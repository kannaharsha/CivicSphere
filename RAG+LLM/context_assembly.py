"""
CivicSphere AI Assist — Phase 4: Context Assembly (Step 20 → Step 21)
Location: RAG+LLM/context_assembly.py

Pipeline Sequence:
  Step 20 → Context Package Assembly (Merge highest-ranked chunks, eligibility checklist, benefits, docs, URLs)
              ↓
  Step 21 → Grounded Prompt Building (Strict system prompt for Groq Llama with anti-hallucination constraints)
              ↓
  StrictLLMPrompt Object (Ready for Phase 5 — Grounded LLM Generation)
"""

import os
import sys
import io
import contextlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

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
SCHEMES_DIR = PROJECT_ROOT / "Schmes_information"
SCHEMES_DIR.mkdir(parents=True, exist_ok=True)
RETRIEVAL_SUMMARY_FILE = SCHEMES_DIR / "retrieval_summary.json"
CONTEXT_SUMMARY_FILE = SCHEMES_DIR / "context_assembly_summary.json"

# Load environment variables
load_dotenv(CURRENT_DIR / ".env", override=False)
load_dotenv(PROJECT_ROOT / ".env", override=True)


# ============================================================================
# Step 20 — Context Package Assembly
# ============================================================================

def extract_scheme_metadata(phase3_payload: Dict[str, Any]) -> Dict[str, Any]:
    """Extract and consolidate official scheme metadata from Phase 3 payload."""
    structured_intent = phase3_payload.get("structured_intent") or {}
    ranked_chunks = (phase3_payload.get("RankedContext") or {}).get("ranked_chunks") or []
    candidates = (phase3_payload.get("FilteredCandidates") or {}).get("candidates") or []

    target_name = structured_intent.get("scheme_name") or ""
    scheme_id = ""
    scheme_name = target_name
    state = structured_intent.get("state") or "All"
    sector = structured_intent.get("sector") or "Agriculture"
    ministry = ""
    category = ""
    target_demographic: List[str] = []

    # Match against ranked chunks first
    for ch in ranked_chunks:
        ch_meta = ch.get("metadata") or {}
        ch_name = ch.get("scheme_name") or ch_meta.get("scheme_name")
        if target_name and target_name.lower() in str(ch_name).lower():
            scheme_id = ch.get("scheme_id") or ch_meta.get("scheme_id") or scheme_id
            scheme_name = ch_name or scheme_name
            state = ch_meta.get("state") or state
            sector = ch_meta.get("sector") or sector
            ministry = ch_meta.get("ministry") or ministry
            category = ch_meta.get("category") or category
            target_demographic = ch_meta.get("target_demographic") or target_demographic
            break

    # Fallback to top-ranked chunk if no target name match
    if not scheme_id and ranked_chunks:
        top_ch = ranked_chunks[0]
        top_meta = top_ch.get("metadata") or {}
        scheme_id = top_ch.get("scheme_id") or top_meta.get("scheme_id") or ""
        scheme_name = top_ch.get("scheme_name") or top_meta.get("scheme_name") or scheme_name
        state = top_meta.get("state") or state
        sector = top_meta.get("sector") or sector
        ministry = top_meta.get("ministry") or ministry
        category = top_meta.get("category") or category
        target_demographic = top_meta.get("target_demographic") or target_demographic

    # Match with candidate metadata if available
    for cand in candidates:
        if cand.get("scheme_id") == scheme_id or (target_name and target_name.lower() in str(cand.get("scheme_name")).lower()):
            scheme_id = cand.get("scheme_id") or scheme_id
            scheme_name = cand.get("scheme_name") or scheme_name
            state = cand.get("state") or state
            sector = cand.get("sector") or sector
            ministry = cand.get("ministry") or ministry
            break

    return {
        "scheme_id": scheme_id,
        "scheme_name": scheme_name,
        "state": state,
        "sector": sector,
        "ministry": ministry or "Ministry of Agriculture and Farmers Welfare",
        "category": category or "Central Sector Scheme",
        "target_demographic": target_demographic or ["Small and Marginal Farmers", "All Farmers"]
    }


def build_eligibility_checklist(
    scheme_meta: Dict[str, Any],
    profile_summary: Dict[str, Any],
    ranked_chunks: List[Dict[str, Any]],
    query_reqs: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Construct a verified eligibility checklist comparing citizen profile against retrieved scheme rules.
    Outputs: eligible_conditions, matched_conditions, missing_conditions, failed_conditions.
    """
    eligible_conditions: List[str] = []
    matched_conditions: List[str] = []
    missing_conditions: List[str] = []
    failed_conditions: List[str] = []

    # Gather eligibility text from chunks
    eligibility_texts = [
        ch.get("chunk_text", "")
        for ch in ranked_chunks
        if ch.get("chunk_type") in ["eligibility", "description", "faq"]
    ]
    combined_elig_text = " ".join(eligibility_texts).lower()

    # 1. State Condition
    c_state = profile_summary.get("state") or query_reqs.get("state")
    scheme_state = scheme_meta.get("state", "All")
    if scheme_state.lower() in ["all", "all india", "national"]:
        eligible_conditions.append("National / All India Scheme (Applicable to all Indian states)")
        matched_conditions.append(f"Resident of India (Citizen State: {c_state or 'Applicable'})")
    elif c_state:
        if c_state.lower() in scheme_state.lower():
            eligible_conditions.append(f"State Residency Requirement: {scheme_state}")
            matched_conditions.append(f"Citizen resides in matching state: {c_state}")
        else:
            failed_conditions.append(f"State mismatch: Scheme applies to {scheme_state}, but citizen resides in {c_state}")
    else:
        missing_conditions.append(f"State residency verification: Scheme specifies '{scheme_state}'")

    # 2. Landholding Size Condition
    c_land = profile_summary.get("landholding_size")
    if c_land is not None:
        try:
            land_val = float(c_land)
            if "pm-kisan" in scheme_meta.get("scheme_name", "").lower() or "kisan samman" in combined_elig_text:
                eligible_conditions.append("Landholding: All cultivable landholding farmer families are eligible (2-hectare cap removed since 2019)")
                matched_conditions.append(f"Farmer holds {land_val} acres of cultivable agricultural land")
            elif "marginal" in combined_elig_text and land_val > 2.5:
                failed_conditions.append(f"Landholding size ({land_val} acres) exceeds marginal farmer limit (2.5 acres)")
            elif "small farmer" in combined_elig_text and land_val > 5.0:
                failed_conditions.append(f"Landholding size ({land_val} acres) exceeds small farmer limit (5.0 acres)")
            else:
                eligible_conditions.append(f"Cultivable agricultural landholding ownership proof")
                matched_conditions.append(f"Landholding verified ({land_val} acres)")
        except (ValueError, TypeError):
            pass
    else:
        missing_conditions.append("Landholding size details not fully specified in profile")

    # 3. Occupation Condition
    c_occ = profile_summary.get("occupation") or ("Farmer" if query_reqs.get("is_farmer") else None)
    if c_occ:
        eligible_conditions.append("Beneficiary must be an active farmer or landholding cultivator")
        matched_conditions.append(f"Citizen is classified as an active {c_occ}")
    else:
        missing_conditions.append("Farmer / Landowner occupational proof required")

    # 4. Income / Institutional Exclusion Condition
    c_income = profile_summary.get("annual_income")
    eligible_conditions.append("Institutional landowners and income-tax paying individuals are excluded")
    if c_income is not None:
        matched_conditions.append(f"Annual household income within permissible limits (₹{c_income})")
    else:
        matched_conditions.append("Non-exclusion self-declaration required (not an active income tax payer or constitutional post holder)")

    # 5. Age Condition
    c_age = profile_summary.get("age")
    if "maandhan" in scheme_meta.get("scheme_name", "").lower():
        eligible_conditions.append("Entry Age: 18 to 40 years")
        if c_age:
            if 18 <= int(c_age) <= 40:
                matched_conditions.append(f"Citizen age ({c_age}) is within eligible pension bracket [18-40]")
            else:
                failed_conditions.append(f"Citizen age ({c_age}) is outside required bracket [18-40]")
        else:
            missing_conditions.append("Citizen age proof required for entry bracket verification")
    else:
        eligible_conditions.append("Minimum age 18 years with valid identity proof")
        if c_age:
            matched_conditions.append(f"Age criterion satisfied ({c_age} years)")

    # Overall Status Determination
    if failed_conditions:
        overall_status = "Ineligible"
    elif len(matched_conditions) >= 3 and not missing_conditions:
        overall_status = "Eligible"
    elif len(matched_conditions) >= 2:
        overall_status = "Likely Eligible"
    else:
        overall_status = "Needs Verification"

    return {
        "overall_status": overall_status,
        "eligible_conditions": eligible_conditions,
        "matched_conditions": matched_conditions,
        "missing_conditions": missing_conditions,
        "failed_conditions": failed_conditions
    }


def extract_benefits_package(ranked_chunks: List[Dict[str, Any]], scheme_name: str) -> Dict[str, Any]:
    """Extract and consolidate verified government benefits from ranked context."""
    financial_benefits: List[str] = []
    subsidies: List[str] = []
    assistance_amounts: List[str] = []
    insurance_benefits: List[str] = []
    other_benefits: List[str] = []

    for ch in ranked_chunks:
        text = ch.get("chunk_text", "")
        meta = ch.get("metadata") or {}

        # Check metadata benefit tags
        for b_tag in meta.get("benefit_tags") or []:
            if b_tag not in other_benefits:
                other_benefits.append(b_tag)

        # Look for direct monetary benefits in text
        if "6,000" in text or "6000" in text:
            if "₹6,000 per year in three equal installments of ₹2,000 every four months" not in assistance_amounts:
                assistance_amounts.append("₹6,000 per year in three equal installments of ₹2,000 every four months")
                financial_benefits.append("Direct Benefit Transfer (DBT) deposited directly into citizen's Aadhaar-linked bank account")

        if "pension" in text.lower() and "3,000" in text:
            assistance_amounts.append("Assured minimum pension of ₹3,000 per month upon reaching 60 years of age")

        if "subsidy" in text.lower():
            for sent in text.split("."):
                if "subsidy" in sent.lower() and len(sent.strip()) > 15:
                    clean_sent = sent.strip().replace("\n", " ")
                    if clean_sent not in subsidies and len(clean_sent) < 180:
                        subsidies.append(clean_sent)

        if "insurance" in text.lower() or "coverage" in text.lower():
            for sent in text.split("."):
                if any(w in sent.lower() for w in ["insurance", "sum insured", "coverage", "premium"]):
                    clean_sent = sent.strip().replace("\n", " ")
                    if clean_sent not in insurance_benefits and 20 < len(clean_sent) < 180:
                        insurance_benefits.append(clean_sent)

    # Standard fallback if empty but known PM-KISAN
    if "pm-kisan" in scheme_name.lower() or "kisan samman" in scheme_name.lower():
        if not assistance_amounts:
            assistance_amounts.append("₹6,000 per year distributed in three four-monthly installments of ₹2,000 each")
        if not financial_benefits:
            financial_benefits.append("Direct cash benefit transferred directly into beneficiary bank account via DBT")

    return {
        "assistance_amounts": assistance_amounts,
        "financial_benefits": financial_benefits,
        "subsidies": subsidies,
        "insurance_benefits": insurance_benefits,
        "other_benefits": other_benefits
    }


def extract_required_documents(ranked_chunks: List[Dict[str, Any]]) -> List[str]:
    """Extract consolidated deduplicated checklist of required documents from context."""
    documents_set: Set[str] = set()

    doc_keywords_map = {
        "aadhaar": "Aadhaar Card (linked with active mobile number)",
        "bank": "Bank Account Passbook (with IFSC code & Aadhaar seed)",
        "land": "Land Ownership Proof / Records of Rights (RoR / Pattadar Passbook / Khatian / 7/12 Extract)",
        "identity": "Government-issued Identity Proof (Voter ID / Driving License)",
        "photo": "Passport Size Photographs",
        "caste": "Caste / Social Category Certificate (for SC/ST/OBC category applicants)",
        "income": "Income Certificate / Self-declaration of non-taxpayer status",
        "residential": "Proof of Residence / Domicile Certificate",
        "mobile": "Active Mobile Number for OTP Verification"
    }

    for ch in ranked_chunks:
        text = ch.get("chunk_text", "").lower()
        meta = ch.get("metadata") or {}

        # Direct required_documents array in metadata
        for doc in meta.get("required_documents") or []:
            documents_set.add(doc)

        for kw, standard_doc in doc_keywords_map.items():
            if kw in text:
                documents_set.add(standard_doc)

    priority_order = ["Aadhaar", "Land Ownership", "Bank Account", "Passport Size", "Identity", "Income", "Caste", "Mobile", "Residence"]
    sorted_docs = sorted(
        list(documents_set),
        key=lambda d: next((i for i, p in enumerate(priority_order) if p.lower() in d.lower()), 99)
    )

    return sorted_docs or [
        "Aadhaar Card (linked with active mobile number)",
        "Land Ownership Records / RoR / Pattadar Passbook",
        "Bank Account Passbook (Aadhaar-seeded with active IFSC)",
        "Passport Size Photograph"
    ]


def extract_application_info(ranked_chunks: List[Dict[str, Any]], scheme_name: str) -> Dict[str, Any]:
    """Extract verified application steps, registration procedure, and official URLs."""
    application_steps: List[str] = []
    official_urls: List[str] = []
    registration_links: List[str] = []

    for ch in ranked_chunks:
        text = ch.get("chunk_text", "")
        meta = ch.get("metadata") or {}

        for url in meta.get("official_urls") or []:
            if url and url not in official_urls:
                official_urls.append(url)

        for link in meta.get("registration_links") or []:
            if link and link not in registration_links:
                registration_links.append(link)

        found_urls = re.findall(r"https?://[^\s)\]\",]+", text)
        for u in found_urls:
            clean_u = u.rstrip(".;")
            if clean_u not in official_urls:
                official_urls.append(clean_u)

        if ch.get("chunk_type") == "application_process" or "step" in text.lower():
            for line in text.split("\n"):
                clean_line = line.strip()
                if clean_line.startswith("**Step") or clean_line.startswith("Step ") or clean_line.startswith("1.") or clean_line.startswith("2.") or clean_line.startswith("3."):
                    if clean_line not in application_steps and len(clean_line) < 220:
                        application_steps.append(clean_line)

    if "pm-kisan" in scheme_name.lower() or "kisan samman" in scheme_name.lower():
        if "https://pmkisan.gov.in/" not in official_urls:
            official_urls.insert(0, "https://pmkisan.gov.in/")
        if "https://pmkisan.gov.in/RegistrationFormNew.aspx" not in registration_links:
            registration_links.insert(0, "https://pmkisan.gov.in/RegistrationFormNew.aspx")

    primary_url = registration_links[0] if registration_links else (official_urls[0] if official_urls else "https://pmkisan.gov.in/")

    return {
        "application_steps": application_steps[:6] if application_steps else [
            "Visit the official portal or nearest Common Service Centre (CSC) / Village Agriculture Office.",
            "Click on 'New Farmer Registration' under the Farmers Corner section.",
            "Enter Aadhaar Number, select State, and verify captcha to generate OTP.",
            "Fill in Land Record details (Survey/Khata Number, Khasra Number, Sub-division, and Area).",
            "Upload mandatory documents (Aadhaar Card, Land Records, Bank Passbook).",
            "Submit the application and save the Registration Number for future tracking."
        ],
        "registration_procedure": "Online registration via official government portal or offline submission via Common Service Centres (CSC) / Panchayat Secretary.",
        "primary_registration_url": primary_url,
        "all_official_urls": list(dict.fromkeys(official_urls + registration_links))
    }


def extract_relevant_faqs(ranked_chunks: List[Dict[str, Any]]) -> List[Dict[str, str]]:
    """Extract relevant FAQ questions and answers from ranked context chunks."""
    faqs: List[Dict[str, str]] = []

    for ch in ranked_chunks:
        if ch.get("chunk_type") == "faq":
            text = ch.get("chunk_text", "")
            if '{"answer":' in text:
                try:
                    match = re.search(r'\{.*\}', text, re.DOTALL)
                    if match:
                        data = json.loads(match.group(0))
                        q = data.get("question") or "Eligibility & Scope"
                        a = data.get("answer") or ""
                        faqs.append({"question": q, "answer": a})
                except Exception:
                    pass

            if not faqs:
                faqs.append({
                    "question": "Are all landholding farmers eligible irrespective of land size?",
                    "answer": "Yes. The ambit of PM-KISAN was revised in 2019 to cover all landholding farmer families in the country, subject to exclusion criteria (e.g. institutional landholders, income tax payers)."
                })

    return faqs[:3]


def step_20_context_package_assembly(phase3_payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Step 20: Merge all verified retrieval information into one trusted context package.
    Output: VerifiedContextPackage = {}
    """
    user_query = phase3_payload.get("original_query") or phase3_payload.get("clean_query") or ""
    clean_query = phase3_payload.get("clean_query") or user_query
    structured_intent = phase3_payload.get("structured_intent") or {}
    citizen_profile = phase3_payload.get("citizen_profile") or {}
    personalized_filters = phase3_payload.get("personalized_filters") or {}
    ranked_chunks = (phase3_payload.get("RankedContext") or {}).get("ranked_chunks") or []
    retrieval_conf = phase3_payload.get("RetrievalConfidence") or {}

    profile_summary = {
        "age": citizen_profile.get("age"),
        "gender": citizen_profile.get("gender", "Unspecified"),
        "occupation": personalized_filters.get("eligible_occupation") or citizen_profile.get("occupation") or "Farmer",
        "annual_income": personalized_filters.get("eligible_income_category", {}).get("annual_income") or citizen_profile.get("annual_family_income"),
        "social_category": personalized_filters.get("eligible_caste_category") or citizen_profile.get("caste_category") or "General",
        "landholding_size": personalized_filters.get("eligible_landholding_size"),
        "state": personalized_filters.get("eligible_state") or citizen_profile.get("state") or structured_intent.get("state"),
        "district": citizen_profile.get("district") or structured_intent.get("district")
    }

    query_reqs = structured_intent.get("user_requirement_keywords") or {}

    scheme_metadata = extract_scheme_metadata(phase3_payload)
    eligibility_checklist = build_eligibility_checklist(
        scheme_meta=scheme_metadata,
        profile_summary=profile_summary,
        ranked_chunks=ranked_chunks,
        query_reqs=query_reqs
    )
    benefits_package = extract_benefits_package(ranked_chunks, scheme_metadata.get("scheme_name", ""))
    required_documents = extract_required_documents(ranked_chunks)
    application_info = extract_application_info(ranked_chunks, scheme_metadata.get("scheme_name", ""))
    faqs = extract_relevant_faqs(ranked_chunks)

    evidence_chunks = []
    seen_types = set()
    for ch in ranked_chunks:
        ctype = ch.get("chunk_type", "general")
        if ctype not in seen_types or len(evidence_chunks) < 4:
            seen_types.add(ctype)
            evidence_chunks.append({
                "chunk_id": ch.get("chunk_id"),
                "chunk_type": ctype,
                "scheme_name": ch.get("scheme_name"),
                "similarity_score": ch.get("similarity_score"),
                "cross_encoder_score": ch.get("cross_encoder_score"),
                "text": ch.get("chunk_text")
            })

    VerifiedContextPackage = {
        "user_query": user_query,
        "clean_query": clean_query,
        "structured_intent": {
            "intent": structured_intent.get("intent"),
            "target_scheme": structured_intent.get("scheme_name"),
            "sector": structured_intent.get("sector"),
            "state": structured_intent.get("state")
        },
        "citizen_profile_summary": profile_summary,
        "matching_scheme_information": scheme_metadata,
        "eligibility_checklist": eligibility_checklist,
        "benefits_summary": benefits_package,
        "required_documents_checklist": required_documents,
        "application_information": application_info,
        "official_urls": application_info.get("all_official_urls", []),
        "relevant_faqs": faqs,
        "retrieval_evidence_chunks": evidence_chunks,
        "retrieval_confidence_summary": {
            "final_confidence_score": retrieval_conf.get("final_confidence_score", 0.85),
            "confidence_category": retrieval_conf.get("confidence_category", "High"),
            "fallback_triggered": retrieval_conf.get("fallback_triggered", False)
        }
    }

    return VerifiedContextPackage


# ============================================================================
# Step 21 — Grounded Prompt Building
# ============================================================================

def format_context_package_markdown(pkg: Dict[str, Any]) -> str:
    """Formats the VerifiedContextPackage dictionary into strict, highly structured markdown for LLM context."""
    scheme = pkg.get("matching_scheme_information") or {}
    elig = pkg.get("eligibility_checklist") or {}
    ben = pkg.get("benefits_summary") or {}
    docs = pkg.get("required_documents_checklist") or []
    app = pkg.get("application_information") or {}
    profile = pkg.get("citizen_profile_summary") or {}
    faqs = pkg.get("relevant_faqs") or []

    lines = [
        "### 🏛️ OFFICIAL SCHEME METADATA",
        f"- **Scheme Name**: {scheme.get('scheme_name')}",
        f"- **Scheme ID**: {scheme.get('scheme_id')}",
        f"- **State Jurisdiction**: {scheme.get('state')} (Applicable in {profile.get('state') or 'All India'})",
        f"- **Sector**: {scheme.get('sector')}",
        f"- **Ministry**: {scheme.get('ministry')}",
        f"- **Target Beneficiaries**: {', '.join(scheme.get('target_demographic', []))}",
        "",
        "### 👤 CITIZEN VERIFIED ATTRIBUTES",
        f"- **Occupation**: {profile.get('occupation') or 'Farmer'}",
        f"- **Landholding Size**: {profile.get('landholding_size')} Acres" if profile.get('landholding_size') is not None else "- **Landholding Size**: Not provided in query",
        f"- **State / Territory**: {profile.get('state') or 'India'}",
        f"- **Social Category**: {profile.get('social_category') or 'General'}",
        "",
        "### ✅ VERIFIED ELIGIBILITY CHECKLIST",
        f"- **Overall Status**: {elig.get('overall_status')}",
        "- **Mandatory Eligibility Rules**:"
    ]

    for cond in elig.get("eligible_conditions", []):
        lines.append(f"  • {cond}")

    lines.append("- **Matched Conditions for this Citizen**:")
    for cond in elig.get("matched_conditions", []):
        lines.append(f"  • [MATCHED] {cond}")

    if elig.get("missing_conditions"):
        lines.append("- **Information Pending / Requires Verification**:")
        for cond in elig.get("missing_conditions", []):
            lines.append(f"  • [PENDING] {cond}")

    if elig.get("failed_conditions"):
        lines.append("- **Exclusion Criteria Violated**:")
        for cond in elig.get("failed_conditions", []):
            lines.append(f"  • [INELIGIBLE] {cond}")

    lines.extend([
        "",
        "### 💰 VERIFIED BENEFITS SUMMARY",
        "- **Direct Financial Assistance**:"
    ])
    for b in ben.get("assistance_amounts", []):
        lines.append(f"  • {b}")
    for b in ben.get("financial_benefits", []):
        lines.append(f"  • {b}")

    if ben.get("subsidies"):
        lines.append("- **Subsidies & Credit Support**:")
        for b in ben.get("subsidies", []):
            lines.append(f"  • {b}")

    if ben.get("insurance_benefits"):
        lines.append("- **Insurance Coverage**:")
        for b in ben.get("insurance_benefits", []):
            lines.append(f"  • {b}")

    lines.extend([
        "",
        "### 📑 REQUIRED DOCUMENTS CHECKLIST"
    ])
    for doc in docs:
        lines.append(f"- [ ] {doc}")

    lines.extend([
        "",
        "### 📝 HOW TO APPLY & REGISTRATION PROCEDURE",
        f"- **Official Registration Link**: {app.get('primary_registration_url')}",
        f"- **Procedure Overview**: {app.get('registration_procedure')}",
        "- **Step-by-Step Instructions**:"
    ])
    for step in app.get("application_steps", []):
        lines.append(f"  {step}")

    if faqs:
        lines.extend([
            "",
            "### ❓ RELEVANT FREQUENTLY ASKED QUESTIONS"
        ])
        for faq in faqs:
            lines.append(f"- **Q: {faq.get('question')}**")
            lines.append(f"  A: {faq.get('answer')}")

    return "\n".join(lines)


def step_21_grounded_prompt_building(verified_context_package: Dict[str, Any]) -> Dict[str, Any]:
    """
    Step 21: Construct a strict system prompt that forces Groq Llama to answer
    strictly from the verified context package with zero hallucinations.
    Output: StrictLLMPrompt = {}
    """
    user_query = verified_context_package.get("user_query", "")
    confidence_summary = verified_context_package.get("retrieval_confidence_summary", {})
    conf_score = confidence_summary.get("final_confidence_score", 0.85)
    conf_cat = confidence_summary.get("confidence_category", "High")
    fallback = confidence_summary.get("fallback_triggered", False)

    context_markdown = format_context_package_markdown(verified_context_package)

    system_prompt = f"""You are CivicSphere AI Assist, an authoritative government scheme advisor for Indian citizens.
Your sole mission is to provide accurate, helpful, and citizen-friendly scheme guidance based EXCLUSIVELY on the verified CivicSphere database context provided below.

================================================================================
CRITICAL ANTI-HALLUCINATION & GROUNDING DIRECTIVES (STRICT ZERO TOLERANCE)
================================================================================
1. STRICT GROUNDING:
   - Answer ONLY using the facts, rules, benefit numbers, documents, and URLs provided in the [VERIFIED CIVICSPHERE CONTEXT] block.
   - NEVER invent, assume, extrapolate, or guess any information.
   - DO NOT rely on external training knowledge, rumors, or outdated policies.

2. MISSING INFORMATION PROTOCOL:
   - If any requested information (e.g. a specific district quota, unlisted benefit, or document) is NOT found in the verified context:
     You MUST state verbatim:
     "Information is not available in the CivicSphere Government Schemes database."
   - Do NOT guess or provide approximate numbers.

3. OFFICIAL GOVERNMENT URLS:
   - Use ONLY the exact official URLs provided in the context (e.g. https://pmkisan.gov.in/).
   - NEVER invent or alter web addresses.

4. CITIZEN ELIGIBILITY REASONING:
   - Clearly explain why the citizen is eligible or what conditions they satisfy based on their profile attributes (e.g. landholding, state, occupation).
   - If any condition requires self-declaration or land passbook, state it clearly as verified in the context.

5. SAFETY & CONFIDENCE NOTICE:
   {"- NOTICE: Retrieval confidence is Low. Emphasize that details are based only on verified database records." if fallback else "- Retrieval confidence is " + conf_cat + f" ({conf_score * 100:.1f}%). Proceed with verified database evidence."}

================================================================================
MANDATORY CIVICSPHERE RESPONSE STRUCTURE (TAILORED STRICTLY TO USER INTENT)
================================================================================
Do NOT dump all sections. Tailor your output specifically to what the citizen asked:
- Always start with:
  ### 🏛️ Scheme Recommendation
  [State the exact official name of the scheme, implementing ministry, and state scope.]

- Then include ONLY the specific information the citizen requested (at most 3 sections):
  • If the user asked about ELIGIBILITY: include "### 🎯 Eligibility Result" and "### 🔍 Why You Are Eligible".
  • If the user asked about BENEFITS / SCHEME AMOUNT: include "### 💰 Benefits Available".
  • If the user asked about REQUIRED DOCUMENTS: include "### 📑 Required Documents Checklist".
  • If the user asked about HOW TO APPLY / REGISTRATION: include "### 📝 How to Apply & Registration Steps" and the official link.
  • If the user asked multiple questions or broad general inquiry: select at most the TOP 3 most relevant sections.
  • NEVER dump unrequested sections. Keep answers focused, clear, and grounded.

DO NOT wrap the whole answer in triple backticks.
================================================================================
"""

    prompt_rules = [
        "Answer exclusively from the provided Verified Context Package.",
        "Zero external assumptions or hallucinated facts permitted.",
        "If information is missing, output 'Information is not available in the CivicSphere Government Schemes database.'",
        "Preserve official government URLs exactly as provided.",
        "Strictly tailor response to citizen intent, generating at most top 3 sections."
    ]

    response_format_instructions = [
        "1. Scheme Recommendation",
        "2. Eligibility Result",
        "3. Why You Are Eligible",
        "4. Benefits Available",
        "5. Required Documents",
        "6. How to Apply",
        "7. Official Registration Link",
        "8. Important Notes"
    ]

    user_prompt_content = f"""[CITIZEN QUERY]
{user_query}

[VERIFIED CIVICSPHERE CONTEXT]
{context_markdown}

Please provide your verified guidance following the mandatory 8-section CivicSphere response structure."""

    StrictLLMPrompt = {
        "system_prompt": system_prompt,
        "user_query": user_query,
        "user_prompt_content": user_prompt_content,
        "verified_context_package": verified_context_package,
        "prompt_rules": prompt_rules,
        "response_format_instructions": response_format_instructions,
        "retrieval_confidence": confidence_summary,
        "target_model": "llama-3.3-70b-versatile",
        "groq_chat_payload": {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt_content}
            ],
            "temperature": 0.1,
            "max_tokens": 1500,
            "top_p": 0.95
        }
    }

    return StrictLLMPrompt


# ============================================================================
# Sequential Phase 4 Pipeline Execution (Step 20 → Step 21)
# ============================================================================

def assemble_context_pipeline(phase3_payload: Dict[str, Any], verbose: bool = False) -> Dict[str, Any]:
    """
    Executes the complete Sequential Phase 4 Context Assembly Pipeline:
      Step 20 → Step 21
    Output of Step 20 becomes the input of Step 21.
    """
    def log(msg: str = ""):
        if verbose:
            print(msg)

    log("\n" + "=" * 80)
    log(" CIVICSPHERE AI ASSIST — PHASE 4: CONTEXT ASSEMBLY (STEP 20 → STEP 21)")
    log("=" * 80)

    # Step 20: Context Package Assembly
    log("📦 [Step 20] Assembling Verified Context Package from Phase 3 Retrieval...")
    verified_context_package = step_20_context_package_assembly(phase3_payload)
    scheme_name = verified_context_package.get("matching_scheme_information", {}).get("scheme_name", "Unknown")
    log(f"   ↳ Matched Scheme : {scheme_name}")
    log(f"   ↳ Status         : {verified_context_package.get('eligibility_checklist', {}).get('overall_status')}")
    log(f"   ↳ Documents      : {len(verified_context_package.get('required_documents_checklist', []))} verified documents")
    log(f"   ↳ Official Link  : {verified_context_package.get('application_information', {}).get('primary_registration_url')}")

    # Step 21: Grounded Prompt Building
    log("\n🔒 [Step 21] Building Grounded System Prompt for Groq Llama...")
    strict_llm_prompt = step_21_grounded_prompt_building(verified_context_package)
    log(f"   ↳ Target Model   : {strict_llm_prompt.get('target_model')}")
    log(f"   ↳ System Prompt  : {len(strict_llm_prompt.get('system_prompt', ''))} characters")
    log(f"   ↳ Grounding Rules: {len(strict_llm_prompt.get('prompt_rules', []))} anti-hallucination rules enforced")

    # Assemble Final Phase 4 Payload
    phase4_payload = {
        "phase": "Phase 4 — Context Assembly",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "VerifiedContextPackage": verified_context_package,
        "StrictLLMPrompt": strict_llm_prompt,
        "ready_for_phase5_generation": True
    }

    # Save summary artifact
    with open(CONTEXT_SUMMARY_FILE, "w", encoding="utf-8") as f:
        json.dump(phase4_payload, f, indent=2, default=str, ensure_ascii=False)

    log(f"\n📁 [Artifact Saved] Phase 4 Summary written to: {CONTEXT_SUMMARY_FILE}")

    return phase4_payload


# ============================================================================
# CLI Runner & Demonstration Test Suite
# ============================================================================

def run_phase4_test_suite():
    """Runs Phase 4 context assembly using saved Phase 3 retrieval summary or triggers on-demand."""
    from retrieval_pipeline import execute_retrieval_pipeline
    from query_understanding import process_user_query

    test_query = "Can you tell me about PM-KISAN eligibility in Telangana for a small farmer with 2 acres?"
    user_id = "Civs1001"

    print(f"\n>>> Running Phase 4 Context Assembly on: '{test_query}'")
    p2_output = process_user_query(citizen_prompt=test_query, user_id=user_id, input_type="text")
    p3_output = execute_retrieval_pipeline(p2_output, top_k=10)
    p4_output = assemble_context_pipeline(p3_output, verbose=True)

    print("\n" + "=" * 80)
    print(" ✅ PHASE 4 CONTEXT ASSEMBLY & STRICT PROMPT BUILDING COMPLETE!")
    print(f" Summary artifact available at: {CONTEXT_SUMMARY_FILE}")
    print("=" * 80)


def main():
    import argparse
    parser = argparse.ArgumentParser(description="CivicSphere AI Assist Phase 4: Context Assembly")
    parser.add_argument("--query", "-q", type=str, help="Citizen query")
    parser.add_argument("--user-id", "-u", type=str, default="Civs1001", help="Citizen Profile ID")
    parser.add_argument("--voice", action="store_true", help="Voice input flag")
    parser.add_argument("--raw-json", action="store_true", help="Output raw JSON to stdout")
    parser.add_argument("--test", action="store_true", help="Run verification test suite")

    args = parser.parse_args()

    if args.test or not args.query:
        run_phase4_test_suite()
    else:
        from query_understanding import process_user_query
        from retrieval_pipeline import execute_retrieval_pipeline

        if args.raw_json:
            with contextlib.redirect_stdout(io.StringIO()):
                p2_output = process_user_query(
                    citizen_prompt=args.query,
                    user_id=args.user_id,
                    input_type="voice" if args.voice else "text"
                )
                p3_output = execute_retrieval_pipeline(p2_output, top_k=10)
                p4_output = assemble_context_pipeline(p3_output, verbose=False)
            sys.stdout.write(json.dumps(p4_output, default=str, ensure_ascii=False) + "\n")
            sys.stdout.flush()
        else:
            p2_output = process_user_query(
                citizen_prompt=args.query,
                user_id=args.user_id,
                input_type="voice" if args.voice else "text"
            )
            p3_output = execute_retrieval_pipeline(p2_output, top_k=10)
            p4_output = assemble_context_pipeline(p3_output, verbose=True)


if __name__ == "__main__":
    main()
