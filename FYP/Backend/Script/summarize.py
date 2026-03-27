from pydoc import text
import sys
import json
import os
import re


SYSTEM_PROMPT = """
ඔබගේ කාර්යය නීතිමය ලේඛන සරළ ලෙස ජනතාවට තේරුම් ගත හැකි ලෙස පැහැදිලි කිරීමයි.

- සරළ සිංහල භාෂාව භාවිතා කරන්න
- නීතිමය ගැඹුරු වචන වලක්වන්න
- වැදගත් කරුණු පමණක් දක්වන්න
- අනවශ්‍ය හැඳින්වීම් (උදා: "මෙම නීතිමය දැනුම්දීම...") භාවිතා නොකරන්න
- පිළිතුර සෘජුවම ආරම්භ කරන්න
"""


def build_summarization_prompt(document_text: str) -> str:
    document_text = (document_text or "").strip()

    return f"""
{SYSTEM_PROMPT}

පහත ලේඛනය සරළව පැහැදිලි කරන්න.

⚠️ වැදගත්:
- "මෙම නීතිමය/රාජ්‍ය දැනුම්දීම..." වැනි වාක්‍ය භාවිතා නොකරන්න
- පිළිතුර සෘජුවම කරුණු වලින් ආරම්භ කරන්න
- සාමාන්‍ය පුද්ගලයෙකුට පහසුවෙන් තේරෙන ලෙස ලියන්න

📌 ආකෘතිය:

• කවුද සම්බන්ධ වෙන්නේ:
• කාර්යය මොනවද:
• ගෙවීම්:
• කාල සීමාව:
• වගකීම් / අවදානම්:

📄 ලේඛනය:
{document_text}
"""


def clean_sinhala_text(text):
    """Post-OCR cleanup for Sinhala text"""
    # Remove repeated characters (නීනීනී → නී)
    text = re.sub(r'(.)\1{2,}', r'\1', text)

    # Fix common OCR issues
    text = text.replace("මාර්නූ", "මාර්තු")
    text = text.replace("ජානික", "ජාතික")

    # Remove weird punctuation noise
    text = re.sub(r'[^\u0D80-\u0DFF0-9.,:;()\s/-]', '', text)

    # Fix spacing
    text = re.sub(r'\s+', ' ', text)

    return text.strip()


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

    # Tesseract config for improved OCR accuracy
    custom_config = r'--oem 3 --psm 6'

    pages = convert_from_path(pdf_path)
    page_texts = []

    for i, page in enumerate(pages):
        img_path = f"{pdf_path}_page_{i}.png"
        page.save(img_path, "PNG")

        img = cv2.imread(img_path)
        
        # Pre-OCR preprocessing
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)[1]
        
        # OCR with custom config
        text = pytesseract.image_to_string(thresh, lang="sin", config=custom_config)
        
        # Post-OCR cleanup
        text = clean_sinhala_text(text)

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

    prompted_pages = [build_summarization_prompt(p) if (p or "").strip() else "" for p in pages]

    payload = {
        "pages": prompted_pages,
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
        "text": build_summarization_prompt(text),
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