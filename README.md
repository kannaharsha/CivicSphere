# 🏛️ CivicSphere — AI-Powered Citizen Welfare Platform & Scheme Discovery Gateway

> **Your Language. Your Government. Empowering 1.4 Billion Indian Citizens.**  
> CivicSphere makes Government welfare schemes understandable, accessible, and actionable in every citizen's preferred language using AI intelligence, multilingual assistance, and real-time database discovery.

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)](https://sqlite.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🌟 Overview

Millions of citizens across India miss out on life-changing Government welfare benefits due to fragmented state portals, legal jargon, and linguistic barriers. **CivicSphere** unifies state and central welfare programs into one intelligent, AI-powered citizen platform.

By leveraging **Retrieval-Augmented Generation (RAG)**, **Verified Government DPI Datasets**, and a **Tailored Dual-Theme Experience (Opulent Gold in Light Mode & Emerald Tech in Dark Mode)**, CivicSphere simplifies complex policy rules and provides step-by-step application guidance in **Telugu**, **Hindi**, and **English**.

---

## ✨ Key Features & Capabilities

### 🔎 1. Explore Schemes & Intelligent Discovery Portal
- **Live Database Integration**: Real-time retrieval of hundreds of verified agricultural and citizen welfare schemes directly from SQLite.
- **Dedicated Scheme Detail Page**: Replaces modal popups with a dedicated, professional full-page view detailing:
  - Scheme Overview & Scope
  - Direct Financial Assistance & Subsidies
  - Eligibility Criteria & Target Beneficiaries
  - Required Documentation & Checklist
  - Step-by-Step Application Guidelines with Direct Portal & PDF Links
- **Dual-Theme Design Language**:
  - **Light Mode**: 100% Opulent Goldish-Yellow Palette (`#D4A017`, `#F59E0B`, `#8A6210`, `#FFFDF7`) with clean contrast and zero rogue green focus artifacts.
  - **Dark Mode**: 100% High-Tech Emerald Palette (`#00B87C`, `#10B981`, `#0C1A2B`, `#0F1C2E`).
- **Dynamic "Flow of Information" Search**:
  - Animated rotating placeholder text cycling through citizen search hints.
  - Quick-discovery topic chips (`🌾 PM Kisan`, `☀️ Solar Pump`, `🛡️ Crop Insurance`, etc.).
  - AI Voice Search simulation with microphone visualizer.
  - Keyboard shortcut support (`Ctrl + K`).
- **Database-Driven Filter Dropdowns**:
  - Scheme Category (dynamic distinct categories from DB).
  - State & Regional Jurisdiction (Pan India and State-specific).
  - Application Mode (Online Portal vs. Offline / CSC Center).
- **Profile Bookmark Synchronization**: Save schemes locally and persist favorites into citizen profiles.

### 🤖 2. Civic Assist — AI Governance Engine
- **Conversational Guidance**: Ask natural questions (`"Am I eligible for PM Kisan as a small farmer in AP?"`).
- **Instant Eligibility Scan**: Automated RAG rules engine checks official government guidelines in milliseconds.
- **Plain-Language Explanations**: Converts complex PDF notifications into easy, step-by-step instructions.

### 🌐 3. Multilingual Citizen Experience
- **Native Script Support**: Seamless localization for **English (`🇬🇧 EN`)**, **Telugu (`🇮🇳 TE - తెలుగు`)**, and **Hindi (`🇮🇳 HI - हिन्दी`)**.
- **Live AI Translation Preview**: Real-time typing engine previews localized scheme answers instantly.

### 👤 4. Citizen Profile & Identity Management
- **Firebase Authentication**: Secure Google, Phone, and Email/Password sign-in.
- **Citizen Digital Persona**: Track eligibility factors including occupation, caste category, landholding size, annual family income, and state of residence.

### 🌾 5. Supported Welfare Sectors
1. **Agriculture & Farmers**: PM Kisan Samman Nidhi, PM Fasal Bima Yojana, Soil Health Card, Solar Pump Subsidies.
2. **Education & Scholarships**: National Scholarship Portal, Post-Matric Assistance, Girl Child Education.
3. **Healthcare & Medical**: Ayushman Bharat PM-JAY, Central Health Welfare.
4. **Women Empowerment**: PM Mudra Yojana, Stree Nidhi, Stand-Up India.
5. **Senior Citizen Support**: National Social Assistance Program, Atal Pension Yojana.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [React 18](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/) |
| **Build & Dev Server** | [Vite 5](https://vitejs.dev/) (Sub-second HMR & optimized production bundles) |
| **Styling & Design System** | [Tailwind CSS](https://tailwindcss.com/) + Custom Design Tokens & Glassmorphism |
| **Motion & Micro-Interactions** | [Framer Motion](https://www.framer.com/motion/) (60 FPS spring animations) |
| **Iconography** | [Lucide React](https://lucide.dev/) |
| **Backend Server** | [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) |
| **Database** | [SQLite](https://sqlite.org/) with [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) |
| **Authentication** | [Firebase Auth](https://firebase.google.com/docs/auth) |
| **Data Pipelines** | Python 3 + Pandas ETL scripts (`Import_Datasets/import_agriculture.py`) |

---

## 📂 Project Architecture

```
Main Project/
├── Import_Datasets/           # Data ingestion & ETL pipeline
│   ├── Datasets/              # Raw CSV / Excel datasets
│   └── import_agriculture.py  # SQLite automated schema & loader script
├── public/                    # Static public assets & favicons
├── server/                    # Express Backend API
│   ├── controllers/           # Route controller logic
│   │   ├── authController.ts  # User profile & authentication
│   │   └── schemeController.ts# Scheme search, filter & detail endpoints
│   ├── routes/                # Express API routes
│   │   ├── authRoutes.ts      # /api/users
│   │   └── schemeRoutes.ts    # /api/schemes
│   ├── services/              # Business logic & SQL queries
│   ├── db.ts                  # SQLite connection & schema initializer
│   └── index.ts               # Server entry point (Port 5000)
├── src/                       # React Frontend (Vite)
│   ├── authentication/        # Auth particles & background graphics
│   ├── components/            # UI components
│   │   ├── dashboard/         # Dashboard tabs & views
│   │   │   ├── ExploreSchemesSection.tsx # Scheme discovery & detail page
│   │   │   ├── ProfileSection.tsx        # Citizen profile management
│   │   │   └── TopHeroSection.tsx        # Quick metrics & greetings
│   │   ├── LandingNavbar.tsx  # Scroll-tracking fixed navbar
│   │   ├── HeroSection.tsx    # Landing page hero
│   │   ├── SectorCards.tsx    # Welfare sector cards
│   │   ├── AISection.tsx      # Interactive AI demo
│   │   └── ...                # Additional landing components
│   ├── firebase/              # Firebase client SDK initialization
│   ├── pages/                 # Full-page routing views
│   │   ├── LandingPage.tsx    # Public landing page
│   │   └── DashboardPage.tsx  # Citizen dashboard portal
│   ├── services/              # Client API clients (schemeService, userService)
│   ├── index.css              # Global styles, typography & color tokens
│   ├── App.tsx                # Client-side router & providers
│   └── main.tsx               # Application entry root
├── package.json               # Full-stack dependencies & scripts
├── tsconfig.json              # TypeScript compilation configuration
├── vite.config.ts             # Vite configuration & proxy routes
└── README.md                  # Project documentation
```

---

## 📡 REST API Reference

The backend operates on `http://localhost:5000` with the following primary endpoints:

### Schemes
- `GET /api/schemes/agriculture`: Paginated list of agriculture schemes with search and category filters.
  - Query parameters: `page`, `limit`, `search`, `category`, `state`, `application_mode`.
- `GET /api/schemes/agriculture/count`: Returns the total number of verified schemes in the database.
- `GET /api/schemes/agriculture/filters`: Distinct categories, ministries, states, and application modes available in the database.
- `GET /api/schemes/agriculture/:id`: Complete metadata and guidelines for an individual scheme.

### User Profiles
- `POST /api/users/profile`: Create or update citizen profile in SQLite.
- `GET /api/users/profile/:firebase_uid`: Retrieve user profile and personalized parameters.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `>= 18.0.0`
- **npm**: `>= 9.0.0`
- **Python**: `>= 3.9` *(Only needed if re-importing raw datasets)*

### 1. Clone the Repository
```bash
git clone https://github.com/kannaharsha/CivicSphere.git
cd CivicSphere
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
PORT=5000
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Populate Database (Optional)
If running a fresh instance without SQLite data:
```bash
python Import_Datasets/import_agriculture.py
```

### 5. Launch Development Environment
```bash
npm run dev
```
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

### 6. Production Build
```bash
npm run build
```
Creates production bundle inside `dist/`.

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for more details.

---

## 👤 Author

**Harsha Kanna**  
- GitHub: [@kannaharsha](https://github.com/kannaharsha)  
- Project Repository: [https://github.com/kannaharsha/CivicSphere](https://github.com/kannaharsha/CivicSphere)
