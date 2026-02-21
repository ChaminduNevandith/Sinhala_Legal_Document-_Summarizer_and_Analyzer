import sys
import json
import os


def extract_text_ocr(pdf_path, txt_path):
    from pdf2image import convert_from_path
    import pytesseract
    import cv2

    pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

    pages = convert_from_path(pdf_path)
    full_text = ""
    for i, page in enumerate(pages):
        img_path = f"{pdf_path}_page_{i}.png"
        page.save(img_path, "PNG")
        img = cv2.imread(img_path)
        text = pytesseract.image_to_string(img, lang="sin")
        full_text += text + "\n"
        os.remove(img_path)
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(full_text)
    return full_text


def extract_text(file_path, file_type):
    if file_type == "pdf":
        txt_path = file_path + ".txt"
        return extract_text_ocr(file_path, txt_path)
    elif file_type == "docx":
        from docx import Document

        doc = Document(file_path)
        text = "\n".join([p.text for p in doc.paragraphs])
        txt_path = file_path + ".txt"
        with open(txt_path, "w", encoding="utf-8") as f:
            f.write(text)
        return text
    elif file_type == "txt":
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    else:
        raise ValueError("Unsupported file type")

def _chunk_text(text: str, max_chars: int = 1500):
    """Split text into simple fixed-size character chunks.

    This does *not* depend on '.', which can be unreliable in OCR'd Sinhala
    documents. We just take consecutive slices of length max_chars.
    """
    text = text.strip()
    if not text:
        return []

    chunks = []
    for i in range(0, len(text), max_chars):
        chunks.append(text[i : i + max_chars])
    return chunks


def summarize_via_fastapi(text: str) -> str:
    """Send extracted text to the FastAPI model server in sentence-based chunks.

    The document is first split into fixed-size chunks by character length
    (no dependency on '.' punctuation). Each chunk is summarized separately,
    and the partial summaries
    are then combined into a single final summary string.
    """
    import requests

    url = "http://127.0.0.1:8000/summarize"  # FastAPI endpoint from FastApiConnection.py

    text = text.strip()
    if not text:
        return ""

    chunks = _chunk_text(text, max_chars=4000)
    if not chunks:
        return ""

    summaries = []
    for idx, chunk in enumerate(chunks):
        payload = {"text": chunk}
        try:
            response = requests.post(url, json=payload, timeout=120)
            response.raise_for_status()
            data = response.json()
            part = data.get("summary", "")
            if part:
                summaries.append(part.strip())
        except Exception as e:
            # Record the error and move on to the next chunk
            summaries.append(f"[PART_{idx+1}_ERROR] {e}")

    return "\n".join(summaries)


if __name__ == "__main__":
    input_data = sys.stdin.read()
    data = json.loads(input_data)
    file_path = data.get("file_path")
    file_type = data.get("file_type")
    if not file_path or not file_type:
        print(json.dumps({"error": "file_path and file_type required"}))
        sys.exit(1)

    text = extract_text(file_path, file_type)
    summary = summarize_via_fastapi(text)
    print(json.dumps({"summary": summary}))
