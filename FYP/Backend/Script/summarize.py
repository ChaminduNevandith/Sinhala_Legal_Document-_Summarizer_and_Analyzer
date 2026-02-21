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


def summarize_via_fastapi(text: str) -> str:
    """Send extracted text to the FastAPI model server and return its summary."""
    import requests

    url = "http://127.0.0.1:8000/summarize"  # FastAPI endpoint from FastApiConnection.py
    payload = {
        "text": text,
        # rely on default max_new_tokens / num_beams defined in the API
    }

    try:
        response = requests.post(url, json=payload, timeout=300)
        response.raise_for_status()
        data = response.json()
        return data.get("summary", "")
    except Exception as e:
        # Fallback: return a simple truncated summary if API fails
        return f"[SUMMARY_ERROR] {e}\n{text[:200]}"


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
