# summarizer_api.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import torch
import uvicorn
import os
import pytesseract
import traceback

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

LANG = "sin"


app = FastAPI()

# ✅ Load model once at startup (resolve path relative to this file)
BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # points to Backend/
MODEL_PATH = os.path.join(BASE_DIR, "FYP_models", "Test_Model_3")

print("Loading model...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_PATH)

# Fix generation config using the supported generation_config API.
# Use a larger max_length so summaries don't get cut off early.
model.generation_config.max_length = 1024
model.generation_config.no_repeat_ngram_size = 3

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)
model.eval()
print(f"Model loaded on {device}")

class SummarizeRequest(BaseModel):
    text: str
    # Larger defaults for fuller summaries. Increase with care: higher values
    # mean slower generation, especially on CPU.
    max_new_tokens: int = 512
    num_beams: int = 4

    # Sampling controls (quality/creativity knobs)
    # - do_sample=False => more deterministic; ignores temperature/top_p
    # - temperature lower (~0.2-0.7) => more focused; higher => more creative
    do_sample: bool = True
    temperature: float = 0.7
    top_p: float = 0.9

class SummarizeResponse(BaseModel):
    summary: str
    input_tokens: int
    chunks_processed: int

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
        max_length=1024,   # 🔥 increased
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

    # 🔥 Retry if summary too short (prevents broken outputs)
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

def map_reduce_summarize(
    text: str,
    max_new_tokens: int,
    num_beams: int,
    do_sample: bool,
    temperature: float,
    top_p: float,
):
    tokens = tokenizer.encode(text)

    chunk_size = 800   # 🔥 bigger chunks
    overlap = 100

    chunks = []
    for i in range(0, len(tokens), chunk_size - overlap):
        chunk_tokens = tokens[i:i + chunk_size]
        chunk_text = tokenizer.decode(chunk_tokens, skip_special_tokens=True)
        chunks.append(chunk_text)

    print(f"Processing {len(chunks)} chunks...")

    # 🔹 MAP STEP (detailed summaries)
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

    # 🔹 REDUCE STEP
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

        # 🔥 smarter threshold
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

@app.get("/health")
async def health():
    return {"status": "ok", "device": str(device)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)