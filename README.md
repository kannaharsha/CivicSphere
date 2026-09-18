# 🏛️ CivicSphere — AI-Powered Citizen Welfare Platform & Scheme Discovery Gateway

> **Your Language. Your Government. Empowering 1.4 Billion Indian Citizens.**  
> CivicSphere makes Government welfare schemes understandable, accessible, and actionable in every citizen's preferred language using conversational AI intelligence, semantic RAG retrieval, multilingual assistance, and real-time welfare databases.

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)](https://sqlite.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Realtime-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![RAG Pipeline](https://img.shields.io/badge/RAG-Hybrid%20Dense%2BSparse-FF6F00)](https://github.com/kannaharsha/CivicSphere)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🌟 Overview

Millions of citizens across India miss out on life-changing Government welfare benefits due to fragmented state portals, legal jargon, complex eligibility matrixes, and linguistic barriers. **CivicSphere** unifies state and central welfare programs into one intelligent, AI-powered citizen platform.

By combining an end-to-end **Retrieval-Augmented Generation (RAG)** pipeline, **Verified Government DPI Datasets**, **Citizen Profile Engines**, and a **Tailored Dual-Theme Experience (Opulent Gold in Light Mode & Emerald Tech in Dark Mode)**, CivicSphere simplifies policy rules and provides step-by-step guidance in **Telugu**, **Hindi**, and **English**.

---

## ✨ Core Modules & Key Capabilities

### 🔎 1. Explore Schemes & Intelligent Discovery Portal
- **Live Database Integration**: Real-time retrieval of hundreds of verified agricultural and citizen welfare schemes directly from SQLite and Supabase.
- **Dedicated Scheme Detail Page**: Full-page view with:
  - Scheme Overview, Scope & Ministry Details
  - Direct Financial Assistance, Subsidies & Benefits Breakdown
  - Granular Eligibility Criteria & Beneficiary Categories
  - Required Documents Checklist
  - Step-by-Step Application Guidelines with Direct Portal & Official PDF Links
- **Dual-Theme Design Language**:
  - **Light Mode**: Opulent Goldish-Yellow Palette (`#D4A017`, `#F59E0B`, `#8A6210`, `#FFFDF7`) with clean contrast and zero visual artifacts.
  - **Dark Mode**: High-Tech Emerald Palette (`#00B87C`, `#10B981`, `#0C1A2B`, `#0F1C2E`).
- **Dynamic Search & Filtering**:
  - Rotating placeholder hints and quick-discovery topic chips (`🌾 PM Kisan`, `☀️ Solar Pump`, `🛡️ Crop Insurance`, etc.).
  - Voice Search simulation with microphone visualizer.
  - Keyboard shortcuts (`Ctrl + K` / `Cmd + K`).
  - Database-driven dropdowns: Category, State / Jurisdiction, and Application Mode (Online / CSC / Offline).
- **Profile Bookmark Synchronization**: Save favorite schemes locally and persist them into citizen profiles.

### 🧠 2. Civic Assist & Multi-Stage RAG Pipeline
- **Natural Language Governance Assistant**: Ask open queries like:
  - *"Am I eligible for PM Kisan as a small farmer in Andhra Pradesh?"*
  - *"What documents do I need for solar pump subsidy in Telangana?"*
- **Python-Powered Semantic AI Engine (`RAG+LLM/`)**:
  - **Query Understanding (`query_understanding.py`)**: Intent classification, entity extraction (land size, income, state, caste, age), and query reformulation.
  - **Hybrid Retrieval (`retrieval_pipeline.py`)**: Dense embeddings + BM25 sparse retrieval across chunked government schemes (`embeddings_matrix.npy`, `chunks_metadata.json`).
  - **Context Assembly (`context_assembly.py`)**: Assembles cited context snippets, ranking, and deduplication for ground-truth provenance.
  - **Grounded Generation (`grounded_llm.py`)**: Hallucination-free responses grounded in verified government notifications.
- **Backend AI Router (`server/routes/aiRoutes.ts`)**: Connects chat requests to Python subprocesses with fallback resilience.

### 📋 3. Eligibility Engine & Calculator (`/eligibility`)
- **Interactive Eligibility Evaluation**:
  - Profile-based eligibility check matching citizen attributes against official welfare criteria.
  - Evaluate eligibility for **Self** or **Another Person** (family members, tenants, laborers).
- **Comprehensive Citizen Factor Tracking**:
  - Landholding size & category (marginal, small, medium, large)
  - Annual family income brackets
  - Social & caste category (General, OBC, SC, ST, EWS)
  - Gender, age, occupation, and state of residence
- **Score Breakdown & Missing Requirements**:
  - Visual match percentage cards.
  - Specific missing criteria or documents required to qualify.
  - Direct 1-click transition from eligibility results to scheme application.

### 📁 4. Document Vault & Guidance Center (`/documents`)
- **Citizen Document Management**:
  - Categorized document directory: Identity (Aadhaar, Voter ID), Land Records (Pattadar Passbook, ROR 1-B), Financial (Bank Passbook, Income Certificate), and Caste/Category certificates.
- **Frequently Required Documents Checklist**: Identifies which documents unlock the highest number of welfare schemes.
- **Government Issuance Guidance**: Step-by-step instructions on how and where to obtain, renew, or link government certificates (MeeSeva, CSC centers, DigiLocker).
- **Scheme-Document Cross-Linking**: View all eligible schemes that accept a specific document.

### 🔔 5. Notification Center & Deadline Reminders (`/notifications`)
- **Time-Sensitive Alerts**:
  - Application deadline countdowns with urgent status flags.
  - Direct Benefit Transfer (DBT) installment release alerts.
  - KYC / e-KYC renewal deadlines and verification reminders.
- **Interactive Calendar & Timeline**:
  - Filter notifications by category: Deadline, Payment/DBT, Verification, and Policy updates.
  - Custom reminder creation for specific schemes and tasks.
  - Mark as read, bookmark, and synchronize state with Supabase.

### ⚙️ 6. Comprehensive Citizen Settings (`/settings`)
- **Personalized App Preferences**:
  - **Appearance**: Light, Dark, and System modes.
  - **Language Selection**: English, Hindi (हिन्दी), and Telugu (తెలుగు).
  - **Accessibility**: High contrast mode, font scaling, screen-reader optimizations, and reduced motion.
  - **Notification Channels**: Email, SMS, browser push, and deadline reminders.
  - **Privacy & Data Controls**: Export citizen data, reset profile parameters, and manage account security.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [React 18](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/) |
| **Build & Dev Server** | [Vite 5](https://vitejs.dev/) (Sub-second HMR & optimized production bundling) |
| **Styling & Design** | [Tailwind CSS 3](https://tailwindcss.com/) + Custom Design Tokens, CSS Variables & Glassmorphism |
| **Animations & Motion**| [Framer Motion](https://www.framer.com/motion/) + Custom Canvas Particle Effects |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Backend API** | [Node.js](https://nodejs.org/) + [Express 4](https://expressjs.com/) (TypeScript) |
| **Databases** | [SQLite 3](https://sqlite.org/) (`better-sqlite3`) + [Supabase](https://supabase.com/) |
| **Authentication** | [Firebase Authentication](https://firebase.google.com/docs/auth) |
| **RAG & NLP Engine** | [Python 3](https://www.python.org/) + NumPy + Sentence-Transformers + BM25 |
| **Data Pipelines** | Python ETL scripts + Pandas for DPI dataset preprocessing |

---

## 📂 Project Architecture

```
Main Project/
├── Import_Datasets/           # Data ingestion & ETL pipeline
│   ├── Datasets/              # Raw CSV / Excel datasets (Agriculture, Welfare)
│   └── import_agriculture.py  # SQLite automated schema & loader script
├── RAG+LLM/                   # Multi-stage semantic RAG & AI inference pipeline
│   ├── query_understanding.py # Intent parsing & query entity normalization
│   ├── retrieval_pipeline.py  # Dense + sparse vector search engine
│   ├── context_assembly.py    # Evidence ranking, provenance & snippet assembly
│   ├── grounded_llm.py        # Factual answer generation with citations
│   ├── semantic_preprocessing.py # Document chunking & text cleansing
│   └── embedding_pipeline.py  # Vector embedding generation
├── Schmes_information/        # Precomputed knowledge bases & vector indices
│   ├── chunks_metadata.json   # Semantic chunk definitions with scheme references
│   ├── embeddings_matrix.npy  # Pre-computed dense embeddings matrix
│   └── *.json                 # Pipeline execution summaries & audit logs
├── public/                    # Static public assets, icons & manifests
├── server/                    # Express Backend API
│   ├── controllers/           # API controllers
│   │   ├── authController.ts  # Citizen authentication & profile synchronization
│   │   └── schemeController.ts# Scheme search, filter & detail endpoints
│   ├── routes/                # Express API routes
│   │   ├── aiRoutes.ts        # AI / RAG query-understanding & assistant routes
│   │   ├── authRoutes.ts      # User profile routes
│   │   └── schemeRoutes.ts    # Welfare schemes endpoints
│   ├── services/              # SQL queries & business layer
│   ├── db.ts                  # SQLite initialization & schema migration
│   └── index.ts               # Express server entry point (Port 5000)
├── src/                       # React Frontend Application
│   ├── authentication/        # Auth forms, animated particle canvas
│   ├── components/            # Reusable modular components
│   │   ├── dashboard/         # Dashboard views, stats & AI Assistant widget
│   │   ├── Documents/         # Document vault, cards, search, filters & guidance
│   │   ├── Eligibility/       # Eligibility calculator, cards, breakdown & forms
│   │   ├── Notifications/     # Notification center, countdowns, timeline & stats
│   │   ├── Settings/          # Preferences, language, theme, accessibility & privacy
│   │   ├── LandingNavbar.tsx  # Scroll-tracking fixed navigation
│   │   ├── HeroSection.tsx    # Hero section with live search
│   │   ├── SectorCards.tsx    # Sector exploration cards
│   │   └── AISection.tsx      # Interactive AI demo section
│   ├── firebase/              # Firebase Client SDK & Auth providers
│   ├── pages/                 # Full-page application views
│   │   ├── LandingPage.tsx    # Public landing portal
│   │   ├── DashboardPage.tsx  # Central citizen dashboard
│   │   ├── EligibilityStandalonePage.tsx   # Dedicated Eligibility portal
│   │   ├── NotificationsStandalonePage.tsx # Dedicated Notifications portal
│   │   └── SettingsStandalonePage.tsx      # Dedicated Citizen Settings portal
│   ├── services/              # Client API clients (schemes, profile, supabase)
│   ├── index.css              # Global design system & theme definitions
│   ├── App.tsx                # Client-side router, theme provider & modals
│   └── main.tsx               # Application root mount
├── package.json               # Full-stack dependencies & scripts
├── tsconfig.json              # TypeScript compilation configuration
├── vite.config.ts             # Vite configuration, proxies & build setup
└── README.md                  # Project documentation
```

---

## 📡 REST API Reference

The backend operates on `http://localhost:5000` with the following endpoints:

### Schemes
- `GET /api/schemes/agriculture`: Paginated list of agriculture schemes with search and category filters.
  - Query parameters: `page`, `limit`, `search`, `category`, `state`, `application_mode`.
- `GET /api/schemes/agriculture/count`: Returns total verified schemes in the database.
- `GET /api/schemes/agriculture/filters`: Distinct categories, ministries, states, and application modes.
- `GET /api/schemes/agriculture/:id`: Complete metadata and guidelines for a single scheme.

### AI & RAG Assistant
- `POST /api/ai/query-understanding`: Passes citizen queries through the Python NLP/RAG pipeline (`query_understanding.py`) for intent extraction, semantic search, and grounded eligibility response.
  - Body: `{ "query": string, "user_id"?: string, "session_id"?: string, "input_type"?: "text" | "voice" }`

### User Profiles
- `POST /api/users/profile`: Create or update citizen profile in SQLite/Supabase.
- `GET /api/users/profile/:firebase_uid`: Retrieve user profile and personalized parameters.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `>= 18.0.0`
- **npm**: `>= 9.0.0`
- **Python**: `>= 3.9` *(Recommended for AI Assistant / RAG pipeline)*

### 1. Clone the Repository
```bash
git clone https://github.com/kannaharsha/CivicSphere.git
cd CivicSphere
```

### 2. Install Node Dependencies
```bash
npm install
```

### 3. Setup Python Virtual Environment (Optional, for RAG/AI Assistant)
```bash
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt # or numpy pandas sentence-transformers
```

### 4. Environment Configuration
Create a `.env` file in the root directory:
```env
PORT=5000

# Firebase Client Auth Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Supabase Configuration (Optional for Cloud Sync)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Launch Development Environment
```bash
npm run dev
```
- **Frontend Application**: `http://localhost:5173`
- **Express Backend API**: `http://localhost:5000`

### 6. Production Build & Validation
```bash
npm run build
```
Creates the optimized production bundle inside `dist/`.

---

## 🌾 Supported Welfare Sectors

1. **Agriculture & Farmers**: PM Kisan Samman Nidhi, PM Fasal Bima Yojana, Soil Health Card, Solar Pump Subsidies, Micro Irrigation.
2. **Education & Scholarships**: National Scholarship Portal, Post-Matric Assistance, Single Girl Child Education.
3. **Healthcare & Medical**: Ayushman Bharat PM-JAY, Central Health Welfare, Rashtriya Arogya Nidhi.
4. **Women & Child Empowerment**: PM Mudra Yojana, Stree Nidhi, Stand-Up India, Sukanya Samriddhi Yojana.
5. **Senior Citizen & Social Security**: National Social Assistance Program (NSAP), Atal Pension Yojana, PM Vaya Vandana Yojana.

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for more details.

---

## 👤 Author

**Harsha Kanna**  
- GitHub: [@kannaharsha](https://github.com/kannaharsha)  
- Project Repository: [https://github.com/kannaharsha/CivicSphere](https://github.com/kannaharsha/CivicSphere)
