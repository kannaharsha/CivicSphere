import os
import pandas as pd
from sqlalchemy import create_engine, text

from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

# Database Connection URL strictly retrieved from .env
DB_URI = os.getenv("DATABASE_URL")
if not DB_URI:
    user = os.getenv("DB_USER")
    password = os.getenv("DB_PASSWORD")
    host = os.getenv("DB_HOST")
    port = os.getenv("DB_PORT")
    dbname = os.getenv("DB_NAME")
    DB_URI = f"postgresql://{user}:{password}@{host}:{port}/{dbname}"

# Dataset File Path
EXCEL_PATH = os.path.join("Datasets", "Agriculture.xlsx")
TABLE_NAME = "agriculture_schemes"

def import_agriculture_data():
    if not os.path.exists(EXCEL_PATH):
        print(f"[ERROR] Could not find Excel file at '{EXCEL_PATH}'")
        return

    print(f"Loading updated dataset from '{EXCEL_PATH}'...")
    
    # 1. Read Excel file
    xls = pd.ExcelFile(EXCEL_PATH)
    sheet_name = xls.sheet_names[0]
    df = pd.read_excel(EXCEL_PATH, sheet_name=sheet_name)
    
    print(f"[OK] Read sheet '{sheet_name}' with {len(df)} rows.")

    # 2. Map Excel columns to database table schema
    column_mapping = {
        'id': 'id',
        'Scheme Name': 'scheme_name',
        'Domain': 'category',
        'Beneficiary State': 'target_beneficiary',
        'Ministry': 'ministry_department',
        'Description': 'description',
        'Eligibility': 'eligibility',
        'Benefits': 'benefits',
        'Documents': 'documents_required',
        'Application Process': 'application_process',
        'Official URL': 'official_scheme_url',
        'Registration Link': 'official_pdf_url'
    }

    df = df.rename(columns=column_mapping)

    # 3. Sort dataset to ensure consistent order by id or scheme_name
    if 'id' in df.columns:
        df['id'] = pd.to_numeric(df['id'], errors='coerce')
        df = df.sort_values(by='id').reset_index(drop=True)
    else:
        # Sort alphabetically by scheme_name for clean consistent indexing
        df = df.sort_values(by='scheme_name').reset_index(drop=True)
        df['id'] = range(1, len(df) + 1)

    # Re-generate sequential scheme_id aligned with primary key id
    df['scheme_id'] = [f"AGRI-{int(i):03d}" for i in df['id']]

    if 'application_mode' not in df.columns:
        df['application_mode'] = 'Online'

    if 'status' not in df.columns:
        df['status'] = 'Active'

    # Select only columns present in table schema (starting with primary key 'id')
    valid_columns = [
        'id', 'scheme_id', 'scheme_name', 'category', 'ministry_department',
        'target_beneficiary', 'description', 'benefits', 'eligibility',
        'documents_required', 'application_mode', 'application_process',
        'official_scheme_url', 'official_pdf_url', 'status'
    ]
    
    df_to_insert = df[[col for col in valid_columns if col in df.columns]]

    # 4. Connect to PostgreSQL Database
    print("Connecting to PostgreSQL database...")
    engine = create_engine(DB_URI)

    # Create table if not existing & clear existing rows for a clean update
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS agriculture_schemes (
        id SERIAL PRIMARY KEY,
        scheme_id VARCHAR(30) UNIQUE,
        scheme_name TEXT NOT NULL,
        category VARCHAR(100) DEFAULT 'Agriculture',
        ministry_department TEXT,
        target_beneficiary VARCHAR(255),
        description TEXT,
        benefits TEXT,
        eligibility TEXT,
        documents_required TEXT,
        application_mode VARCHAR(20) DEFAULT 'Online',
        application_process TEXT,
        official_scheme_url TEXT,
        official_pdf_url TEXT,
        status VARCHAR(20) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    with engine.begin() as conn:
        conn.execute(text(create_table_sql))
        print(f"Clearing previous records in '{TABLE_NAME}'...")
        conn.execute(text(f"TRUNCATE TABLE {TABLE_NAME} RESTART IDENTITY;"))

    # 5. Push DataFrame records directly to PostgreSQL table 'agriculture_schemes' sorted by primary key id
    print(f"Importing {len(df_to_insert)} records into '{TABLE_NAME}' sorted by primary key 'id'...")
    df_to_insert.to_sql(TABLE_NAME, engine, if_exists='append', index=False)

    # Update serial sequence to match highest primary key id
    with engine.begin() as conn:
        conn.execute(text(f"SELECT setval('agriculture_schemes_id_seq', (SELECT MAX(id) FROM agriculture_schemes));"))

    print(f"\nTable updated successfully! Total {len(df_to_insert)} rows sorted and indexed by primary key 'id'.")

if __name__ == "__main__":
    import_agriculture_data()




