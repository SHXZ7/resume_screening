# resume_screening

AI & Machine Learning-powered automated candidate resume screening, domain categorization, and ranking system.

Built for **B.Tech Minor Degree in Machine Learning (2025–2026)**.

### Team Members
- **Fariz Hasan** — S7 Mechanical Engineering
- **Adarsh J** — S7 Electronics & Communication Engineering
- **Mohd Shaaz** — S7 Electronics & Communication Engineering

---

## 🚀 Key Features & System Architecture

This project implements an industry-grade **Two-Stage Hybrid Machine Learning & NLP Pipeline**:

```
Candidate Resumes (PDF / DOCX)
               │
               ▼
┌────────────────────────────────────────────────────────┐
│  STAGE 1: Modern NLP Role Classifier & Semantic Engine │
│  • 30 Modern Categories (Full Stack, Frontend, AI/ML,  │
│    Data Engineering, DevOps, Cloud Architect, etc.)    │
│  • TF-IDF (1, 2 n-grams, 6000 features, sublinear TF)  │
│  • 99.43% Test Accuracy & 0.9942 Weighted F1           │
│  • Cosine Similarity + Dynamic Skills Taxonomy Matching│
└────────────────────────────────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────────────────┐
│  STAGE 2: 30k Candidate Decision Engine                │
│  • Trained on 30,000 real-world candidate profiles     │
│  • Gradient Boosting Decision Engine                   │
│  • 90.62% Accuracy & 0.9665 ROC-AUC                   │
│  • Evaluates: Experience (62.1%), Projects (11.5%),    │
│    GitHub Activity (10.4%), Skills Overlap (9.8%),     │
│    Education Level (3.2%), Resume Length (2.9%)        │
│  • Outputs Shortlist Decision (Yes / No) + Confidence  │
└────────────────────────────────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────────────────┐
│  STAGE 3: Groq LLM Recruiter Assistant                │
│  • Deep Project Extraction & Architecture Highlights   │
│  • Executive Recruiter Verdict                         │
│  • Tailored Technical Interview Questions              │
│  • One-click Job Description Expansion & Keyword Editor│
└────────────────────────────────────────────────────────┘
               │
               ▼
   Jobply.ai-Themed Modern Next.js Dashboard
```

---

## 📁 Repository Structure

```
resume_screening/
├── backend/                  # FastAPI Python ML Backend
│   ├── .env.example          # Safe template for credentials
│   ├── requirements.txt      # Python dependencies
│   ├── server.py             # FastAPI REST endpoints
│   ├── data/                 # Datasets & skills taxonomy
│   │   ├── UpdatedResumeDataSet.csv     # 1,154 resumes, 30 categories
│   │   ├── ai_resume_screening.csv      # 30,000 candidate decision dataset
│   │   └── skills_dict.json             # 114+ categorized skills taxonomy
│   ├── models/               # Saved trained artifacts
│   │   ├── best_model.pkl    # Logistic Regression Classifier
│   │   ├── tfidf.pkl         # Sublinear TF-IDF Vectorizer
│   │   ├── label_encoder.pkl # 30 Category Label Encoder
│   │   ├── shortlist_model.pkl # Gradient Boosting Decision Model
│   │   └── shortlist_meta.json # Model specs & feature weights
│   └── src/
│       ├── candidate_feature_extractor.py # 6-feature + project extraction
│       ├── groq_helper.py                # LLM JD enhancer & deep recruiter reports
│       ├── train_and_evaluate.py         # Baseline training script
│       └── train_modern_models.py        # Multi-stage training pipeline
│
├── frontend/                 # Next.js 14 Web Application
│   ├── src/
│   │   └── app/
│   │       ├── page.js       # Modern Landing Page (Jobply.ai aesthetic)
│   │       └── dashboard/    # Screener Workspace & Interactive Modals
│   ├── package.json
│   └── next.config.mjs
│
├── .gitignore                # Protects .env, node_modules, and cache
├── PROJECT_PLAN.md           # Project documentation & academic report
└── README.md
```

---

## 🛠️ Quickstart Guide

### Prerequisites
- Python 3.10+ / Conda
- Node.js 18+ & npm
- [Groq API Key](https://console.groq.com)

### 1. Backend Setup
```bash
# Navigate to backend
cd backend

# Create .env from template
cp .env.example .env
# Edit .env and paste your GROQ_API_KEY

# Install dependencies
pip install -r requirements.txt

# Start backend server
python -m uvicorn server:app --host 127.0.0.1 --port 8000 --reload
```
The backend API documentation is available at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup
```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 📊 Model Evaluation Summary

| Model Component | Algorithm | Dataset Size | Accuracy | ROC-AUC / F1 |
| :--- | :--- | :--- | :--- | :--- |
| **Domain Categorizer** | TF-IDF (1,2 n-grams) + Logistic Regression | 1,154 resumes (30 classes) | **99.43%** | 0.9942 (Weighted F1) |
| **Shortlist Engine** | Gradient Boosting Classifier | 30,000 candidate profiles | **90.62%** | 0.9665 (ROC-AUC) |

---

## 🔒 Security & Privacy
All sensitive credentials, API keys, and local environment files are managed through dedicated `.env` files and excluded from version control via `.gitignore`.
