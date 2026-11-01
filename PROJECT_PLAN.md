# Smart Resume Screening (NLP) — Project Implementation Plan
**B.Tech Minor Degree in Machine Learning | Academic Year 2025–26**
**Team Members:** Fariz Hasan (S7 ME), Adarsh J (S7 ECE), Mohd Shaaz (S7 ECE)

---

## 1. Project Overview & Objectives
**Problem Statement:**
Recruiters and HR teams face high volumes of candidate resumes. Manual screening is slow, inconsistent, and prone to human oversight.

**Objective:**
Develop an intelligent end-to-end NLP-driven Resume Screening system that parses unstructured resumes (PDF/DOCX), extracts key entities (skills, experience, education), calculates a multi-dimensional match score against a target Job Description (JD), and ranks candidates with an intuitive interactive Streamlit dashboard.

---

## 2. System Architecture & Modular Pipeline

```
  ┌─────────────────┐       ┌─────────────────┐
  │  Resume Upload  │       │ Job Description │
  │ (PDF/DOCX/Text) │       │   (Text/File)   │
  └────────┬────────┘       └────────┬────────┘
           │                         │
           ▼                         ▼
┌─────────────────────┐   ┌─────────────────────┐
│  Text Extraction    │   │  Text Extraction    │
│ (pdfplumber/docx2txt│   │  & Normalization    │
└──────────┬──────────┘   └──────────┬──────────┘
           │                         │
           ▼                         ▼
┌─────────────────────┐   ┌─────────────────────┐
│   NLP Preprocessing │   │   NLP Preprocessing │
│ (Clean, Tokenize,   │   │ (Clean, Stopwords,  │
│  Lemmatize, spaCy)  │   │  Lemmatization)     │
└──────────┬──────────┘   └──────────┬──────────┘
           │                         │
           ├─────────────────────────┤
           ▼                         ▼
┌─────────────────────┐   ┌─────────────────────┐
│  Entity & Skill     │   │ Key Requirements    │
│  Extraction         │   │ Skill Extraction    │
└──────────┬──────────┘   └──────────┬──────────┘
           │                         │
           └────────────┬────────────┘
                        ▼
┌───────────────────────────────────────────────┐
│ Feature Representation & Scoring Engine       │
│  - TF-IDF Vectorization + Cosine Similarity   │
│  - Semantic Embeddings (Sentence Transformers)│
│  - Skill Overlap / Weighted Fit Score         │
└───────────────────────┬───────────────────────┘
                        ▼
┌───────────────────────────────────────────────┐
│ Ranking & Analytics Engine                    │
│  - Overall Match Score (%)                    │
│  - Matched vs Missing Skills Breakdown        │
└───────────────────────┬───────────────────────┘
                        ▼
┌───────────────────────────────────────────────┐
│ Streamlit Interactive Dashboard UI            │
│  - Batch upload & instant ranking table       │
│  - Candidate detail drilldown & visual charts │
└───────────────────────────────────────────────┘
```

---

## 3. Technology Stack

| Layer | Tools & Libraries | Purpose |
|---|---|---|
| **Programming Language** | Python 3.10+ | Primary development language |
| **Document Parsing** | `pdfplumber`, `pypdf`, `python-docx` | Extracting raw text from various resume formats |
| **NLP & Text Processing** | `spaCy` (`en_core_web_sm`), `nltk`, `regex` | Tokenization, lemmatization, entity recognition, text cleaning |
| **Vectorization & Matching** | `scikit-learn` (`TfidfVectorizer`, `cosine_similarity`) | Statistical text representation & similarity scoring |
| **Semantic Embeddings** | `sentence-transformers` (`all-MiniLM-L6-v2`) | Deep semantic contextual matching |
| **Data Manipulation** | `pandas`, `numpy` | Dataframe handling, sorting, aggregation |
| **User Interface** | `Streamlit` | Modern web UI for file upload, ranking, and visualization |
| **Data Visualization** | `plotly` | Match score gauges, skill match radar/bar charts |

---

## 4. Phase-by-Phase Implementation Roadmap

### Phase 1: Environment Setup & Project Foundation
- [ ] Initialize Python environment and `requirements.txt`.
- [ ] Prepare curated datasets:
  - Sample Job Descriptions (e.g., Data Scientist, ML Engineer, Full-Stack Developer).
  - Diverse sample resumes in PDF/DOCX format.
- [ ] Build a predefined Skills Dictionary / Taxonomy (Programming, Frameworks, Cloud, Soft Skills).

### Phase 2: Document Ingestion & Text Preprocessing
- [ ] Build robust file extractor module (`src/extractor.py`) to parse `.pdf`, `.docx`, and `.txt`.
- [ ] Implement text cleaner (`src/preprocessor.py`):
  - Lowercasing, URL/email/phone stripping (regex), special character removal, whitespace normalization.
  - Stopword filtering and lemmatization.

### Phase 3: Information Extraction (Skills & Sections)
- [ ] Implement Skill Extractor (`src/skill_extractor.py`):
  - Match skills using token matching + phrase matcher with standard tech taxonomy.
  - Extract candidate details (name, contact info, education, years of experience heuristics).
- [ ] Identify gap analysis: **Matched Skills** vs. **Missing Skills**.

### Phase 4: Matching Algorithm & Scoring System
- [ ] **TF-IDF + Cosine Similarity**: Fast, explainable baseline matching resume text vs. job description.
- [ ] **Composite Match Score**:
  $$\text{Final Score} = w_1 \cdot \text{TF-IDF Cosine Score} + w_2 \cdot \text{Skill Overlap Ratio} + w_3 \cdot \text{Semantic Score}$$
- [ ] Generate candidate ranking order based on final score.

### Phase 5: Streamlit Web UI Application
- [ ] **Job Description Input**: Text box paste or file upload.
- [ ] **Batch Resume Upload**: Support uploading multiple resumes at once.
- [ ] **Ranked Leaderboard**: Sort candidates by overall score with progress bars.
- [ ] **Candidate Deep Dive**:
  - Breakdown of matched vs. missing skills.
  - Interactive radar or bar chart comparison.
  - Option to export shortlisted candidates to CSV.

### Phase 6: Evaluation & Academic Deliverables
- [ ] Evaluation with test set (ranking sanity, precision@k).
- [ ] Project report & presentation slides for B.Tech Minor submission.

---

## 5. Proposed Directory Structure

```
minor/
├── README.md
├── requirements.txt
├── app.py                      # Main Streamlit dashboard application
├── src/
│   ├── __init__.py
│   ├── extractor.py            # PDF/DOCX text extraction
│   ├── preprocessor.py         # Text cleaning and normalization
│   ├── skill_extractor.py      # Skill matching & entity extraction
│   ├── matcher.py              # TF-IDF, embeddings & scoring logic
│   └── utils.py                # Helper utilities & data loaders
├── data/
│   ├── sample_resumes/         # Sample PDF/DOCX resumes for testing
│   ├── job_descriptions/       # Sample job descriptions (.txt)
│   └── skills_dict.json        # Curated technical & domain skills database
└── tests/
    └── test_pipeline.py        # Unit tests for extraction & scoring
```
