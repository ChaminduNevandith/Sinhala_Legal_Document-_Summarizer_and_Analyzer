"""
Legal Document Analysis Module
Hybrid approach: Rule-based extraction + LLM refinement
Identifies Rights, Obligations, Deadlines, and Risks in Sinhala legal documents
"""

import re
from typing import Dict, List, Tuple
import json

# ============================================================================
# IMPROVED SINHALA KEYWORD LISTS
# ============================================================================

RIGHTS_KEYWORDS_SI = [
    # Basic rights
    "අයිතිය ඇත",
    "අයිතිවාසිකම",
    "තිබිය",
    "ඉතුරු කිරීමට",
    "සිටින්නට",
    "නැගිටින්නට",
    "ස්වාধීනව",
    # Permission-based
    "හැක",
    "පිළිබඳ අවසර",
    "අවසර ඇත",
    "අවසරයි",
    "කිරීමට හැක",
    # Protected rights
    "ගිණුම",
    "භාණ්ඩ",
    "සඳහා",
    "නිකංම",
    "අනිවාර්ය",
    # Property and claims
    "ඉල්ලා සිටිය",
    "දකින්න",
    "ලබාගත",
    "සුරක්ෂිතයි",
    "වන්නාවූ",
]

OBLIGATIONS_KEYWORDS_SI = [
    # Mandatory actions
    "කළ යුතුය",
    "කරන බැවින්",
    "කිරීමට වචනගත",
    "පැවරුණු",
    # Responsibility
    "වගකිව යුතුය",
    "වගකීම",
    "දාය",
    "පිළිබඳ වගකීම",
    # Mandatory/Necessary
    "අනිවාර්යයි",
    "අනිවාර්ය",
    "බොහෝ",
    "පතිසර",
    # Actions/Duties
    "ගෙවිය යුතුය",
    "ගෙවීම",
    "නිකුතු කළ යුතුය",
    "පිළිබඳ",
    "ඉටු කිරීම",
    "ඉටු කළ යුතුය",
    # Non-action
    "නොවිය",
    "නොකිරීම",
    "තනතුරු නොအඩුන්",
    # Burden/Cost
    "ගිණුම",
    "වියදම",
    "පිරිවැය",
    "ගිණුම විසින්",
]

DEADLINES_KEYWORDS_SI = [
    # Time periods
    "දින",
    "සතිය",
    "මසකට",
    "මාසයකින්",
    "වසරකට",
    "වසරකින්",
    "පෙර",
    "පසුව",
    "අනතුරුව",
    # Specific timing
    "වන විට",
    "පසුව",
    "ඔබ්බට",
    "තුළ",
    "ඉතර",
    # Dates and periods
    "දිනට",
    "දිනින්",
    "ක්ෂණයට",
    "වකවානු",
    "කාලීනව",
    "පිට",
    # Related to time
    "නිතර",
    "සැම",
    "වාර",
    "අවස්ථා",
    "ස්ථාවර",
]

RISK_KEYWORDS_SI = [
    # Penalties
    "දඩය",
    "දඩුවම",
    "ඉවලා දැමීම",
    "සිර",
    "දණ්ඩනය",
    # Consequences
    "නසා දැමීම",
    "විසුරුවා දැමීම",
    "නතර",
    "බිම රැගෙන යාම",
    "නැතිවීම",
    # Breach/Violation
    "කඩ කිරීම",
    "උල්ලංඝනය",
    "පිස්සුවීම",
    "හිමිකාරයා",
    # Disputes
    "ගිණුම",
    "ගිණුම් පෙරදर්ශනී",
    "පරිවර්තනය",
    "විවාදය",
    # Default/Failure
    "ඉටු නොවන",
    "එකඟ නොවුන",
    "පිහිටඳ",
    "නොසිදුවන",
    # Financial risks
    "අබල",
    "අතුරුදහස්",
    "යටිකර",
]

# ============================================================================
# RULE-BASED EXTRACTOR
# ============================================================================

def preprocess_text(text: str) -> str:
    """Normalize text for better matching"""
    # Remove extra whitespace and normalize
    text = re.sub(r'\s+', ' ', text.strip())
    return text

def split_into_sentences(text: str) -> List[str]:
    """Split Sinhala text into sentences"""
    # Sinhala sentence endings: ।, ।।, !, ?, etc.
    sentences = re.split(r'[।।।।!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    return sentences

def extract_by_keywords(
    sentence: str,
    keywords: List[str],
    keyword_type: str
) -> List[Dict]:
    """
    Extract items matching keywords
    Returns list of matched items with confidence scores
    Cleans up the sentence to focus on relevant parts
    """
    matches = []
    sentence_lower = sentence.lower()
    
    for keyword in keywords:
        if keyword.lower() in sentence_lower:
            # Calculate confidence based on keyword length
            confidence = min(len(keyword) / 50.0, 1.0)
            
            # Clean up the sentence: remove extra whitespace, limit length
            cleaned_text = sentence.strip()
            if len(cleaned_text) > 300:  # If too long, truncate around keyword
                idx = sentence_lower.find(keyword.lower())
                if idx > 0:
                    start = max(0, idx - 100)
                    end = min(len(cleaned_text), idx + len(keyword) + 100)
                    cleaned_text = "..." + cleaned_text[start:end] + "..."
            
            matches.append({
                "text": cleaned_text,
                "keyword": keyword,
                "type": keyword_type,
                "confidence": confidence
            })
    
    return matches

def rule_based_extraction(text: str) -> Dict[str, List]:
    """
    Rule-based extraction of rights, obligations, deadlines, and risks
    """
    preprocessed = preprocess_text(text)
    sentences = split_into_sentences(preprocessed)
    
    results = {
        "rights": [],
        "obligations": [],
        "deadlines": [],
        "risks": []
    }
    
    for sentence in sentences:
        # Extract each category
        rights_matches = extract_by_keywords(sentence, RIGHTS_KEYWORDS_SI, "rights")
        obligations_matches = extract_by_keywords(sentence, OBLIGATIONS_KEYWORDS_SI, "obligations")
        deadlines_matches = extract_by_keywords(sentence, DEADLINES_KEYWORDS_SI, "deadlines")
        risks_matches = extract_by_keywords(sentence, RISK_KEYWORDS_SI, "risks")
        
        # Add to results (avoid duplicates)
        for match in rights_matches:
            if match["text"] not in [r["text"] for r in results["rights"]]:
                results["rights"].append(match)
        
        for match in obligations_matches:
            if match["text"] not in [o["text"] for o in results["obligations"]]:
                results["obligations"].append(match)
        
        for match in deadlines_matches:
            if match["text"] not in [d["text"] for d in results["deadlines"]]:
                results["deadlines"].append(match)
        
        for match in risks_matches:
            if match["text"] not in [r["text"] for r in results["risks"]]:
                results["risks"].append(match)
    
    return results

# ============================================================================
# LLM-BASED VALIDATION (Confirm extracted items are genuine)
# ============================================================================

def validate_with_llm(
    items: List[str],
    item_type: str,
    model_callable: callable,
    tokenizer_callable: callable,
    device: str,
    max_items: int = 10
) -> List[str]:
    """
    Use LLM to validate that identified sections are truly obligations/deadlines/risks/rights
    
    Args:
        items: List of extracted text sections
        item_type: "obligation" | "deadline" | "risk" | "right"
        model_callable: The LLM model
        tokenizer_callable: The tokenizer
        device: Device to run on
        max_items: Process max N items to save inference time
    
    Returns:
        List of validated items (only confirmed by LLM)
    """
    import torch
    
    if not items or len(items) == 0:
        return []
    
    # Limit to max_items for performance
    items_to_check = items[:max_items]
    validated_items = []
    
    type_names = {
        "obligation": "වගකීම (Obligation)",
        "deadline": "කාලසීමා (Deadline)",
        "risk": "අවදැරණීම (Risk)",
        "right": "අයිතිවාසිකම (Right)"
    }
    type_name = type_names.get(item_type, item_type)
    
    for item_text in items_to_check:
        try:
            # Create validation prompt in Sinhala
            validation_prompt = f"""ඔබ නීතිඥයෙක්. මෙම වාක්යය एक {type_name} ందැයි තහවුරු කරන්න.

වාක්යය: "{item_text}"

එය {type_name} ද? හាँ නැතිනම් නැත ? පිළිතුරු : හාँ ან නැත"""

            inputs = tokenizer_callable(
                validation_prompt,
                return_tensors="pt",
                max_length=256,
                truncation=True
            ).to(device)
            
            with torch.no_grad():
                output_ids = model_callable.generate(
                    inputs["input_ids"],
                    attention_mask=inputs["attention_mask"],
                    max_new_tokens=10,
                    num_beams=2,
                    do_sample=False,
                    eos_token_id=tokenizer_callable.eos_token_id,
                    pad_token_id=tokenizer_callable.pad_token_id
                )
            
            response = tokenizer_callable.decode(output_ids[0], skip_special_tokens=True).strip()
            
            # Check if LLM confirmed (look for "yes" indicators in Sinhala/English)
            if any(keyword in response.lower() for keyword in ["ඔව්", "yes", "true", "ඉතිරි"]):
                validated_items.append(item_text)
                print(f"✓ LLM Confirmed {item_type}: {item_text[:80]}")
            else:
                print(f"✗ LLM Rejected {item_type}: {item_text[:80]}")
        
        except Exception as e:
            print(f"LLM validation error for {item_type}: {str(e)}")
            # On error, include the item (assume it's correct)
            validated_items.append(item_text)
    
    return validated_items

def generate_refined_extraction(
    text: str,
    rule_based_results: Dict[str, List],
    model_callable: callable,
    tokenizer_callable: callable,
    device: str
) -> Dict[str, List[str]]:
    """
    Use LLM to refine and enhance rule-based extraction
    """
    import torch
    
    # Create a prompt for the LLM to extract structured information
    extraction_prompt = f"""
Analyze the following legal document excerpt and identify:
1. Rights (අයිතිවාසිකම)
2. Obligations (වගකීම)
3. Deadlines (කාලසීමා)
4. Risks (අවදැරණීම)

Document:
{text}

Provide a JSON response with these four categories, listing each item as a concise statement.
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
                num_beams=4,
                do_sample=True,
                temperature=0.7,
                top_p=0.9
            )
        
        response_text = tokenizer_callable.decode(output_ids[0], skip_special_tokens=True)
        
        # Try to parse as JSON
        try:
            extracted = json.loads(response_text)
            return {
                "rights": extracted.get("rights", []) if isinstance(extracted.get("rights"), list) else [],
                "obligations": extracted.get("obligations", []) if isinstance(extracted.get("obligations"), list) else [],
                "deadlines": extracted.get("deadlines", []) if isinstance(extracted.get("deadlines"), list) else [],
                "risks": extracted.get("risks", []) if isinstance(extracted.get("risks"), list) else []
            }
        except:
            # If not JSON, extract text from rule-based results as fallback
            return {
                "rights": [r["text"] for r in rule_based_results.get("rights", [])],
                "obligations": [o["text"] for o in rule_based_results.get("obligations", [])],
                "deadlines": [d["text"] for d in rule_based_results.get("deadlines", [])],
                "risks": [r["text"] for r in rule_based_results.get("risks", [])]
            }
    
    except Exception as e:
        print(f"Error in LLM refinement: {e}")
        # Return rule-based results with text extraction if LLM fails
        return {
            "rights": [r["text"] for r in rule_based_results.get("rights", [])],
            "obligations": [o["text"] for o in rule_based_results.get("obligations", [])],
            "deadlines": [d["text"] for d in rule_based_results.get("deadlines", [])],
            "risks": [r["text"] for r in rule_based_results.get("risks", [])]
        }

# ============================================================================
# HYBRID ANALYSIS (Main Function)
# ============================================================================

def analyze_legal_document(
    text: str,
    model_callable: callable = None,
    tokenizer_callable: callable = None,
    device: str = "cpu"
) -> Dict:
    """
    Hybrid analysis combining rule-based, refinement, and LLM validation
    
    Returns:
    {
        "rights": [...],
        "obligations": [...],
        "deadlines": [...],
        "risks": [...],
        "summary": {
            "total_rights": int,
            "total_obligations": int,
            "total_deadlines": int,
            "total_risks": int
        }
    }
    """
    # Step 1: Rule-based filtering (fast & accurate)
    rule_results = rule_based_extraction(text)
    
    # Step 2: Convert rule results to clean format
    formatted_results = {
        "rights": [r["text"] for r in rule_results["rights"]],
        "obligations": [o["text"] for o in rule_results["obligations"]],
        "deadlines": [d["text"] for d in rule_results["deadlines"]],
        "risks": [r["text"] for r in rule_results["risks"]]
    }
    
    # Step 3: LLM-based refinement (if model provided)
    if model_callable and tokenizer_callable:
        llm_results = generate_refined_extraction(
            text,
            rule_results,
            model_callable,
            tokenizer_callable,
            device
        )
        # Merge results (prefer LLM but keep rule-based as backup)
        for key in ["rights", "obligations", "deadlines", "risks"]:
            if llm_results.get(key):
                formatted_results[key] = llm_results[key]
    
    # Step 4: Remove duplicates while preserving order
    for key in ["rights", "obligations", "deadlines", "risks"]:
        seen = set()
        unique = []
        for item in formatted_results[key]:
            item_lower = str(item).lower().strip()
            if item_lower not in seen:
                seen.add(item_lower)
                unique.append(item)
        formatted_results[key] = unique
    
    # Step 5: 🔥 LLM VALIDATION - Confirm each item is genuinely a right/obligation/deadline/risk
    # Only save items that are confirmed by the LLM
    if model_callable and tokenizer_callable:
        print("\n[LLM Validation] Confirming identified items...")
        validated_results = {}
        
        for item_type, items in formatted_results.items():
            # Map result key to validation type
            type_map = {
                "rights": "right",
                "obligations": "obligation",
                "deadlines": "deadline",
                "risks": "risk"
            }
            validation_type = type_map.get(item_type, item_type)
            
            print(f"\n📋 Validating {item_type} ({len(items)} items)...")
            validated_items = validate_with_llm(
                items,
                validation_type,
                model_callable,
                tokenizer_callable,
                device,
                max_items=15  # Validate up to 15 items per category
            )
            validated_results[item_type] = validated_items
            print(f"✓ {len(validated_items)}/{len(items)} {item_type} confirmed")
        
        formatted_results = validated_results
    
    # Step 6: Create summary
    summary = {
        "total_rights": len(formatted_results["rights"]),
        "total_obligations": len(formatted_results["obligations"]),
        "total_deadlines": len(formatted_results["deadlines"]),
        "total_risks": len(formatted_results["risks"]),
    }
    
    return {
        "rights": formatted_results["rights"],
        "obligations": formatted_results["obligations"],
        "deadlines": formatted_results["deadlines"],
        "risks": formatted_results["risks"],
        "summary": summary
    }

# ============================================================================
# UTILITY: Format for Frontend
# ============================================================================

def format_for_highlights(analysis_result: Dict) -> Dict:
    """
    Format analysis results for the 'highlights' tab
    Returns organized structure for: Rights, Obligations, Deadlines
    """
    return {
        "rights": {
            "title": "ඔබගේ අයිතිවාසිකම (Rights)",
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
    """
    Format analysis results for the 'risk explanation' tab
    Returns risk insights with explanations
    """
    risks = analysis_result.get("risks", [])
    
    risk_explanations = []
    for risk in risks:
        risk_explanations.append({
            "question": f"වැදගතක් - {risk[:50]}...",
            "answer": f"මෙම අවදැරණීම සඳහා අවධානය යොමු කරන්න: {risk}"
        })
    
    return {
        "risks": risks,
        "explanations": risk_explanations
    }
