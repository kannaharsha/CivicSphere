"""
CivicSphere AI Assist — Phase 1: Steps 4, 5 & 6 Pipeline
Location: RAG+LLM/semantic_preprocessing.py

Sequential Preprocessing Pipeline:
  Step 3 Output (dataset_after_cleaning.json)
              ↓
  Step 4 → Intent & Stopword Removal (produces dataset_after_intent_removal.json)
              ↓
  Step 5 → Text Normalization (produces dataset_after_normalization.json)
              ↓
  Step 6 → Metadata Generation (produces dataset_after_metadata.json)
              ↓
  User Approval Summary & Review
              ↓
  (Optional --apply flag) → Update PostgreSQL + Supabase
"""

import os
import sys
import re
import json
import time
import urllib.request
import urllib.error
from pathlib import Path
from typing import Any, Dict, List, Set, Tuple, Optional

import psycopg2
from psycopg2.extras import RealDictCursor, Json
from dotenv import load_dotenv

# Ensure console handles UTF-8 on Windows
if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Resolve paths
current_dir = Path(__file__).resolve().parent
project_root = current_dir.parent

# Load environment variables
load_dotenv(project_root / ".env", override=True)
if (current_dir / ".env").exists():
    load_dotenv(current_dir / ".env", override=False)

# Output directories & files inside Schmes_information
OUTPUT_DIR = project_root / "Schmes_information"
CLEANED_DATASET_FILE = OUTPUT_DIR / "dataset_after_cleaning.json"
FALLBACK_DATASET_FILE = OUTPUT_DIR / "dataset_after_validation.json"

STEP4_OUTPUT_FILE = OUTPUT_DIR / "dataset_after_intent_removal.json"
STEP5_OUTPUT_FILE = OUTPUT_DIR / "dataset_after_normalization.json"
STEP6_OUTPUT_FILE = OUTPUT_DIR / "dataset_after_metadata.json"
PREPROCESSING_SUMMARY_FILE = OUTPUT_DIR / "preprocessing_summary.json"


def get_db_connection():
    """Establish and return a PostgreSQL connection."""
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return psycopg2.connect(database_url)
    
    password = os.getenv("DB_PASSWORD") or "Harsha@9106"
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", 5432)),
        dbname=os.getenv("DB_NAME", "civicsphere_db"),
        user=os.getenv("DB_USER", "postgres"),
        password=password
    )


# =====================================================================
# STEP 4: INTENT & STOPWORD REMOVAL
# =====================================================================

# Conversational intent phrases and greetings to remove
CONVERSATIONAL_INTENT_PATTERNS = [
    r"(?i)\b(please\s+(help\s+me\s+find|give\s+me|tell\s+me|show\s+me|provide\s+me\s+with))\b",
    r"(?i)\b(can\s+you\s+(tell\s+me|show\s+me|help\s+me\s+with|provide\s+details\s+on))\b",
    r"(?i)\b(i\s+(want|would\s+like|need)\s+to\s+(know|learn|find|apply\s+for|understand))\b",
    r"(?i)\b(tell\s+me\s+about|show\s+me\s+information\s+about|give\s+me\s+details\s+on)\b",
    r"(?i)\b(here\s+is\s+the\s+information|as\s+you\s+requested|feel\s+free\s+to\s+ask)\b",
    r"(?i)\b(hello|hi\s+there|hey\s+there|good\s+morning|good\s+afternoon|good\s+evening)\b",
    r"(?i)\b(kindly\s+note\s+that|please\s+note\s+that|it\s+may\s+be\s+noted\s+that)\b",
    r"(?i)\b(dear\s+sir|dear\s+madam|to\s+whom\s+it\s+may\s+concern)\b",
    r"(?i)\b(as\s+a\s+matter\s+of\s+fact|needless\s+to\s+say|at\s+the\s+end\s+of\s+the\s+day)\b",
    r"(?i)\b(in\s+order\s+to\s+provide|as\s+mentioned\s+above|as\s+stated\s+earlier)\b",
    r"(?i)\b(for\s+more\s+details\s+please\s+contact|for\s+further\s+queries)\b",
]

# Non-informative conversational filler stopwords to prune
NON_INFORMATIVE_STOPWORDS = [
    r"(?i)\b(basically|actually|literally|furthermore|moreover|hereby|thereof|wherein|henceforth)\b",
    r"(?i)\b(obviously|incidentally|nonetheless|nevertheless|pertaining\s+to|with\s+regards\s+to)\b",
    r"(?i)\b(in\s+this\s+regard|in\s+terms\s+of|as\s+well\s+as\s+the\s+fact\s+that)\b",
]

# Domain keywords that MUST be protected from truncation or removal
PROTECTED_DOMAIN_TERMS = {
    "pm-kisan", "kcc", "pmfby", "dbt", "msp", "fpo", "shg", "pacs", "bpl", "pwd", "sc", "st", "obc",
    "ews", "hectare", "acre", "quintal", "kharif", "rabi", "zaid", "paddy", "wheat", "cotton",
    "sugarcane", "maize", "pulses", "millets", "horticulture", "dairy", "poultry", "fisheries",
    "sericulture", "apiculture", "drip", "sprinkler", "polyhouse", "shade net", "solar pump",
    "soil health card", "kisan credit card", "interest subvention", "crop loan", "micro irrigation"
}


def remove_intent_and_fillers(text: Any) -> Any:
    """Strip conversational intent phrases and conversational fillers while preserving domain text."""
    if not isinstance(text, str):
        return text

    cleaned = text
    for pattern in CONVERSATIONAL_INTENT_PATTERNS:
        cleaned = re.sub(pattern, " ", cleaned)

    for pattern in NON_INFORMATIVE_STOPWORDS:
        cleaned = re.sub(pattern, " ", cleaned)

    # Clean double spaces and dangling punctuation
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    cleaned = re.sub(r"^[\s,;:.-]+", "", cleaned).strip()
    return cleaned


def clean_semantic_json(item: Any) -> Any:
    """Recursively clean intent phrases from dictionaries, lists, and strings."""
    if isinstance(item, str):
        return remove_intent_and_fillers(item)
    elif isinstance(item, list):
        return [clean_semantic_json(v) for v in item if v is not None]
    elif isinstance(item, dict):
        cleaned_dict = {}
        for k, v in item.items():
            clean_key = remove_intent_and_fillers(k) if isinstance(k, str) else k
            clean_val = clean_semantic_json(v)
            if clean_val is not None:
                cleaned_dict[clean_key] = clean_val
        return cleaned_dict
    return item


def step4_intent_and_stopword_removal(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Executes Step 4: Intent & Stopword Removal across structured and unstructured fields."""
    print(f"\n🔄 [Step 4/6] Executing Intent & Stopword Removal on {len(records)} records...")
    processed_records = []

    for rec in records:
        cleaned_rec = {
            "scheme_id": rec.get("scheme_id"),
            "scheme_name": remove_intent_and_fillers(rec.get("scheme_name", "")),
            "category": rec.get("category", ""),
            "state": rec.get("state", "All India"),
            "description": remove_intent_and_fillers(rec.get("description", "")),
            "eligibility": clean_semantic_json(rec.get("eligibility")),
            "benefits": clean_semantic_json(rec.get("benefits")),
            "documents": clean_semantic_json(rec.get("documents")),
            "application_process": clean_semantic_json(rec.get("application_process")),
            "official_urls": rec.get("official_urls") or [],
            "registration_links": rec.get("registration_links") or [],
            "faq": clean_semantic_json(rec.get("faq")),
            "tags": [remove_intent_and_fillers(t) for t in (rec.get("tags") or []) if t],
        }
        processed_records.append(cleaned_rec)

    print(f"✅ [Step 4] Intent & Stopword Removal complete. {len(processed_records)} semantic records generated.")
    return processed_records


# =====================================================================
# STEP 5: TEXT NORMALIZATION
# =====================================================================

def normalize_currency(text: str) -> str:
    """Standardize monetary formats to consistent INR representations (e.g. ₹50,000, ₹5 Lakhs)."""
    if not isinstance(text, str):
        return text

    # Handle Rs. / Rs / INR / Rupees with numbers
    t = re.sub(r"(?i)\b(?:rs\.?|inr|rupees)\s*([\d,]+(?:\.\d+)?)\s*(?:/-\s*|\s*lakhs?|\s*crores?)?", lambda m: _format_inr_match(m.group(0)), text)
    # Handle pure numbers with '/-' e.g., 50000/-
    t = re.sub(r"\b(\d[\d,]*)/-", r"₹\1", t)
    return t


def _format_inr_match(match_str: str) -> str:
    """Helper to convert matched currency string into standardized ₹ format."""
    clean = re.sub(r"(?i)(?:rs\.?|inr|rupees|/-)", "", match_str).strip()
    if not clean:
        return match_str
    if "lakh" in match_str.lower():
        num = re.search(r"[\d.]+", clean)
        return f"₹{num.group(0)} Lakhs" if num else f"₹{clean}"
    if "crore" in match_str.lower() or "cr" in match_str.lower():
        num = re.search(r"[\d.]+", clean)
        return f"₹{num.group(0)} Crores" if num else f"₹{clean}"
    return f"₹{clean}"


def normalize_administrative_titles(text: str) -> str:
    """Standardize government administrative titles into uniform official terminology."""
    if not isinstance(text, str):
        return text

    replacements = {
        r"(?i)\bgovt\.?\s+of\s+india\b": "Government of India",
        r"(?i)\bgovt\.?\s+of\s+([A-Za-z\s]+)\b": r"Government of \1",
        r"(?i)\bstate\s+govt\.?\b": "State Government",
        r"(?i)\bcentral\s+govt\.?\b": "Central Government",
        r"(?i)\bdept\.?\s+of\s+agri(?:culture)?\b": "Department of Agriculture",
        r"(?i)\bdept\.?\s+of\s+([A-Za-z\s]+)\b": r"Department of \1",
        r"(?i)\bmin\.?\s+of\s+agriculture\b": "Ministry of Agriculture & Farmers Welfare",
        r"(?i)\bdist\.?\s+collector\b": "District Collector",
        r"(?i)\bd\.?d\.?a\.?\b": "Deputy Director of Agriculture",
        r"(?i)\ba\.?d\.?o\.?\b": "Agriculture Development Officer",
        r"(?i)\bg\.?o\.?\s*ms\.?\s*no\.?\b": "Government Order (GO) No.",
    }

    normalized = text
    for pattern, repl in replacements.items():
        normalized = re.sub(pattern, repl, normalized)
    return normalized


def normalize_state_name(state_raw: Any) -> str:
    """Standardize state representation into a clean, canonical string."""
    if not state_raw:
        return "All India"
    if isinstance(state_raw, list):
        return ", ".join(state_raw)
    raw = str(state_raw).strip()
    if raw.startswith("[") and raw.endswith("]"):
        items = raw[1:-1].split(",")
        cleaned_items = [i.strip().replace("'", "").replace('"', "") for i in items if i.strip()]
        return ", ".join(cleaned_items) if cleaned_items else "All India"
    return raw


def json_to_natural_summary(record: Dict[str, Any]) -> str:
    """Convert JSON fields into a cohesive natural-language narrative summary for semantic RAG."""
    parts = []

    # 1. Scheme Title & Objective
    name = record.get("scheme_name", "").strip()
    state = normalize_state_name(record.get("state", "All India"))
    category = record.get("category", "").strip()
    parts.append(f"Scheme: {name}. Applicable State: {state}. Category: {category}.")

    # 2. Description
    desc = record.get("description", "").strip()
    if desc:
        parts.append(f"Description: {desc}")

    # 3. Eligibility Natural Text
    elig = record.get("eligibility")
    if isinstance(elig, dict):
        elig_parts = []
        if elig.get("age"):
            age_obj = elig["age"]
            if isinstance(age_obj, dict):
                min_a = age_obj.get("min")
                max_a = age_obj.get("max")
                if min_a and max_a:
                    elig_parts.append(f"Age between {min_a} and {max_a} years")
                elif min_a:
                    elig_parts.append(f"Minimum age {min_a} years")
                elif max_a:
                    elig_parts.append(f"Maximum age {max_a} years")
        if elig.get("income"):
            inc = elig["income"]
            if isinstance(inc, dict) and inc.get("max"):
                elig_parts.append(f"Annual family income up to ₹{inc['max']:,}")
        if elig.get("land"):
            land = elig["land"]
            if isinstance(land, dict):
                if land.get("max"):
                    elig_parts.append(f"Landholding up to {land['max']} hectares/acres")
        if elig.get("occupation"):
            elig_parts.append(f"Target occupation: {elig['occupation']}")
        if elig.get("priority"):
            prio = elig["priority"]
            if isinstance(prio, list):
                elig_parts.append(f"Priority categories: {', '.join(prio)}")
        if elig.get("conditions"):
            conds = elig["conditions"]
            if isinstance(conds, list):
                elig_parts.extend(conds[:5])  # top conditions
        if elig_parts:
            parts.append(f"Eligibility Criteria: {'; '.join(elig_parts)}.")
    elif isinstance(elig, str) and elig.strip():
        parts.append(f"Eligibility Criteria: {elig.strip()}")

    # 4. Benefits Natural Text
    bene = record.get("benefits")
    if isinstance(bene, dict):
        bene_parts = []
        if bene.get("subsidy"):
            sub = bene["subsidy"]
            if isinstance(sub, dict):
                if sub.get("percentage"):
                    bene_parts.append(f"Subsidy of {sub['percentage']}%")
                elif sub.get("max_percentage"):
                    bene_parts.append(f"Subsidy up to {sub['max_percentage']}%")
                if sub.get("max_amount"):
                    bene_parts.append(f"Financial assistance up to ₹{sub['max_amount']:,}")
        if bene.get("summary"):
            s_list = bene["summary"]
            if isinstance(s_list, list):
                bene_parts.extend(s_list[:4])
        if bene_parts:
            parts.append(f"Key Benefits: {'; '.join(bene_parts)}.")
    elif isinstance(bene, str) and bene.strip():
        parts.append(f"Key Benefits: {bene.strip()}")

    # 5. Application Process & Mode
    app_proc = record.get("application_process")
    if isinstance(app_proc, list) and len(app_proc) > 0:
        first = app_proc[0]
        if isinstance(first, dict):
            mode = first.get("mode", "Online")
            steps = first.get("steps", [])
            steps_txt = " ".join(steps[:3]) if isinstance(steps, list) else ""
            parts.append(f"Application Mode: {mode}. Process: {steps_txt}")
    elif isinstance(app_proc, str) and app_proc.strip():
        parts.append(f"Application Process: {app_proc.strip()}")

    return "\n\n".join(parts)


def step5_text_normalization(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Executes Step 5: Text Normalization across all structured and unstructured fields."""
    print(f"\n🔄 [Step 5/6] Executing Text Normalization on {len(records)} records...")
    normalized_records = []

    for rec in records:
        norm_desc = normalize_administrative_titles(normalize_currency(rec.get("description", "")))
        norm_state = normalize_state_name(rec.get("state"))
        
        # Build normalized narrative summary for vector search
        narrative_summary = json_to_natural_summary(rec)
        norm_summary = normalize_administrative_titles(normalize_currency(narrative_summary))

        normalized_rec = {
            "scheme_id": rec.get("scheme_id"),
            "scheme_name": normalize_administrative_titles(rec.get("scheme_name", "")),
            "category": rec.get("category", ""),
            "state": norm_state,
            "description": norm_desc,
            "eligibility": rec.get("eligibility"),
            "benefits": rec.get("benefits"),
            "documents": rec.get("documents"),
            "application_process": rec.get("application_process"),
            "official_urls": rec.get("official_urls") or [],
            "registration_links": rec.get("registration_links") or [],
            "faq": rec.get("faq"),
            "tags": rec.get("tags") or [],
            "normalized_summary": norm_summary,
        }
        normalized_records.append(normalized_rec)

    print(f"✅ [Step 5] Text Normalization complete. {len(normalized_records)} uniform records generated.")
    return normalized_records


# =====================================================================
# STEP 6: METADATA GENERATION
# =====================================================================

# Crop taxonomy dictionary for tagging
CROP_TAXONOMY = {
    "Paddy / Rice": [r"\bpaddy\b", r"\brice\b", r"\bdhan\b"],
    "Wheat": [r"\bwheat\b", r"\bgehun\b"],
    "Cotton": [r"\bcotton\b", r"\bkapas\b"],
    "Sugarcane": [r"\bsugarcane\b", r"\bganna\b"],
    "Pulses": [r"\bpulses?\b", r"\bgram\b", r"\btur\b", r"\barhar\b", r"\bmoong\b", r"\burad\b", r"\blentils?\b", r"\bchana\b"],
    "Oilseeds": [r"\boilseeds?\b", r"\bmustard\b", r"\bgroundnut\b", r"\bsoybean\b", r"\bsunflower\b", r"\bsesame\b"],
    "Millets / Shree Anna": [r"\bmillets?\b", r"\bjowar\b", r"\bbajra\b", r"\bragi\b", r"\bshree\s+anna\b", r"\bkodo\b", r"\bkutki\b"],
    "Horticulture & Fruits": [r"\bhorticulture\b", r"\bfruits?\b", r"\bmango\b", r"\bbanana\b", r"\bapple\b", r"\bcitrus\b", r"\bgrapes?\b", r"\bguava\b"],
    "Vegetables": [r"\bvegetables?\b", r"\bpotato\b", r"\btomato\b", r"\bonion\b", r"\bchilli\b", r"\bgarlic\b"],
    "Spices & Plantation": [r"\bspices?\b", r"\bcardamom\b", r"\bpepper\b", r"\bturmeric\b", r"\bginger\b", r"\btea\b", r"\bcoffee\b", r"\brubber\b", r"\bcoconut\b"],
    "Floriculture": [r"\bflowers?\b", r"\bfloriculture\b", r"\brose\b", r"\bmarigold\b"],
}

# Farmer types and demographics taxonomy
FARMER_TAXONOMY = {
    "Small & Marginal Farmers": [r"\bsmall\s+and\s+marginal\b", r"\bsmall\s+farmers?\b", r"\bmarginal\s+farmers?\b", r"\b<\s*2\s*ha\b", r"\bup\s+to\s+2\s+hectares\b"],
    "Women Farmers": [r"\bwomen\s+farmers?\b", r"\bfemale\s+farmers?\b", r"\bmahila\s+kisan\b", r"\bwomen\b"],
    "Tenant Farmers & Sharecroppers": [r"\btenant\s+farmers?\b", r"\bsharecroppers?\b", r"\blessee\s+cultivators?\b"],
    "SC / ST Farmers": [r"\bsc\b", r"\bst\b", r"\bscheduled\s+caste\b", r"\bscheduled\s+tribe\b"],
    "Organic Farmers": [r"\borganic\s+farm(?:ing|er)\b", r"\bnatural\s+farm(?:ing|er)\b", r"\bparamparagat\b", r"\bzero\s+budget\b"],
    "Fishermen & Aquaculturists": [r"\bfisher(?:men|man|ies)\b", r"\baquaculture\b", r"\bfish\s+farm(?:ing|er)\b"],
    "Livestock & Dairy Keepers": [r"\bdairy\b", r"\blivestock\b", r"\bpoultry\b", r"\banimal\s+husbandry\b", r"\bpiggery\b", r"\bgoat\s+rearing\b"],
}

# Sector classification taxonomy
SECTOR_TAXONOMY = {
    "Crop Production & Inputs": [r"\bseeds?\b", r"\bfertilizers?\b", r"\bpesticides?\b", r"\bcrop\s+production\b", r"\bsoil\s+health\b", r"\bmsp\b"],
    "Farm Mechanization & Machinery": [r"\btractor\b", r"\bmachinery\b", r"\bmechanization\b", r"\bpower\s+tiller\b", r"\bharvester\b", r"\bimplements?\b"],
    "Irrigation & Water Management": [r"\bmicros?irrigation\b", r"\bdrip\b", r"\bsprinkler\b", r"\bsolar\s+pump\b", r"\bwatershed\b", r"\bborewell\b", r"\bpond\b"],
    "Credit, Subsidy & Financial Assistance": [r"\bcredit\b", r"\bkcc\b", r"\bloan\b", r"\bsubsidy\b", r"\bdirect\s+benefit\s+transfer\b", r"\bdbt\b", r"\bfinancial\s+assistance\b", r"\binterest\s+subvention\b"],
    "Crop Insurance & Risk Management": [r"\binsurance\b", r"\bpmfby\b", r"\bcompensation\b", r"\bdrought\b", r"\bflood\b", r"\byield\s+loss\b"],
    "Horticulture & High-Value Crops": [r"\bhorticulture\b", r"\bpolyhouse\b", r"\bshade\s+net\b", r"\bgreenhouse\b", r"\bnursery\b", r"\bhydroponics\b"],
    "Animal Husbandry, Dairy & Fisheries": [r"\bdairy\b", r"\banimal\s+husbandry\b", r"\bpoultry\b", r"\bfisheries?\b", r"\bcattle\b", r"\bfodder\b"],
    "Post-Harvest & Storage": [r"\bcold\s+storage\b", r"\bgodown\b", r"\bwarehouse\b", r"\bprocessing\b", r"\bvalue\s+addition\b", r"\bmarket\s+infrastructure\b"],
    "Skill Development & Entrepreneurship": [r"\btraining\b", r"\bskill\b", r"\bstartup\b", r"\bentrepreneur\b", r"\byouth\b", r"\bincubation\b"],
}


def extract_tags_by_taxonomy(full_text: str, taxonomy: Dict[str, List[str]]) -> List[str]:
    """Match regex patterns from a taxonomy dictionary against text and return matching tag categories."""
    matched = []
    for tag_name, patterns in taxonomy.items():
        for pat in patterns:
            if re.search(pat, full_text, re.IGNORECASE):
                matched.append(tag_name)
                break
    return matched


def extract_ministry(record: Dict[str, Any]) -> str:
    """Extract and normalize Ministry/Department classification."""
    state = record.get("state", "All India")
    name = record.get("scheme_name", "")
    desc = record.get("description", "")
    combined = f"{name} {desc}".lower()

    if "fisheries" in combined or "matsya" in combined:
        return "Ministry of Fisheries, Animal Husbandry and Dairying"
    if "animal husbandry" in combined or "dairy" in combined or "livestock" in combined:
        return "Ministry of Fisheries, Animal Husbandry and Dairying"
    if "rural development" in combined or "mgnregs" in combined or "pmgsy" in combined:
        return "Ministry of Rural Development"
    if "food processing" in combined:
        return "Ministry of Food Processing Industries"
    if state and state != "All India" and len(state.split(",")) == 1:
        return f"Department of Agriculture, Government of {state.strip()}"
    return "Ministry of Agriculture & Farmers Welfare"


def extract_scheme_level(state: str, name: str, desc: str) -> str:
    """Classify scheme as Central Sector, Centrally Sponsored, or State Government."""
    if not state or state.strip() == "All India":
        return "Central Sector Scheme"
    combined = f"{name} {desc}".lower()
    if "centrally sponsored" in combined or "sharing pattern" in combined:
        return "Centrally Sponsored Scheme"
    if len(state.split(",")) > 1:
        return "Centrally Sponsored Scheme"
    return "State Government Scheme"


def extract_application_mode(record: Dict[str, Any]) -> str:
    """Extract application mode (Online, Offline, Hybrid)."""
    app_proc = record.get("application_process")
    proc_str = json.dumps(app_proc) if app_proc else ""
    desc = record.get("description", "")
    combined = f"{proc_str} {desc}".lower()

    has_online = "online" in combined or "portal" in combined or "website" in combined or bool(record.get("registration_links"))
    has_offline = "offline" in combined or "physical" in combined or "office" in combined or "panchayat" in combined or "submit application" in combined

    if has_online and has_offline:
        return "Hybrid / CSC / Online"
    if has_online:
        return "Online"
    if has_offline:
        return "Offline (Panchayat / Agriculture Office)"
    return "Online"


def extract_benefit_tags(record: Dict[str, Any]) -> List[str]:
    """Extract benefit type tags."""
    benefits_json = json.dumps(record.get("benefits", {}))
    desc = record.get("description", "")
    combined = f"{benefits_json} {desc}".lower()

    tags = []
    if "subsidy" in combined:
        tags.append("Financial Subsidy")
    if "dbt" in combined or "direct benefit transfer" in combined or "bank account" in combined:
        tags.append("Direct Benefit Transfer (DBT)")
    if "loan" in combined or "credit" in combined or "kcc" in combined:
        tags.append("Low-Interest Credit / Loan")
    if "insurance" in combined or "pmfby" in combined or "claim" in combined:
        tags.append("Crop Insurance Coverage")
    if "training" in combined or "capacity building" in combined or "workshop" in combined:
        tags.append("Free Training & Skill Development")
    if "free" in combined and ("seed" in combined or "kit" in combined or "fertilizer" in combined):
        tags.append("Free Agricultural Inputs")
    if "machinery" in combined or "tractor" in combined or "equipment" in combined:
        tags.append("Farm Equipment Assistance")
    if not tags:
        tags.append("Financial Assistance")
    return tags


def extract_eligibility_tags(record: Dict[str, Any]) -> List[str]:
    """Extract clean eligibility tags for filtering."""
    elig_json = json.dumps(record.get("eligibility", {}))
    desc = record.get("description", "")
    combined = f"{elig_json} {desc}".lower()

    tags = []
    if "aadhaar" in combined:
        tags.append("Aadhaar Card Required")
    if "land" in combined or "patta" in combined or "ror" in combined or "khatoni" in combined:
        tags.append("Agricultural Land Ownership / RoR")
    if "bank" in combined or "passbook" in combined:
        tags.append("Active Bank Account")
    if "resident" in combined or "domicile" in combined or "certificate of identification" in combined:
        tags.append("State Domicile / Residential Proof")
    if "small" in combined or "marginal" in combined:
        tags.append("Small & Marginal Farmer Category")
    if "sc" in combined or "st" in combined or "scheduled" in combined:
        tags.append("SC / ST Priority")
    if "women" in combined or "female" in combined or "mahila" in combined:
        tags.append("Women Farmer Priority")
    if "age" in combined:
        tags.append("Age Criteria Applicable")
    if "income" in combined:
        tags.append("Income Threshold Applicable")
    return tags or ["Eligible Farmers"]


def extract_government_tags(record: Dict[str, Any]) -> List[str]:
    """Extract key government scheme badges & agencies."""
    full_text = f"{record.get('scheme_name', '')} {record.get('description', '')}".lower()
    gov_tags = []
    if "pm-kisan" in full_text or "pm kisan" in full_text:
        gov_tags.append("PM-KISAN")
    if "pmfby" in full_text or "crop insurance" in full_text:
        gov_tags.append("PMFBY")
    if "kcc" in full_text or "kisan credit" in full_text:
        gov_tags.append("KCC")
    if "nabard" in full_text:
        gov_tags.append("NABARD")
    if "rkvy" in full_text:
        gov_tags.append("RKVY")
    if "midh" in full_text:
        gov_tags.append("MIDH")
    if "dbt" in full_text:
        gov_tags.append("DBT Enabled")
    if not gov_tags:
        gov_tags.append("Government Verified")
    return gov_tags


def step6_metadata_generation(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Executes Step 6: Metadata Generation across all records."""
    print(f"\n🔄 [Step 6/6] Executing Metadata Generation on {len(records)} records...")
    enriched_records = []

    for rec in records:
        full_text = f"{rec.get('scheme_name', '')} {rec.get('description', '')} {json.dumps(rec.get('eligibility', {}))} {json.dumps(rec.get('benefits', {}))}"

        # Extract Sector & Sub-Sector
        matched_sectors = extract_tags_by_taxonomy(full_text, SECTOR_TAXONOMY)
        primary_sector = matched_sectors[0] if matched_sectors else "Agriculture & Allied Sectors"
        sub_sector = ", ".join(matched_sectors[1:3]) if len(matched_sectors) > 1 else primary_sector

        # Extract Crops, Farmer tags & Demographics
        crop_tags = extract_tags_by_taxonomy(full_text, CROP_TAXONOMY)
        farmer_tags = extract_tags_by_taxonomy(full_text, FARMER_TAXONOMY)
        benefit_tags = extract_benefit_tags(rec)
        eligibility_tags = extract_eligibility_tags(rec)
        government_tags = extract_government_tags(rec)

        state = rec.get("state", "All India")
        ministry = extract_ministry(rec)
        scheme_level = extract_scheme_level(state, rec.get("scheme_name", ""), rec.get("description", ""))
        application_mode = extract_application_mode(rec)

        # Keyword tags for hybrid search
        keyword_tags = list(set(
            (rec.get("tags") or []) +
            matched_sectors +
            crop_tags +
            farmer_tags +
            benefit_tags +
            government_tags
        ))

        # Target demographic list
        target_demographic = farmer_tags or ["All Farmers", "Rural Citizens"]

        enriched_rec = {
            # Base data
            **rec,

            # Metadata Columns (Required for Phase 1 Step 6)
            "ministry": ministry,
            "sector": primary_sector,
            "sub_sector": sub_sector,
            "target_demographic": target_demographic,
            "beneficiary_category": ["Individual Farmer", "FPOs / SHGs"] if "fpo" in full_text.lower() else ["Individual Farmer"],
            "occupation_category": ["Agriculture & Allied"],
            "language": "English",
            "scheme_level": scheme_level,
            "document_language": ["English", "Hindi"],
            "application_mode": application_mode,
            "eligibility_tags": eligibility_tags,
            "benefit_tags": benefit_tags,
            "keyword_tags": keyword_tags,
            "crop_tags": crop_tags or ["All Crops"],
            "farmer_tags": farmer_tags or ["All Farmers"],
            "government_tags": government_tags,
        }
        enriched_records.append(enriched_rec)

    print(f"✅ [Step 6] Metadata Generation complete. {len(enriched_records)} fully enriched records created.")
    return enriched_records


# =====================================================================
# PIPELINE ORCHESTRATION & SUMMARY
# =====================================================================

def run_semantic_preprocessing_pipeline() -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """Runs Step 4, Step 5, and Step 6 sequentially and writes output JSONs."""
    start_time = time.time()

    # Step A: Load input data
    input_file = CLEANED_DATASET_FILE if CLEANED_DATASET_FILE.exists() else FALLBACK_DATASET_FILE
    if not input_file.exists():
        print(f"❌ Input dataset not found. Checked:\n   1. {CLEANED_DATASET_FILE}\n   2. {FALLBACK_DATASET_FILE}", file=sys.stderr)
        sys.exit(1)

    print("=" * 70)
    print("🚀 CIVICSPHERE AI ASSIST — PREPROCESSING PIPELINE (STEPS 4, 5 & 6)")
    print("=" * 70)
    print(f"📥 Loading input dataset from:\n   {input_file}")

    with open(input_file, "r", encoding="utf-8") as f:
        input_records = json.load(f)

    total_records = len(input_records)
    print(f"🎯 Total records to process: {total_records}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Step 4: Intent & Stopword Removal
    step4_records = step4_intent_and_stopword_removal(input_records)
    with open(STEP4_OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(step4_records, f, indent=2, ensure_ascii=False)
    print(f"💾 Step 4 output saved to:\n   {STEP4_OUTPUT_FILE}")

    # Step 5: Text Normalization
    step5_records = step5_text_normalization(step4_records)
    with open(STEP5_OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(step5_records, f, indent=2, ensure_ascii=False)
    print(f"💾 Step 5 output saved to:\n   {STEP5_OUTPUT_FILE}")

    # Step 6: Metadata Generation
    step6_records = step6_metadata_generation(step5_records)
    with open(STEP6_OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(step6_records, f, indent=2, ensure_ascii=False)
    print(f"💾 Step 6 output saved to:\n   {STEP6_OUTPUT_FILE}")

    duration = round(time.time() - start_time, 2)

    # Calculate Summary Metrics
    sectors_count = set(r["sector"] for r in step6_records)
    ministries_count = set(r["ministry"] for r in step6_records)
    states_count = set(r["state"] for r in step6_records)
    total_tags = sum(len(r.get("keyword_tags", [])) for r in step6_records)

    summary = {
        "pipeline": "Phase 1: Steps 4, 5 & 6 (Intent Removal + Normalization + Metadata)",
        "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total_records_processed": total_records,
        "step4_file": str(STEP4_OUTPUT_FILE.name),
        "step5_file": str(STEP5_OUTPUT_FILE.name),
        "step6_file": str(STEP6_OUTPUT_FILE.name),
        "unique_sectors_identified": len(sectors_count),
        "unique_ministries_identified": len(ministries_count),
        "unique_states_covered": len(states_count),
        "total_metadata_tags_generated": total_tags,
        "avg_tags_per_scheme": round(total_tags / total_records, 1) if total_records else 0,
        "execution_time_seconds": duration,
        "sample_enriched_scheme": {
            "scheme_id": step6_records[0]["scheme_id"],
            "scheme_name": step6_records[0]["scheme_name"],
            "sector": step6_records[0]["sector"],
            "sub_sector": step6_records[0]["sub_sector"],
            "ministry": step6_records[0]["ministry"],
            "scheme_level": step6_records[0]["scheme_level"],
            "application_mode": step6_records[0]["application_mode"],
            "crop_tags": step6_records[0]["crop_tags"],
            "farmer_tags": step6_records[0]["farmer_tags"],
            "benefit_tags": step6_records[0]["benefit_tags"],
        } if step6_records else {}
    }

    with open(PREPROCESSING_SUMMARY_FILE, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    print("\n" + "=" * 70)
    print("📊 PREPROCESSING PIPELINE SUMMARY")
    print("=" * 70)
    print(f"Total Schemes Processed         : {total_records}")
    print(f"Unique Sectors Identified       : {len(sectors_count)}")
    print(f"Unique Ministries Identified    : {len(ministries_count)}")
    print(f"Unique States Covered           : {len(states_count)}")
    print(f"Total Searchable Tags Generated : {total_tags}")
    print(f"Avg Tags per Scheme             : {summary['avg_tags_per_scheme']}")
    print(f"⏱️ Time Taken                   : {duration}s")
    print("-" * 70)
    print(f"📁 Step 4 JSON : {STEP4_OUTPUT_FILE}")
    print(f"📁 Step 5 JSON : {STEP5_OUTPUT_FILE}")
    print(f"📁 Step 6 JSON : {STEP6_OUTPUT_FILE}")
    print(f"📁 Summary JSON: {PREPROCESSING_SUMMARY_FILE}")
    print("=" * 70)
    print("\n⚠️ USER APPROVAL REQUIRED:")
    print("PostgreSQL and Supabase databases have NOT been modified.")
    print("Please review the generated dataset_after_metadata.json summary above.")
    print("To apply metadata columns and updated dataset to PostgreSQL and Supabase, run:")
    print("   python semantic_preprocessing.py --apply")
    print("=" * 70)

    return step6_records, summary


# =====================================================================
# DATABASE & SUPABASE MIGRATION & REPLACEMENT (AFTER APPROVAL)
# =====================================================================

def ensure_metadata_columns_pg(cur):
    """
    Ensures the base agriculture_schemes table exists with its sequence and core 13 columns,
    and then adds the additional metadata columns if they do not exist.
    """
    # 1. Base Sequence & Table with core 13 columns
    cur.execute("CREATE SEQUENCE IF NOT EXISTS agriculture_schemes_seq START WITH 1001;")
    cur.execute("""
        CREATE TABLE IF NOT EXISTS agriculture_schemes (
            scheme_id VARCHAR(50) PRIMARY KEY DEFAULT ('AGRI' || nextval('agriculture_schemes_seq')),
            scheme_name TEXT NOT NULL,
            category TEXT NOT NULL,
            state TEXT NOT NULL,
            description TEXT,
            eligibility JSONB,
            benefits JSONB,
            documents JSONB,
            application_process JSONB,
            official_urls TEXT[],
            registration_links TEXT[],
            faq JSONB,
            tags TEXT[]
        );
    """)

    # 2. Add the additional metadata columns
    columns_sql = [
        "ALTER TABLE agriculture_schemes ADD COLUMN IF NOT EXISTS ministry TEXT;",
        "ALTER TABLE agriculture_schemes ADD COLUMN IF NOT EXISTS sector TEXT;",
        "ALTER TABLE agriculture_schemes ADD COLUMN IF NOT EXISTS sub_sector TEXT;",
        "ALTER TABLE agriculture_schemes ADD COLUMN IF NOT EXISTS target_demographic TEXT[];",
        "ALTER TABLE agriculture_schemes ADD COLUMN IF NOT EXISTS beneficiary_category TEXT[];",
        "ALTER TABLE agriculture_schemes ADD COLUMN IF NOT EXISTS occupation_category TEXT[];",
        "ALTER TABLE agriculture_schemes ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'English';",
        "ALTER TABLE agriculture_schemes ADD COLUMN IF NOT EXISTS scheme_level VARCHAR(100);",
        "ALTER TABLE agriculture_schemes ADD COLUMN IF NOT EXISTS document_language TEXT[];",
        "ALTER TABLE agriculture_schemes ADD COLUMN IF NOT EXISTS application_mode VARCHAR(100);",
        "ALTER TABLE agriculture_schemes ADD COLUMN IF NOT EXISTS eligibility_tags TEXT[];",
        "ALTER TABLE agriculture_schemes ADD COLUMN IF NOT EXISTS benefit_tags TEXT[];",
        "ALTER TABLE agriculture_schemes ADD COLUMN IF NOT EXISTS keyword_tags TEXT[];",
        "ALTER TABLE agriculture_schemes ADD COLUMN IF NOT EXISTS crop_tags TEXT[];",
        "ALTER TABLE agriculture_schemes ADD COLUMN IF NOT EXISTS farmer_tags TEXT[];",
        "ALTER TABLE agriculture_schemes ADD COLUMN IF NOT EXISTS government_tags TEXT[];",
        "ALTER TABLE agriculture_schemes ADD COLUMN IF NOT EXISTS normalized_summary TEXT;",
    ]
    for sql in columns_sql:
        cur.execute(sql)


def sync_metadata_to_supabase(records: List[Dict[str, Any]]) -> bool:
    """Sync full metadata records into Supabase agriculture_schemes table with automatic schema adaptation."""
    supabase_url = (os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL") or "").strip().rstrip("/")
    supabase_key = (
        os.getenv("SUPABASE_SERVICE_ROLE_KEY") or
        os.getenv("SUPABASE_KEY") or
        os.getenv("SUPABASE_ANON_KEY") or
        os.getenv("VITE_SUPABASE_ANON_KEY") or
        ""
    ).strip()

    if not supabase_url or not supabase_key:
        print("⚠️ Supabase credentials not found. Skipping Supabase sync.")
        return False

    print(f"\n🚀 [Supabase] Syncing {len(records)} enriched scheme records to Supabase...")
    rest_url = f"{supabase_url}/rest/v1/agriculture_schemes"

    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
    }

    batch_size = 50
    total_synced = 0
    use_core_columns_only = False

    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        payload = []

        for item in batch:
            # Combine generated keyword tags with existing tags
            merged_tags = list(set((item.get("tags") or []) + (item.get("keyword_tags") or [])))

            if not use_core_columns_only:
                payload.append({
                    "scheme_id": item["scheme_id"],
                    "scheme_name": item["scheme_name"],
                    "category": item["category"],
                    "state": item["state"],
                    "description": item.get("description"),
                    "eligibility": item.get("eligibility"),
                    "benefits": item.get("benefits"),
                    "documents": item.get("documents"),
                    "application_process": item.get("application_process"),
                    "official_urls": item.get("official_urls") or [],
                    "registration_links": item.get("registration_links") or [],
                    "faq": item.get("faq"),
                    "tags": merged_tags,
                    "ministry": item.get("ministry"),
                    "sector": item.get("sector"),
                    "sub_sector": item.get("sub_sector"),
                    "target_demographic": item.get("target_demographic") or [],
                    "beneficiary_category": item.get("beneficiary_category") or [],
                    "occupation_category": item.get("occupation_category") or [],
                    "language": item.get("language", "English"),
                    "scheme_level": item.get("scheme_level"),
                    "document_language": item.get("document_language") or ["English"],
                    "application_mode": item.get("application_mode"),
                    "eligibility_tags": item.get("eligibility_tags") or [],
                    "benefit_tags": item.get("benefit_tags") or [],
                    "keyword_tags": item.get("keyword_tags") or [],
                    "crop_tags": item.get("crop_tags") or [],
                    "farmer_tags": item.get("farmer_tags") or [],
                    "government_tags": item.get("government_tags") or [],
                    "normalized_summary": item.get("normalized_summary"),
                })
            else:
                payload.append({
                    "scheme_id": item["scheme_id"],
                    "scheme_name": item["scheme_name"],
                    "category": item["category"],
                    "state": item["state"],
                    "description": item.get("description"),
                    "eligibility": item.get("eligibility"),
                    "benefits": item.get("benefits"),
                    "documents": item.get("documents"),
                    "application_process": item.get("application_process"),
                    "official_urls": item.get("official_urls") or [],
                    "registration_links": item.get("registration_links") or [],
                    "faq": item.get("faq"),
                    "tags": merged_tags,
                })

        try:
            req = urllib.request.Request(
                rest_url,
                data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
                headers=headers,
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=30) as resp:
                if resp.status in (200, 201):
                    total_synced += len(batch)
                    print(f"   ↳ [Supabase] Synced batch {i // batch_size + 1} ({total_synced}/{len(records)} records)")
                else:
                    print(f"   ⚠️ [Supabase] Batch {i // batch_size + 1} status: {resp.status}")
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="replace")
            # If metadata column is missing from Supabase schema cache (PGRST204), fallback to core columns
            if "PGRST204" in err_body or "schema cache" in err_body:
                if not use_core_columns_only:
                    print(f"   ℹ️ [Supabase] Extra metadata columns not yet added to Supabase schema. Switching to core 13 columns...")
                    use_core_columns_only = True
                    # Retry this batch with core columns
                    core_payload = []
                    for item in batch:
                        core_payload.append({
                            "scheme_id": item["scheme_id"],
                            "scheme_name": item["scheme_name"],
                            "category": item["category"],
                            "state": item["state"],
                            "description": item.get("description"),
                            "eligibility": item.get("eligibility"),
                            "benefits": item.get("benefits"),
                            "documents": item.get("documents"),
                            "application_process": item.get("application_process"),
                            "official_urls": item.get("official_urls") or [],
                            "registration_links": item.get("registration_links") or [],
                            "faq": item.get("faq"),
                            "tags": list(set((item.get("tags") or []) + (item.get("keyword_tags") or []))),
                        })
                    try:
                        retry_req = urllib.request.Request(
                            rest_url,
                            data=json.dumps(core_payload, ensure_ascii=False).encode("utf-8"),
                            headers=headers,
                            method="POST"
                        )
                        with urllib.request.urlopen(retry_req, timeout=30) as retry_resp:
                            if retry_resp.status in (200, 201):
                                total_synced += len(batch)
                                print(f"   ↳ [Supabase] Synced batch {i // batch_size + 1} (Core Schema) ({total_synced}/{len(records)} records)")
                    except Exception as retry_err:
                        print(f"   ❌ [Supabase] Core schema retry error on batch {i // batch_size + 1}: {retry_err}", file=sys.stderr)
            else:
                print(f"   ❌ [Supabase] HTTP error on batch {i // batch_size + 1} ({e.code}): {err_body}", file=sys.stderr)
        except Exception as e:
            print(f"   ❌ [Supabase] Error on batch {i // batch_size + 1}: {e}", file=sys.stderr)

    if total_synced > 0:
        print(f"✨ [Supabase] Successfully synced {total_synced}/{len(records)} records to Supabase 'agriculture_schemes' table!\n")
    return total_synced > 0


def apply_metadata_dataset_to_db():
    """Applies dataset_after_metadata.json to PostgreSQL and Supabase after explicit approval."""
    if not STEP6_OUTPUT_FILE.exists():
        print(f"❌ Enriched dataset not found at {STEP6_OUTPUT_FILE}.")
        print("Please run pipeline first: python semantic_preprocessing.py")
        return

    with open(STEP6_OUTPUT_FILE, "r", encoding="utf-8") as f:
        enriched_data = json.load(f)

    if not isinstance(enriched_data, list) or len(enriched_data) == 0:
        print("❌ Dataset is empty. Aborting database replacement.")
        return

    print("⚠️  DATABASE & SUPABASE REPLACEMENT WORKFLOW (STEPS 4-6 ENRICHED)")
    print(f"This will replace all rows in 'agriculture_schemes' with {len(enriched_data)} records containing full metadata.")
    
    if "--yes" not in sys.argv and "-y" not in sys.argv:
        confirm = input("Are you sure you want to proceed? Type 'YES' to confirm: ").strip()
        if confirm != "YES":
            print("🚫 Database update cancelled by user. No changes were made.")
            return
    else:
        print("✅ Auto-confirmed via --yes flag. Proceeding with database replacement...")

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        print("🛠️  [1/4] Ensuring base table and adding metadata columns in PostgreSQL...")
        ensure_metadata_columns_pg(cur)

        print("🧹 [2/4] Truncating PostgreSQL 'agriculture_schemes' table...")
        cur.execute("TRUNCATE TABLE agriculture_schemes CASCADE;")

        print(f"💾 [3/4] Inserting {len(enriched_data)} enriched records with metadata columns into PostgreSQL...")
        insert_query = """
            INSERT INTO agriculture_schemes (
                scheme_id,
                scheme_name,
                category,
                state,
                description,
                eligibility,
                benefits,
                documents,
                application_process,
                official_urls,
                registration_links,
                faq,
                tags,
                ministry,
                sector,
                sub_sector,
                target_demographic,
                beneficiary_category,
                occupation_category,
                language,
                scheme_level,
                document_language,
                application_mode,
                eligibility_tags,
                benefit_tags,
                keyword_tags,
                crop_tags,
                farmer_tags,
                government_tags,
                normalized_summary
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            );
        """

        for item in enriched_data:
            cur.execute(
                insert_query,
                (
                    item["scheme_id"],
                    item["scheme_name"],
                    item["category"],
                    item["state"],
                    item["description"],
                    Json(item["eligibility"]) if item.get("eligibility") is not None else None,
                    Json(item["benefits"]) if item.get("benefits") is not None else None,
                    Json(item["documents"]) if item.get("documents") is not None else None,
                    Json(item["application_process"]) if item.get("application_process") is not None else None,
                    item.get("official_urls") or [],
                    item.get("registration_links") or [],
                    Json(item["faq"]) if item.get("faq") is not None else None,
                    item.get("tags") or [],
                    item.get("ministry"),
                    item.get("sector"),
                    item.get("sub_sector"),
                    item.get("target_demographic") or [],
                    item.get("beneficiary_category") or [],
                    item.get("occupation_category") or [],
                    item.get("language", "English"),
                    item.get("scheme_level"),
                    item.get("document_language") or ["English"],
                    item.get("application_mode"),
                    item.get("eligibility_tags") or [],
                    item.get("benefit_tags") or [],
                    item.get("keyword_tags") or [],
                    item.get("crop_tags") or [],
                    item.get("farmer_tags") or [],
                    item.get("government_tags") or [],
                    item.get("normalized_summary"),
                ),
            )

        conn.commit()
        print("✨ [3/4] PostgreSQL database replacement completed successfully!")
        print(f"🎯 Total records in PostgreSQL agriculture_schemes: {len(enriched_data)}")

        # Step 4: Sync to Supabase
        print("☁️  [4/4] Syncing enriched records to Supabase...")
        sync_metadata_to_supabase(enriched_data)

    except Exception as e:
        conn.rollback()
        print(f"❌ Failed to update PostgreSQL database: {e}", file=sys.stderr)
        print("☁️  Attempting Supabase sync as fallback...")
        sync_metadata_to_supabase(enriched_data)
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    if "--apply" in sys.argv or "--update-db" in sys.argv:
        apply_metadata_dataset_to_db()
    else:
        run_semantic_preprocessing_pipeline()
