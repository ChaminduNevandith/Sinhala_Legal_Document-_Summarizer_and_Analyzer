import sys
import json
import os


def extract_text_ocr_page_wise(pdf_path, txt_path):
    """Extract text page-by-page from PDF (returns list of pages)"""
    from pdf2image import convert_from_path
    import pytesseract
    import cv2
    import os

    pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

    # Verify file exists before attempting extraction
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")

    pages = convert_from_path(pdf_path)
    page_texts = []

    for i, page in enumerate(pages):
        img_path = f"{pdf_path}_page_{i}.png"
        page.save(img_path, "PNG")

        img = cv2.imread(img_path)
        text = pytesseract.image_to_string(img, lang="sin")

        page_texts.append(text)
        os.remove(img_path)

    # Save combined text for reference
    full_text = "\n".join(page_texts)
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(full_text)

    return page_texts  # Return list of pages instead of concatenated text


def extract_text_ocr(pdf_path, txt_path):
    """Legacy function: Extract text as single concatenated string"""
    page_texts = extract_text_ocr_page_wise(pdf_path, txt_path)
    return "\n".join(page_texts)


def extract_text(file_path, file_type):
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
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


# ✅ PAGE-WISE SUMMARIZATION
def summarize_via_fastapi_page_wise(pages: list) -> str:
    """Summarize document page-by-page, then combine results"""
    import requests

    url = "http://127.0.0.1:8000/summarize-page-wise"

    if not pages or all(not p.strip() for p in pages):
        return ""

    payload = {
        "pages": pages,
        "max_new_tokens": 1500,
        "num_beams": 6,
        "do_sample": False,
        "temperature": 0.3,
        "top_p": 0.9,
    }

    response = requests.post(url, json=payload, timeout=6000)
    response.raise_for_status()

    return response.json().get("summary", "")


# ✅ LEGACY — CHUNK-WISE SUMMARIZATION (kept for backward compatibility)
def summarize_via_fastapi(text: str) -> str:
    import requests

    url = "http://127.0.0.1:8000/summarize"

    text = text.strip()
    if not text:
        return ""

    payload = {
        "text": f"""
            පහත නීතිමය ලේඛනයක් සාරාංශ කරන්න.
            - පැහැදිලි හා නිවැරදි සිංහල භාෂාවෙන් ලියන්න
            - පුනරාවර්තන වලක්වන්න
            - වැදගත් කරුණු පමණක් ලබා දෙන්න
            - නීතිමය ශෛලියෙන් ලියන්න

            ලේඛනය:
            {text}
            """,
    }

    response = requests.post(url, json=payload, timeout=6000)
    response.raise_for_status()

    return response.json().get("summary", "")


if __name__ == "__main__":
    input_data = sys.stdin.read()
    data = json.loads(input_data)

    file_path = data.get("file_path")
    file_type = data.get("file_type")
    use_page_wise = data.get("use_page_wise", True)  # Default: page-wise (True)

    if not file_path or not file_type:
        print(json.dumps({"error": "file_path and file_type required"}))
        sys.exit(1)

    # Extract text
    if file_type == "pdf" and use_page_wise:
        # Extract pages separately for page-wise summarization
        txt_path = file_path + ".txt"
        pages = extract_text_ocr_page_wise(file_path, txt_path)
        extracted_text = "\n".join(pages)
        # Generate summary using page-wise approach
        summary = summarize_via_fastapi_page_wise(pages)
    else:
        # Fall back to old chunk-wise approach for non-PDF or if explicitly requested
        extracted_text = extract_text(file_path, file_type)
        summary = summarize_via_fastapi(extracted_text)

    # Return BOTH extracted text and summary
    print(json.dumps({
        "summary": summary,
        "extracted_text": extracted_text
    }))