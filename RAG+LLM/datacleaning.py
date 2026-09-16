"""
CivicSphere AI Assist — Phase 1, Step 3: Data Cleaning Script
Location: RAG+LLM/datacleaning.py

Objective:
Clean the validated dataset retrieved from PostgreSQL `agriculture_schemes` table
(after Step 2: Data Validation) before intent & keyword/stopword removal and embedding generation.
Generates `dataset_after_cleaning.json` inside Schmes_information for user review
and approval before updating the database.
"""

import os
import sys
import re
import html
import json
import time
import urllib.parse
from pathlib import Path
from typing import Any, Dict, List, Set, Tuple

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
dotenv_path = current_dir / ".env"
if not dotenv_path.exists():
    dotenv_path = project_root / ".env"
load_dotenv(dotenv_path)

# Output directories & files inside Schmes_information
OUTPUT_DIR = project_root / "Schmes_information"
CLEANED_DATASET_FILE = OUTPUT_DIR / "dataset_after_cleaning.json"
CLEANING_SUMMARY_FILE = OUTPUT_DIR / "cleaning_summary.json"


def get_db_connection():
    """Establish and return a PostgreSQL connection."""
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return psycopg2.connect(database_url)
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", 5432)),
        dbname=os.getenv("DB_NAME", "civicsphere_db"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "")
    )


# ---------------------------------------------------------
# 1. Text & Unstructured Cleaning Utilities
# ---------------------------------------------------------

# Regular expressions for cleaning
RE_HTML_TAGS = re.compile(r"<\/?(?!https?:\/\/)[a-zA-Z0-9_\-]+(?:\s+[^>]*?)?\/?>", re.IGNORECASE)
RE_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
RE_CONSECUTIVE_SPACES = re.compile(r"[ \t]+")
RE_CONSECUTIVE_NEWLINES = re.compile(r"\n{3,}")
RE_MARKDOWN_ESCAPES = re.compile(r"\\([\\`*_{}\[\]()#+\-.!])")


def decode_html_entities(text: str) -> Tuple[str, bool]:
    """Repeatedly decode HTML entities until stable (e.g. &amp;amp; -> &)."""
    if not isinstance(text, str) or ("&" not in text and "<" not in text):
        return text, False
    
    current = text
    changed = False
    for _ in range(5):  # Max 5 passes to handle multi-encoded entities
        # Handle literal &lt;br&gt; or &lt;br/&gt; before html unescape
        decoded = html.unescape(current)
        if decoded == current:
            break
        changed = True
        current = decoded
    return current, changed


def remove_html_tags(text: str) -> Tuple[str, bool]:
    """
    Remove raw HTML tags (like <br>, <p>, </div>, <span>) while preserving
    bracketed markdown links e.g. [text](url) and semantic content.
    """
    if not isinstance(text, str) or ("<" not in text and ">" not in text):
        return text, False

    # Replace <br>, <br/>, <p>, </p> with appropriate newlines
    transformed = re.sub(r"<\s*br\s*\/?>", "\n", text, flags=re.IGNORECASE)
    transformed = re.sub(r"<\s*\/\s*p\s*>", "\n\n", transformed, flags=re.IGNORECASE)
    transformed = re.sub(r"<\s*p(?:\s+[^>]*)?>", "", transformed, flags=re.IGNORECASE)
    
    # Strip remaining HTML tags
    cleaned = RE_HTML_TAGS.sub(" ", transformed)
    return cleaned, (cleaned != text)


def remove_corrupted_characters(text: str) -> Tuple[str, bool]:
    """Remove ASCII control characters and corrupted sequences while preserving unicode."""
    if not isinstance(text, str):
        return text, False

    original = text
    # Strip control chars except newline (\n), carriage return (\r), tab (\t)
    cleaned = RE_CONTROL_CHARS.sub("", text)
    # Replace non-breaking spaces, BOM, zero-width space, and unicode replacement character
    cleaned = (
        cleaned.replace("\ufffd", "")
        .replace("\u00a0", " ")
        .replace("\ufeff", "")
        .replace("\u200b", "")
        .replace("\u201c", '"')
        .replace("\u201d", '"')
        .replace("\u2018", "'")
        .replace("\u2019", "'")
        .replace("\u2013", "-")
        .replace("\u2014", "-")
    )
    return cleaned, (cleaned != original)


def clean_whitespace(text: str) -> Tuple[str, bool]:
    """Normalize excessive whitespace, tabs, and line breaks while preserving paragraphs."""
    if not isinstance(text, str):
        return text, False

    original = text
    # Replace carriage returns with standard newlines
    lines = text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    # Clean trailing/leading spaces on each line and collapse tabs/spaces
    cleaned_lines = [RE_CONSECUTIVE_SPACES.sub(" ", line).strip() for line in lines]
    rejoined = "\n".join(cleaned_lines)
    # Collapse 3+ newlines into 2
    rejoined = RE_CONSECUTIVE_NEWLINES.sub("\n\n", rejoined)
    cleaned = rejoined.strip()
    return cleaned, (cleaned != original)


def remove_duplicate_sentences(text: str) -> Tuple[str, bool]:
    """
    Remove consecutive repetitive sentences and boilerplate phrases
    without shortening or summarizing semantic information.
    """
    if not isinstance(text, str) or len(text) < 20:
        return text, False

    paragraphs = text.split("\n")
    cleaned_paragraphs = []
    changed = False

    for para in paragraphs:
        if not para.strip():
            cleaned_paragraphs.append("")
            continue

        # Split sentences by period/exclamation/question mark followed by space
        sentences = re.split(r"(?<=[.!?])\s+", para)
        unique_sentences = []
        last_norm = None

        for s in sentences:
            s_stripped = s.strip()
            if not s_stripped:
                continue
            s_norm = re.sub(r"[^\w\s]", "", s_stripped.lower())
            s_norm = RE_CONSECUTIVE_SPACES.sub(" ", s_norm).strip()

            # Skip consecutive identical sentence
            if s_norm and s_norm == last_norm:
                changed = True
                continue

            unique_sentences.append(s_stripped)
            if s_norm:
                last_norm = s_norm

        cleaned_paragraphs.append(" ".join(unique_sentences))

    cleaned = "\n".join(cleaned_paragraphs)
    return cleaned, changed


def clean_unstructured_text(text: Any) -> Tuple[Any, Set[str]]:
    """
    Apply full unstructured cleaning pipeline on a text string.
    Returns (cleaned_text, set_of_operations_applied).
    """
    if not isinstance(text, str):
        return text, set()

    ops: Set[str] = set()

    # 1. Decode HTML entities
    t, changed = decode_html_entities(text)
    if changed:
        ops.add("HTML_ENTITIES_DECODED")

    # 2. Remove HTML tags
    t, changed = remove_html_tags(t)
    if changed:
        ops.add("HTML_TAGS_REMOVED")

    # 3. Again decode in case tags unmasked entities
    t, changed = decode_html_entities(t)
    if changed:
        ops.add("HTML_ENTITIES_DECODED")

    # 4. Remove corrupted / control characters
    t, changed = remove_corrupted_characters(t)
    if changed:
        ops.add("CONTROL_CHARS_REMOVED")

    # 5. Remove consecutive duplicate sentences
    t, changed = remove_duplicate_sentences(t)
    if changed:
        ops.add("DUPLICATE_SENTENCES_REMOVED")

    # 6. Normalize whitespace
    t, changed = clean_whitespace(t)
    if changed:
        ops.add("WHITESPACE_NORMALIZED")

    return t, ops


# ---------------------------------------------------------
# 2. Key-Value & Nested JSON Cleaning
# ---------------------------------------------------------

def clean_key_string(key: str) -> Tuple[str, Set[str]]:
    """Clean JSON object keys: strip, remove escape characters, unescape HTML."""
    if not isinstance(key, str):
        return str(key), set()

    ops = set()
    k_clean, changed_entities = decode_html_entities(key)
    if changed_entities:
        ops.add("HTML_ENTITIES_DECODED")

    k_clean, changed_tags = remove_html_tags(k_clean)
    if changed_tags:
        ops.add("HTML_TAGS_REMOVED")

    k_clean, changed_chars = remove_corrupted_characters(k_clean)
    if changed_chars:
        ops.add("CONTROL_CHARS_REMOVED")

    k_clean = RE_CONSECUTIVE_SPACES.sub(" ", k_clean).strip()
    if k_clean != key:
        ops.add("WHITESPACE_NORMALIZED")

    return k_clean, ops


def clean_nested_structure(data: Any, is_url_context: bool = False) -> Tuple[Any, Set[str], bool]:
    """
    Recursively clean nested dicts, lists, and values while preserving
    exact JSON structures and types (numbers, booleans, nulls).
    Returns (cleaned_data, set_of_operations, was_modified).
    """
    ops: Set[str] = set()
    modified = False

    if isinstance(data, dict):
        cleaned_dict = {}
        for k, v in data.items():
            # Check if this key or child represents a URL
            child_is_url = is_url_context or any(term in k.lower() for term in ["url", "link", "website", "portal"])
            
            clean_k, k_ops = clean_key_string(k)
            ops.update(k_ops)
            if clean_k != k:
                modified = True

            clean_v, v_ops, v_mod = clean_nested_structure(v, is_url_context=child_is_url)
            ops.update(v_ops)
            if v_mod:
                modified = True

            cleaned_dict[clean_k] = clean_v
        return cleaned_dict, ops, modified

    elif isinstance(data, list):
        cleaned_list = []
        for item in data:
            clean_item, item_ops, item_mod = clean_nested_structure(item, is_url_context=is_url_context)
            ops.update(item_ops)
            if item_mod:
                modified = True
            cleaned_list.append(clean_item)
        return cleaned_list, ops, modified

    elif isinstance(data, str):
        # If this string is a pure URL, do NOT modify it; only strip whitespace
        if is_url_context or data.startswith("http://") or data.startswith("https://"):
            stripped = data.strip()
            if stripped != data:
                ops.add("WHITESPACE_NORMALIZED")
                return stripped, ops, True
            return data, ops, False

        clean_val, val_ops = clean_unstructured_text(data)
        ops.update(val_ops)
        return clean_val, ops, (clean_val != data)

    # Primitives: int, float, bool, None
    return data, ops, False


def clean_notes_text(text: Any) -> Tuple[Any, Set[str]]:
    """
    Clean individual note text:
    - Removes asterisks (*)
    - Removes blockquote '>' and stray '>' symbols
    - Replaces newlines (\\n, \\r) with spaces
    - Standardizes whitespace
    """
    if not isinstance(text, str):
        return text, set()

    ops: Set[str] = set()
    cleaned = text

    # Remove asterisks (*)
    if "*" in cleaned:
        cleaned = cleaned.replace("*", "")
        ops.add("ASTERISKS_REMOVED")

    # Remove '>' characters
    if ">" in cleaned:
        cleaned = cleaned.replace(">", "")
        ops.add("SYMBOLS_REMOVED")

    # Replace newlines with single space
    if "\n" in cleaned or "\r" in cleaned:
        cleaned = cleaned.replace("\r\n", " ").replace("\r", " ").replace("\n", " ")
        ops.add("NEWLINES_REMOVED")

    # Apply general unstructured cleaning
    cleaned, text_ops = clean_unstructured_text(cleaned)
    ops.update(text_ops)

    # Collapse any leftover multiple spaces
    cleaned = RE_CONSECUTIVE_SPACES.sub(" ", cleaned).strip()

    return cleaned, ops


def clean_application_process(app_data: Any) -> Tuple[Any, Set[str], bool]:
    """
    Clean application_process column:
    Special cleaning for 'notes' or 'noted' keys:
    - Removes all asterisks (*)
    - Removes '>' and blockquote characters
    - Splits multiline notes by \\n into individual clean items
    - Decodes HTML entities and removes raw HTML tags
    - Normalizes whitespace and removes control characters
    Preserves exact URLs in 'url' keys.
    """
    if not app_data:
        return app_data, set(), False

    ops: Set[str] = set()
    modified = False

    def clean_item(item: Any, key_name: str = "") -> Any:
        nonlocal modified, ops
        if isinstance(item, dict):
            cleaned_dict = {}
            for k, v in item.items():
                clean_k, k_ops = clean_key_string(k)
                ops.update(k_ops)
                if clean_k != k:
                    modified = True

                is_note_key = "note" in clean_k.lower()
                is_url_key = any(term in clean_k.lower() for term in ["url", "link", "website", "portal"])

                if is_note_key:
                    if isinstance(v, list):
                        cleaned_list = []
                        for s in v:
                            if isinstance(s, str):
                                raw_lines = s.replace("\r\n", "\n").replace("\r", "\n").split("\n")
                                for line in raw_lines:
                                    c_str, s_ops = clean_notes_text(line)
                                    ops.update(s_ops)
                                    if c_str:
                                        cleaned_list.append(c_str)
                                if len(raw_lines) > 1 or cleaned_list != v:
                                    modified = True
                            else:
                                cleaned_list.append(clean_item(s, clean_k))
                        cleaned_dict[clean_k] = cleaned_list
                    elif isinstance(v, str):
                        raw_lines = v.replace("\r\n", "\n").replace("\r", "\n").split("\n")
                        cleaned_sub = [clean_notes_text(line)[0] for line in raw_lines if clean_notes_text(line)[0]]
                        if len(cleaned_sub) > 1:
                            cleaned_dict[clean_k] = cleaned_sub
                            modified = True
                        elif cleaned_sub:
                            cleaned_dict[clean_k] = cleaned_sub[0]
                            if cleaned_sub[0] != v:
                                modified = True
                        else:
                            cleaned_dict[clean_k] = ""
                    else:
                        cleaned_dict[clean_k] = clean_item(v, clean_k)
                elif is_url_key:
                    if isinstance(v, str):
                        s = v.strip()
                        if s != v:
                            ops.add("WHITESPACE_NORMALIZED")
                            modified = True
                        cleaned_dict[clean_k] = s
                    else:
                        cleaned_dict[clean_k] = clean_item(v, clean_k)
                else:
                    cleaned_dict[clean_k] = clean_item(v, clean_k)
            return cleaned_dict

        elif isinstance(item, list):
            is_note_context = "note" in key_name.lower()
            cleaned_list = []
            for sub in item:
                if is_note_context and isinstance(sub, str):
                    raw_lines = sub.replace("\r\n", "\n").replace("\r", "\n").split("\n")
                    for line in raw_lines:
                        c_str, s_ops = clean_notes_text(line)
                        ops.update(s_ops)
                        if c_str:
                            cleaned_list.append(c_str)
                    if len(raw_lines) > 1:
                        modified = True
                else:
                    cleaned_list.append(clean_item(sub, key_name))
            return cleaned_list

        elif isinstance(item, str):
            if "note" in key_name.lower():
                c_str, s_ops = clean_notes_text(item)
                ops.update(s_ops)
                if c_str != item:
                    modified = True
                return c_str
            cleaned_str, s_ops = clean_unstructured_text(item)
            ops.update(s_ops)
            if cleaned_str != item:
                modified = True
            return cleaned_str

        return item

    cleaned_result = clean_item(app_data)
    return cleaned_result, ops, modified


# ---------------------------------------------------------
# 3. Structured Data Cleaning Utilities
# ---------------------------------------------------------

def clean_structured_string(val: Any) -> Tuple[str, Set[str]]:
    """Clean structured fields (scheme_id, state, category, etc.)."""
    if val is None:
        return "", set()
    if not isinstance(val, str):
        val = str(val)

    ops = set()
    # Decode any html entities
    cleaned, c_ent = decode_html_entities(val)
    if c_ent:
        ops.add("HTML_ENTITIES_DECODED")

    # Remove corrupted control chars
    cleaned, c_chars = remove_corrupted_characters(cleaned)
    if c_chars:
        ops.add("CONTROL_CHARS_REMOVED")

    # Standardize whitespace
    orig = cleaned
    cleaned = RE_CONSECUTIVE_SPACES.sub(" ", cleaned).strip()
    if cleaned != orig or cleaned != val:
        ops.add("WHITESPACE_NORMALIZED")

    return cleaned, ops


def clean_string_array(arr: Any) -> Tuple[List[str], Set[str], bool]:
    """Clean array fields such as tags."""
    if not isinstance(arr, list):
        if isinstance(arr, str) and arr.strip():
            c, ops = clean_structured_string(arr)
            return [c] if c else [], ops, True
        return [], set(), False

    cleaned_items = []
    ops = set()
    modified = False

    for item in arr:
        if isinstance(item, str):
            c, c_ops = clean_structured_string(item)
            ops.update(c_ops)
            if c != item:
                modified = True
            if c:
                cleaned_items.append(c)
        else:
            cleaned_items.append(item)

    if len(cleaned_items) != len(arr):
        modified = True

    return cleaned_items, ops, modified


# ---------------------------------------------------------
# 4. URL and Link Preservation
# ---------------------------------------------------------

def preserve_and_validate_urls(urls_raw: Any) -> Tuple[List[str], str]:
    """
    Preserve official URLs and registration links without changing the links.
    Ensures URLs are stripped of stray whitespace and validates consistency.
    """
    if not isinstance(urls_raw, list):
        if isinstance(urls_raw, str) and urls_raw.strip():
            urls_raw = [urls_raw.strip()]
        else:
            urls_raw = []

    preserved_urls = []
    for u in urls_raw:
        if isinstance(u, str):
            clean_u = u.strip()
            if clean_u:
                preserved_urls.append(clean_u)

    return preserved_urls, "PRESERVED"


# ---------------------------------------------------------
# 5. Main Data Cleaning Pipeline
# ---------------------------------------------------------

def run_data_cleaning():
    """
    Executes Step 3: Data Cleaning pipeline on PostgreSQL `agriculture_schemes`.
    Outputs `dataset_after_cleaning.json` and `cleaning_summary.json`.
    Does NOT modify the database.
    """
    start_time = time.time()
    print("=" * 70)
    print("🧹 CivicSphere AI Assist — Phase 1, Step 3: Data Cleaning Pipeline")
    print("=" * 70)

    # 1. Fetch raw validated records from PostgreSQL
    print("📡 [1/5] Connecting to PostgreSQL database...")
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM agriculture_schemes ORDER BY scheme_id ASC;")
        db_records = cur.fetchall()
        cur.close()
        conn.close()
        print(f"📥 Successfully fetched {len(db_records)} records from 'agriculture_schemes'.")
    except Exception as e:
        print(f"⚠️ Direct database fetch encountered an issue: {e}", file=sys.stderr)
        val_file = OUTPUT_DIR / "dataset_after_validation.json"
        if val_file.exists():
            print(f"🔄 Falling back to validated cache: {val_file}")
            with open(val_file, "r", encoding="utf-8") as f:
                db_records = json.load(f)
        else:
            print("❌ Cannot retrieve input dataset. Aborting.", file=sys.stderr)
            return

    if not db_records:
        print("❌ No records available to clean.")
        return

    total_records = len(db_records)
    print(f"⚙️  [2/5] Cleaning {total_records} scheme records...")

    cleaned_records: List[Dict[str, Any]] = []
    record_summaries: List[Dict[str, Any]] = []

    cleaned_count = 0
    unchanged_count = 0

    # Aggregate operation counters
    operation_counts: Dict[str, int] = {
        "HTML_TAGS_REMOVED": 0,
        "HTML_ENTITIES_DECODED": 0,
        "WHITESPACE_NORMALIZED": 0,
        "CONTROL_CHARS_REMOVED": 0,
        "DUPLICATE_SENTENCES_REMOVED": 0,
        "ASTERISKS_REMOVED": 0,
        "SYMBOLS_REMOVED": 0,
        "NEWLINES_REMOVED": 0,
    }

    for idx, rec in enumerate(db_records, 1):
        scheme_id = str(rec.get("scheme_id") or f"SCHEME_{idx}").strip()
        scheme_name = str(rec.get("scheme_name") or "Untitled Scheme").strip()

        fields_cleaned: List[str] = []
        record_ops: Set[str] = set()

        # ---------------------------------------------------------
        # Pipeline 1: Structured Data Cleaning
        # ---------------------------------------------------------
        # Scheme ID
        clean_id, id_ops = clean_structured_string(scheme_id)
        record_ops.update(id_ops)
        if clean_id != scheme_id:
            fields_cleaned.append("scheme_id")

        # Category
        orig_category = rec.get("category") or ""
        clean_category, cat_ops = clean_structured_string(orig_category)
        record_ops.update(cat_ops)
        if clean_category != orig_category:
            fields_cleaned.append("category")

        # State
        orig_state = rec.get("state") or ""
        clean_state, state_ops = clean_structured_string(orig_state)
        record_ops.update(state_ops)
        if clean_state != orig_state:
            fields_cleaned.append("state")

        # Tags
        orig_tags = rec.get("tags") or []
        clean_tags, tags_ops, tags_mod = clean_string_array(orig_tags)
        record_ops.update(tags_ops)
        if tags_mod:
            fields_cleaned.append("tags")

        # ---------------------------------------------------------
        # Pipeline 2: Unstructured Data Cleaning
        # ---------------------------------------------------------
        # Scheme Name
        clean_name, name_ops = clean_unstructured_text(scheme_name)
        record_ops.update(name_ops)
        if clean_name != scheme_name:
            fields_cleaned.append("scheme_name")

        # Description
        orig_desc = rec.get("description") or ""
        clean_desc, desc_ops = clean_unstructured_text(orig_desc)
        record_ops.update(desc_ops)
        if clean_desc != orig_desc:
            fields_cleaned.append("description")

        # ---------------------------------------------------------
        # Pipeline 3: Key-Value Pair Cleaning
        # ---------------------------------------------------------
        # Eligibility
        orig_elig = rec.get("eligibility")
        clean_elig, elig_ops, elig_mod = clean_nested_structure(orig_elig)
        record_ops.update(elig_ops)
        if elig_mod:
            fields_cleaned.append("eligibility")

        # Benefits
        orig_ben = rec.get("benefits")
        clean_ben, ben_ops, ben_mod = clean_nested_structure(orig_ben)
        record_ops.update(ben_ops)
        if ben_mod:
            fields_cleaned.append("benefits")

        # Documents / Documents Required
        orig_docs = rec.get("documents") if rec.get("documents") is not None else rec.get("documents_required")
        clean_docs, docs_ops, docs_mod = clean_nested_structure(orig_docs)
        record_ops.update(docs_ops)
        if docs_mod:
            fields_cleaned.append("documents")

        # Application Process
        orig_app = rec.get("application_process")
        clean_app, app_ops, app_mod = clean_application_process(orig_app)
        record_ops.update(app_ops)
        if app_mod:
            fields_cleaned.append("application_process")

        # FAQs
        orig_faq = rec.get("faq") if rec.get("faq") is not None else rec.get("faqs")
        clean_faq, faq_ops, faq_mod = clean_nested_structure(orig_faq)
        record_ops.update(faq_ops)
        if faq_mod:
            fields_cleaned.append("faq")

        # ---------------------------------------------------------
        # Pipeline 4: URL and Registration Link Preservation
        # ---------------------------------------------------------
        clean_off_urls, off_url_status = preserve_and_validate_urls(rec.get("official_urls"))
        clean_reg_urls, reg_url_status = preserve_and_validate_urls(rec.get("registration_links"))

        # Check status
        is_cleaned = len(fields_cleaned) > 0
        status = "CLEANED" if is_cleaned else "UNCHANGED"

        if is_cleaned:
            cleaned_count += 1
        else:
            unchanged_count += 1

        for op in record_ops:
            if op in operation_counts:
                operation_counts[op] += 1

        # ---------------------------------------------------------
        # Pipeline 5: Record Cleaning Summary Construction
        # ---------------------------------------------------------
        record_summary = {
            "scheme_id": clean_id,
            "scheme_name": clean_name,
            "cleaning_status": status,
            "fields_cleaned": fields_cleaned,
            "cleaning_operations": sorted(list(record_ops)),
            "url_preservation_status": "PRESERVED",
        }
        record_summaries.append(record_summary)

        # Assemble full cleaned record preserving exact DB schema
        cleaned_record = {
            "scheme_id": clean_id,
            "scheme_name": clean_name,
            "category": clean_category,
            "state": clean_state,
            "description": clean_desc,
            "eligibility": clean_elig,
            "benefits": clean_ben,
            "documents": clean_docs,
            "application_process": clean_app,
            "official_urls": clean_off_urls,
            "registration_links": clean_reg_urls,
            "faq": clean_faq,
            "tags": clean_tags,
        }
        cleaned_records.append(cleaned_record)

    # ---------------------------------------------------------
    # Save Cleaned Dataset and Detailed Summary
    # ---------------------------------------------------------
    print("💾 [3/5] Writing cleaned dataset and cleaning summary files...")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    with open(CLEANED_DATASET_FILE, "w", encoding="utf-8") as f:
        json.dump(cleaned_records, f, indent=2, ensure_ascii=False)

    summary_metadata = {
        "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total_records_processed": total_records,
        "records_cleaned": cleaned_count,
        "records_unchanged": unchanged_count,
        "operation_counts": operation_counts,
        "url_preservation_status": "ALL_URLS_PRESERVED_WITHOUT_MODIFICATION",
        "output_file": str(CLEANED_DATASET_FILE),
        "records": record_summaries,
    }

    with open(CLEANING_SUMMARY_FILE, "w", encoding="utf-8") as f:
        json.dump(summary_metadata, f, indent=2, ensure_ascii=False)

    duration = f"{time.time() - start_time:.2f}"

    # Print Detailed Statistics
    print("\n" + "=" * 70)
    print("📊 DATA CLEANING PIPELINE SUMMARY")
    print("=" * 70)
    print(f"Total Records Processed      : {total_records}")
    print(f"✨ Records Cleaned & Enhanced : {cleaned_count} ({cleaned_count / total_records * 100:.1f}%)")
    print(f"✅ Records Already Pristine  : {unchanged_count} ({unchanged_count / total_records * 100:.1f}%)")
    print("-" * 70)
    print("🔧 Cleaning Operations Breakdown:")
    for op, cnt in sorted(operation_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"   • {op.ljust(28)}: {cnt} records")
    print("-" * 70)
    print("🔗 URL Preservation Status     : 100% PRESERVED (Official URLs & Reg Links)")
    print(f"⏱️  Pipeline Execution Time    : {duration}s")
    print("=" * 70)
    print(f"📁 Cleaned dataset saved to:\n   {CLEANED_DATASET_FILE}")
    print(f"📁 Cleaning summary saved to:\n   {CLEANING_SUMMARY_FILE}")
    print("=" * 70)
    print("\n⚠️  USER APPROVAL WORKFLOW:")
    print("The PostgreSQL database has NOT been modified.")
    print("Please review the cleaned dataset in 'Schmes_information/dataset_after_cleaning.json'.")
    print("To apply this cleaned dataset to the PostgreSQL database, run:")
    print("   python RAG+LLM/datacleaning.py --apply")
    print("=" * 70)


# ---------------------------------------------------------
# 6. Database Replacement Workflow (Post User Approval Only)
# ---------------------------------------------------------

def apply_cleaned_dataset_to_db():
    """
    Applies cleaned dataset from dataset_after_cleaning.json to PostgreSQL.
    ONLY executed after explicit user confirmation.
    """
    if not CLEANED_DATASET_FILE.exists():
        print(f"❌ Cleaned dataset not found at {CLEANED_DATASET_FILE}.")
        print("Please run cleaning first: python RAG+LLM/datacleaning.py")
        return

    with open(CLEANED_DATASET_FILE, "r", encoding="utf-8") as f:
        cleaned_data = json.load(f)

    if not isinstance(cleaned_data, list) or len(cleaned_data) == 0:
        print("❌ Cleaned dataset is empty. Aborting database replacement.")
        return

    print("\n" + "=" * 70)
    print("⚠️  DATABASE REPLACEMENT WORKFLOW (STEP 3)")
    print("=" * 70)
    print(f"This will replace all rows in 'agriculture_schemes' with {len(cleaned_data)} CLEANED records.")
    print("All previous records will be completely deleted and replaced.")
    print("-" * 70)

    # Check for --yes flag in command line
    auto_confirm = "--yes" in sys.argv or "-y" in sys.argv
    if not auto_confirm:
        confirm = input("Are you sure you want to proceed? Type 'YES' to confirm: ").strip()
    else:
        confirm = "YES"

    if confirm != "YES":
        print("🚫 Database update cancelled by user. No changes were made.")
        return

    print("🚀 Commencing database replacement...")
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        print("🧹 [1/3] Deleting all existing records from 'agriculture_schemes'...")
        cur.execute("TRUNCATE TABLE agriculture_schemes CASCADE;")

        print(f"💾 [2/3] Inserting {len(cleaned_data)} cleaned records...")
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
                tags
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            );
        """

        for item in cleaned_data:
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
                ),
            )

        conn.commit()
        print("✨ [3/3] Database replacement completed successfully!")
        print(f"🎯 Total records in agriculture_schemes: {len(cleaned_data)}")
        print("=" * 70)

    except Exception as e:
        conn.rollback()
        print(f"❌ Failed to update database: {e}", file=sys.stderr)
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    if "--apply" in sys.argv or "--update-db" in sys.argv:
        apply_cleaned_dataset_to_db()
    else:
        run_data_cleaning()
