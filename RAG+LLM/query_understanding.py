"""
CivicSphere AI Assist — Phase 2: User Query Understanding Pipeline (Steps 10 → 14)
Location: RAG+LLM/query_understanding.py

Pipeline Sequence:
  Step 10 → User Input Capture (Raw user prompt + Session Context)
              ↓
  Step 11 → Language Detection (English verification & confidence tagging)
              ↓
  Step 12 → Query Cleaning (Voice transcription artifact removal & text normalization)
              ↓
  Step 13 → Query Understanding & Intent Parsing (Intent, Scheme, Geo, Sector, Criteria & SQL Filters)
              ↓
  Step 14 → Citizen Profile Merge (PostgreSQL citizen_profiles merge & Personalized Filters)
              ↓
  Summary Review & JSON Audit Log (Do NOT execute SQL/Vector Retrieval)
"""

import os
import sys
import re
import json
import uuid
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Ensure console handles UTF-8 on Windows
if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Resolve directory paths
CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent
OUTPUT_DIR = PROJECT_ROOT / "Schmes_information"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
SUMMARY_OUTPUT_FILE = OUTPUT_DIR / "query_understanding_summary.json"

# Load environment variables (Local .env prioritized, then root .env)
load_dotenv(CURRENT_DIR / ".env", override=False)
load_dotenv(PROJECT_ROOT / ".env", override=True)


# ============================================================================
# Database Helper Utilities
# ============================================================================

def get_db_connection():
    """Establish and return a PostgreSQL database connection."""
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return psycopg2.connect(database_url)
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", 5432)),
        dbname=os.getenv("DB_NAME", "civicsphere_db"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "Harsha@9106")
    )


def fetch_citizen_profile_from_db(identifier: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Fetch citizen profile from PostgreSQL public.citizen_profiles table.
    Matches against profile_id, firebase_uid, or email.
    If identifier is None or empty, returns the first available citizen profile.
    """
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        if identifier:
            query = """
                SELECT * FROM public.citizen_profiles
                WHERE profile_id = %s OR firebase_uid = %s OR email = %s
                LIMIT 1;
            """
            cur.execute(query, (identifier, identifier, identifier))
        else:
            query = "SELECT * FROM public.citizen_profiles LIMIT 1;"
            cur.execute(query)

        row = cur.fetchone()
        cur.close()
        if row:
            return dict(row)
        return None
    except Exception as err:
        print(f"[WARN] Database lookup for citizen profile '{identifier}' failed: {err}")
        return None
    finally:
        if conn:
            conn.close()


# ============================================================================
# Knowledge Taxonomies & Dictionaries
# ============================================================================

INDIAN_STATES_AND_UTS = {
    "andhra pradesh": "Andhra Pradesh",
    "arunachal pradesh": "Arunachal Pradesh",
    "assam": "Assam",
    "bihar": "Bihar",
    "chhattisgarh": "Chhattisgarh",
    "goa": "Goa",
    "gujarat": "Gujarat",
    "haryana": "Haryana",
    "himachal pradesh": "Himachal Pradesh",
    "jharkhand": "Jharkhand",
    "karnataka": "Karnataka",
    "kerala": "Kerala",
    "madhya pradesh": "Madhya Pradesh",
    "maharashtra": "Maharashtra",
    "manipur": "Manipur",
    "meghalaya": "Meghalaya",
    "mizoram": "Mizoram",
    "nagaland": "Nagaland",
    "odisha": "Odisha",
    "orissa": "Odisha",
    "punjab": "Punjab",
    "rajasthan": "Rajasthan",
    "sikkim": "Sikkim",
    "tamil nadu": "Tamil Nadu",
    "telangana": "Telangana",
    "tripura": "Tripura",
    "uttar pradesh": "Uttar Pradesh",
    "uttarakhand": "Uttarakhand",
    "west bengal": "West Bengal",
    # Union Territories
    "andaman and nicobar": "Andaman and Nicobar Islands",
    "chandigarh": "Chandigarh",
    "dadra and nagar haveli": "Dadra & Nagar Haveli And Daman & Diu",
    "daman and diu": "Dadra & Nagar Haveli And Daman & Diu",
    "delhi": "Delhi",
    "jammu and kashmir": "Jammu and Kashmir",
    "ladakh": "Ladakh",
    "lakshadweep": "Lakshadweep",
    "puducherry": "Puducherry",
    # Aliases
    "ap": "Andhra Pradesh",
    "ts": "Telangana",
    "tg": "Telangana",
    "up": "Uttar Pradesh",
    "mp": "Madhya Pradesh",
    "tn": "Tamil Nadu",
    "wb": "West Bengal",
    "hp": "Himachal Pradesh",
    "j&k": "Jammu and Kashmir",
    "uk": "Uttarakhand"
}

INDIAN_DISTRICTS_SAMPLE = {
    # Telangana
    "hyderabad", "warangal", "karimnagar", "khammam", "medak", "nizamabad", "nalgonda",
    "rangareddy", "sangareddy", "siddipet", "mahabubnagar", "adilabad", "jagtial",
    # Andhra Pradesh
    "visakhapatnam", "vijayawada", "guntur", "krishna", "kurnool", "nellore", "anantapur",
    "chittoor", "kadapa", "srikakulam", "east godavari", "west godavari",
    # Maharashtra
    "pune", "mumbai", "nagpur", "nashik", "aurangabad", "solapur", "kolhapur", "amravati",
    # Karnataka
    "bangalore", "bengaluru", "mysore", "mysuru", "hubli", "dharwad", "belagavi", "shimoga",
    # Uttar Pradesh
    "lucknow", "kanpur", "varanasi", "agra", "prayagraj", "gorakhpur", "meerut", "bareilly",
    # Punjab / Haryana
    "ludhiana", "amritsar", "jalandhar", "karnal", "hisar", "panipat", "gurugram", "rohtak",
    # Bihar
    "patna", "gaya", "bhagalpur", "muzaffarpur", "darbhanga"
}

SECTOR_TAXONOMY = {
    "Agriculture": [
        "agriculture", "farmer", "farming", "crop", "crops", "paddy", "wheat", "cotton",
        "soil", "fertilizer", "seed", "seeds", "tractor", "irrigation", "horticulture",
        "dairy", "cattle", "cow", "buffalo", "livestock", "fisheries", "fish", "sericulture",
        "apiculture", "beekeeping", "poultry", "kisan", "krishi", "harvest", "fodder"
    ],
    "Education": [
        "education", "student", "school", "college", "university", "scholarship", "tuition",
        "study", "degree", "diploma", "fellowship", "coaching", "exam", "books", "hostel"
    ],
    "Healthcare": [
        "healthcare", "health", "hospital", "medical", "treatment", "medicine", "doctor",
        "insurance", "ayushman", "clinic", "surgery", "disease", "maternity", "ambulance"
    ],
    "Housing": [
        "housing", "house", "home", "awas", "shelter", "construction", "pucca", "flat",
        "residence", "homeless", "plot", "colony"
    ],
    "Employment": [
        "employment", "job", "jobs", "unemployment", "livelihood", "skill", "training",
        "entrepreneur", "entrepreneurship", "startup", "apprentice", "mgnrega", "self-employed"
    ],
    "Finance": [
        "finance", "loan", "credit", "subsidy", "banking", "account", "dbt", "pension",
        "financial assistance", "cash", "grant", "kcc", "interest subvention"
    ],
    "Social Welfare": [
        "social welfare", "welfare", "pension", "widow", "senior citizen", "elderly",
        "disability", "disabled", "handicap", "pwd", "divyang", "sc", "st", "obc", "minority", "ews"
    ]
}

SCHEME_KNOWLEDGE_BASE = [
    {
        "scheme_id": "AGRI2551",
        "canonical_name": "Pradhan Mantri Kisan Samman Nidhi",
        "aliases": ["pm-kisan", "pm kisan", "pmkisan", "kisan samman", "samman nidhi"],
        "sector": "Agriculture",
        "level": "Central",
        "category": "Direct Benefit Transfer"
    },
    {
        "scheme_id": "AGRI1970",
        "canonical_name": "Kisan Credit Card Scheme",
        "aliases": ["kcc", "kisan credit card", "kisan card", "crop loan card"],
        "sector": "Agriculture",
        "level": "Central",
        "category": "Credit & Financial Assistance"
    },
    {
        "scheme_id": "AGRI2374",
        "canonical_name": "Pradhan Mantri Fasal Bima Yojana",
        "aliases": ["pmfby", "fasal bima", "crop insurance", "pm crop insurance"],
        "sector": "Agriculture",
        "level": "Central",
        "category": "Crop Insurance & Risk Management"
    },
    {
        "scheme_id": "AGRI2137",
        "canonical_name": "Pradhan Mantri Krishi Sinchayee Yojana",
        "aliases": ["pmksy", "krishi sinchayee", "drip irrigation scheme", "micro irrigation"],
        "sector": "Agriculture",
        "level": "Central",
        "category": "Farm Mechanization & Machinery"
    },
    {
        "scheme_id": "AGRI2238",
        "canonical_name": "Pradhan Mantri Kisan Maandhan Yojana",
        "aliases": ["pmkmy", "kisan maandhan", "farmer pension", "pm-kmy"],
        "sector": "Agriculture",
        "level": "Central",
        "category": "Social Security & Pension"
    },
    {
        "scheme_id": "AGRI2252",
        "canonical_name": "Rythu Bima Scheme",
        "aliases": ["rythu bima", "telangana farmer life insurance", "rythubima"],
        "sector": "Agriculture",
        "level": "State",
        "state": "Telangana",
        "category": "Insurance"
    },
    {
        "canonical_name": "Soil Health Card Scheme",
        "aliases": ["soil health card", "shc", "soil card", "soil testing scheme"],
        "sector": "Agriculture",
        "level": "Central",
        "category": "Agriculture & Allied Sectors"
    },
    {
        "canonical_name": "Pradhan Mantri Matsya Sampada Yojana",
        "aliases": ["pmmsy", "matsya sampada", "fisheries scheme", "fish farming scheme"],
        "sector": "Agriculture",
        "level": "Central",
        "category": "Animal Husbandry, Dairy & Fisheries"
    },
    {
        "canonical_name": "Rythu Bharosa Kendralu",
        "aliases": ["rythu bharosa", "ysr rythu bharosa"],
        "sector": "Agriculture",
        "level": "State",
        "state": "Andhra Pradesh",
        "category": "Direct Benefit Transfer"
    },
    {
        "canonical_name": "Rythu Bandhu Scheme",
        "aliases": ["rythu bandhu", "farmer investment support scheme", "telangana farmer support"],
        "sector": "Agriculture",
        "level": "State",
        "state": "Telangana",
        "category": "Direct Benefit Transfer"
    },
    {
        "canonical_name": "Sub-Mission on Agricultural Mechanization",
        "aliases": ["smam", "tractor subsidy", "agricultural machinery scheme", "farm equipment subsidy"],
        "sector": "Agriculture",
        "level": "Central",
        "category": "Farm Mechanization & Machinery"
    },
    {
        "canonical_name": "Pradhan Mantri Awas Yojana",
        "aliases": ["pmay", "pm awas", "pradhan mantri awas", "housing for all"],
        "sector": "Housing",
        "level": "Central",
        "category": "Housing & Infrastructure"
    },
    {
        "canonical_name": "Ayushman Bharat PM-JAY",
        "aliases": ["ayushman bharat", "pm-jay", "pmjay", "golden card", "health protection scheme"],
        "sector": "Healthcare",
        "level": "Central",
        "category": "Healthcare & Health Insurance"
    }
]

VOICE_FILLER_WORDS = [
    r"\bum+\b", r"\buh+\b", r"\berr+\b", r"\bah+\b", r"\bhmm+\b",
    r"\byou know\b", r"\bi mean\b", r"\blike\b", r"\bactually\b", r"\bbasically\b",
    r"\bso yeah\b", r"\bwell\b", r"\bkind of\b", r"\bsort of\b",
    r"\bcan you please tell me\b", r"\bcould you please tell me\b",
    r"\bcan you tell me\b", r"\bcould you tell me\b",
    r"\bplease tell me\b", r"\btell me about\b",
    r"\bi want to know about\b", r"\bi would like to know\b",
    r"\bi want to know\b", r"\bcould you explain\b"
]

SPEECH_ARTIFACTS = [
    r"\[cough\]", r"\[coughing\]", r"\[laughter\]", r"\[laugh\]", r"\[pause\]",
    r"\[noise\]", r"\[applause\]", r"\(inaudible\)", r"\(unclear\)", r"<noise>",
    r"<silence>", r"<breath>", r"\[background noise\]"
]


# ============================================================================
# Step 10 — User Input Capture
# ============================================================================

def step_10_user_input_capture(
    citizen_prompt: str,
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
    conversation_id: Optional[str] = None,
    input_type: str = "text",
    target_scheme_id: Optional[str] = None,
    target_scheme_name: Optional[str] = None
) -> Dict[str, Any]:
    """
    Step 10: Capture the complete user query submitted from the AI Assistant chat interface
    and attach active user session metadata.
    
    Preserves original query exactly as entered without modifying, cleaning, or translating.
    """
    raw_query = str(citizen_prompt) if citizen_prompt is not None else ""
    
    # Generate fallback session / conversation identifiers if not provided
    active_session_id = session_id or f"sess_{uuid.uuid4().hex[:12]}"
    active_user_id = user_id or "Civs1001"
    active_conversation_id = conversation_id or f"conv_{uuid.uuid4().hex[:10]}"
    timestamp = datetime.now(timezone.utc).isoformat()
    
    # Validate input type
    normalized_input_type = "voice" if input_type.lower() == "voice" else "text"

    user_query: Dict[str, Any] = {
        "step": "step_10",
        "original_query": raw_query,
        "user_id": active_user_id,
        "session_id": active_session_id,
        "conversation_id": active_conversation_id,
        "timestamp": timestamp,
        "input_type": normalized_input_type,
        "target_scheme_id": target_scheme_id,
        "target_scheme_name": target_scheme_name
    }
    
    return user_query


# ============================================================================
# Step 11 — Language Detection
# ============================================================================

def step_11_language_detection(user_query: Dict[str, Any]) -> Dict[str, Any]:
    """
    Step 11: Detect the language of the user's query before retrieval.
    Current Configuration: Support only English ('en').
    
    Validates whether the query is in English, assigns language tags,
    computes confidence, and preserves original query without alteration.
    """
    raw_query = user_query.get("original_query", "")
    
    if not raw_query.strip():
        user_query.update({
            "step": "step_11",
            "language_code": "en",
            "language_name": "English",
            "language_confidence": 1.0,
            "is_supported": True,
            "language_status": "empty_query"
        })
        return user_query

    # Heuristic English Detection
    # 1. Check Latin / ASCII printable character ratio
    total_chars = len(raw_query)
    ascii_letters = sum(1 for c in raw_query if c.isascii() and (c.isalnum() or c.isspace() or c in ".,?!-':/₹%"))
    ascii_ratio = ascii_letters / total_chars if total_chars > 0 else 1.0

    # 2. Check for common English stopwords
    tokens = re.findall(r"\b[a-zA-Z]+\b", raw_query.lower())
    common_en_words = {
        "the", "is", "at", "which", "on", "a", "an", "and", "in", "to", "for", "of",
        "with", "what", "how", "can", "i", "my", "me", "are", "do", "we", "he", "she",
        "farmer", "subsidy", "scheme", "schemes", "state", "money", "loan", "get",
        "apply", "eligible", "help", "give", "tell", "available", "who", "when"
    }
    en_matches = sum(1 for w in tokens if w in common_en_words)
    en_word_ratio = (en_matches / len(tokens)) if tokens else 0.5

    # Determine confidence
    if ascii_ratio >= 0.85:
        language_code = "en"
        language_name = "English"
        confidence = round(min(1.0, 0.70 + (en_word_ratio * 0.30)), 2)
        is_supported = True
        status = "verified_english"
    else:
        # Query contains non-Latin or unsupported characters
        language_code = "en"  # Current config restricts to en
        language_name = "English"
        confidence = 0.50
        is_supported = False
        status = "non_english_characters_detected"

    user_query.update({
        "step": "step_11",
        "language_code": language_code,
        "language_name": language_name,
        "language_confidence": confidence,
        "is_supported": is_supported,
        "language_status": status
    })

    return user_query


# ============================================================================
# Step 12 — Query Cleaning
# ============================================================================

def clean_voice_transcription(text: str) -> str:
    """Strip speech transcription artifacts, fillers, and stuttered words."""
    cleaned = text

    # Remove speech transcription tags (e.g. [cough], (inaudible))
    for artifact_pat in SPEECH_ARTIFACTS:
        cleaned = re.sub(artifact_pat, " ", cleaned, flags=re.IGNORECASE)

    # Remove filler phrases and verbal tics
    for filler_pat in VOICE_FILLER_WORDS:
        cleaned = re.sub(filler_pat, " ", cleaned, flags=re.IGNORECASE)

    # Remove stuttered duplicate words (e.g., "the the" -> "the", "i i" -> "i")
    cleaned = re.sub(r"\b([a-zA-Z]{1,15})\s+\1\b", r"\1", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\b([a-zA-Z]{1,15})\s+\1\b", r"\1", cleaned, flags=re.IGNORECASE)

    return cleaned


def clean_text_query(text: str) -> str:
    """
    Clean formatting noise, symbols, excessive spaces, and emojis while
    strictly preserving scheme names, Indian states, districts, numbers,
    income amounts, acreages, and eligibility criteria.
    """
    cleaned = text

    # Remove regex noise and escape sequences
    cleaned = cleaned.replace("\\n", " ").replace("\\r", " ").replace("\\t", " ")
    cleaned = re.sub(r"[\r\n\t]+", " ", cleaned)

    # Remove emojis and unreadable Unicode symbols (preserve Latin, numbers, basic currency)
    cleaned = re.sub(r"[^\x00-\x7F₹]", " ", cleaned)

    # Collapse duplicate punctuation (??? -> ?, !!! -> !, .... -> .)
    cleaned = re.sub(r"\?{2,}", "?", cleaned)
    cleaned = re.sub(r"!{2,}", "!", cleaned)
    cleaned = re.sub(r"\.{2,}", ".", cleaned)

    # Remove noisy formatting symbols (@, #, $, ^, *, ~, _, `, {, }, [, ], quotes)
    # BUT keep hyphen (for PM-KISAN), slash (for SC/ST), period, question mark, comma if needed
    cleaned = re.sub(r"[\"@#$%^&*~`{}[\]|\\]+", " ", cleaned)

    # Clean leftover conversational preamble and stray leading/trailing dots/commas
    cleaned = re.sub(r"^[.,;:?!\s]+", "", cleaned)
    cleaned = re.sub(r"^(?:can you|could you|please)\s+(?:tell me|explain|help me with|inform me)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"^[.,;:?!\s]+", "", cleaned)

    # Normalize repeated spaces and trim
    cleaned = re.sub(r"\s+", " ", cleaned).strip()

    return cleaned


def step_12_query_cleaning(user_query: Dict[str, Any]) -> Dict[str, Any]:
    """
    Step 12: Clean user's query by removing voice noise, formatting noise,
    and unnecessary characters while preserving actual intent and domain entities.
    """
    raw_query = user_query.get("original_query", "")
    input_type = user_query.get("input_type", "text")

    # Pass 1: Voice transcription cleaning (applied to all, especially voice inputs)
    cleaned_stage1 = clean_voice_transcription(raw_query)

    # Pass 2: Text normalization and formatting cleanup
    clean_query = clean_text_query(cleaned_stage1)

    # Edge case: If cleaning stripped everything, fall back to basic stripped raw
    if not clean_query:
        clean_query = re.sub(r"\s+", " ", raw_query).strip()

    user_query.update({
        "step": "step_12",
        "clean_query": clean_query
    })

    return user_query


# ============================================================================
# Step 13 — Query Understanding & Intent Parsing
# ============================================================================

def classify_intent(text: str) -> str:
    """Classify user's primary intent from the cleaned query."""
    lower = text.lower()

    # Required Documents
    if any(k in lower for k in ["document", "documents", "paperwork", "certificate", "id proof", "what docs", "docs needed"]):
        return "Required Documents"

    # Application Process
    if any(k in lower for k in ["how to apply", "application process", "procedure to apply", "steps to apply", "where to apply", "application form", "portal link"]):
        return "Application Process"

    # Registration Help
    if any(k in lower for k in ["how to register", "registration", "sign up", "enroll", "enrollment", "login help", "create account"]):
        return "Registration Help"

    # Eligibility Check
    if any(k in lower for k in ["eligible", "eligibility", "criteria", "can i apply", "am i qualified", "who can apply", "do i qualify", "who is eligible"]):
        return "Eligibility Check"

    # Scheme Recommendation (Checked before generic benefit terms when user asks for suggestions)
    if any(k in lower for k in ["recommend", "suggest", "which scheme", "what schemes", "find scheme", "best scheme", "schemes for", "options for"]):
        return "Scheme Recommendation"

    # Scheme Comparison
    if any(k in lower for k in ["compare", "difference between", "versus", " vs ", "better than"]):
        return "Scheme Comparison"

    # Benefits Information
    if any(k in lower for k in ["benefit", "benefits", "how much money", "subsidy amount", "financial assistance", "cash incentive", "pension amount", "interest rate"]):
        return "Benefits Information"

    # Default to FAQ
    return "FAQ"


def extract_scheme_info(text: str) -> Tuple[Optional[str], Optional[str], List[str], Optional[str]]:
    """Extract canonical scheme name, alias, related keywords, and scheme_id."""
    lower = text.lower()

    for scheme in SCHEME_KNOWLEDGE_BASE:
        # Check canonical name
        if scheme["canonical_name"].lower() in lower:
            return scheme["canonical_name"], scheme["aliases"][0].upper(), scheme["aliases"], scheme.get("scheme_id")

        # Check aliases
        for alias in scheme["aliases"]:
            # Match word boundary
            if re.search(r"\b" + re.escape(alias) + r"\b", lower):
                return scheme["canonical_name"], alias.upper(), scheme["aliases"], scheme.get("scheme_id")

    return None, None, [], None


def extract_geography(text: str) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    """Extract State, District, and Village from the query."""
    lower = text.lower()
    detected_state = None
    detected_district = None
    detected_village = None

    # 1. State Extraction
    for key, canonical_state in INDIAN_STATES_AND_UTS.items():
        if re.search(r"\b" + re.escape(key) + r"\b", lower):
            detected_state = canonical_state
            break

    # 2. District Extraction
    for dist in INDIAN_DISTRICTS_SAMPLE:
        if re.search(r"\b" + re.escape(dist) + r"\b", lower):
            detected_district = dist.title()
            break

    # 3. Village Extraction (Heuristic for 'village XYZ' or 'gram XYZ')
    village_match = re.search(r"\b(?:village|mandal|gram)\s+([a-zA-Z]+)\b", lower)
    if village_match:
        detected_village = village_match.group(1).title()

    return detected_state, detected_district, detected_village


def extract_sector(text: str, scheme_name: Optional[str] = None) -> str:
    """Identify sector of interest from keywords or matched scheme."""
    lower = text.lower()

    # Check matched scheme first
    if scheme_name:
        for s in SCHEME_KNOWLEDGE_BASE:
            if s["canonical_name"] == scheme_name:
                return s.get("sector", "Agriculture")

    # Score each sector based on keyword hits
    best_sector = "Agriculture"  # CivicSphere primary domain
    max_hits = 0

    for sector, keywords in SECTOR_TAXONOMY.items():
        hits = sum(1 for kw in keywords if re.search(r"\b" + re.escape(kw) + r"\b", lower))
        if hits > max_hits:
            max_hits = hits
            best_sector = sector

    return best_sector


def extract_explicit_user_requirements(text: str) -> Dict[str, Any]:
    """
    Extract explicit user requirement keywords:
    Farmer, Student, Woman, Senior Citizen, Income limit, Landholding size,
    Social Category (SC/ST/OBC/EWS), Disability, Occupation, Age group.
    """
    lower = text.lower()
    reqs: Dict[str, Any] = {
        "is_farmer": False,
        "farmer_type": None,
        "is_student": False,
        "is_woman": False,
        "is_senior_citizen": False,
        "income_limit": None,
        "landholding_size": None,
        "social_category": None,
        "has_disability": False,
        "occupation": None,
        "age_group": None
    }

    # 1. Farmer detection
    if any(k in lower for k in ["farmer", "farmers", "kisan", "cultivator", "rythu", "farming"]):
        reqs["is_farmer"] = True
        reqs["occupation"] = "Farmer"
        if "tenant" in lower:
            reqs["farmer_type"] = "Tenant Farmer"
        elif "marginal" in lower:
            reqs["farmer_type"] = "Marginal Farmer"
        elif "small" in lower:
            reqs["farmer_type"] = "Small Farmer"
        elif "large" in lower:
            reqs["farmer_type"] = "Large Farmer"

    # 2. Student detection
    if any(k in lower for k in ["student", "scholarship", "college", "school", "university", "undergraduate", "postgraduate"]):
        reqs["is_student"] = True
        if not reqs["occupation"]:
            reqs["occupation"] = "Student"

    # 3. Woman / Female detection
    if any(k in lower for k in ["woman", "women", "female", "girl", "mother", "widow", "mahila"]):
        reqs["is_woman"] = True

    # 4. Senior Citizen detection
    if any(k in lower for k in ["senior citizen", "elderly", "old age", "pensioner", "60+", "above 60"]):
        reqs["is_senior_citizen"] = True

    # 5. Landholding size extraction (acres / hectares)
    land_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:acres?|acre|hectares?|ha)\b", lower)
    if land_match:
        try:
            reqs["landholding_size"] = float(land_match.group(1))
            reqs["is_farmer"] = True
            if not reqs["farmer_type"]:
                val = float(land_match.group(1))
                if val <= 2.5:
                    reqs["farmer_type"] = "Marginal Farmer"
                elif val <= 5.0:
                    reqs["farmer_type"] = "Small Farmer"
                else:
                    reqs["farmer_type"] = "Medium/Large Farmer"
        except ValueError:
            pass

    # 6. Income Limit Extraction
    income_match = re.search(r"(?:income|earning|salary)?\s*(?:under|below|less than|upto|up to)?\s*(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s*(lakh|lakhs|lac|lacs|k|thousand)?\b", lower)
    if income_match and income_match.group(1):
        num_str = income_match.group(1)
        unit = (income_match.group(2) or "").lower()
        try:
            val = float(num_str)
            if "lakh" in unit or "lac" in unit:
                val = val * 100000
            elif "k" in unit or "thousand" in unit:
                val = val * 1000
            # Sanity check: reasonable annual income limit between 10,000 and 5,000,000
            if 10000 <= val <= 5000000:
                reqs["income_limit"] = val
        except ValueError:
            pass

    if "bpl" in lower or "below poverty line" in lower:
        reqs["income_limit"] = reqs["income_limit"] or 120000

    # 7. Social Category (SC/ST/OBC/EWS/General)
    if re.search(r"\b(sc|scheduled caste)\b", lower):
        reqs["social_category"] = "SC"
    elif re.search(r"\b(st|scheduled tribe)\b", lower):
        reqs["social_category"] = "ST"
    elif re.search(r"\b(obc|other backward class|bc)\b", lower):
        reqs["social_category"] = "OBC"
    elif re.search(r"\b(ews|economically weaker section)\b", lower):
        reqs["social_category"] = "EWS"
    elif re.search(r"\b(general|oc)\b", lower):
        reqs["social_category"] = "General"

    # 8. Disability
    if any(k in lower for k in ["disabled", "disability", "handicap", "handicapped", "pwd", "divyang"]):
        reqs["has_disability"] = True

    # 9. Age Group
    age_range_match = re.search(r"(?:between|from)?\s*(\d{2})\s*(?:to|-|and)\s*(\d{2})\s*(?:years?|yrs?|age)?", lower)
    if age_range_match:
        reqs["age_group"] = f"{age_range_match.group(1)}-{age_range_match.group(2)}"
    else:
        single_age_match = re.search(r"(?:age|aged)\s*(\d{2})", lower)
        if single_age_match:
            reqs["age_group"] = single_age_match.group(1)

    return reqs


def build_sql_filter_object(
    state: Optional[str],
    sector: str,
    scheme_name: Optional[str],
    requirements: Dict[str, Any]
) -> Dict[str, Any]:
    """Generate structured SQL search filter object for backend retrieval."""
    filters: Dict[str, Any] = {
        "state": state or "All",
        "sector": sector,
        "scheme_name": scheme_name,
        "target_demographic": [],
        "beneficiary_category": [],
        "max_income": requirements.get("income_limit"),
        "max_landholding": requirements.get("landholding_size"),
        "social_category": requirements.get("social_category")
    }

    if requirements.get("is_farmer"):
        filters["target_demographic"].append("Farmer")
        if requirements.get("farmer_type"):
            filters["beneficiary_category"].append(requirements["farmer_type"])

    if requirements.get("is_student"):
        filters["target_demographic"].append("Student")

    if requirements.get("is_woman"):
        filters["target_demographic"].append("Women")

    if requirements.get("is_senior_citizen"):
        filters["target_demographic"].append("Senior Citizen")

    if requirements.get("has_disability"):
        filters["target_demographic"].append("Persons with Disabilities")

    return filters


def extract_search_keywords(text: str, scheme_name: Optional[str], sector: str) -> List[str]:
    """Extract high-value search tokens for vector and keyword retrieval."""
    # Common words to exclude from search tokens
    stop_tokens = {
        "i", "me", "my", "we", "the", "a", "an", "is", "are", "can", "what", "which",
        "for", "in", "at", "to", "of", "and", "or", "how", "tell", "give", "please",
        "want", "know", "about", "there", "any", "having", "with"
    }

    words = re.findall(r"\b[a-zA-Z0-9-]{2,}\b", text.lower())
    keywords = [w for w in words if w not in stop_tokens]

    if sector and sector.lower() not in keywords:
        keywords.append(sector.lower())

    if scheme_name:
        for term in scheme_name.lower().split():
            if len(term) > 2 and term not in keywords:
                keywords.append(term)

    # Return unique keywords preserving order
    seen = set()
    return [k for k in keywords if not (k in seen or seen.add(k))]


def step_13_query_understanding(user_query: Dict[str, Any]) -> Dict[str, Any]:
    """
    Step 13: Convert cleaned query into structured intent payload.
    Extracts: Intent, Scheme, Geography, Sector, Requirements, SQL Filter, Search Keywords.
    """
    clean_text = user_query.get("clean_query", "")

    # 1. Intent Classification
    intent = classify_intent(clean_text)

    # 2. Scheme Extraction
    scheme_name, scheme_alias, scheme_keywords, detected_scheme_id = extract_scheme_info(clean_text)

    # Context override from active conversation / previous response if passed
    effective_scheme_id = detected_scheme_id or user_query.get("target_scheme_id")
    effective_scheme_name = scheme_name or user_query.get("target_scheme_name")

    # 3. Geographical Extraction
    state, district, village = extract_geography(clean_text)

    # 4. Sector Extraction
    sector = extract_sector(clean_text, effective_scheme_name)

    # 5. Explicit User Requirements
    user_reqs = extract_explicit_user_requirements(clean_text)

    # 6. SQL Search Filter Object
    sql_filters = build_sql_filter_object(state, sector, effective_scheme_name, user_reqs)

    # 7. Search Keywords
    search_keywords = extract_search_keywords(clean_text, effective_scheme_name, sector)

    structured_intent: Dict[str, Any] = {
        "intent": intent,
        "scheme_name": effective_scheme_name,
        "scheme_id": effective_scheme_id,
        "scheme_alias": scheme_alias,
        "scheme_keywords": scheme_keywords,
        "state": state,
        "district": district,
        "village": village,
        "sector": sector,
        "user_requirement_keywords": user_reqs,
        "sql_filter_object": sql_filters,
        "search_keywords": search_keywords
    }

    user_query.update({
        "step": "step_13",
        "structured_intent": structured_intent
    })

    return user_query


# ============================================================================
# Step 14 — Citizen Profile Merge
# ============================================================================

def determine_income_bracket(annual_income: Optional[float]) -> str:
    """Categorize annual family income into economic brackets."""
    if annual_income is None:
        return "Unknown"
    if annual_income <= 150000:
        return "BPL / Low Income"
    elif annual_income <= 300000:
        return "Lower Middle Income"
    elif annual_income <= 800000:
        return "Middle Income"
    else:
        return "Higher Income"


def step_14_citizen_profile_merge(
    user_query: Dict[str, Any],
    citizen_profile: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Step 14: Merge structured intent with the logged-in citizen's profile
    to generate personalized eligibility filters before retrieval.
    
    Source: PostgreSQL public.citizen_profiles
    Target Filters:
      - Eligible age range
      - Eligible income category
      - Eligible caste category
      - Eligible occupation
      - Eligible landholding size
      - Eligible state
      - Eligible district
      - Target demographic
      - Priority matching score
    """
    user_id = user_query.get("user_id")

    # If profile is not passed explicitly, fetch from PostgreSQL DB
    if not citizen_profile:
        citizen_profile = fetch_citizen_profile_from_db(user_id)

    # Fallback to defaults if no profile exists in DB
    if not citizen_profile:
        citizen_profile = {
            "profile_id": user_id or "Civs1001",
            "full_name": "Citizen",
            "age": None,
            "gender": "Male",
            "caste_category": "General",
            "occupation": "Farmer",
            "annual_family_income": None,
            "state": "Telangana",
            "district": None,
            "profile_completed": False
        }

    # Extract profile fields
    profile_age = citizen_profile.get("age")
    profile_gender = citizen_profile.get("gender")
    profile_income = citizen_profile.get("annual_family_income")
    try:
        profile_income_float = float(profile_income) if profile_income is not None else None
    except (ValueError, TypeError):
        profile_income_float = None

    profile_caste = citizen_profile.get("caste_category") or "General"
    profile_occupation = citizen_profile.get("occupation")
    profile_state = citizen_profile.get("state")
    profile_district = citizen_profile.get("district")
    profile_land = citizen_profile.get("landholding_size")
    try:
        profile_land_float = float(profile_land) if profile_land is not None else None
    except (ValueError, TypeError):
        profile_land_float = None

    structured_intent = user_query.get("structured_intent", {})
    query_reqs = structured_intent.get("user_requirement_keywords", {})
    query_state = structured_intent.get("state")
    query_district = structured_intent.get("district")

    # Resolve Effective State:
    # Query state takes precedence if explicitly specified; otherwise use citizen profile state
    resolved_state = query_state or profile_state or "All"

    # Resolve Effective District
    resolved_district = query_district or profile_district

    # Resolve Occupation
    resolved_occupation = query_reqs.get("occupation") or profile_occupation or "All"

    # Resolve Landholding
    resolved_landholding = query_reqs.get("landholding_size") or profile_land_float

    # Resolve Income Limit
    resolved_income = query_reqs.get("income_limit") or profile_income_float

    # Construct Synthesized Target Demographic
    target_demographics: List[str] = []
    if query_reqs.get("is_farmer") or (profile_occupation and "farmer" in str(profile_occupation).lower()):
        target_demographics.append("Farmer")
    if query_reqs.get("is_student") or (profile_occupation and "student" in str(profile_occupation).lower()):
        target_demographics.append("Student")
    if query_reqs.get("is_woman") or (profile_gender and "female" in str(profile_gender).lower()):
        target_demographics.append("Women")
    if query_reqs.get("is_senior_citizen") or (profile_age and int(profile_age) >= 60):
        target_demographics.append("Senior Citizen")
    if profile_caste and profile_caste != "General":
        target_demographics.append(profile_caste)
    if not target_demographics:
        target_demographics.append("General Citizen")

    # Priority Matching Score (1.0 = standard, boosted if intent is highly targeted)
    priority_score = 1.0
    if structured_intent.get("scheme_name"):
        priority_score += 0.50  # Exact scheme mentioned
    if query_state:
        priority_score += 0.25  # Explicit state mentioned
    if query_reqs.get("landholding_size") or query_reqs.get("income_limit"):
        priority_score += 0.25  # Concrete quantitative criteria given

    # Personalized Filters Object
    personalized_eligibility_filters: Dict[str, Any] = {
        "eligible_age_range": {
            "citizen_age": profile_age,
            "is_senior_citizen": bool(profile_age and int(profile_age) >= 60) or query_reqs.get("is_senior_citizen", False)
        },
        "eligible_income_category": {
            "annual_income": resolved_income,
            "income_bracket": determine_income_bracket(resolved_income)
        },
        "eligible_caste_category": query_reqs.get("social_category") or profile_caste,
        "eligible_occupation": resolved_occupation,
        "eligible_landholding_size": resolved_landholding,
        "eligible_state": resolved_state,
        "eligible_district": resolved_district,
        "target_demographic": target_demographics,
        "priority_matching_score": round(priority_score, 2)
    }

    # Citizen Profile Summary (Cleaned view)
    citizen_profile_summary = {
        "profile_id": citizen_profile.get("profile_id"),
        "full_name": citizen_profile.get("full_name"),
        "gender": profile_gender,
        "age": profile_age,
        "caste_category": profile_caste,
        "occupation": profile_occupation,
        "annual_family_income": profile_income,
        "state": profile_state,
        "district": profile_district,
        "employment_status": citizen_profile.get("employment_status")
    }

    # Final Retrieval Payload ready for future Phase 3 (Retrieval)
    final_retrieval_payload = {
        "query_text": user_query.get("clean_query"),
        "intent": structured_intent.get("intent"),
        "target_scheme": structured_intent.get("scheme_name"),
        "target_sector": structured_intent.get("sector"),
        "sql_filters": {
            "state": resolved_state,
            "sector": structured_intent.get("sector"),
            "target_demographics": target_demographics,
            "social_category": query_reqs.get("social_category") or profile_caste,
            "max_income": resolved_income,
            "max_land": resolved_landholding
        },
        "vector_search_tokens": structured_intent.get("search_keywords"),
        "priority_score": personalized_eligibility_filters["priority_matching_score"]
    }

    user_query.update({
        "step": "step_14",
        "citizen_profile_summary": citizen_profile_summary,
        "personalized_eligibility_filters": personalized_eligibility_filters,
        "final_retrieval_payload": final_retrieval_payload
    })

    return user_query


# ============================================================================
# Sequential Pipeline Runner (Step 10 → Step 11 → Step 12 → Step 13 → Step 14)
# ============================================================================

def process_user_query(
    citizen_prompt: str,
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
    conversation_id: Optional[str] = None,
    input_type: str = "text",
    citizen_profile: Optional[Dict[str, Any]] = None,
    scheme_id: Optional[str] = None,
    scheme_name: Optional[str] = None
) -> Dict[str, Any]:
    """
    Execute the full Sequential Phase 2 Pipeline:
      Step 10 → Step 11 → Step 12 → Step 13 → Step 14
      
    Strictly adheres to requirement:
      The output of one step becomes the input of the next step.
      Does NOT execute Retrieval (SQL or Vector Search).
    """
    # Step 10: User Input Capture
    step10_output = step_10_user_input_capture(
        citizen_prompt=citizen_prompt,
        user_id=user_id,
        session_id=session_id,
        conversation_id=conversation_id,
        input_type=input_type,
        target_scheme_id=scheme_id,
        target_scheme_name=scheme_name
    )

    # Step 11: Language Detection
    step11_output = step_11_language_detection(step10_output)

    # Step 12: Query Cleaning
    step12_output = step_12_query_cleaning(step11_output)

    # Step 13: Query Understanding & Intent Parsing
    step13_output = step_13_query_understanding(step12_output)

    # Step 14: Citizen Profile Merge
    step14_output = step_14_citizen_profile_merge(step13_output, citizen_profile=citizen_profile)

    return step14_output


# ============================================================================
# Console Display & Formatting Helpers
# ============================================================================

def print_banner(title: str):
    """Print an aesthetic section header."""
    bar = "=" * 80
    print(f"\n{bar}")
    print(f" {title.upper()}")
    print(f"{bar}")


def display_pipeline_summary(payload: Dict[str, Any]):
    """Pretty-print the Phase 2 execution summary to console."""
    print_banner("CivicSphere AI Assist — Phase 2 Execution Result")

    print(f"[*] Step 10 — Original Query : {payload.get('original_query')}")
    print(f"    - Input Type             : {payload.get('input_type')}")
    print(f"    - User ID                : {payload.get('user_id')}")
    print(f"    - Session ID             : {payload.get('session_id')}")
    print(f"    - Timestamp              : {payload.get('timestamp')}")

    print(f"\n[*] Step 11 — Language Tag   : {payload.get('language_name')} ({payload.get('language_code')})")
    print(f"    - Confidence             : {payload.get('language_confidence')}")
    print(f"    - Supported              : {payload.get('is_supported')}")

    print(f"\n[*] Step 12 — Cleaned Query  : {payload.get('clean_query')}")

    intent_data = payload.get("structured_intent", {})
    print(f"\n[*] Step 13 — Structured Intent:")
    print(f"    - Primary Intent         : {intent_data.get('intent')}")
    print(f"    - Detected Scheme        : {intent_data.get('scheme_name')} ({intent_data.get('scheme_alias')})")
    print(f"    - Geographical Focus     : State={intent_data.get('state')} | District={intent_data.get('district')}")
    print(f"    - Relevant Sector        : {intent_data.get('sector')}")
    print(f"    - Explicit Requirements  : {json.dumps(intent_data.get('user_requirement_keywords'), indent=6)}")
    print(f"    - SQL Filters            : {json.dumps(intent_data.get('sql_filter_object'), indent=6)}")
    print(f"    - Vector Search Tokens   : {intent_data.get('search_keywords')}")

    profile_summary = payload.get("citizen_profile_summary", {})
    print(f"\n[*] Step 14 — Citizen Profile & Personalized Filters:")
    print(f"    - Profile Name           : {profile_summary.get('full_name')} (ID: {profile_summary.get('profile_id')})")
    print(f"    - Profile Demographics   : Gender={profile_summary.get('gender')}, Caste={profile_summary.get('caste_category')}, State={profile_summary.get('state')}")

    p_filters = payload.get("personalized_eligibility_filters", {})
    print(f"    - Eligible State         : {p_filters.get('eligible_state')}")
    print(f"    - Eligible District      : {p_filters.get('eligible_district')}")
    print(f"    - Eligible Occupation    : {p_filters.get('eligible_occupation')}")
    print(f"    - Eligible Landholding   : {p_filters.get('eligible_landholding_size')} acres")
    print(f"    - Income Category        : {p_filters.get('eligible_income_category')}")
    print(f"    - Target Demographics    : {p_filters.get('target_demographic')}")
    print(f"    - Priority Match Score   : {p_filters.get('priority_matching_score')}")

    print(f"\n[*] Final Retrieval Payload Ready (Pre-RAG):")
    print(json.dumps(payload.get("final_retrieval_payload"), indent=4))
    print("\n[NOTE] As per Phase 2 specifications: SQL & Vector Retrieval NOT executed.")
    print("=" * 80)


# ============================================================================
# Main CLI & Demonstration Suite
# ============================================================================

def run_test_suite() -> List[Dict[str, Any]]:
    """Execute a comprehensive test suite of real-world citizen queries."""
    test_cases = [
        {
            "name": "Voice Query with Stutters & Fillers for PM-KISAN in Telangana",
            "prompt": "Um uh... can you please tell me... am I eligible for PM-KISAN in Telangana for a small farmer having 2 acres?",
            "input_type": "voice",
            "user_id": "Civs1001"
        },
        {
            "name": "Typed Query for Required Documents (Kisan Credit Card)",
            "prompt": "What documents are required for Kisan Credit Card loan under 2.5 lakh in Guntur Andhra Pradesh?",
            "input_type": "text",
            "user_id": "Civs1001"
        },
        {
            "name": "Scheme Recommendation for Female Student with Low Income",
            "prompt": "Please suggest scholarship and financial assistance schemes for SC female student with family income under 1.5 lakh.",
            "input_type": "text",
            "user_id": "Civs1001"
        },
        {
            "name": "Speech Noise & Artifacts Cleaning (Crop Insurance)",
            "prompt": "Like actually [cough] what is the procedure to apply for PMFBY crop insurance in Maharashtra?",
            "input_type": "voice",
            "user_id": "Civs1001"
        }
    ]

    all_results = []
    print_banner("Running CivicSphere AI Assist Phase 2 Verification Suite")

    for idx, tc in enumerate(test_cases, 1):
        print(f"\n>>> Running Test Case #{idx}: {tc['name']}")
        result = process_user_query(
            citizen_prompt=tc["prompt"],
            user_id=tc["user_id"],
            input_type=tc["input_type"]
        )
        display_pipeline_summary(result)
        all_results.append(result)

    # Save summary artifact for review
    with open(SUMMARY_OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump({
            "phase": "Phase 2 — User Query Understanding",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "total_test_cases": len(all_results),
            "results": all_results
        }, f, indent=2, ensure_ascii=False)

    print(f"\n[SUCCESS] Verification summary saved to: {SUMMARY_OUTPUT_FILE}")
    return all_results


def main():
    import argparse
    parser = argparse.ArgumentParser(description="CivicSphere AI Assist Phase 2: User Query Understanding Pipeline")
    parser.add_argument("--query", "-q", type=str, help="User prompt to process through Step 10 → Step 14")
    parser.add_argument("--user-id", "-u", type=str, default="Civs1001", help="Citizen Profile ID or Firebase UID")
    parser.add_argument("--session-id", "-s", type=str, default=None, help="Session ID")
    parser.add_argument("--conversation-id", "-c", type=str, default=None, help="Conversation ID")
    parser.add_argument("--voice", action="store_true", help="Mark input as voice transcription")
    parser.add_argument("--raw-json", action="store_true", help="Output raw JSON to stdout only")
    parser.add_argument("--test", action="store_true", help="Run full verification test suite")
    
    args = parser.parse_args()

    if args.test or (not args.query and not args.raw_json):
        # Default to test suite if no query is given or --test specified
        run_test_suite()
    else:
        input_type = "voice" if args.voice else "text"
        result = process_user_query(
            citizen_prompt=args.query or "",
            user_id=args.user_id,
            session_id=args.session_id,
            conversation_id=args.conversation_id,
            input_type=input_type
        )
        
        if args.raw_json:
            print(json.dumps(result, default=str, ensure_ascii=False))
        else:
            display_pipeline_summary(result)
            # Append single execution result to summary file
            with open(SUMMARY_OUTPUT_FILE, "w", encoding="utf-8") as f:
                json.dump({
                    "phase": "Phase 2 — User Query Understanding",
                    "generated_at": datetime.now(timezone.utc).isoformat(),
                    "single_query_execution": result
                }, f, indent=2, ensure_ascii=False)
            print(f"\n[SUCCESS] Result written to: {SUMMARY_OUTPUT_FILE}")


if __name__ == "__main__":
    main()
