# summarizer_api.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import torch
import uvicorn
import os
import pytesseract
import traceback
from typing import List, Dict
import sys
import warnings
warnings.filterwarnings("ignore", message=".*tied weights.*")
sys.path.insert(0, os.path.dirname(__file__))
from legal_analysis import analyze_legal_document, format_for_highlights, format_for_risks

# tesseract path for OCR
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Language code for Sinhala
LANG = "sin"

# Initialize FastAPI app
app = FastAPI()

#  Load model once at startup 
BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # points to Backend/
MODEL_PATH = os.path.join(BASE_DIR, "FYP_models", "Test_Model_4")

print("Loading model...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSeq2SeqLM.from_pretrained(
    MODEL_PATH,
    tie_word_embeddings=False
)

# Adjust generation config for better summaries
model.generation_config.max_length = 1024
model.generation_config.no_repeat_ngram_size = 3

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)
model.eval()
print(f"Model loaded on {device}")

# API request/response models
class SummarizeRequest(BaseModel):
    text: str
    max_new_tokens: int = 512
    num_beams: int = 4
    do_sample: bool = True
    temperature: float = 0.7
    top_p: float = 0.9

class SummarizeResponse(BaseModel):
    summary: str
    input_tokens: int
    chunks_processed: int

class PageWiseSummarizeRequest(BaseModel):
    pages: List[str]  # List of page texts
    max_new_tokens: int = 512
    num_beams: int = 4
    do_sample: bool = True
    temperature: float = 0.7
    top_p: float = 0.9

class PageWiseSummarizeResponse(BaseModel):
    summary: str
    page_summaries: List[str]  # Summary of each page
    total_pages: int
    total_input_tokens: int

class LegalAnalysisRequest(BaseModel):
    text: str
    use_llm_refinement: bool = True

class LegalAnalysisResponse(BaseModel):
    rights: List[str]
    obligations: List[str]
    deadlines: List[str]
    risks: List[str]
    summary: Dict
    highlights: Dict
    risk_explanations: Dict

# Core summarization logic

def generate_summary(
    text: str,
    max_new_tokens: int,
    num_beams: int,
    do_sample: bool,
    temperature: float,
    top_p: float,
) -> str:
    inputs = tokenizer(
        text,
        return_tensors="pt",
        max_length=1024,   
        truncation=True
    ).to(device)

    with torch.no_grad():
        output_ids = model.generate(
            inputs["input_ids"],
            attention_mask=inputs["attention_mask"],

            max_new_tokens=max_new_tokens,
            min_length=int(max_new_tokens * 0.5),

            num_beams=num_beams,

            do_sample=do_sample,
            top_p=top_p,
            temperature=temperature,

            no_repeat_ngram_size=3,
            repetition_penalty=1.2,
            length_penalty=2.0,

            eos_token_id=tokenizer.eos_token_id,
            pad_token_id=tokenizer.pad_token_id
        )

    summary = tokenizer.decode(output_ids[0], skip_special_tokens=True)

    if len(summary.strip()) < 100:
        output_ids = model.generate(
            inputs["input_ids"],
            attention_mask=inputs["attention_mask"],
            max_new_tokens=max_new_tokens,
            num_beams=num_beams,
            do_sample=do_sample,
            top_p=top_p,
            temperature=temperature,
            no_repeat_ngram_size=3,
            repetition_penalty=1.2,
            length_penalty=2.0,
            eos_token_id=tokenizer.eos_token_id,
            pad_token_id=tokenizer.pad_token_id
        )
        summary = tokenizer.decode(output_ids[0], skip_special_tokens=True)

    return summary

# Map Reduce style summarization for long documents chunk wise
def map_reduce_summarize(
    text: str,
    max_new_tokens: int,
    num_beams: int,
    do_sample: bool,
    temperature: float,
    top_p: float,
):
    tokens = tokenizer.encode(text)

    chunk_size = 800   # 
    overlap = 100

    chunks = []
    for i in range(0, len(tokens), chunk_size - overlap):
        chunk_tokens = tokens[i:i + chunk_size]
        chunk_text = tokenizer.decode(chunk_tokens, skip_special_tokens=True)
        chunks.append(chunk_text)

    print(f"Processing {len(chunks)} chunks...")

    chunk_summaries = []
    for c in chunks:
        summary = generate_summary(
            c,
            int(max_new_tokens * 0.7),
            num_beams,
            do_sample,
            temperature,
            top_p,
        )
        chunk_summaries.append(summary)

    combined = " ".join(chunk_summaries)

    final_summary = generate_summary(
        combined,
        max_new_tokens,
        num_beams,
        do_sample,
        temperature,
        top_p,
    )

    return final_summary, len(tokens), len(chunks)

# Page wise summarization logic
def map_reduce_page_wise_summarize(
    pages: List[str],
    max_new_tokens: int,
    num_beams: int,
    do_sample: bool,
    temperature: float,
    top_p: float,
):
    """
    Summarize document page-by-page then combine results
    
    MAP STEP: Summarize each page individually
    REDUCE STEP: Combine page summaries into final summary
    """
    print(f"Processing {len(pages)} pages...")
    
    total_tokens = 0
    page_summaries = []
    

    for idx, page_text in enumerate(pages):
        if not page_text.strip():
            print(f"  Skipping empty page {idx + 1}")
            page_summaries.append("")
            continue
            
        print(f"  Summarizing page {idx + 1}/{len(pages)}...")
        
        page_tokens = len(tokenizer.encode(page_text))
        total_tokens += page_tokens
        

        page_summary = generate_summary(
            page_text,
            int(max_new_tokens * 0.6), 
            num_beams,
            do_sample,
            temperature,
            top_p,
        )
        page_summaries.append(page_summary)
    
    print("Combining page summaries...")
    combined = " ".join([s for s in page_summaries if s.strip()])
    
    if not combined.strip():
        return "", page_summaries, total_tokens
    
    final_summary = generate_summary(
        combined,
        max_new_tokens,
        num_beams,
        do_sample,
        temperature,
        top_p,
    )
    
    return final_summary, page_summaries, total_tokens

# FastAPI endpoints
@app.post("/summarize", response_model=SummarizeResponse)
async def summarize(request: SummarizeRequest):
    try:
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")

        # Basic guardrails (avoid invalid sampling settings causing runtime errors)
        temperature = float(request.temperature)
        top_p = float(request.top_p)
        if temperature <= 0:
            raise HTTPException(status_code=400, detail="temperature must be > 0")
        if not (0 < top_p <= 1):
            raise HTTPException(status_code=400, detail="top_p must be in (0, 1]")

        token_count = len(tokenizer.encode(request.text))

        print(f"Token count: {token_count}")

        if token_count > 900:
            summary, input_tokens, chunks = map_reduce_summarize(
                request.text,
                request.max_new_tokens,
                request.num_beams,
                request.do_sample,
                temperature,
                top_p,
            )
        else:
            summary = generate_summary(
                request.text,
                request.max_new_tokens,
                request.num_beams,
                request.do_sample,
                temperature,
                top_p,
            )
            input_tokens = token_count
            chunks = 1

        return SummarizeResponse(
            summary=summary,
            input_tokens=input_tokens,
            chunks_processed=chunks
        )

    except Exception as e:
        print("[FASTAPI_SUMMARIZE_ERROR]", repr(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    
# New endpoint for page wise summarization
@app.post("/summarize-page-wise", response_model=PageWiseSummarizeResponse)
async def summarize_page_wise(request: PageWiseSummarizeRequest):
    """
    Summarize document page-by-page and combine results
    
    MAP STEP: Each page summarized individually
    REDUCE STEP: Page summaries combined into final summary
    """
    try:
        if not request.pages or all(not p.strip() for p in request.pages):
            raise HTTPException(status_code=400, detail="Pages cannot be empty")

        temperature = float(request.temperature)
        top_p = float(request.top_p)
        if temperature <= 0:
            raise HTTPException(status_code=400, detail="temperature must be > 0")
        if not (0 < top_p <= 1):
            raise HTTPException(status_code=400, detail="top_p must be in (0, 1]")

        final_summary, page_summaries, total_tokens = map_reduce_page_wise_summarize(
            request.pages,
            request.max_new_tokens,
            request.num_beams,
            request.do_sample,
            temperature,
            top_p,
        )

        return PageWiseSummarizeResponse(
            summary=final_summary,
            page_summaries=page_summaries,
            total_pages=len(request.pages),
            total_input_tokens=total_tokens
        )

    except Exception as e:
        print("[FASTAPI_PAGE_WISE_SUMMARIZE_ERROR]", repr(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok", "device": str(device)}

# Legal document analysis endpoint
@app.post("/analyze-legal", response_model=LegalAnalysisResponse)
async def analyze_legal(request: LegalAnalysisRequest):
    """
    Hybrid legal document analysis: Rule-based + LLM refinement
    Identifies Rights, Obligations, Deadlines, and Risks
    """
    try:
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        print("[Legal Analysis] Processing document...")
        
        # Run hybrid analysis
        if request.use_llm_refinement:
            analysis = analyze_legal_document(
                request.text,
                model_callable=model,
                tokenizer_callable=tokenizer,
                device=device
            )
        else:
            from legal_analysis import rule_based_extraction
            rule_results = rule_based_extraction(request.text)
            analysis = {
                "rights": [r["text"] for r in rule_results["rights"]],
                "obligations": [o["text"] for o in rule_results["obligations"]],
                "deadlines": [d["text"] for d in rule_results["deadlines"]],
                "risks": [r["text"] for r in rule_results["risks"]],
                "summary": {
                    "total_rights": len(rule_results["rights"]),
                    "total_obligations": len(rule_results["obligations"]),
                    "total_deadlines": len(rule_results["deadlines"]),
                    "total_risks": len(rule_results["risks"])
                }
            }
        
        highlights = format_for_highlights(analysis)
        risk_explanations = format_for_risks(analysis)
        
        print(f"[Legal Analysis] Completed: {analysis['summary']}")
        
        return LegalAnalysisResponse(
            rights=analysis["rights"],
            obligations=analysis["obligations"],
            deadlines=analysis["deadlines"],
            risks=analysis["risks"],
            summary=analysis["summary"],
            highlights=highlights,
            risk_explanations=risk_explanations
        )
    
    except Exception as e:
        print("[LEGAL_ANALYSIS_ERROR]", repr(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)