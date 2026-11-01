# Smart Resume Screener - Backend Service

FastAPI-powered machine learning and NLP backend service for automated resume screening, domain categorization, and candidate ranking.

## Directory Structure
```
backend/
├── .env                  # Environment secrets (IGNORED BY GIT)
├── .env.example          # Safe template for version control
├── .gitignore            # Backend gitignore rules
├── requirements.txt      # Python dependencies
├── server.py             # FastAPI main application & API routes
├── data/                 # Datasets & skills taxonomy
├── models/               # Pretrained ML & Decision models
└── src/                  # ML modules, feature extractors, Groq LLM helper
```

## Setup & Running

1. **Activate Python Environment:**
   ```bash
   conda activate autoflow
   ```

2. **Configure Environment Variables:**
   ```bash
   cp .env.example .env
   # Add your GROQ_API_KEY inside .env
   ```

3. **Start Backend Server:**
   ```bash
   # From project root:
   python -m uvicorn backend.server:app --host 127.0.0.1 --port 8000 --reload
   
   # Or from backend/ directory:
   cd backend
   python -m uvicorn server:app --host 127.0.0.1 --port 8000 --reload
   ```

4. **Verify Health:**
   ```bash
   curl http://127.0.0.1:8000/api/health
   ```

