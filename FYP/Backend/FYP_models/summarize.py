import sys
import json
import os

# Add your model loading code here (e.g., using transformers, peft, etc.)

def extract_text(file_path, file_type):
    if file_type == "pdf":
        import pdfplumber
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
        return text
    elif file_type == "docx":
        from docx import Document
        doc = Document(file_path)
        return "\n".join([p.text for p in doc.paragraphs])
    else:
        raise ValueError("Unsupported file type")

def summarize(text):
    # Replace this with your actual model inference code
    return "[SUMMARY] " + text[:200]  # Dummy summary for now

if __name__ == "__main__":
    input_data = sys.stdin.read()
    data = json.loads(input_data)
    file_path = data.get("file_path")
    file_type = data.get("file_type")
    if not file_path or not file_type:
        print(json.dumps({"error": "file_path and file_type required"}))
        sys.exit(1)
    text = extract_text(file_path, file_type)
    summary = summarize(text)
    print(json.dumps({"summary": summary}))
