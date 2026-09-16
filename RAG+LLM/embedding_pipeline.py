"""
CivicSphere AI Assist — Phase 1: Steps 7, 8 & 9 Embedding & Vector Storage Pipeline
Location: RAG+LLM/embedding_pipeline.py

Pipeline Steps:
  Step 6 Output (dataset_after_metadata.json)
              ↓
  Step 7 → Text Chunking (produces dataset_after_chunking.json)
              ↓
  Step 8 → Embedding Generation via BAAI/bge-small-en-v1.5 (produces dataset_after_embeddings.json)
              ↓
  Step 9 → Vector Storage into ChromaDB & pgvector
              ↓
  User Review Summary & Approval Workflow
              ↓
  (Optional --apply flag) → Populate Vector Database Collections
"""

import os
import sys
import re
import json
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

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

# File Paths
OUTPUT_DIR = project_root / "Schmes_information"
CHROMA_DIR = current_dir / "chroma_db"

STEP6_INPUT_FILE = OUTPUT_DIR / "dataset_after_metadata.json"
FALLBACK_STEP6_FILE = OUTPUT_DIR / "dataset_after_metadata_generation.json"

STEP7_CHUNK_FILE = OUTPUT_DIR / "dataset_after_chunking.json"
STEP8_EMBEDDING_FILE = OUTPUT_DIR / "dataset_after_embeddings.json"
PIPELINE_SUMMARY_FILE = OUTPUT_DIR / "embedding_pipeline_summary.json"

COLLECTION_NAME = "agriculture_schemes_embeddings"
EMBEDDING_MODEL_NAME = "BAAI/bge-small-en-v1.5"
EMBEDDING_DIMENSION = 384


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
        password=password,
    )


# =====================================================================
# STEP 7: TEXT CHUNKING (500–700 Characters, 100 Character Overlap)
# =====================================================================

def chunk_text_sliding_window(
    text: str,
    prefix_header: str,
    min_size: int = 500,
    max_size: int = 700,
    overlap: int = 100
) -> List[str]:
    """
    Splits text into semantic chunks of 500–700 characters with 100-character overlap,
    preserving sentence boundaries and word integrity.
    """
    clean_text = re.sub(r"\s+", " ", text).strip()
    if not clean_text:
        return []

    # If the text is small enough, return as single chunk with header
    full_str = f"{prefix_header}: {clean_text}" if prefix_header else clean_text
    if len(full_str) <= max_size:
        return [full_str]

    # Split into sentences
    sentences = re.split(r"(?<=[.!?])\s+", clean_text)
    chunks = []
    current_chunk = []
    current_length = len(prefix_header) + 2 if prefix_header else 0

    for sent in sentences:
        sent = sent.strip()
        if not sent:
            continue

        sent_len = len(sent) + 1

        if current_length + sent_len <= max_size:
            current_chunk.append(sent)
            current_length += sent_len
        else:
            if current_chunk:
                chunk_body = " ".join(current_chunk)
                final_chunk = f"{prefix_header}: {chunk_body}" if prefix_header else chunk_body
                chunks.append(final_chunk)

                # Overlap logic: retain trailing sentences from previous chunk (~100 chars)
                overlap_chunk = []
                overlap_len = 0
                for prev_sent in reversed(current_chunk):
                    if overlap_len + len(prev_sent) <= overlap:
                        overlap_chunk.insert(0, prev_sent)
                        overlap_len += len(prev_sent) + 1
                    else:
                        break

                current_chunk = overlap_chunk + [sent]
                current_length = (len(prefix_header) + 2 if prefix_header else 0) + sum(len(s) + 1 for s in current_chunk)
            else:
                # Single long sentence exceeds max_size; split gracefully on words
                words = sent.split(" ")
                sub_chunk = []
                sub_len = len(prefix_header) + 2 if prefix_header else 0
                for w in words:
                    if sub_len + len(w) + 1 <= max_size:
                        sub_chunk.append(w)
                        sub_len += len(w) + 1
                    else:
                        if sub_chunk:
                            body = " ".join(sub_chunk)
                            chunks.append(f"{prefix_header}: {body}" if prefix_header else body)
                        sub_chunk = [w]
                        sub_len = (len(prefix_header) + 2 if prefix_header else 0) + len(w) + 1
                if sub_chunk:
                    current_chunk = [" ".join(sub_chunk)]
                    current_length = sub_len

    if current_chunk:
        body = " ".join(current_chunk)
        final_chunk = f"{prefix_header}: {body}" if prefix_header else body
        if len(final_chunk) >= min_size or not chunks:
            chunks.append(final_chunk)
        elif chunks:
            # If trailing chunk is shorter than min_size, append to previous chunk if feasible
            if len(chunks[-1]) + len(body) + 1 <= max_size + 150:
                chunks[-1] = chunks[-1] + " " + body
            else:
                chunks.append(final_chunk)

    return chunks


def extract_topic_text(raw_field: Any) -> str:
    """Extracts human-readable text from JSON structures, strings, or lists for chunking."""
    if not raw_field:
        return ""
    if isinstance(raw_field, str):
        return raw_field.strip()
    if isinstance(raw_field, list):
        items = []
        for item in raw_field:
            if isinstance(item, str):
                items.append(item.strip())
            elif isinstance(item, dict):
                # e.g., steps or document names
                if item.get("steps"):
                    steps = item["steps"]
                    items.append(" ".join(steps) if isinstance(steps, list) else str(steps))
                elif item.get("name"):
                    items.append(str(item["name"]))
                else:
                    items.append(json.dumps(item, ensure_ascii=False))
        return "; ".join(filter(None, items))
    if isinstance(raw_field, dict):
        parts = []
        for k, v in raw_field.items():
            if isinstance(v, (str, int, float, bool)):
                parts.append(f"{k.replace('_', ' ').title()}: {v}")
            elif isinstance(v, list):
                parts.append(f"{k.replace('_', ' ').title()}: {', '.join(map(str, v))}")
            elif isinstance(v, dict):
                parts.append(f"{k.replace('_', ' ').title()}: {extract_topic_text(v)}")
        return ". ".join(parts)
    return str(raw_field)


def step7_text_chunking(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Executes Step 7: Topic-Preserving Semantic Text Chunking.
    Produces multiple 500–700 character chunks with 100-character overlap for every scheme.
    """
    print(f"\n🔄 [Step 7/9] Executing Text Chunking on {len(records)} records...")
    all_chunks = []

    for rec in records:
        scheme_id = rec.get("scheme_id", "UNKNOWN")
        scheme_name = rec.get("scheme_name", "Agriculture Scheme")
        state = rec.get("state", "All India")
        ministry = rec.get("ministry", "Ministry of Agriculture & Farmers Welfare")
        sector = rec.get("sector", "Agriculture")
        category = rec.get("category", "General")

        # Metadata bundle for every chunk
        base_meta = {
            "scheme_id": scheme_id,
            "scheme_name": scheme_name,
            "state": state,
            "sector": sector,
            "sub_sector": rec.get("sub_sector", sector),
            "ministry": ministry,
            "category": category,
            "scheme_level": rec.get("scheme_level", "Central Sector Scheme"),
            "target_demographic": rec.get("target_demographic") or ["All Farmers"],
            "application_mode": rec.get("application_mode", "Online"),
            "eligibility_tags": rec.get("eligibility_tags") or [],
            "benefit_tags": rec.get("benefit_tags") or [],
            "crop_tags": rec.get("crop_tags") or [],
            "farmer_tags": rec.get("farmer_tags") or [],
            "government_tags": rec.get("government_tags") or [],
            "keyword_tags": rec.get("keyword_tags") or [],
            "official_urls": rec.get("official_urls") or [],
            "registration_links": rec.get("registration_links") or [],
        }

        scheme_chunks: List[Tuple[str, str]] = []  # (chunk_type, text)

        # 1. Description Chunk
        desc_text = extract_topic_text(rec.get("description"))
        if desc_text:
            chunks = chunk_text_sliding_window(desc_text, f"{scheme_name} (Description)")
            for ch in chunks:
                scheme_chunks.append(("description", ch))

        # 2. Eligibility Chunk
        elig_text = extract_topic_text(rec.get("eligibility"))
        if elig_text:
            chunks = chunk_text_sliding_window(elig_text, f"{scheme_name} (Eligibility Criteria)")
            for ch in chunks:
                scheme_chunks.append(("eligibility", ch))

        # 3. Benefits Chunk
        bene_text = extract_topic_text(rec.get("benefits"))
        if bene_text:
            chunks = chunk_text_sliding_window(bene_text, f"{scheme_name} (Benefits & Subsidies)")
            for ch in chunks:
                scheme_chunks.append(("benefits", ch))

        # 4. Documents Required Chunk
        doc_text = extract_topic_text(rec.get("documents"))
        if doc_text:
            chunks = chunk_text_sliding_window(doc_text, f"{scheme_name} (Required Documents)")
            for ch in chunks:
                scheme_chunks.append(("documents", ch))

        # 5. Application Process Chunk
        proc_text = extract_topic_text(rec.get("application_process"))
        if proc_text:
            chunks = chunk_text_sliding_window(proc_text, f"{scheme_name} (Application Process)")
            for ch in chunks:
                scheme_chunks.append(("application_process", ch))

        # 6. FAQ Chunk (if available)
        faq_text = extract_topic_text(rec.get("faq"))
        if faq_text:
            chunks = chunk_text_sliding_window(faq_text, f"{scheme_name} (FAQs)")
            for ch in chunks:
                scheme_chunks.append(("faq", ch))

        # Fallback: if fields produced no chunks, use normalized summary
        if not scheme_chunks:
            fallback_text = rec.get("normalized_summary") or f"{scheme_name}. Applicable in {state}. Category: {category}."
            chunks = chunk_text_sliding_window(fallback_text, scheme_name)
            for ch in chunks:
                scheme_chunks.append(("summary", ch))

        # Build chunk records with unique chunk_id and indexed numbering
        for idx, (chunk_type, chunk_text) in enumerate(scheme_chunks):
            chunk_id = f"{scheme_id}_chk_{idx}"
            chunk_obj = {
                "chunk_id": chunk_id,
                "scheme_id": scheme_id,
                "chunk_index": idx,
                "chunk_type": chunk_type,
                "chunk_length_chars": len(chunk_text),
                "chunk_text": chunk_text,
                "metadata": {
                    **base_meta,
                    "chunk_id": chunk_id,
                    "chunk_type": chunk_type,
                    "chunk_index": idx,
                },
            }
            all_chunks.append(chunk_obj)

    print(f"✅ [Step 7] Text Chunking complete. {len(all_chunks)} semantic chunks generated across {len(records)} schemes.")
    return all_chunks


# =====================================================================
# STEP 8: EMBEDDING GENERATION (BAAI/bge-small-en-v1.5)
# =====================================================================

def step8_embedding_generation(chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Executes Step 8: Embedding Generation using BAAI/bge-small-en-v1.5.
    Generates normalized 384-dimensional dense vectors for all chunk texts.
    """
    print(f"\n🔄 [Step 8/9] Initializing embedding model '{EMBEDDING_MODEL_NAME}'...")

    try:
        from sentence_transformers import SentenceTransformer
    except ImportError:
        print("❌ 'sentence-transformers' not installed. Please install via: pip install sentence-transformers", file=sys.stderr)
        sys.exit(1)

    # Load model
    model = SentenceTransformer(EMBEDDING_MODEL_NAME)
    print(f"✅ Model loaded successfully. Dimension: {EMBEDDING_DIMENSION}")

    texts_to_embed = [ch["chunk_text"] for ch in chunks]
    total_chunks = len(texts_to_embed)
    print(f"🚀 Generating dense embeddings for {total_chunks} chunks (batch_size=64)...")

    start_emb = time.time()
    # Generate normalized embeddings for cosine similarity
    embeddings = model.encode(
        texts_to_embed,
        batch_size=64,
        show_progress_bar=True,
        normalize_embeddings=True,
    )
    emb_duration = round(time.time() - start_emb, 2)
    print(f"✅ Embeddings generated in {emb_duration}s ({round(total_chunks / emb_duration, 1)} chunks/sec)")

    embedded_records = []
    for idx, (chunk_obj, vector) in enumerate(zip(chunks, embeddings)):
        vector_list = vector.tolist() if hasattr(vector, "tolist") else list(vector)
        emb_id = f"{chunk_obj['chunk_id']}_emb"

        emb_record = {
            "embedding_id": emb_id,
            "chunk_id": chunk_obj["chunk_id"],
            "scheme_id": chunk_obj["scheme_id"],
            "chunk_index": chunk_obj["chunk_index"],
            "chunk_type": chunk_obj["chunk_type"],
            "chunk_text": chunk_obj["chunk_text"],
            "embedding_model": EMBEDDING_MODEL_NAME,
            "embedding_dimension": len(vector_list),
            "embedding_vector": vector_list,
            "metadata": chunk_obj["metadata"],
        }
        embedded_records.append(emb_record)

    print(f"✅ [Step 8] Embedding Generation complete. {len(embedded_records)} embedding vectors ready.")
    return embedded_records


# =====================================================================
# STEP 9: VECTOR STORAGE (ChromaDB & pgvector)
# =====================================================================

def store_vectors_in_chromadb(embedded_records: List[Dict[str, Any]]) -> bool:
    """Stores all embeddings with metadata into local persistent ChromaDB collection."""
    print(f"\n📂 [ChromaDB] Initializing ChromaDB persistent storage at {CHROMA_DIR}...")
    try:
        import chromadb
        from chromadb.config import Settings
    except ImportError:
        print("❌ 'chromadb' package not found. Skipping ChromaDB storage.", file=sys.stderr)
        return False

    CHROMA_DIR.mkdir(parents=True, exist_ok=True)
    client = chromadb.PersistentClient(path=str(CHROMA_DIR))

    # Reset/Delete existing collection if exists
    try:
        client.delete_collection(COLLECTION_NAME)
        print(f"   🧹 Removed existing ChromaDB collection '{COLLECTION_NAME}'")
    except Exception:
        pass

    # Create fresh collection with cosine similarity
    collection = client.create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine", "model": EMBEDDING_MODEL_NAME}
    )

    batch_size = 200
    total_stored = 0

    print(f"🚀 [ChromaDB] Inserting {len(embedded_records)} vectors into collection '{COLLECTION_NAME}'...")

    for i in range(0, len(embedded_records), batch_size):
        batch = embedded_records[i:i + batch_size]
        ids = [rec["embedding_id"] for rec in batch]
        embeddings = [rec["embedding_vector"] for rec in batch]
        documents = [rec["chunk_text"] for rec in batch]

        # Format metadata (convert lists to strings for ChromaDB compatibility)
        metadatas = []
        for rec in batch:
            raw_meta = rec["metadata"]
            clean_meta = {}
            for k, v in raw_meta.items():
                if isinstance(v, list):
                    clean_meta[k] = ", ".join(map(str, v))
                elif isinstance(v, (str, int, float, bool)):
                    clean_meta[k] = v
                else:
                    clean_meta[k] = str(v)
            metadatas.append(clean_meta)

        collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas
        )
        total_stored += len(batch)
        print(f"   ↳ [ChromaDB] Stored batch {i // batch_size + 1} ({total_stored}/{len(embedded_records)} embeddings)")

    print(f"✨ [ChromaDB] Successfully stored {total_stored} vectors in ChromaDB collection '{COLLECTION_NAME}'!\n")
    return True


def store_vectors_in_pgvector(embedded_records: List[Dict[str, Any]]) -> bool:
    """Stores all embeddings with metadata into PostgreSQL pgvector table."""
    print("🐘 [pgvector] Connecting to PostgreSQL to setup pgvector knowledge base...")
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Check / enable pgvector extension
        try:
            cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
            conn.commit()
            print("   ✅ pgvector extension verified.")
        except Exception as ext_err:
            conn.rollback()
            print(f"   ⚠️ pgvector extension warning (may require superuser or pre-installed vector extension): {ext_err}")

        # Create embeddings table
        create_table_sql = f"""
            CREATE TABLE IF NOT EXISTS {COLLECTION_NAME} (
                embedding_id VARCHAR(120) PRIMARY KEY,
                chunk_id VARCHAR(100) NOT NULL,
                scheme_id VARCHAR(50) NOT NULL,
                chunk_type VARCHAR(50),
                chunk_index INT,
                chunk_text TEXT NOT NULL,
                embedding_model VARCHAR(100),
                embedding_dimension INT,
                metadata JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """
        cur.execute(create_table_sql)
        conn.commit()

        # Add vector column if pgvector is active
        try:
            cur.execute(f"ALTER TABLE {COLLECTION_NAME} ADD COLUMN IF NOT EXISTS embedding vector({EMBEDDING_DIMENSION});")
            conn.commit()
            has_vector_col = True
        except Exception:
            conn.rollback()
            has_vector_col = False
            print("   ℹ️ Storing embeddings in JSONB array format inside PostgreSQL.")

        # Truncate existing vectors
        cur.execute(f"TRUNCATE TABLE {COLLECTION_NAME};")
        conn.commit()

        print(f"🚀 [pgvector] Inserting {len(embedded_records)} vectors into PostgreSQL table '{COLLECTION_NAME}'...")

        if has_vector_col:
            insert_query = f"""
                INSERT INTO {COLLECTION_NAME} (
                    embedding_id, chunk_id, scheme_id, chunk_type, chunk_index,
                    chunk_text, embedding_model, embedding_dimension, metadata, embedding
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s::vector);
            """
            for rec in embedded_records:
                vec_str = "[" + ",".join(map(str, rec["embedding_vector"])) + "]"
                cur.execute(insert_query, (
                    rec["embedding_id"],
                    rec["chunk_id"],
                    rec["scheme_id"],
                    rec["chunk_type"],
                    rec["chunk_index"],
                    rec["chunk_text"],
                    rec["embedding_model"],
                    rec["embedding_dimension"],
                    Json(rec["metadata"]),
                    vec_str
                ))
        else:
            insert_query = f"""
                INSERT INTO {COLLECTION_NAME} (
                    embedding_id, chunk_id, scheme_id, chunk_type, chunk_index,
                    chunk_text, embedding_model, embedding_dimension, metadata
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
            """
            for rec in embedded_records:
                cur.execute(insert_query, (
                    rec["embedding_id"],
                    rec["chunk_id"],
                    rec["scheme_id"],
                    rec["chunk_type"],
                    rec["chunk_index"],
                    rec["chunk_text"],
                    rec["embedding_model"],
                    rec["embedding_dimension"],
                    Json({**rec["metadata"], "embedding_vector": rec["embedding_vector"]}),
                ))

        conn.commit()
        print(f"✨ [pgvector] Successfully stored {len(embedded_records)} records in table '{COLLECTION_NAME}'!\n")
        cur.close()
        conn.close()
        return True

    except Exception as e:
        print(f"❌ [pgvector] Failed to insert into PostgreSQL: {e}", file=sys.stderr)
        return False


def store_vectors_in_supabase(embedded_records: List[Dict[str, Any]]) -> bool:
    """Stores all embeddings with metadata into Supabase via REST API."""
    import urllib.request
    import urllib.error

    supabase_url = (
        os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL") or ""
    ).strip().rstrip("/")
    supabase_key = (
        os.getenv("SUPABASE_SERVICE_ROLE_KEY") or
        os.getenv("VITE_SUPABASE_ANON_KEY") or
        os.getenv("SUPABASE_ANON_KEY") or ""
    ).strip()

    if not supabase_url or not supabase_key:
        print("⚠️ Supabase credentials not found in .env. Skipping Supabase sync.")
        return False

    print(f"\n⚡ [Supabase] Syncing {len(embedded_records)} vector records to Supabase table '{COLLECTION_NAME}'...")
    rest_url = f"{supabase_url}/rest/v1/{COLLECTION_NAME}"

    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
    }

    batch_size = 100
    total_synced = 0

    for i in range(0, len(embedded_records), batch_size):
        batch = embedded_records[i:i + batch_size]
        payload = []

        for rec in batch:
            payload.append({
                "embedding_id": rec["embedding_id"],
                "chunk_id": rec["chunk_id"],
                "scheme_id": rec["scheme_id"],
                "chunk_type": rec["chunk_type"],
                "chunk_index": rec["chunk_index"],
                "chunk_text": rec["chunk_text"],
                "embedding_model": rec["embedding_model"],
                "embedding_dimension": rec["embedding_dimension"],
                "metadata": rec["metadata"],
                "embedding": rec["embedding_vector"],
            })

        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(rest_url, data=data_bytes, headers=headers, method="POST")

        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                if resp.status in (200, 201):
                    total_synced += len(batch)
                    if (i // batch_size + 1) % 10 == 0 or total_synced == len(embedded_records):
                        print(f"   ↳ [Supabase] Synced {total_synced}/{len(embedded_records)} embeddings...")
        except urllib.error.HTTPError as http_err:
            err_msg = http_err.read().decode("utf-8", errors="replace")
            print(f"   ⚠️ [Supabase] Batch {i // batch_size + 1} HTTP Error ({http_err.code}): {err_msg[:250]}")
            # If relation does not exist on Supabase, inform user
            if "relation" in err_msg and "does not exist" in err_msg:
                print(f"   ℹ️ Notice: The table '{COLLECTION_NAME}' must first be created in Supabase SQL editor.")
                print(f"   You can run the SQL script in civicsphere_db.sql in your Supabase SQL editor.")
                return False
        except Exception as sync_err:
            print(f"   ⚠️ [Supabase] Batch {i // batch_size + 1} Error: {sync_err}")

    print(f"✨ [Supabase] Vector sync finished: {total_synced}/{len(embedded_records)} records processed.\n")
    return total_synced > 0


# =====================================================================
# PIPELINE ORCHESTRATION & SUMMARY
# =====================================================================

def run_embedding_pipeline():
    """Runs Step 7, Step 8, and generates JSON files with complete review summary."""
    start_time = time.time()

    input_file = STEP6_INPUT_FILE if STEP6_INPUT_FILE.exists() else FALLBACK_STEP6_FILE
    if not input_file.exists():
        print(f"❌ Input metadata dataset not found. Checked:\n   1. {STEP6_INPUT_FILE}\n   2. {FALLBACK_STEP6_FILE}", file=sys.stderr)
        print("Please run semantic_preprocessing.py first.", file=sys.stderr)
        sys.exit(1)

    print("=" * 75)
    print("🚀 CIVICSPHERE AI ASSIST — EMBEDDING PIPELINE (STEPS 7, 8 & 9)")
    print("=" * 75)
    print(f"📥 Loading Step 6 metadata dataset from:\n   {input_file}")

    with open(input_file, "r", encoding="utf-8") as f:
        metadata_records = json.load(f)

    total_schemes = len(metadata_records)
    print(f"🎯 Total schemes loaded: {total_schemes}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Step 7: Text Chunking
    chunks = step7_text_chunking(metadata_records)
    with open(STEP7_CHUNK_FILE, "w", encoding="utf-8") as f:
        json.dump(chunks, f, indent=2, ensure_ascii=False)
    print(f"💾 Step 7 output saved to:\n   {STEP7_CHUNK_FILE}")

    # Step 8: Embedding Generation
    embeddings = step8_embedding_generation(chunks)
    with open(STEP8_EMBEDDING_FILE, "w", encoding="utf-8") as f:
        json.dump(embeddings, f, indent=2, ensure_ascii=False)
    print(f"💾 Step 8 output saved to:\n   {STEP8_EMBEDDING_FILE}")

    duration = round(time.time() - start_time, 2)

    # Metrics Breakdown
    chunk_types: Dict[str, int] = {}
    for ch in chunks:
        t = ch.get("chunk_type", "other")
        chunk_types[t] = chunk_types.get(t, 0) + 1

    summary = {
        "pipeline": "Phase 1: Steps 7, 8 & 9 (Text Chunking + Embedding Generation + Vector Storage)",
        "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total_schemes_processed": total_schemes,
        "total_semantic_chunks_generated": len(chunks),
        "total_embedding_vectors_generated": len(embeddings),
        "embedding_model": EMBEDDING_MODEL_NAME,
        "embedding_dimension": EMBEDDING_DIMENSION,
        "avg_chunks_per_scheme": round(len(chunks) / total_schemes, 1) if total_schemes else 0,
        "chunk_type_breakdown": chunk_types,
        "execution_time_seconds": duration,
        "sample_chunk": {
            "chunk_id": chunks[0]["chunk_id"],
            "scheme_id": chunks[0]["scheme_id"],
            "chunk_type": chunks[0]["chunk_type"],
            "chunk_length_chars": chunks[0]["chunk_length_chars"],
            "chunk_text_preview": chunks[0]["chunk_text"][:200] + "...",
            "embedding_id": embeddings[0]["embedding_id"],
            "embedding_dimension": embeddings[0]["embedding_dimension"],
            "sample_vector_head": embeddings[0]["embedding_vector"][:5],
        } if chunks and embeddings else {}
    }

    with open(PIPELINE_SUMMARY_FILE, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    print("\n" + "=" * 75)
    print("📊 EMBEDDING PIPELINE SUMMARY (STEPS 7 & 8 COMPLETE)")
    print("=" * 75)
    print(f"Total Schemes Processed         : {total_schemes}")
    print(f"Total Semantic Chunks Generated : {len(chunks)}")
    print(f"Total Dense Vectors Generated   : {len(embeddings)}")
    print(f"Embedding Model                 : {EMBEDDING_MODEL_NAME}")
    print(f"Vector Dimensions               : {EMBEDDING_DIMENSION}")
    print(f"Avg Chunks per Scheme           : {summary['avg_chunks_per_scheme']}")
    print("-" * 75)
    print("📌 Chunk Types Breakdown:")
    for ctype, ccount in chunk_types.items():
        print(f"   ↳ {ctype.title():<22}: {ccount} chunks")
    print("-" * 75)
    print(f"⏱️ Total Time Taken             : {duration}s")
    print(f"📁 Step 7 JSON : {STEP7_CHUNK_FILE}")
    print(f"📁 Step 8 JSON : {STEP8_EMBEDDING_FILE}")
    print(f"📁 Summary JSON: {PIPELINE_SUMMARY_FILE}")
    print("=" * 75)
    print("\n⚠️ USER APPROVAL REQUIRED (STEP 9 - VECTOR STORAGE):")
    print("Vector databases (ChromaDB, pgvector & Supabase) have NOT been modified yet.")
    print("Please review the generated chunks and embedding summary above.")
    print("To store all vectors into ChromaDB, pgvector & Supabase, run:")
    print("   python embedding_pipeline.py --apply")
    print("=" * 75)

    return chunks, embeddings, summary


def apply_vectors_to_databases():
    """Applies generated embeddings to ChromaDB, PostgreSQL pgvector and Supabase after explicit confirmation."""
    if not STEP8_EMBEDDING_FILE.exists():
        print(f"❌ Embeddings dataset not found at {STEP8_EMBEDDING_FILE}.")
        print("Please run embedding pipeline first: python embedding_pipeline.py")
        return

    with open(STEP8_EMBEDDING_FILE, "r", encoding="utf-8") as f:
        embedded_records = json.load(f)

    if not isinstance(embedded_records, list) or len(embedded_records) == 0:
        print("❌ Embeddings dataset is empty. Aborting vector storage.")
        return

    print("⚠️  VECTOR STORAGE WORKFLOW (STEP 9)")
    print(f"This will store {len(embedded_records)} embedding vectors into ChromaDB, pgvector and Supabase.")

    if "--yes" not in sys.argv and "-y" not in sys.argv:
        confirm = input("Are you sure you want to proceed? Type 'YES' to confirm: ").strip()
        if confirm != "YES":
            print("🚫 Vector storage cancelled by user. No changes were made.")
            return
    else:
        print("✅ Auto-confirmed via --yes flag. Proceeding with vector storage...")

    # 1. ChromaDB Storage
    store_vectors_in_chromadb(embedded_records)

    # 2. pgvector / PostgreSQL Storage
    store_vectors_in_pgvector(embedded_records)

    # 3. Supabase Storage
    store_vectors_in_supabase(embedded_records)

    print("🎉 [Step 9] Vector knowledge base update completed across all vector stores successfully!")


if __name__ == "__main__":
    if "--apply" in sys.argv or "--store-vectors" in sys.argv or "--update-db" in sys.argv:
        apply_vectors_to_databases()
    else:
        run_embedding_pipeline()

