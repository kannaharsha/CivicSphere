# 🏛️ CivicSphere — AI Powered Multilingual Citizen Welfare Platform

> **Your Language. Your Government. Empowering 1.4 Billion Indian Citizens.**  
> CivicSphere makes Government welfare schemes understandable, accessible, and actionable in every citizen's preferred language using AI-powered RAG intelligence and multilingual assistance.

---

## 🌟 Overview

Millions of citizens across India miss out on life-changing Government welfare benefits due to fragmented portals, legal jargon, and language barriers. **CivicSphere** unifies state and central welfare programs into one intelligent, AI-powered citizen platform.

By leveraging **Retrieval-Augmented Generation (RAG)** and **Native Language Translation**, CivicSphere automatically verifies citizen eligibility, simplifies complex policy rules, and provides step-by-step application guidance in **Telugu**, **Hindi**, and **English**.

---

## ✨ Key Features

### 🤖 Civic Assist — AI Governance Engine
- **Conversational Guidance**: Ask questions naturally (`"Am I eligible for PM Kisan as a small farmer in AP?"`).
- **Instant Eligibility Scan**: Automated RAG rules engine checks official government guidelines in milliseconds.
- **Plain-Language Explanations**: Converts complex PDF notifications into easy, step-by-step instructions.

### 🌐 Multilingual AI Platform
- **Native Script Support**: Full native script support for **English (`🇬🇧 EN`)**, **Telugu (`🇮🇳 TE - తెలుగు`)**, and **Hindi (`🇮🇳 HI - हिन्दी`)**.
- **Live AI Translation Terminal**: Real-time typing engine previews localized scheme answers instantly.

### ⚖️ The Old Way vs The Smart Way
- **Side-by-Side Comparison**: Contrasts traditional government portal friction (fragmented sites, legal jargon, missed deadlines) against CivicSphere's 1-click AI workflow.

### 🌾 5 Core Welfare Sectors
1. **Agriculture & Farmers**: PM Kisan Samman Nidhi, Raitu Bima, Soil Health Card.
2. **Education & Scholarships**: National Scholarship Portal, Post-Matric Assistance.
3. **Healthcare & Medical**: Ayushman Bharat PM-JAY, Central Health Schemes.
4. **Women Empowerment**: PM Mudra Yojana, Stree Nidhi, Stand-Up India.
5. **Senior Citizen Support**: National Social Assistance Program, Pension Schemes.

### 💚 Real Citizen Success Stories
- **Infinite Animated Showcase**: Real success stories from farmers, students, artisans, and senior citizens across India with AI-verified eligibility badges.
- **Interactive Read Mode**: Pause control and step-by-step navigation arrows for comfortable reading.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Core Framework** | [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tooling** | [Vite](https://vitejs.dev/) (Sub-850ms Production Builds) |
| **Styling & UI** | [Tailwind CSS](https://tailwindcss.com/) + Custom Glassmorphism System |
| **Motion & Graphics** | [Framer Motion](https://www.framer.com/motion/) (GPU-Accelerated 60 FPS) |
| **Icons** | [Lucide React](https://lucide.dev/) |

---

## 📂 Project Architecture

```
Main Project/
├── src/
│   ├── components/            # Production UI Components
│   │   ├── LandingNavbar.tsx  # Scroll-tracking fixed navbar
│   │   ├── HeroSection.tsx    # Section Hero & AI Badge
│   │   ├── AboutSection.tsx   # Platform vision & mission
│   │   ├── SectorCards.tsx    # 5 Welfare sectors grid
│   │   ├── FeaturesSection.tsx# Core AI capabilities
│   │   ├── HowItWorks.tsx     # 5-Step citizen journey
│   │   ├── AISection.tsx      # Civic Assist AI interactive demo (#civic-assist)
│   │   ├── LanguageSection.tsx# Multilingual AI platform (#languages)
│   │   ├── ComparisonSection.tsx # Old Way vs Smart Way (#comparison)
│   │   ├── Testimonials.tsx   # Infinite Citizen Stories marquee (#testimonials)
│   │   ├── CTASection.tsx     # Final call-to-action banner
│   │   └── Footer.tsx         # Responsive footer
│   ├── pages/
│   │   └── LandingPage.tsx    # Main Landing Page view
│   ├── App.tsx                # App entry routing
│   ├── main.tsx               # DOM React root
│   └── index.css              # Global design system & marquee keyframes
├── public/                    # Static assets & favicon
├── package.json               # Dependencies & build scripts
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite bundler configuration
└── README.md                  # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `>= 18.0.0`
- **npm**: `>= 9.0.0`

### 1. Clone the Repository
```bash
git clone https://github.com/kannaharsha/CivicSphere.git
cd CivicSphere
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser to view the application live.

### 4. Build for Production
```bash
npm run build
```
Generates optimized production assets in the `dist/` directory.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 👤 Author

**Harsha Kanna**  
- GitHub: [@kannaharsha](https://github.com/kannaharsha)  
- Project Repository: [https://github.com/kannaharsha/CivicSphere](https://github.com/kannaharsha/CivicSphere)
