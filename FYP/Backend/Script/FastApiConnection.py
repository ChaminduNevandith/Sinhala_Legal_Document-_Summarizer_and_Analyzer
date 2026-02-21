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
MODEL_PATH = os.path.join(BASE_DIR, "FYP_models", "Test_Model_2")

print("Loading model...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_PATH)

# Fix generation config using the supported generation_config API
model.generation_config.max_length = 256
model.generation_config.no_repeat_ngram_size = 3

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)
model.eval()
print(f"Model loaded on {device}")

class SummarizeRequest(BaseModel):
    text: str
    # Use smaller defaults so each request is faster, especially on CPU.
    max_new_tokens: int = 80
    num_beams: int = 2

class SummarizeResponse(BaseModel):
    summary: str
    input_tokens: int
    chunks_processed: int

def generate_summary(text: str, max_new_tokens: int, num_beams: int) -> str:
    inputs = tokenizer(
        text,
        return_tensors="pt",
        max_length=512,
        truncation=True
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
            repetition_penalty=1.5,
            length_penalty=1.2,
            forced_eos_token_id=tokenizer.eos_token_id
        )
    return tokenizer.decode(output_ids[0], skip_special_tokens=True)

def map_reduce_summarize(text: str, max_new_tokens: int, num_beams: int):
    tokens = tokenizer.encode(text)
    chunk_size = 400
    overlap = 50
    chunks = []

    for i in range(0, len(tokens), chunk_size - overlap):
        chunk_tokens = tokens[i:i + chunk_size]
        chunks.append(tokenizer.decode(chunk_tokens, skip_special_tokens=True))

    # MAP
    chunk_summaries = [generate_summary(c, max_new_tokens, num_beams) for c in chunks]

    # REDUCE
    combined = " ".join(chunk_summaries)
    final_summary = generate_summary(combined, max_new_tokens, num_beams)

    return final_summary, len(tokens), len(chunks)

@app.post("/summarize", response_model=SummarizeResponse)
async def summarize(request: SummarizeRequest):
    try:
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")

        token_count = len(tokenizer.encode(request.text))

        # ✅ Auto switch to map-reduce for long documents
        if token_count > 450:
            summary, input_tokens, chunks = map_reduce_summarize(
                request.text,
                request.max_new_tokens,
                request.num_beams
            )
        else:
            summary = generate_summary(
                request.text,
                request.max_new_tokens,
                request.num_beams
            )
            input_tokens = token_count
            chunks = 1

        return SummarizeResponse(
            summary=summary,
            input_tokens=input_tokens,
            chunks_processed=chunks
        )

    except Exception as e:
        # Print full traceback to server logs for debugging
        print("[FASTAPI_SUMMARIZE_ERROR]", repr(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok", "device": str(device)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)