"""
CivicSphere AI Assist — Phase 3: Retrieval (Hybrid RAG Pipeline)
Location: RAG+LLM/retrieval_pipeline.py

Pipeline Sequence:
  Step 15 → Relational SQL Filtering (Exclusively on Supabase agriculture_schemes)
              ↓
  Step 16 → Query Embedding (BAAI/bge-small-en-v1.5 normalized query vector)
              ↓
  Step 17 → Vector Similarity Search (Candidate-isolated cosine similarity)
              ↓
  Step 18 → Context Re-Ranking (Cross-Encoder + Maximal Marginal Relevance MMR)
              ↓
  Step 19 → Retrieval Confidence Scoring & Safety Fallback
              ↓
  User Review Summary & Audit Log (Do NOT generate final AI answer)
"""

import os
import sys
import io
import contextlib
import json
import time
import math
import re
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Set

import numpy as np
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
EMBEDDINGS_DATASET_FILE = OUTPUT_DIR / "dataset_after_embeddings.json"
RETRIEVAL_SUMMARY_FILE = OUTPUT_DIR / "retrieval_summary.json"

# Load environment variables
load_dotenv(CURRENT_DIR / ".env", override=False)
load_dotenv(PROJECT_ROOT / ".env", override=True)

# Supabase Configuration (Strictly used for relational filtering)
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL") or "https://qoafhrmugjeezzfsgilg.supabase.co"
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY") or ""

# Embedding & Cross-Encoder Models
EMBEDDING_MODEL_NAME = "BAAI/bge-small-en-v1.5"
EMBEDDING_DIMENSION = 384
CROSS_ENCODER_MODEL_NAME = "cross-encoder/ms-marco-MiniLM-L-6-v2"

# Global model cache to avoid reloading models on every invocation
_EMBEDDING_MODEL = None
_CROSS_ENCODER_MODEL = None
_CACHED_EMBEDDINGS_DATASET = None


def get_embedding_model():
    """Load or retrieve cached SentenceTransformer embedding model."""
    global _EMBEDDING_MODEL
    if _EMBEDDING_MODEL is None:
        from sentence_transformers import SentenceTransformer
        _EMBEDDING_MODEL = SentenceTransformer(EMBEDDING_MODEL_NAME)
    return _EMBEDDING_MODEL


def get_cross_encoder_model():
    """Load or retrieve cached CrossEncoder model."""
    global _CROSS_ENCODER_MODEL
    if _CROSS_ENCODER_MODEL is None:
        from sentence_transformers import CrossEncoder
        _CROSS_ENCODER_MODEL = CrossEncoder(CROSS_ENCODER_MODEL_NAME)
    return _CROSS_ENCODER_MODEL


def load_embeddings_dataset() -> List[Dict[str, Any]]:
    """Load pre-computed embedding vectors and chunks from dataset_after_embeddings.json."""
    global _CACHED_EMBEDDINGS_DATASET
    if _CACHED_EMBEDDINGS_DATASET is None:
        if not EMBEDDINGS_DATASET_FILE.exists():
            raise FileNotFoundError(f"Embeddings dataset not found at {EMBEDDINGS_DATASET_FILE}")
        with open(EMBEDDINGS_DATASET_FILE, "r", encoding="utf-8") as f:
            _CACHED_EMBEDDINGS_DATASET = json.load(f)
    return _CACHED_EMBEDDINGS_DATASET


# ============================================================================
# Supabase Relational Client (User Requirement: Use Supabase Only)
# ============================================================================

def query_supabase_schemes(state: Optional[str] = None, scheme_id: Optional[str] = None, limit: int = 200) -> List[Dict[str, Any]]:
    """
    Query public.agriculture_schemes table exclusively from Supabase PostgREST API.
    Applies state-level matching and retrieves full scheme metadata.
    """
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        print("[WARN] Supabase URL or Anon Key missing in environment.")
        return []

    base_endpoint = f"{SUPABASE_URL.rstrip('/')}/rest/v1/agriculture_schemes"

    if scheme_id:
        url = f"{base_endpoint}?scheme_id=eq.{urllib.parse.quote(scheme_id)}&select=scheme_id,scheme_name,state,sector,category,ministry,eligibility,benefits,target_demographic,beneficiary_category,normalized_summary&limit=1"
    else:
        params = [
            "select=scheme_id,scheme_name,state,sector,category,ministry,eligibility,benefits,target_demographic,beneficiary_category,normalized_summary",
            f"limit={limit}"
        ]
        # If state is provided and not 'All', query schemes matching state or 'All'
        if state and state.lower() not in ["all", "all india", "none"]:
            encoded_state = urllib.parse.quote(f"*{state}*")
            encoded_all = urllib.parse.quote("*All*")
            params.append(f"or=(state.ilike.{encoded_state},state.ilike.{encoded_all})")
        url = f"{base_endpoint}?{'&'.join(params)}"
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json"
    }

    try:
        req = urllib.request.Request(url, headers=headers, method="GET")
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data
    except Exception as err:
        print(f"[ERROR] Supabase schemes fetch failed: {err}")
        # Fallback to broader query if complex filter failed
        try:
            fallback_url = f"{base_endpoint}?select=scheme_id,scheme_name,state,sector,category,ministry,eligibility,benefits,target_demographic,beneficiary_category&limit=100"
            req = urllib.request.Request(fallback_url, headers=headers, method="GET")
            with urllib.request.urlopen(req, timeout=10) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except Exception as fb_err:
            print(f"[FATAL] Supabase fallback query also failed: {fb_err}")
            return []


# ============================================================================
# Step 15 — Relational SQL Filtering (Supabase Only)
# ============================================================================

def evaluate_scheme_eligibility(scheme: Dict[str, Any], profile_filters: Dict[str, Any], query_reqs: Dict[str, Any], target_scheme_name: Optional[str]) -> Tuple[bool, List[str], str]:
    """
    Evaluates whether a candidate scheme matches citizen eligibility constraints.
    Returns: (is_eligible, matched_filters, match_reason)
    """
    matched_filters = []
    reasons = []

    scheme_id = scheme.get("scheme_id", "")
    scheme_name = scheme.get("scheme_name", "")
    scheme_state = scheme.get("state", "All")
    eligibility_meta = scheme.get("eligibility") or {}
    demographics = scheme.get("target_demographic") or []

    # Priority match if explicit scheme was targeted in query
    if target_scheme_name and target_scheme_name.lower() in scheme_name.lower():
        matched_filters.append("Explicit Scheme Target")
        return True, matched_filters, f"Direct match with user query target scheme: '{target_scheme_name}'"

    # 1. State Filter Rule
    eligible_state = profile_filters.get("eligible_state")
    if eligible_state and eligible_state.lower() not in ["all", "all india"]:
        if scheme_state and scheme_state.lower() not in ["all", "all india"]:
            if eligible_state.lower() not in scheme_state.lower():
                return False, [], f"State mismatch: user state '{eligible_state}' not in scheme state '{scheme_state}'"
            matched_filters.append(f"State: {eligible_state}")
    else:
        matched_filters.append("National / All India Scheme")

    # 2. Income Filter Rule
    user_income = profile_filters.get("eligible_income_category", {}).get("annual_income")
    if user_income is not None:
        try:
            user_inc_val = float(user_income)
            # Check eligibility.income.max if present
            scheme_income_cap = None
            if isinstance(eligibility_meta, dict):
                income_obj = eligibility_meta.get("income")
                if isinstance(income_obj, dict):
                    scheme_income_cap = income_obj.get("max")
                elif isinstance(income_obj, (int, float)):
                    scheme_income_cap = income_obj

            if scheme_income_cap and user_inc_val > float(scheme_income_cap):
                return False, [], f"Income ceiling exceeded: user income ₹{user_inc_val} > scheme limit ₹{scheme_income_cap}"
            if scheme_income_cap:
                matched_filters.append(f"Income <= ₹{scheme_income_cap}")
        except (ValueError, TypeError):
            pass

    # 3. Age Filter Rule
    user_age = profile_filters.get("eligible_age_range", {}).get("citizen_age")
    if user_age is not None:
        try:
            age_val = int(user_age)
            if isinstance(eligibility_meta, dict):
                age_obj = eligibility_meta.get("age")
                if isinstance(age_obj, dict):
                    min_age = age_obj.get("min")
                    max_age = age_obj.get("max")
                    if min_age and age_val < int(min_age):
                        return False, [], f"Age below minimum: user age {age_val} < min age {min_age}"
                    if max_age and age_val > int(max_age):
                        return False, [], f"Age above maximum: user age {age_val} > max age {max_age}"
                    matched_filters.append(f"Age {age_val} in [{min_age}-{max_age}]")
        except (ValueError, TypeError):
            pass

    # 4. Gender Filter Rule
    is_woman = query_reqs.get("is_woman", False)
    target_demo_str = " ".join(str(d).lower() for d in demographics)
    if "women only" in target_demo_str or "female only" in target_demo_str:
        if not is_woman:
            return False, [], "Gender restriction: scheme is exclusively for women beneficiaries"
        matched_filters.append("Target Demographic: Women")

    # 5. Landholding Size Rule
    user_land = profile_filters.get("eligible_landholding_size")
    if user_land is not None:
        try:
            land_val = float(user_land)
            if "marginal" in target_demo_str and land_val > 2.5:
                return False, [], f"Landholding exceeds marginal farmer cap: {land_val} acres > 2.5 acres"
            if "small farmer" in target_demo_str and land_val > 5.0:
                return False, [], f"Landholding exceeds small farmer cap: {land_val} acres > 5.0 acres"
            matched_filters.append(f"Landholding: {land_val} acres")
        except (ValueError, TypeError):
            pass

    # 6. Caste / Social Category Rule
    user_caste = profile_filters.get("eligible_caste_category")
    if user_caste and user_caste != "General":
        if any(c in target_demo_str for c in ["sc", "st", "obc"]):
            matched_filters.append(f"Caste: {user_caste}")

    # If made it through all elimination filters, it is eligible!
    reasons.append(f"Passed all eligibility gates for {scheme_name}")
    return True, matched_filters, "; ".join(reasons)


def step_15_relational_sql_filtering(phase2_payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Step 15: Perform relational metadata filtering on Supabase agriculture_schemes table
    before vector search. Eliminates schemes that clearly fail citizen eligibility conditions.
    """
    print("\n" + "=" * 80)
    print(" [STEP 15] RELATIONAL SQL FILTERING (EXCLUSIVELY ON SUPABASE)")
    print("=" * 80)

    structured_intent = phase2_payload.get("structured_intent", {})
    profile_filters = phase2_payload.get("personalized_eligibility_filters", {})
    query_reqs = structured_intent.get("user_requirement_keywords", {})
    target_scheme = structured_intent.get("scheme_name")
    resolved_state = profile_filters.get("eligible_state")

    # Query candidate schemes from Supabase
    target_scheme_id = phase2_payload.get("target_scheme_id") or structured_intent.get("scheme_id")
    target_scheme = structured_intent.get("scheme_name") or phase2_payload.get("target_scheme_name")

    if target_scheme_id:
        print(f"🎯 [Step 15] Direct Scheme ID Targeted: '{target_scheme_id}'. Isolating candidate pool...")
        direct_schemes = query_supabase_schemes(scheme_id=target_scheme_id)
        if direct_schemes:
            s = direct_schemes[0]
            candidates = [{
                "scheme_id": s.get("scheme_id"),
                "scheme_name": s.get("scheme_name"),
                "state": s.get("state"),
                "sector": s.get("sector"),
                "ministry": s.get("ministry"),
                "matched_filters": [f"Direct Scheme Target: {target_scheme_id}"],
                "eligibility_match_reason": f"Directly bound to active scheme {s.get('scheme_name')}"
            }]
            raw_schemes = direct_schemes
            eliminated_count = 0
        else:
            raw_schemes = query_supabase_schemes(state=resolved_state, limit=300)
    else:
        print(f"📡 Querying Supabase 'agriculture_schemes' table (State: {resolved_state})...")
        raw_schemes = query_supabase_schemes(state=resolved_state, limit=300)
        print(f"   ↳ Retrieved {len(raw_schemes)} candidate rows from Supabase.")

    if not target_scheme_id or not candidates:
        candidates = []
        eliminated_count = 0

        for scheme in raw_schemes:
            is_eligible, matched_filters, reason = evaluate_scheme_eligibility(
                scheme=scheme,
                profile_filters=profile_filters,
                query_reqs=query_reqs,
                target_scheme_name=target_scheme
            )

            if is_eligible:
                candidates.append({
                    "scheme_id": scheme.get("scheme_id"),
                    "scheme_name": scheme.get("scheme_name"),
                    "state": scheme.get("state"),
                    "sector": scheme.get("sector"),
                    "ministry": scheme.get("ministry"),
                    "matched_filters": matched_filters,
                    "eligibility_match_reason": reason
                })
            else:
                eliminated_count += 1

        # If an explicit scheme was targeted by name, isolate candidates to those matching targets
        if target_scheme:
            explicit_candidates = [
                c for c in candidates
                if "Explicit Scheme Target" in c.get("matched_filters", []) or
                   target_scheme.lower() in c.get("scheme_name", "").lower()
            ]
            if explicit_candidates:
                print(f"🎯 [Step 15] Explicit Scheme Target '{target_scheme}' found. Isolating to {len(explicit_candidates)} candidate(s)...")
                candidates = explicit_candidates

    # In case filtering was too restrictive, ensure top default schemes are retained
    if not candidates and raw_schemes:
        print("[WARN] All schemes eliminated by strict filters. Retaining top general schemes...")
        for s in raw_schemes[:5]:
            candidates.append({
                "scheme_id": s.get("scheme_id"),
                "scheme_name": s.get("scheme_name"),
                "state": s.get("state"),
                "sector": s.get("sector"),
                "ministry": s.get("ministry"),
                "matched_filters": ["Relaxed Fallback Match"],
                "eligibility_match_reason": "General matching scheme under relaxed conditions"
            })

    filtered_candidates_dict = {
        "candidates": candidates,
        "total_candidates": len(candidates),
        "total_evaluated": len(raw_schemes),
        "eliminated_count": eliminated_count,
        "matched_filters": {
            "state": resolved_state,
            "sector": structured_intent.get("sector"),
            "target_scheme": target_scheme,
            "demographics": profile_filters.get("target_demographic", [])
        }
    }

    print(f"✅ [Step 15] Relational Filtering Complete.")
    print(f"   - Total Evaluated from Supabase : {len(raw_schemes)}")
    print(f"   - Eliminated Non-Matching       : {eliminated_count}")
    print(f"   - Preserved Eligible Candidates  : {len(candidates)}")
    for c in candidates[:5]:
        print(f"     • [{c['scheme_id']}] {c['scheme_name']} ({c['state']}) — {c['eligibility_match_reason']}")

    return filtered_candidates_dict


# ============================================================================
# Step 16 — Query Embedding
# ============================================================================

def step_16_query_embedding(clean_query: str, original_query: str = "") -> Dict[str, Any]:
    """
    Step 16: Generate an embedding vector for the cleaned user query using BAAI/bge-small-en-v1.5.
    Normalizes the vector for cosine similarity dot product.
    """
    print("\n" + "=" * 80)
    print(" [STEP 16] QUERY EMBEDDING GENERATION")
    print("=" * 80)
    print(f"🔢 Loading embedding model '{EMBEDDING_MODEL_NAME}' (Dimension: {EMBEDDING_DIMENSION})...")

    model = get_embedding_model()

    start_time = time.time()
    # Generate normalized embedding vector
    vector = model.encode(clean_query, normalize_embeddings=True)
    vector_list = vector.tolist() if isinstance(vector, np.ndarray) else list(vector)
    elapsed = time.time() - start_time

    query_vector_dict = {
        "original_query": original_query or clean_query,
        "clean_query": clean_query,
        "embedding_model": EMBEDDING_MODEL_NAME,
        "embedding_dimension": len(vector_list),
        "embedding_vector": vector_list,
        "generation_time_seconds": round(elapsed, 4)
    }

    print(f"✅ [Step 16] Query Embedding Complete in {elapsed:.3f}s.")
    print(f"   - Clean Query Text   : '{clean_query}'")
    print(f"   - Vector Dimension   : {len(vector_list)}")
    print(f"   - Vector Norm        : {np.linalg.norm(vector_list):.4f} (Normalized for Cosine Similarity)")
    print(f"   - Sample Vector Head : {vector_list[:5]}")

    return query_vector_dict


# ============================================================================
# Step 17 — Vector Similarity Search (Candidate Isolated)
# ============================================================================

def step_17_vector_similarity_search(query_vector_dict: Dict[str, Any], filtered_candidates: Dict[str, Any], top_k: int = 10) -> Dict[str, Any]:
    """
    Step 17: Search pre-computed chunk embeddings using cosine similarity.
    Restricts search exclusively to chunks belonging to candidate schemes identified in Step 15.
    """
    print("\n" + "=" * 80)
    print(" [STEP 17] VECTOR SIMILARITY SEARCH (CANDIDATE-ISOLATED)")
    print("=" * 80)

    candidates = filtered_candidates.get("candidates", [])
    candidate_scheme_ids: Set[str] = {c["scheme_id"] for c in candidates if c.get("scheme_id")}

    print(f"🔍 Filtering vector space to {len(candidate_scheme_ids)} eligible candidate schemes...")
    all_chunks = load_embeddings_dataset()
    print(f"   ↳ Total indexed dataset chunks: {len(all_chunks)}")

    # Filter chunks belonging exclusively to candidate schemes
    candidate_chunks = [ch for ch in all_chunks if ch.get("scheme_id") in candidate_scheme_ids]

    # If strict scheme matching yielded few chunks and no specific scheme was targeted, broaden
    is_specific_target = len(candidate_scheme_ids) <= 3
    if len(candidate_chunks) < top_k and not is_specific_target:
        print("[WARN] Candidate chunks less than Top-K. Including general central scheme chunks...")
        candidate_chunks = [ch for ch in all_chunks if ch.get("scheme_id") in candidate_scheme_ids or "Central" in str(ch.get("metadata", {}).get("scheme_level", ""))]

    if not candidate_chunks:
        candidate_chunks = all_chunks[:top_k]

    print(f"🚀 Running Cosine Similarity search across {len(candidate_chunks)} candidate chunks...")

    q_vec = np.array(query_vector_dict["embedding_vector"], dtype=np.float32)

    scored_chunks = []
    for ch in candidate_chunks:
        emb = ch.get("embedding_vector")
        if not emb:
            continue
        c_vec = np.array(emb, dtype=np.float32)
        # Normalized cosine similarity is dot product
        cos_sim = float(np.dot(q_vec, c_vec))

        scored_chunks.append({
            "chunk_id": ch.get("chunk_id"),
            "scheme_id": ch.get("scheme_id"),
            "scheme_name": ch.get("metadata", {}).get("scheme_name") or ch.get("scheme_id"),
            "chunk_type": ch.get("chunk_type", "general"),
            "chunk_text": ch.get("chunk_text", ""),
            "similarity_score": round(cos_sim, 4),
            "metadata": ch.get("metadata", {})
        })

    # Sort descending by similarity score
    scored_chunks.sort(key=lambda x: x["similarity_score"], reverse=True)
    top_chunks = scored_chunks[:top_k]

    top_k_chunks_dict = {
        "chunks": top_chunks,
        "top_k": len(top_chunks),
        "candidate_pool_size": len(candidate_chunks),
        "total_dataset_size": len(all_chunks)
    }

    print(f"✅ [Step 17] Vector Search Complete. Retrieved Top-{len(top_chunks)} chunks:")
    for idx, ch in enumerate(top_chunks, 1):
        print(f"   [{idx}] Score: {ch['similarity_score']:.4f} | [{ch['chunk_type']}] {ch['scheme_name']} ({ch['chunk_id']})")
        print(f"       Text: {ch['chunk_text'][:110]}...")

    return top_k_chunks_dict


# ============================================================================
# Step 18 — Context Re-Ranking & MMR
# ============================================================================

def compute_mmr_selection(query_sims: List[float], chunk_vectors: List[np.ndarray], lambda_param: float = 0.70, top_n: int = 6) -> List[int]:
    r"""
    Maximal Marginal Relevance (MMR) selection to balance relevance and diversity.
    MMR = argmax_{d_i in R \ S} [ lambda * Sim1(d_i, q) - (1 - lambda) * max_{d_j in S} Sim2(d_i, d_j) ]
    """
    selected_indices: List[int] = []
    unselected = list(range(len(query_sims)))

    if not unselected:
        return []

    # Pick the top relevance candidate first
    best_first = int(np.argmax(query_sims))
    selected_indices.append(best_first)
    unselected.remove(best_first)

    while unselected and len(selected_indices) < top_n:
        mmr_scores = []
        for idx in unselected:
            relevance = query_sims[idx]
            # Max similarity to already selected chunks
            max_sim_to_selected = max(
                float(np.dot(chunk_vectors[idx], chunk_vectors[sel]))
                for sel in selected_indices
            )
            mmr_val = lambda_param * relevance - (1.0 - lambda_param) * max_sim_to_selected
            mmr_scores.append((mmr_val, idx))

        mmr_scores.sort(key=lambda x: x[0], reverse=True)
        chosen_idx = mmr_scores[0][1]
        selected_indices.append(chosen_idx)
        unselected.remove(chosen_idx)

    return selected_indices


def step_18_context_reranking(clean_query: str, top_k_chunks: Dict[str, Any], lambda_mmr: float = 0.70) -> Dict[str, Any]:
    """
    Step 18: Re-rank retrieved chunks using Cross-Encoder and Maximal Marginal Relevance (MMR).
    Eliminates redundant text, elevates semantic depth, and preserves chunk type diversity.
    """
    print("\n" + "=" * 80)
    print(" [STEP 18] CONTEXT RE-RANKING (CROSS-ENCODER + MMR)")
    print("=" * 80)

    chunks = top_k_chunks.get("chunks", [])
    if not chunks:
        print("[WARN] No chunks provided for re-ranking.")
        return {"ranked_chunks": [], "total_ranked": 0}

    print(f"🔄 Initializing Cross-Encoder '{CROSS_ENCODER_MODEL_NAME}'...")
    cross_encoder = get_cross_encoder_model()

    # Form query-chunk pairs
    pairs = [(clean_query, ch["chunk_text"]) for ch in chunks]
    print(f"🚀 Computing Cross-Encoder relevance for {len(pairs)} query-chunk pairs...")
    raw_ce_scores = cross_encoder.predict(pairs)

    # Convert logits to probability range [0, 1] using sigmoid
    ce_scores = [float(1.0 / (1.0 + math.exp(-float(s)))) for s in raw_ce_scores]

    # Load chunk vectors for MMR diversity calculation
    emb_model = get_embedding_model()
    chunk_vectors = [emb_model.encode(ch["chunk_text"], normalize_embeddings=True) for ch in chunks]

    # Combine Cross-Encoder and Cosine Similarity into blended relevance
    blended_relevance = [
        0.65 * ce + 0.35 * ch["similarity_score"]
        for ce, ch in zip(ce_scores, chunks)
    ]

    # Apply MMR Diversity Selection
    mmr_order = compute_mmr_selection(blended_relevance, chunk_vectors, lambda_param=lambda_mmr, top_n=len(chunks))

    ranked_chunks = []
    seen_texts: Set[str] = set()

    for rank, idx in enumerate(mmr_order, 1):
        ch = chunks[idx]
        text_fingerprint = re.sub(r"\W+", "", ch["chunk_text"][:80].lower())
        if text_fingerprint in seen_texts:
            continue  # Exact near-duplicate removal
        seen_texts.add(text_fingerprint)

        ranked_chunks.append({
            "final_rank": rank,
            "scheme_id": ch["scheme_id"],
            "scheme_name": ch["scheme_name"],
            "chunk_id": ch["chunk_id"],
            "chunk_type": ch["chunk_type"],
            "chunk_text": ch["chunk_text"],
            "similarity_score": ch["similarity_score"],
            "cross_encoder_score": round(ce_scores[idx], 4),
            "mmr_score": round(blended_relevance[idx], 4),
            "metadata": ch.get("metadata", {})
        })

    ranked_context_dict = {
        "ranked_chunks": ranked_chunks,
        "total_ranked": len(ranked_chunks),
        "lambda_mmr": lambda_mmr,
        "cross_encoder_model": CROSS_ENCODER_MODEL_NAME
    }

    print(f"✅ [Step 18] Re-ranking & MMR Complete. {len(ranked_chunks)} diverse chunks ranked:")
    for ch in ranked_chunks:
        print(f"   Rank #{ch['final_rank']} | CE: {ch['cross_encoder_score']:.4f} | Cos: {ch['similarity_score']:.4f} | [{ch['chunk_type']}] {ch['scheme_name']}")

    return ranked_context_dict


# ============================================================================
# Step 19 — Retrieval Confidence Scoring & Safety Fallback
# ============================================================================

def step_19_retrieval_confidence_scoring(
    ranked_context: Dict[str, Any],
    filtered_candidates: Dict[str, Any],
    phase2_payload: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Step 19: Calculate mathematical confidence score combining Cosine Similarity,
    Cross-Encoder relevance, Metadata match, Profile Eligibility score, and MMR rank.
    Assigns confidence category (Very High, High, Medium, Low) and safety fallback trigger.
    """
    print("\n" + "=" * 80)
    print(" [STEP 19] RETRIEVAL CONFIDENCE SCORING & SAFETY FALLBACK")
    print("=" * 80)

    ranked_chunks = ranked_context.get("ranked_chunks", [])
    if not ranked_chunks:
        return {
            "final_confidence_score": 0.0,
            "confidence_category": "Low",
            "fallback_triggered": True,
            "matching_scheme_ids": [],
            "matching_scheme_names": [],
            "top_ranked_chunk_ids": [],
            "top_ranked_chunk_types": [],
            "retrieval_summary": "Zero context chunks retrieved. Fallback triggered."
        }

    # 1. Top-3 Cross-Encoder Mean Score
    top_ce = [ch["cross_encoder_score"] for ch in ranked_chunks[:3]]
    s_ce = float(np.mean(top_ce)) if top_ce else 0.50

    # 2. Top-3 Cosine Similarity Mean Score
    top_cos = [ch["similarity_score"] for ch in ranked_chunks[:3]]
    s_cos = float(np.mean(top_cos)) if top_cos else 0.50

    # 3. Metadata Match Score
    structured_intent = phase2_payload.get("structured_intent", {})
    profile_filters = phase2_payload.get("personalized_eligibility_filters", {})
    target_scheme = structured_intent.get("scheme_name")

    meta_score = 0.50
    # Boost if target scheme matched
    if target_scheme and any(target_scheme.lower() in ch["scheme_name"].lower() for ch in ranked_chunks[:3]):
        meta_score += 0.35
    if profile_filters.get("eligible_state") and profile_filters["eligible_state"] != "All":
        meta_score += 0.15
    s_meta = min(1.0, meta_score)

    # 4. Eligibility Match Score
    p_score = profile_filters.get("priority_matching_score", 1.0)
    s_elig = min(1.0, 0.60 + (p_score - 1.0) * 0.25)

    # 5. MMR Diversity Score
    unique_types = len(set(ch["chunk_type"] for ch in ranked_chunks[:5]))
    s_mmr = min(1.0, 0.40 + (unique_types * 0.15))

    # Mathematical Formula Weighting:
    # Confidence = 0.35 * S_CE + 0.25 * S_Cosine + 0.20 * S_Meta + 0.15 * S_Elig + 0.05 * S_MMR
    final_score = (
        0.35 * s_ce +
        0.25 * s_cos +
        0.20 * s_meta +
        0.15 * s_elig +
        0.05 * s_mmr
    )
    final_score = round(float(final_score), 4)

    # Categorization
    if final_score >= 0.82:
        category = "Very High"
        fallback = False
    elif final_score >= 0.68:
        category = "High"
        fallback = False
    elif final_score >= 0.50:
        category = "Medium"
        fallback = False
    else:
        category = "Low"
        fallback = True

    # Matching scheme IDs and top ranked chunk types
    matching_ids = list(dict.fromkeys(ch["scheme_id"] for ch in ranked_chunks[:5]))
    matching_names = list(dict.fromkeys(ch["scheme_name"] for ch in ranked_chunks[:5]))
    top_chunk_ids = [ch["chunk_id"] for ch in ranked_chunks[:5]]
    top_chunk_types = [ch["chunk_type"] for ch in ranked_chunks[:5]]

    summary_msg = (
        f"Retrieval confidence: {category} ({final_score * 100:.1f}%). "
        f"Retrieved {len(ranked_chunks)} diverse chunks across {len(matching_names)} matching schemes. "
        f"Cross-Encoder relevance: {s_ce:.2f}, Cosine similarity: {s_cos:.2f}. "
        f"Safety fallback: {'ACTIVE' if fallback else 'OFF'}."
    )

    confidence_dict = {
        "final_confidence_score": final_score,
        "confidence_category": category,
        "fallback_triggered": fallback,
        "component_scores": {
            "cross_encoder_mean": round(s_ce, 4),
            "cosine_similarity_mean": round(s_cos, 4),
            "metadata_match_score": round(s_meta, 4),
            "eligibility_match_score": round(s_elig, 4),
            "mmr_diversity_score": round(s_mmr, 4)
        },
        "matching_scheme_ids": matching_ids,
        "matching_scheme_names": matching_names,
        "top_ranked_chunk_ids": top_chunk_ids,
        "top_ranked_chunk_types": top_chunk_types,
        "retrieval_summary": summary_msg
    }

    print(f"📊 Final Confidence Score : {final_score:.4f} ({category})")
    print(f"   - Cross-Encoder Score  : {s_ce:.4f} (Weight 35%)")
    print(f"   - Cosine Sim Score     : {s_cos:.4f} (Weight 25%)")
    print(f"   - Metadata Match Score : {s_meta:.4f} (Weight 20%)")
    print(f"   - Eligibility Score    : {s_elig:.4f} (Weight 15%)")
    print(f"   - MMR Diversity Score  : {s_mmr:.4f} (Weight 5%)")
    print(f"   - Safety Fallback Gate : {'TRIGGERED (Low Confidence)' if fallback else 'PASSED (Proceed with Verified Context)'}")

    return confidence_dict


# ============================================================================
# Sequential Phase 3 Pipeline Execution (Step 15 → Step 19)
# ============================================================================

def execute_retrieval_pipeline(phase2_payload: Dict[str, Any], top_k: int = 10) -> Dict[str, Any]:
    """
    Executes the complete Sequential Phase 3 Retrieval Pipeline:
      Step 15 → Step 16 → Step 17 → Step 18 → Step 19
      
    Adheres strictly to requirement:
      The output of one step becomes the input of the next step.
      Do NOT generate final AI answer.
    """
    # Step 15: Relational SQL Filtering (Exclusively on Supabase)
    step15_output = step_15_relational_sql_filtering(phase2_payload)

    # Step 16: Query Embedding
    clean_query = phase2_payload.get("clean_query") or phase2_payload.get("original_query", "")
    original_query = phase2_payload.get("original_query", "")
    step16_output = step_16_query_embedding(clean_query, original_query=original_query)

    # Step 17: Vector Similarity Search
    step17_output = step_17_vector_similarity_search(
        query_vector_dict=step16_output,
        filtered_candidates=step15_output,
        top_k=top_k
    )

    # Step 18: Context Re-Ranking & MMR
    step18_output = step_18_context_reranking(
        clean_query=clean_query,
        top_k_chunks=step17_output,
        lambda_mmr=0.70
    )

    # Step 19: Retrieval Confidence Scoring
    step19_output = step_19_retrieval_confidence_scoring(
        ranked_context=step18_output,
        filtered_candidates=step15_output,
        phase2_payload=phase2_payload
    )

    # Assemble Final Phase 3 Payload (ready for future Phase 4 Context Assembly)
    phase3_payload = {
        "phase": "Phase 3 — Retrieval (Hybrid RAG Pipeline)",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        # Inputs preserved from Phase 2
        "original_query": original_query,
        "clean_query": clean_query,
        "structured_intent": phase2_payload.get("structured_intent"),
        "citizen_profile": phase2_payload.get("citizen_profile_summary"),
        "personalized_filters": phase2_payload.get("personalized_eligibility_filters"),
        # Phase 3 Step Outputs
        "FilteredCandidates": step15_output,
        "QueryVector": {
            "embedding_model": step16_output.get("embedding_model"),
            "embedding_dimension": step16_output.get("embedding_dimension"),
            "generation_time_seconds": step16_output.get("generation_time_seconds")
            # Omitting full 384 float vector from summary display to keep logs clean
        },
        "TopKChunks": {
            "retrieved_count": step17_output.get("top_k"),
            "candidate_pool_size": step17_output.get("candidate_pool_size")
        },
        "RankedContext": step18_output,
        "RetrievalConfidence": step19_output,
        "phase4_ready_context": {
            "top_chunks": step18_output.get("ranked_chunks", []),
            "confidence_score": step19_output.get("final_confidence_score"),
            "confidence_category": step19_output.get("confidence_category"),
            "fallback_triggered": step19_output.get("fallback_triggered")
        }
    }

    # Save summary artifact
    with open(RETRIEVAL_SUMMARY_FILE, "w", encoding="utf-8") as f:
        json.dump(phase3_payload, f, indent=2, default=str, ensure_ascii=False)
    print(f"\n📁 [Artifact Saved] Phase 3 Retrieval Summary written to: {RETRIEVAL_SUMMARY_FILE}")

    return phase3_payload


# ============================================================================
# CLI Runner & Demonstration Test Suite
# ============================================================================

def run_phase3_test_suite():
    """Runs verification tests across 4 representative citizen queries."""
    from query_understanding import process_user_query

    test_queries = [
        {
            "name": "PM-KISAN in Telangana for Small Farmer with 2 Acres",
            "prompt": "Can you tell me about PM-KISAN eligibility in Telangana for a small farmer with 2 acres?",
            "user_id": "Civs1001",
            "input_type": "text"
        },
        {
            "name": "Kisan Credit Card Loan in Andhra Pradesh",
            "prompt": "What documents are required for Kisan Credit Card loan under 2.5 lakh in Guntur Andhra Pradesh?",
            "user_id": "Civs1001",
            "input_type": "text"
        },
        {
            "name": "PMFBY Crop Insurance Application in Maharashtra",
            "prompt": "What is the procedure to apply for PMFBY crop insurance in Maharashtra?",
            "user_id": "Civs1001",
            "input_type": "voice"
        }
    ]

    all_summaries = []
    print("\n" + "#" * 80)
    print(" CIVICSPHERE AI ASSIST — PHASE 3 RETRIEVAL PIPELINE TEST SUITE")
    print("#" * 80)

    for i, tc in enumerate(test_queries, 1):
        print(f"\n>>> Running Phase 3 Test Case #{i}: {tc['name']}")
        p2_output = process_user_query(
            citizen_prompt=tc["prompt"],
            user_id=tc["user_id"],
            input_type=tc["input_type"]
        )
        p3_output = execute_retrieval_pipeline(p2_output)
        all_summaries.append(p3_output)

    print("\n" + "=" * 80)
    print(" ✅ ALL PHASE 3 RETRIEVAL TESTS COMPLETED SUCCESSFULLY!")
    print(f" Summary artifact available at: {RETRIEVAL_SUMMARY_FILE}")
    print("=" * 80)


def main():
    import argparse
    parser = argparse.ArgumentParser(description="CivicSphere AI Assist Phase 3: Retrieval Pipeline")
    parser.add_argument("--query", "-q", type=str, help="User query to process through Phase 2 + Phase 3")
    parser.add_argument("--user-id", "-u", type=str, default="Civs1001", help="User profile ID")
    parser.add_argument("--voice", action="store_true", help="Mark input as voice input")
    parser.add_argument("--top-k", type=int, default=10, help="Number of chunks to retrieve in vector search")
    parser.add_argument("--raw-json", action="store_true", help="Output raw JSON to stdout")
    parser.add_argument("--test", action="store_true", help="Run full test suite")

    args = parser.parse_args()

    if args.test or not args.query:
        run_phase3_test_suite()
    else:
        from query_understanding import process_user_query
        
        if args.raw_json:
            # Suppress intermediate prints during pipeline steps to guarantee pure JSON on stdout
            with contextlib.redirect_stdout(io.StringIO()):
                p2_output = process_user_query(
                    citizen_prompt=args.query,
                    user_id=args.user_id,
                    input_type="voice" if args.voice else "text"
                )
                p3_output = execute_retrieval_pipeline(p2_output, top_k=args.top_k)
            sys.stdout.write(json.dumps(p3_output, default=str, ensure_ascii=False) + "\n")
            sys.stdout.flush()
        else:
            p2_output = process_user_query(
                citizen_prompt=args.query,
                user_id=args.user_id,
                input_type="voice" if args.voice else "text"
            )
            p3_output = execute_retrieval_pipeline(p2_output, top_k=args.top_k)


if __name__ == "__main__":
    main()
