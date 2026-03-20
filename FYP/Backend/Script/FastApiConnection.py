# summarizer_api.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import torch
import uvicorn
import os
import re
import traceback

app = FastAPI()


BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # points to Backend/
MODEL_PATH = os.path.join(BASE_DIR, "FYP_models", "Test_Model_2")

TASK_PREFIX = "සිංහල නීති ලේඛනය සාරාංශ කරන්න: "

print("Loading model from:", MODEL_PATH)
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_PATH)

model.generation_config.max_length = 1024
model.generation_config.no_repeat_ngram_size = 3

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)
model.eval()
print(f"✅ Model loaded on {device}")



class SummarizeRequest(BaseModel):
    text: str
    max_new_tokens: int = 256
    num_beams: int = 4


class SummarizeResponse(BaseModel):
    summary: str
    input_tokens: int
    chunks_processed: int


def clean_ocr_text(text: str) -> str:
    """
    Remove common OCR artefacts from scanned Sinhala documents:
      - Collapse multiple whitespace/newlines into a single space
      - Drop lines that are pure symbols or very short (likely noise)
      - Strip leading/trailing whitespace
    """
    # Normalise whitespace
    text = re.sub(r'[ \t]+', ' ', text)          # multiple spaces → one
    text = re.sub(r'\n{3,}', '\n\n', text)        # 3+ newlines → two

    # Filter out noise lines
    lines = []
    for line in text.splitlines():
        stripped = line.strip()
        # keep if it has at least 4 characters and contains a letter
        if len(stripped) >= 4 and re.search(r'\w', stripped):
            lines.append(stripped)

    return ' '.join(lines).strip()



def generate_summary(text: str, max_new_tokens: int, num_beams: int) -> str:
    """Summarise a single chunk of text that fits within the model's window."""
    inputs = tokenizer(
        TASK_PREFIX + text,
        return_tensors="pt",
        max_length=2000,
        truncation=True,
    ).to(device)

    with torch.no_grad():
        output_ids = model.generate(
            inputs["input_ids"],
            attention_mask=inputs["attention_mask"],
            max_new_tokens=max_new_tokens,
            min_length=30,          
            num_beams=num_beams,
            early_stopping=True,
            no_repeat_ngram_size=3,
            repetition_penalty=2.0,  
            length_penalty=0.8,      
            forced_eos_token_id=tokenizer.eos_token_id,
        )

    return tokenizer.decode(output_ids[0], skip_special_tokens=True)



CHUNK_SIZE = 250  
OVERLAP    = 30


def _split_into_chunks(text: str):
    """Tokenise text and split into overlapping chunks."""
    token_ids = tokenizer.encode(text, add_special_tokens=False)
    chunks = []
    for i in range(0, len(token_ids), CHUNK_SIZE - OVERLAP):
        chunk_ids = token_ids[i : i + CHUNK_SIZE]
        chunks.append(tokenizer.decode(chunk_ids, skip_special_tokens=True))
    return chunks


def map_reduce_summarize(text: str, max_new_tokens: int, num_beams: int, depth: int = 0):
    """
    1. MAP  – summarise every chunk independently.
    2. REDUCE – join chunk summaries; if still too long, recurse.

    `depth` guards against infinite recursion (max 3 levels).
    """
    MAX_DEPTH = 3

    chunks = _split_into_chunks(text)
    total_input_tokens = len(tokenizer.encode(text, add_special_tokens=False))

    print(f"[map_reduce depth={depth}] {len(chunks)} chunks, {total_input_tokens} tokens")

    # ── MAP ──────────────────────────────────
    chunk_summaries = []
    for idx, chunk in enumerate(chunks):
        print(f"  Summarising chunk {idx + 1}/{len(chunks)} …")
        chunk_summaries.append(generate_summary(chunk, max_new_tokens, num_beams))

    # ── REDUCE ───────────────────────────────
    combined = " ".join(chunk_summaries)
    combined_tokens = len(tokenizer.encode(combined, add_special_tokens=False))

    if combined_tokens > 450 and depth < MAX_DEPTH:
        # Still too long – recurse
        final_summary, _, _ = map_reduce_summarize(
            combined, max_new_tokens, num_beams, depth=depth + 1
        )
    else:
        # Fits in one pass
        final_summary = generate_summary(combined, max_new_tokens, num_beams)

    return final_summary, total_input_tokens, len(chunks)



@app.post("/summarize", response_model=SummarizeResponse)
async def summarize(request: SummarizeRequest):
    try:
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")

       
        clean_text = clean_ocr_text(request.text)

        if not clean_text:
            raise HTTPException(status_code=400, detail="No usable text after cleaning")

        token_count = len(tokenizer.encode(clean_text, add_special_tokens=False))
        print(f"[/summarize] token_count={token_count}")

        if token_count > 450:
            # Long document → map-reduce
            summary, input_tokens, chunks = map_reduce_summarize(
                clean_text,
                request.max_new_tokens,
                request.num_beams,
            )
        else:
            # Short document → single pass
            summary = generate_summary(
                clean_text,
                request.max_new_tokens,
                request.num_beams,
            )
            input_tokens = token_count
            chunks = 1

        return SummarizeResponse(
            summary=summary,
            input_tokens=input_tokens,
            chunks_processed=chunks,
        )

    except HTTPException:
        raise
    except Exception as e:
        print("[FASTAPI_SUMMARIZE_ERROR]", repr(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    return {"status": "ok", "device": str(device)}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)