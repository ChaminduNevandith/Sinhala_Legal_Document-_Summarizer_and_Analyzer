"""
Legal Document Analysis Module (Improved)
Hybrid approach: Rule-based extraction + LLM refinement
Sinhala-optimized with fuzzy matching + priority classification
"""

import re
from typing import Dict, List
import json
from difflib import SequenceMatcher


# CLEAN KEYWORDS


RIGHTS_KEYWORDS_SI = [
    "අයිතිය ඇත",
    "අවසර ඇත",
    "අවසරයි",
    "කිරීමට හැක",
    "ලබාගත හැක",
]

OBLIGATIONS_KEYWORDS_SI = [
    "කළ යුතුය",
    "ගෙවිය යුතුය",
    "ඉටු කළ යුතුය",
    "වගකීම",
    "අනිවාර්යයි",
]

DEADLINES_KEYWORDS_SI = [
    "දිනය",
    "දිනට පෙර",
    "පෙර",
    "තුළ",
    "වන විට",
    "202",  # catch years
]

RISK_KEYWORDS_SI = [
    "වගකිව යුතුය",
    "නීතිමය",
    "අලාභ",
    "උල්ලංඝනය",
    "ප්‍රතිවිපාක",
]


# FUZZY MATCHING 


def is_similar(a, b, threshold=0.8):
    return SequenceMatcher(None, a, b).ratio() > threshold


def keyword_match(sentence, keyword):
    if keyword in sentence:
        return True

    words = sentence.split()
    for word in words:
        if is_similar(word, keyword):
            return True
    return False



# TEXT PREPROCESSING


def preprocess_text(text: str) -> str:
    text = re.sub(r'\s+', ' ', text.strip())
    return text


def split_into_sentences(text: str) -> List[str]:
    sentences = re.split(r'[.!?।\n]+', text)
    return [s.strip() for s in sentences if len(s.strip()) > 10]



# SECTION DETECTION

def detect_section(sentence):
    if "අයිතිවාසිකම්" in sentence:
        return "rights"
    if "Obligations" in sentence or "කළ යුතු දේ" in sentence:
        return "obligations"
    if "Deadlines" in sentence or "දිනයන්" in sentence:
        return "deadlines"
    return None



# PRIORITY CLASSIFIER


def classify_sentence(sentence):
    s = sentence.lower()

    # Priority order
    if any(k in s for k in ["වගකිව යුතුය", "අලාභ", "නීතිමය"]):
        return "risks"

    if any(k in s for k in ["ගෙවිය යුතුය", "කළ යුතුය", "අනිවාර්ය"]):
        return "obligations"

    if any(k in s for k in ["දිනය", "202", "පෙර", "තුළ"]):
        return "deadlines"

    if any(k in s for k in ["අවසර", "හැක", "අයිතිය"]):
        return "rights"

    return None


# RULE-BASED EXTRACTION 


def rule_based_extraction(text: str) -> Dict[str, List]:
    preprocessed = preprocess_text(text)
    sentences = split_into_sentences(preprocessed)

    results = {
        "rights": [],
        "obligations": [],
        "deadlines": [],
        "risks": []
    }

    for sentence in sentences:
        section_hint = detect_section(sentence)
        category = classify_sentence(sentence)

        if section_hint:
            category = section_hint

        if category:
            if sentence not in [r["sentence"] for r in results[category]]:
                results[category].append({
                    "sentence": sentence,
                    "type": category
                })

    return results



# LLM REFINEMENT


def generate_refined_extraction(
    text: str,
    rule_based_results: Dict[str, List],
    model_callable: callable,
    tokenizer_callable: callable,
    device: str
) -> Dict[str, List[str]]:
    import torch

    extraction_prompt = f"""
Analyze the following Sinhala legal document and extract:

1. Rights (අයිතිවාසිකම්)
2. Obligations (වගකීම්)
3. Deadlines (කාලසීමා)
4. Risks (අවදානම්)

Return ONLY valid JSON:
{{
  "rights": [],
  "obligations": [],
  "deadlines": [],
  "risks": []
}}

Document:
{text}
"""

    try:
        inputs = tokenizer_callable(
            extraction_prompt,
            return_tensors="pt",
            max_length=512,
            truncation=True
        ).to(device)

        with torch.no_grad():
            output_ids = model_callable.generate(
                inputs["input_ids"],
                attention_mask=inputs["attention_mask"],
                max_new_tokens=512,
                temperature=0.7
            )

        response_text = tokenizer_callable.decode(output_ids[0], skip_special_tokens=True)

        extracted = json.loads(response_text)

        return {
            "rights": extracted.get("rights", []),
            "obligations": extracted.get("obligations", []),
            "deadlines": extracted.get("deadlines", []),
            "risks": extracted.get("risks", [])
        }

    except Exception:
        return {
            "rights": [r["sentence"] for r in rule_based_results.get("rights", [])],
            "obligations": [o["sentence"] for o in rule_based_results.get("obligations", [])],
            "deadlines": [d["sentence"] for d in rule_based_results.get("deadlines", [])],
            "risks": [r["sentence"] for r in rule_based_results.get("risks", [])]
        }



# MAIN ANALYZER


def normalize_text(text):
    return re.sub(r'\s+', ' ', text.strip().lower())


def analyze_legal_document(
    text: str,
    model_callable: callable = None,
    tokenizer_callable: callable = None,
    device: str = "cpu"
) -> Dict:

    rule_results = rule_based_extraction(text)

    formatted_results = {
        "rights": [r["sentence"] for r in rule_results["rights"]],
        "obligations": [o["sentence"] for o in rule_results["obligations"]],
        "deadlines": [d["sentence"] for d in rule_results["deadlines"]],
        "risks": [r["sentence"] for r in rule_results["risks"]],
    }

    # LLM refinement (optional)
    if model_callable and tokenizer_callable:
        llm_results = generate_refined_extraction(
            text,
            rule_results,
            model_callable,
            tokenizer_callable,
            device
        )

        for key in formatted_results:
            if llm_results.get(key):
                formatted_results[key] = llm_results[key]

    # Deduplication
    for key in formatted_results:
        seen = set()
        unique = []

        for item in formatted_results[key]:
            norm = normalize_text(item)
            if norm not in seen:
                seen.add(norm)
                unique.append(item)

        formatted_results[key] = unique

    summary = {
        "total_rights": len(formatted_results["rights"]),
        "total_obligations": len(formatted_results["obligations"]),
        "total_deadlines": len(formatted_results["deadlines"]),
        "total_risks": len(formatted_results["risks"]),
    }

    return {
        **formatted_results,
        "summary": summary
    }


def format_for_highlights(analysis_result: Dict) -> Dict:
    return {
        "rights": {
            "title": "ඔබගේ අයිතිවාසිකම් (Rights)",
            "icon": "verified_user",
            "items": analysis_result.get("rights", [])
        },
        "obligations": {
            "title": "ඔබට කළ යුතු දේ (Obligations)",
            "icon": "assignment_late",
            "items": analysis_result.get("obligations", [])
        },
        "deadlines": {
            "title": "වැදගත් දිනයන් (Deadlines)",
            "icon": "event_busy",
            "items": analysis_result.get("deadlines", [])
        }
    }


def format_for_risks(analysis_result: Dict) -> Dict:
    risks = analysis_result.get("risks", [])

    return {
        "risks": risks,
        "explanations": [
            {
                "question": f"වැදගත් අවදානම - {r[:50]}...",
                "answer": f"මෙම අවදානම සඳහා අවධානය යොමු කරන්න: {r}"
            }
            for r in risks
        ]
    }