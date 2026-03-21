from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import torch
import uvicorn
import os
import pytesseract
import traceback
import re

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

app = FastAPI()

# =========================
# 🔹 LOAD MODEL
# =========================
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "FYP_models", "Test_Model_2")

print("Loading model...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_PATH)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)
model.eval()

print(f"Model loaded on {device}")


# =========================
# 🔹 REQUEST / RESPONSE
# =========================
class SummarizeRequest(BaseModel):
    text: str
    max_new_tokens: int = 1500
    num_beams: int = 5


class SummarizeResponse(BaseModel):
    summary: str
    input_tokens: int
    chunks_processed: int


# =========================
# 🔹 OCR CLEANING
# =========================
def clean_ocr_text(text: str) -> str:
    text = re.sub(r'[^\u0D80-\u0DFF0-9a-zA-Z\s.,:/()-]', ' ', text)
    text = re.sub(r'(විස්තරාත්මක\s*){2,}', 'විස්තර', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


# =========================
# 🔹 SYSTEM RULES (UPDATED)
# =========================
SYSTEM_RULES = (
    "ඔබ ජ්‍යේෂ්ඨ ශ්‍රී ලාංකික නීති විශ්ලේෂකයෙකි.\n"
    "පිළිතුර සම්පූර්ණයෙන්ම සිංහලෙන් ලබා දෙන්න.\n"
    "පිළිතුර paragraph 3ක් ලෙස ලියන්න.\n"
    "1 වන paragraph → ලේඛනයේ අරමුණ\n"
    "2 වන paragraph → ප්‍රධාන කරුණු\n"
    "3 වන paragraph → නීතිමය බලපෑම\n"
    "OCR දෝෂ නිවැරදි කරන්න.\n"
)


# =========================
# 🔹 PROMPT BUILDER
# =========================
def build_prompt(chunk: str) -> str:
    return f"{SYSTEM_RULES}\n\n{chunk}"


# =========================
# 🔹 PARAGRAPH ENFORCER
# =========================
def enforce_paragraphs(text: str) -> str:
    sentences = re.split(r'(?<=[.])', text)
    n = len(sentences)

    p1 = " ".join(sentences[:n//3])
    p2 = " ".join(sentences[n//3:2*n//3])
    p3 = " ".join(sentences[2*n//3:])

    return f"{p1.strip()}\n\n{p2.strip()}\n\n{p3.strip()}"


# =========================
# 🔹 GENERATION
# =========================
def generate_summary(text: str, max_new_tokens: int, num_beams: int) -> str:

    text = clean_ocr_text(text)
    prompt = build_prompt(text)

    inputs = tokenizer(
        prompt,
        return_tensors="pt",
        max_length=1024,
        truncation=True
    ).to(device)

    with torch.no_grad():
        output_ids = model.generate(
            inputs["input_ids"],
            attention_mask=inputs["attention_mask"],
            max_new_tokens=max_new_tokens,
            min_length=int(max_new_tokens * 0.6),
            num_beams=num_beams,
            do_sample=True,
            top_p=0.9,
            temperature=0.7,
            no_repeat_ngram_size=3,
            repetition_penalty=1.2,
            length_penalty=2.0,
            eos_token_id=tokenizer.eos_token_id,
            pad_token_id=tokenizer.pad_token_id
        )

    summary = tokenizer.decode(output_ids[0], skip_special_tokens=True)

    return enforce_paragraphs(summary)


# =========================
# 🔹 MAP REDUCE
# =========================
def map_reduce_summarize(text, max_new_tokens, num_beams):
    tokens = tokenizer.encode(text)

    chunk_size = 800
    overlap = 100

    chunks = []
    for i in range(0, len(tokens), chunk_size - overlap):
        chunk_tokens = tokens[i:i + chunk_size]
        chunks.append(tokenizer.decode(chunk_tokens, skip_special_tokens=True))

    summaries = [
        generate_summary(c, int(max_new_tokens * 0.7), num_beams)
        for c in chunks
    ]

    combined = " ".join(summaries)

    final_summary = generate_summary(
        combined,
        max_new_tokens,
        num_beams
    )

    return final_summary, len(tokens), len(chunks)


# =========================
# 🔹 API
# =========================
@app.post("/summarize", response_model=SummarizeResponse)
async def summarize(request: SummarizeRequest):
    try:
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Empty text")

        token_count = len(tokenizer.encode(request.text))

        if token_count > 900:
            summary, tokens, chunks = map_reduce_summarize(
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
            tokens = token_count
            chunks = 1

        return SummarizeResponse(
            summary=summary,
            input_tokens=tokens,
            chunks_processed=chunks
        )

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    return {"status": "ok", "device": str(device)}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)