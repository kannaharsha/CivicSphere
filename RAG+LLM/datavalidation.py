"""
CivicSphere AI Assist — Phase 1, Step 2: Data Validation Script
Location: RAG+LLM/datavalidation.py

Objective:
Validate raw scheme dataset from PostgreSQL (agriculture_schemes table)
before generating embeddings. Produces dataset_after_validation.json
for user review and approval before updating the database.
"""

import os
import sys
import re
import json
import time
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Set, Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed

import psycopg2
from psycopg2.extras import RealDictCursor, Json
from dotenv import load_dotenv

# Ensure console handles UTF-8 on Windows
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
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

# Output directory & files - saving directly into Schmes_information folder
OUTPUT_DIR = project_root / "Schmes_information"
OUTPUT_FILE = OUTPUT_DIR / "dataset_after_validation.json"
SUMMARY_FILE = OUTPUT_DIR / "validation_summary.json"


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
# 1. Unstructured Data Cleaning Functions
# ---------------------------------------------------------

def clean_html(text: str) -> str:
    """Strip HTML tags while preserving content."""
    if not isinstance(text, str):
        return text
    clean = re.sub(r"<[^>]+>", " ", text)
    return clean


def remove_corrupted_characters(text: str) -> str:
    """Remove control characters and corrupted sequences while preserving unicode."""
    if not isinstance(text, str):
        return text
    # Remove ASCII control characters except \n, \r, \t
    cleaned = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
    # Replace non-breaking spaces with standard space
    cleaned = cleaned.replace("\u00a0", " ").replace("\ufeff", "")
    return cleaned


def remove_duplicate_sentences(text: str) -> str:
    """Remove consecutive duplicate sentences without shortening semantic meaning."""
    if not isinstance(text, str):
        return text
    # Split text into paragraphs
    paragraphs = text.split("\n")
    cleaned_paragraphs = []
    for para in paragraphs:
        sentences = re.split(r"(?<=[.!?]) +", para)
        unique_sentences = []
        last_sentence_norm = None
        for s in sentences:
            s_norm = s.strip().lower()
            if s_norm and s_norm == last_sentence_norm:
                continue
            unique_sentences.append(s)
            if s_norm:
                last_sentence_norm = s_norm
        cleaned_paragraphs.append(" ".join(unique_sentences))
    return "\n".join(cleaned_paragraphs)


def clean_whitespace(text: str) -> str:
    """Normalize excessive whitespace while preserving paragraph structure."""
    if not isinstance(text, str):
        return text
    # Replace multiple horizontal spaces with a single space
    text = re.sub(r"[ \t]+", " ", text)
    # Limit consecutive newlines to 2
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def clean_text_field(text: Any) -> Any:
    """Apply full cleaning pipeline to unstructured text."""
    if not isinstance(text, str):
        return text
    t = clean_html(text)
    t = remove_corrupted_characters(t)
    t = clean_whitespace(t)
    t = remove_duplicate_sentences(t)
    return clean_whitespace(t)


def clean_nested_json(data: Any) -> Any:
    """Recursively clean all strings inside dicts or lists."""
    if isinstance(data, dict):
        return {k: clean_nested_json(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [clean_nested_json(item) for item in data]
    elif isinstance(data, str):
        return clean_text_field(data)
    return data


# ---------------------------------------------------------
# 2. URL Format and Vitality Validation
# ---------------------------------------------------------

URL_REGEX = re.compile(
    r"^https?://"  # http:// or https://
    r"(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|"  # domain...
    r"localhost|"  # localhost...
    r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})"  # ...or ip
    r"(?::\d+)?"  # optional port
    r"(?:/?|[/?]\S+)$",
    re.IGNORECASE,
)


def extract_url_strings(val: Any) -> List[str]:
    """Extract and clean URL strings from list, string, or json object."""
    urls: List[str] = []
    if isinstance(val, list):
        for item in val:
            urls.extend(extract_url_strings(item))
    elif isinstance(val, dict):
        for k, v in val.items():
            if "url" in k.lower() or "link" in k.lower():
                urls.extend(extract_url_strings(v))
            elif isinstance(v, (str, list, dict)):
                urls.extend(extract_url_strings(v))
    elif isinstance(val, str):
        clean_s = val.strip()
        if clean_s:
            # Handle Chrome extension viewer wrapper: chrome-extension://.../https://actual-url.pdf
            if "chrome-extension://" in clean_s and "http" in clean_s:
                match = re.search(r"https?://[^\s]+", clean_s)
                if match:
                    clean_s = match.group(0)

            # Check if string contains comma or semicolon separated urls
            if ("," in clean_s or ";" in clean_s) and "://" in clean_s:
                for part in re.split(r"[,;]\s*", clean_s):
                    part_str = part.strip()
                    if part_str:
                        urls.append(part_str)
            else:
                urls.append(clean_s)

    # Deduplicate and clean trailing characters (such as stray brackets or periods)
    cleaned_urls = []
    seen = set()
    for u in urls:
        u_clean = u.strip().rstrip(".)],;'\"")
        if u_clean and u_clean not in seen:
            seen.add(u_clean)
            cleaned_urls.append(u_clean)
    return cleaned_urls


def is_valid_url_format(url: str) -> bool:
    """Check if the string is a syntactically valid HTTP/HTTPS URL."""
    if not isinstance(url, str) or not url.strip():
        return False
    return bool(URL_REGEX.match(url.strip()))


def check_url_reachability(url: str, timeout: int = 4) -> Tuple[bool, str]:
    """Verify if URL is reachable via HTTP request."""
    if not is_valid_url_format(url):
        return False, "INVALID_FORMAT"
    
    headers = {
        "User-Agent": "CivicSphere-DataValidator/1.0 (Government Portal Verification; +https://civicsphere.org)"
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        # Try HEAD first or GET
        with urllib.request.urlopen(req, timeout=timeout) as response:
            if response.status < 400:
                return True, "REACHABLE"
            return False, f"HTTP_{response.status}"
    except urllib.error.HTTPError as e:
        # 403 or 401 often returned by government firewalls to bots; URL exists
        if e.code in [401, 403, 405]:
            return True, f"HTTP_{e.code}_RESTRICTED"
        return False, f"HTTP_{e.code}"
    except urllib.error.URLError as e:
        return False, f"URL_ERROR: {e.reason}"
    except Exception as e:
        return False, f"ERROR: {str(e)[:30]}"


def batch_validate_urls(
    unique_urls: Set[str], check_vitality: bool = True
) -> Dict[str, Dict[str, Any]]:
    """Validate all unique URLs format and vitality using ThreadPool."""
    results = {}
    if not check_vitality:
        for url in unique_urls:
            valid_format = is_valid_url_format(url)
            results[url] = {
                "valid_format": valid_format,
                "reachable": valid_format,
                "status": "VALID_FORMAT" if valid_format else "INVALID_FORMAT",
            }
        return results

    print(f"🌐 Verifying reachability for {len(unique_urls)} unique URLs (ThreadPool)...")

    def worker(u: str):
        if not is_valid_url_format(u):
            return u, {"valid_format": False, "reachable": False, "status": "INVALID_FORMAT"}
        reachable, status = check_url_reachability(u)
        return u, {"valid_format": True, "reachable": reachable, "status": status}

    with ThreadPoolExecutor(max_workers=15) as executor:
        futures = {executor.submit(worker, u): u for u in unique_urls}
        for future in as_completed(futures):
            u, res = future.result()
            results[u] = res

    return results


# ---------------------------------------------------------
# 3. Structured Data Normalization
# ---------------------------------------------------------

STATE_CORRECTIONS = {
    "all india": "All India",
    "central": "All India",
    "national": "All India",
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
    "punjab": "Punjab",
    "rajasthan": "Rajasthan",
    "sikkim": "Sikkim",
    "tamil nadu": "Tamil Nadu",
    "telangana": "Telangana",
    "tripura": "Tripura",
    "uttar pradesh": "Uttar Pradesh",
    "uttarakhand": "Uttarakhand",
    "west bengal": "West Bengal",
    "delhi": "Delhi",
    "jammu and kashmir": "Jammu and Kashmir",
    "ladakh": "Ladakh",
    "puducherry": "Puducherry",
}


def normalize_state(state_raw: Any) -> str:
    """Standardize state names."""
    if isinstance(state_raw, list):
        states = [normalize_state(s) for s in state_raw if s]
        return ", ".join(dict.fromkeys(states)) if states else "All India"
    
    if not isinstance(state_raw, str) or not state_raw.strip():
        return "All India"
    
    s = state_raw.strip()
    return STATE_CORRECTIONS.get(s.lower(), s.title())


def normalize_category(cat_raw: Any) -> str:
    """Standardize sector/category field."""
    if isinstance(cat_raw, list):
        cats = [normalize_category(c) for c in cat_raw if c]
        return ", ".join(dict.fromkeys(cats)) if cats else "Agriculture"
    
    if not isinstance(cat_raw, str) or not cat_raw.strip():
        return "Agriculture"
    
    return cat_raw.strip().title()


# ---------------------------------------------------------
# 4. Main Validation Pipeline
# ---------------------------------------------------------

def run_data_validation(check_vitality: bool = True):
    """
    Executes the 6-stage validation pipeline on postgres agriculture_schemes table.
    Saves clean dataset to backend/app/CivicAssist/schemes_information/dataset_after_validation.json.
    """
    start_time = time.time()
    print("=" * 65)
    print("🏛️  CivicSphere AI Assist — Phase 1, Step 2: Data Validation")
    print("=" * 65)

    # Connect to PostgreSQL
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM agriculture_schemes ORDER BY scheme_id ASC;")
        raw_records = cur.fetchall()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ Database connection/fetch failed: {e}", file=sys.stderr)
        return

    total_records = len(raw_records)
    print(f"📥 Retrieved {total_records} raw records from 'agriculture_schemes' table.")

    if total_records == 0:
        print("⚠️ No records found in agriculture_schemes table. Please insert schemes first.")
        return

    # Step A: Collect all unique URLs across dataset for batch validation
    all_urls: Set[str] = set()
    for rec in raw_records:
        urls = extract_url_strings(rec.get("official_urls")) + extract_url_strings(rec.get("registration_links"))
        for u in urls:
            all_urls.add(u)

    url_validation_cache = batch_validate_urls(all_urls, check_vitality=check_vitality)

    # Step B: Process records through the 6 validation stages
    validated_records: List[Dict[str, Any]] = []
    validation_summary: List[Dict[str, Any]] = []

    seen_scheme_ids: Set[str] = set()
    seen_scheme_names: Set[str] = set()
    seen_primary_urls: Set[str] = set()

    valid_count = 0
    invalid_count = 0
    duplicate_count = 0
    url_filtered_count = 0

    for idx, rec in enumerate(raw_records, 1):
        scheme_id = str(rec.get("scheme_id") or "").strip()
        scheme_name = str(rec.get("scheme_name") or "").strip()
        errors: List[str] = []
        is_duplicate = False

        # --- 1. Schema Validation ---
        if not scheme_id:
            errors.append("Missing mandatory field: scheme_id")
        if not scheme_name:
            errors.append("Missing mandatory field: scheme_name")
        if not rec.get("category"):
            errors.append("Missing mandatory field: category")
        if not rec.get("state"):
            errors.append("Missing mandatory field: state")

        # --- 2. Duplicate Record Elimination ---
        norm_name = re.sub(r"[^\w\s]", "", scheme_name.lower())
        norm_name = re.sub(r"\s+", " ", norm_name).strip()
        
        # Primary official URL for deduplication
        raw_off_urls = extract_url_strings(rec.get("official_urls"))
        norm_primary_url = raw_off_urls[0].strip().lower().rstrip("/") if raw_off_urls else ""

        # Check for duplication across ID, normalized name, or specific scheme URL match
        if scheme_id in seen_scheme_ids:
            errors.append(f"Duplicate scheme_id: '{scheme_id}'")
            is_duplicate = True
        elif norm_name in seen_scheme_names:
            errors.append(f"Duplicate scheme_name: '{scheme_name}'")
            is_duplicate = True
        elif norm_primary_url and (norm_name, norm_primary_url) in seen_primary_urls:
            errors.append(f"Duplicate scheme record with identical name and URL: '{norm_primary_url}'")
            is_duplicate = True

        if not is_duplicate and scheme_id and scheme_name:
            seen_scheme_ids.add(scheme_id)
            seen_scheme_names.add(norm_name)
            if norm_primary_url:
                seen_primary_urls.add((norm_name, norm_primary_url))

        # --- 3. URL Vitality & Filtering ---
        raw_reg_urls = extract_url_strings(rec.get("registration_links"))

        valid_official_urls = []
        url_statuses = {}
        for u in raw_off_urls:
            u_info = url_validation_cache.get(u, {"valid_format": False, "reachable": False, "status": "UNKNOWN"})
            url_statuses[u] = u_info["status"]
            # Preserve only valid format URLs
            if u_info["valid_format"]:
                valid_official_urls.append(u)
            else:
                url_filtered_count += 1

        valid_reg_urls = []
        for u in raw_reg_urls:
            u_info = url_validation_cache.get(u, {"valid_format": False, "reachable": False, "status": "UNKNOWN"})
            url_statuses[u] = u_info["status"]
            if u_info["valid_format"]:
                valid_reg_urls.append(u)
            else:
                url_filtered_count += 1

        # --- 4. Structured Data Validation ---
        clean_state = normalize_state(rec.get("state"))
        clean_category = normalize_category(rec.get("category"))

        # Tags formatting
        raw_tags = rec.get("tags")
        if isinstance(raw_tags, list):
            clean_tags = [clean_text_field(t) for t in raw_tags if isinstance(t, str) and t.strip()]
        elif isinstance(raw_tags, str) and raw_tags.strip():
            clean_tags = [clean_text_field(raw_tags)]
        else:
            clean_tags = []

        # --- 5. Unstructured Data Cleaning ---
        clean_description = clean_text_field(rec.get("description") or "")
        clean_eligibility = clean_nested_json(rec.get("eligibility"))
        clean_benefits = clean_nested_json(rec.get("benefits"))
        clean_documents = clean_nested_json(rec.get("documents"))
        clean_app_process = clean_nested_json(rec.get("application_process"))
        clean_faq = clean_nested_json(rec.get("faq"))

        # --- 6. Status Determination ---
        is_valid = len(errors) == 0
        if is_valid:
            valid_count += 1
        else:
            if is_duplicate:
                duplicate_count += 1
            invalid_count += 1

        # Build Record Validation Summary
        rec_summary = {
            "scheme_id": scheme_id or f"RAW_{idx}",
            "scheme_name": scheme_name or "Unknown",
            "validation_status": "VALID" if is_valid else "INVALID",
            "duplicate_status": "DUPLICATE" if is_duplicate else "UNIQUE",
            "validation_errors": errors,
            "url_status": url_statuses,
        }
        validation_summary.append(rec_summary)

        # Build Validated Record (preserving DB structure)
        if is_valid:
            cleaned_record = {
                "scheme_id": scheme_id,
                "scheme_name": scheme_name,
                "category": clean_category,
                "state": clean_state,
                "description": clean_description,
                "eligibility": clean_eligibility,
                "benefits": clean_benefits,
                "documents": clean_documents,
                "application_process": clean_app_process,
                "official_urls": valid_official_urls,
                "registration_links": valid_reg_urls,
                "faq": clean_faq,
                "tags": clean_tags,
            }
            validated_records.append(cleaned_record)

    # Step C: Save outputs
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(validated_records, f, indent=2, ensure_ascii=False)

    with open(SUMMARY_FILE, "w", encoding="utf-8") as f:
        json.dump({
            "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            "total_input_records": total_records,
            "valid_records": valid_count,
            "invalid_records": invalid_count,
            "duplicate_records": duplicate_count,
            "filtered_invalid_urls": url_filtered_count,
            "records": validation_summary
        }, f, indent=2, ensure_ascii=False)

    # Also mirror to Schmes_information for easy local access
    

    duration = f"{time.time() - start_time:.2f}"

    # Print Summary Report
    print("\n" + "=" * 65)
    print("📊 VALIDATION PIPELINE SUMMARY")
    print("=" * 65)
    print(f"Total Raw Records Processed : {total_records}")
    print(f"✅ Valid Records Accepted   : {valid_count}")
    print(f"❌ Invalid / Rejected Records: {invalid_count}")
    print(f"   ↳ Duplicate Records       : {duplicate_count}")
    print(f"   ↳ Other Schema/Field Errors: {invalid_count - duplicate_count}")
    print(f"🔗 Invalid URLs Excluded    : {url_filtered_count}")
    print(f"⏱️ Time Taken                : {duration}s")
    print("-" * 65)
    print(f"📁 Validated dataset saved to:\n   {OUTPUT_FILE}")
    print(f"📁 Detailed summary saved to:\n   {SUMMARY_FILE}")
    print("=" * 65)
    print("\n⚠️ USER APPROVAL REQUIRED:")
    print("The PostgreSQL database has NOT been modified.")
    print("Please review the validated dataset above.")
    print("To apply this clean dataset to the PostgreSQL database, run:")
    print(f"   python {Path(__file__).name} --apply")
    print("=" * 65)


# ---------------------------------------------------------
# 5. Database & Supabase Replacement Workflow
# ---------------------------------------------------------

def sync_validated_to_supabase(validated_data: List[Dict[str, Any]]) -> bool:
    """
    Inserts / upserts validated records into Supabase `agriculture_schemes` table via REST API.
    """
    supabase_url = (os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL") or "").strip().rstrip("/")
    supabase_key = (
        os.getenv("SUPABASE_SERVICE_ROLE_KEY") or
        os.getenv("SUPABASE_KEY") or
        os.getenv("SUPABASE_ANON_KEY") or
        os.getenv("VITE_SUPABASE_ANON_KEY") or
        ""
    ).strip()

    if not supabase_url or not supabase_key:
        print("⚠️ Supabase credentials (SUPABASE_URL, SUPABASE_ANON_KEY) not found in environment. Skipping Supabase sync.")
        return False

    print(f"\n🚀 [Supabase] Syncing {len(validated_data)} validated scheme records to Supabase...")
    rest_url = f"{supabase_url}/rest/v1/agriculture_schemes"

    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
    }

    batch_size = 50
    total_synced = 0

    for i in range(0, len(validated_data), batch_size):
        batch = validated_data[i:i + batch_size]
        payload = []
        for item in batch:
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
                "tags": item.get("tags") or [],
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
                    print(f"   ↳ [Supabase] Synced batch {i // batch_size + 1} ({total_synced}/{len(validated_data)} records)")
                else:
                    print(f"   ⚠️ [Supabase] Batch {i // batch_size + 1} response status: {resp.status}")
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="replace")
            print(f"   ❌ [Supabase] HTTP error on batch {i // batch_size + 1} ({e.code}): {err_body}", file=sys.stderr)
        except Exception as e:
            print(f"   ❌ [Supabase] Error on batch {i // batch_size + 1}: {e}", file=sys.stderr)

    if total_synced > 0:
        print(f"✨ [Supabase] Successfully synced {total_synced}/{len(validated_data)} records to Supabase 'agriculture_schemes' table!\n")
    return total_synced > 0


def apply_validated_dataset_to_db():
    """
    Applies validated dataset from dataset_after_validation.json to PostgreSQL & Supabase.
    ONLY executed after explicit user confirmation.
    """
    if not OUTPUT_FILE.exists():
        print(f"❌ Clean dataset not found at {OUTPUT_FILE}.")
        print("Please run validation first: python datavalidation.py")
        return

    with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
        validated_data = json.load(f)

    if not isinstance(validated_data, list) or len(validated_data) == 0:
        print("❌ Validated dataset is empty. Aborting database replacement.")
        return

    print("⚠️  DATABASE & SUPABASE REPLACEMENT WORKFLOW")
    print(f"This will replace all rows in 'agriculture_schemes' with {len(validated_data)} validated records in PostgreSQL and Supabase.")
    
    confirm = input("Are you sure you want to proceed? Type 'YES' to confirm: ").strip()
    if confirm != "YES":
        print("🚫 Database update cancelled by user. No changes were made.")
        return

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        print("🧹 [1/4] Truncating PostgreSQL 'agriculture_schemes' table...")
        cur.execute("TRUNCATE TABLE agriculture_schemes CASCADE;")

        print(f"💾 [2/4] Inserting {len(validated_data)} validated records into PostgreSQL...")
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

        for item in validated_data:
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
        print("✨ [3/4] PostgreSQL database replacement completed successfully!")
        print(f"🎯 Total records in PostgreSQL agriculture_schemes: {len(validated_data)}")

        # Step 4: Sync to Supabase
        print("☁️  [4/4] Syncing validated records to Supabase...")
        sync_validated_to_supabase(validated_data)

    except Exception as e:
        conn.rollback()
        print(f"❌ Failed to update PostgreSQL database: {e}", file=sys.stderr)
        # Attempt Supabase sync regardless
        print("☁️  Attempting Supabase sync as fallback...")
        sync_validated_to_supabase(validated_data)
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    if "--apply" in sys.argv or "--update-db" in sys.argv:
        apply_validated_dataset_to_db()
    elif "--supabase" in sys.argv or "--sync-supabase" in sys.argv:
        if OUTPUT_FILE.exists():
            with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            sync_validated_to_supabase(data)
        else:
            print(f"❌ Validated dataset not found at {OUTPUT_FILE}. Run datavalidation.py first.")
    else:
        # Check if user wants quick URL format validation without waiting for external network requests
        quick_mode = "--quick" in sys.argv or "--no-network" in sys.argv
        run_data_validation(check_vitality=not quick_mode)
