import os
import sys
import json
import time
from pathlib import Path
import psycopg2
from psycopg2.extras import Json
from dotenv import load_dotenv

# Resolve paths
current_dir = Path(__file__).resolve().parent
project_root = current_dir.parent

# Load environment variables from .env in project root
dotenv_path = project_root / '.env'
if dotenv_path.exists():
    load_dotenv(dotenv_path)
else:
    load_dotenv()


def get_db_connection():
    """Establish and return a PostgreSQL connection using environment variables."""
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


def format_text_field(value, default=""):
    """Format category or state fields which can be string or list."""
    if isinstance(value, list):
        filtered = [str(x).strip() for x in value if x and str(x).strip()]
        return ", ".join(filtered) if filtered else default
    elif isinstance(value, str) and value.strip():
        return value.strip()
    return default


def format_array_field(value):
    """Format fields expected as text[] (official URLs, registration links, tags)."""
    if isinstance(value, list):
        return [str(x).strip() for x in value if isinstance(x, str) and x.strip()]
    elif isinstance(value, str) and value.strip():
        return [value.strip()]
    return []


def format_json_field(value):
    """Format jsonb fields, wrapping in Json adapter if present."""
    if value is not None:
        return Json(value)
    return None


def insert_agriculture_schemes():
    start_time = time.time()
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        print("🚀 [Agriculture Importer] Starting database migration & scheme insertion...")

        # 1. Ensure sequence starting at 1001 and table exist
        print('🛠️ [1/4] Ensuring sequence "agriculture_schemes_seq" and table "agriculture_schemes" exist...')
        cur.execute("""
            CREATE SEQUENCE IF NOT EXISTS agriculture_schemes_seq START WITH 1001;

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
        conn.commit()

        # 2. Read dataset JSON file in current directory
        json_path = current_dir / "Agriculture.json"
        if not json_path.exists():
            raise FileNotFoundError(f"Agriculture JSON dataset not found at expected path: {json_path}")

        print(f"📖 [2/4] Reading dataset from: {json_path}")
        with open(json_path, "r", encoding="utf-8") as f:
            parsed_data = json.load(f)

        schemes = parsed_data.get("schemes", [])
        if not isinstance(schemes, list) or len(schemes) == 0:
            raise ValueError('No schemes found in the dataset "schemes" array.')
        print(f"📦 Found {len(schemes)} schemes in Agriculture.json.")

        # 3. Check for --clean, --truncate, or -c flag
        args = sys.argv[1:]
        should_truncate = any(arg in args for arg in ["--clean", "--truncate", "-c"])

        if should_truncate:
            print('🧹 Truncating "agriculture_schemes" and restarting sequence at 1001...')
            cur.execute("TRUNCATE TABLE agriculture_schemes CASCADE;")
            cur.execute("ALTER SEQUENCE agriculture_schemes_seq RESTART WITH 1001;")
            conn.commit()
        else:
            cur.execute("SELECT COUNT(*) FROM agriculture_schemes;")
            existing_count = cur.fetchone()[0] or 0
            if existing_count > 0:
                print(f"ℹ️ Table already has {existing_count} rows. To re-import from scratch starting at AGRI1001, run with --clean")

        # 4. Batch insert into database
        print("💾 [3/4] Inserting schemes with auto-generated scheme_id (AGRI1001+)...")
        batch_size = 50
        inserted_count = 0
        first_id = ""
        last_id = ""

        insert_query = """
            INSERT INTO agriculture_schemes (
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
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
            RETURNING scheme_id;
        """

        for i in range(0, len(schemes), batch_size):
            batch = schemes[i : i + batch_size]

            for item in batch:
                scheme_name = (item.get("Scheme Name") or "").strip() or "Untitled Scheme"
                category = format_text_field(item.get("Category"), default="Agriculture")
                state = format_text_field(item.get("State"), default="All India")
                description = item.get("Description") or ""

                eligibility = format_json_field(item.get("Eligibility"))
                benefits = format_json_field(item.get("Benefits"))
                documents = format_json_field(item.get("Documents"))
                application_process = format_json_field(item.get("Application Process"))
                faq = format_json_field(item.get("FAQ"))

                official_urls = format_array_field(item.get("Official URL"))
                registration_links = format_array_field(item.get("Registration Link"))
                tags = format_array_field(item.get("Tags"))

                cur.execute(
                    insert_query,
                    (
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
                    ),
                )

                generated_id = cur.fetchone()[0]
                if not first_id:
                    first_id = generated_id
                last_id = generated_id
                inserted_count += 1

            conn.commit()
            print(f"⏳ Inserted {min(i + batch_size, len(schemes))} / {len(schemes)} schemes...")

        duration = f"{time.time() - start_time:.2f}"
        print("----------------------------------------------------")
        print(f"✨ [4/4] COMPLETE: Successfully inserted {inserted_count} schemes in {duration}s!")
        print(f"🎯 ID Range: {first_id} -> {last_id}")
        print("----------------------------------------------------")

        return {"inserted_count": inserted_count, "first_id": first_id, "last_id": last_id}

    except Exception as e:
        conn.rollback()
        print(f"❌ Insertion failed: {e}", file=sys.stderr)
        raise
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    insert_agriculture_schemes()
