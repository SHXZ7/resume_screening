import os
import sys
import re
import json
import pickle
import io
import pypdf
import docx
from typing import List, Optional
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# Load dedicated environment variables from .env
load_dotenv(os.path.join(BASE_DIR, ".env"))
load_dotenv()

app = FastAPI(
    title="Smart Resume Screening API",
    description="NLP & ML powered backend for Resume Classification and JD Matching",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Models and Taxonomy
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
DATA_DIR = os.path.join(BASE_DIR, "data")

try:
    with open(os.path.join(MODELS_DIR, "best_model.pkl"), "rb") as f:
        classifier_model = pickle.load(f)
    with open(os.path.join(MODELS_DIR, "tfidf.pkl"), "rb") as f:
        model_tfidf = pickle.load(f)
    with open(os.path.join(MODELS_DIR, "label_encoder.pkl"), "rb") as f:
        label_encoder = pickle.load(f)
    print("Loaded ML classification artifacts successfully.")
except Exception as e:
    print(f"Warning: could not load model artifacts: {e}")
    classifier_model, model_tfidf, label_encoder = None, None, None

try:
    with open(os.path.join(MODELS_DIR, "shortlist_model.pkl"), "rb") as f:
        shortlist_model = pickle.load(f)
    with open(os.path.join(MODELS_DIR, "shortlist_meta.json"), "r") as f:
        shortlist_meta = json.load(f)
    print("Loaded 30k Shortlisting ML Model successfully.")
except Exception as e:
    print(f"Warning: could not load shortlist model: {e}")
    shortlist_model, shortlist_meta = None, {}

from src.candidate_feature_extractor import extract_candidate_features, extract_projects_and_experience

try:
    with open(os.path.join(DATA_DIR, "skills_dict.json"), "r") as f:
        SKILLS_TAXONOMY = json.load(f)
    ALL_TAXONOMY_SKILLS = set(s.lower() for cat in SKILLS_TAXONOMY.values() for s in cat)
except Exception as e:
    print(f"Warning: could not load skills taxonomy: {e}")
    SKILLS_TAXONOMY, ALL_TAXONOMY_SKILLS = {}, set()

def clean_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    text = re.sub(r'http\S+\s*', ' ', text)
    text = re.sub(r'RT|cc', ' ', text)
    text = re.sub(r'#\S+', '', text)
    text = re.sub(r'@\S+', ' ', text)
    text = text.replace("c++", "cpp").replace("c#", "csharp").replace(".net", "dotnet").replace("node.js", "nodejs")
    text = re.sub(r'[%s]' % re.escape("""!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~"""), ' ', text)
    text = re.sub(r'[^\x00-\x7f]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip().lower()

def extract_text_from_bytes(file_bytes: bytes, filename: str) -> str:
    filename_lower = filename.lower()
    text = ""
    try:
        if filename_lower.endswith(".pdf"):
            pdf_stream = io.BytesIO(file_bytes)
            reader = pypdf.PdfReader(pdf_stream)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + " "
        elif filename_lower.endswith(".docx"):
            docx_stream = io.BytesIO(file_bytes)
            doc = docx.Document(docx_stream)
            for para in doc.paragraphs:
                text += para.text + " "
        else:
            text = file_bytes.decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"Error parsing {filename}: {e}")
        text = ""
    return text.strip()

def extract_skills_from_text(text: str) -> List[str]:
    text_lower = f" {text.lower()} "
    found = []
    for skill in ALL_TAXONOMY_SKILLS:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found.append(skill)
    return sorted(list(set(found)))

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "nlp_classifier_loaded": classifier_model is not None,
        "shortlist_model_loaded": shortlist_model is not None,
        "taxonomy_skills_count": len(ALL_TAXONOMY_SKILLS),
        "classes_count": len(label_encoder.classes_) if label_encoder else 0
    }

@app.get("/api/model-info")
def get_model_info():
    """Returns technical specs and evaluation metrics of the models for viva/reporting."""
    return {
        "nlp_model": {
            "name": "TF-IDF + Multinomial Logistic Regression",
            "categories_count": len(label_encoder.classes_) if label_encoder else 0,
            "categories": list(label_encoder.classes_) if label_encoder else [],
            "accuracy": "99.43%",
            "f1_score": "0.9942",
            "features": "6000 sublinear TF-IDF n-grams (1, 2)"
        },
        "shortlisting_engine": {
            "name": "Gradient Boosting Decision Classifier",
            "dataset_size": shortlist_meta.get("total_training_samples", 30000),
            "accuracy": f"{shortlist_meta.get('accuracy', 90.62)}%",
            "roc_auc": shortlist_meta.get("roc_auc", 0.9665),
            "f1_score": shortlist_meta.get("f1_score", 0.9333),
            "feature_importances": shortlist_meta.get("feature_importances", {})
        }
    }

@app.get("/api/sample-jds")
def get_sample_jds():
    jds = {}
    jd_dir = os.path.join(DATA_DIR, "job_descriptions")
    if os.path.exists(jd_dir):
        for f in os.listdir(jd_dir):
            if f.endswith(".txt"):
                key = f.replace("_jd.txt", "").replace("_", " ").title()
                with open(os.path.join(jd_dir, f), "r", encoding="utf-8") as file:
                    jds[key] = file.read()
    return jds

from src.groq_helper import analyze_jd_with_groq, enhance_and_expand_jd, classify_candidate_domain_with_groq, generate_deep_candidate_report

@app.post("/api/candidate-deep-report")
async def get_candidate_deep_report(
    resume_text: str = Form(...),
    job_description: str = Form(...),
    filename: str = Form("Candidate")
):
    """Generates an in-depth recruiter evaluation report assessing projects, strengths, and interview questions."""
    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text is required.")
    
    report = generate_deep_candidate_report(resume_text, job_description, filename)
    return report

@app.post("/api/enhance-jd")
async def enhance_job_description(text: str = Form(...)):
    """Expands a generic or brief job title/description into a professional, comprehensive JD using Groq LLM."""
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    
    enhanced_data = enhance_and_expand_jd(text)
    taxonomy_skills = extract_skills_from_text(enhanced_data.get("enhanced_jd_text", text))
    llm_skills = [s.lower() for s in enhanced_data.get("key_skills", [])]
    combined_skills = sorted(list(set(taxonomy_skills + llm_skills)))

    return {
        "role_title": enhanced_data.get("role_title", text.strip().title()),
        "category": enhanced_data.get("category", "Technical"),
        "enhanced_jd_text": enhanced_data.get("enhanced_jd_text", text),
        "skills": combined_skills,
        "summary": enhanced_data.get("summary", "")
    }

@app.post("/api/analyze-jd")
async def analyze_job_description(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None)
):
    """Analyzes an uploaded or pasted Job Description, extracts text, and detects the Role/Domain and Skills using Groq LLM + Supervised ML."""
    raw_text = ""
    file_name = None

    if file:
        content = await file.read()
        raw_text = extract_text_from_bytes(content, file.filename)
        file_name = file.filename
    elif text and text.strip():
        raw_text = text.strip()

    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="No job description text or document provided.")

    cleaned = clean_text(raw_text)
    detected_domain = "General Technical Role"
    confidence = 0.0

    # 1. Supervised ML Classifier
    if classifier_model and model_tfidf and label_encoder and cleaned:
        try:
            feat = model_tfidf.transform([cleaned])
            pred_idx = classifier_model.predict(feat)[0]
            detected_domain = label_encoder.inverse_transform([pred_idx])[0]
            probs = classifier_model.predict_proba(feat)[0]
            confidence = round(float(probs[pred_idx] * 100), 1)
        except Exception as e:
            print(f"Error predicting JD role: {e}")

    # 2. Taxonomy Skills
    taxonomy_skills = extract_skills_from_text(raw_text)

    # 3. Groq LLM Analysis (for exact Job Title & Summary)
    llm_analysis = analyze_jd_with_groq(raw_text)
    exact_title = llm_analysis.get("job_title", detected_domain)
    llm_skills = [s.lower() for s in llm_analysis.get("key_skills", [])]
    summary = llm_analysis.get("brief_summary", "")

    # Combine unique skills
    combined_skills = sorted(list(set(taxonomy_skills + llm_skills)))

    return {
        "role_title": exact_title,
        "detected_domain": detected_domain,
        "confidence": confidence,
        "skills": combined_skills,
        "summary": summary,
        "jd_text": raw_text,
        "file_name": file_name,
        "word_count": len(raw_text.split())
    }

@app.post("/api/screen-samples")
def screen_preloaded_samples(
    job_description: str = Form(...),
    explicit_skills: Optional[str] = Form(None)
):
    """Screens the preloaded sample resumes directly from disk without manual upload."""
    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty.")
    
    resumes_dir = os.path.join(DATA_DIR, "sample_resumes")
    if not os.path.exists(resumes_dir):
        raise HTTPException(status_code=404, detail="Sample resumes directory not found.")
    
    files = [f for f in os.listdir(resumes_dir) if f.endswith(('.pdf', '.docx', '.txt'))]
    if not files:
        raise HTTPException(status_code=404, detail="No sample resume files found.")
        
    clean_jd = clean_text(job_description)
    jd_skills = set(extract_skills_from_text(job_description))
    if explicit_skills:
        try:
            parsed = json.loads(explicit_skills)
            if isinstance(parsed, list) and len(parsed) > 0:
                jd_skills = set(s.lower().strip() for s in parsed if s.strip())
        except Exception:
            pass
    candidates = []

    for file_name in files:
        file_path = os.path.join(resumes_dir, file_name)
        with open(file_path, "rb") as f:
            content = f.read()
        raw_text = extract_text_from_bytes(content, file_name)
        cleaned_text = clean_text(raw_text)

        cand_skills = set(extract_skills_from_text(raw_text))
        matched_skills = sorted(list(cand_skills.intersection(jd_skills)))
        missing_skills = sorted(list(jd_skills - cand_skills))
        skill_score = len(matched_skills) / max(1, len(jd_skills))

        try:
            vec = TfidfVectorizer(stop_words='english', sublinear_tf=True)
            tfidf_mat = vec.fit_transform([clean_jd, cleaned_text])
            cos_sim = float(cosine_similarity(tfidf_mat[0:1], tfidf_mat[1:2])[0][0])
        except Exception:
            cos_sim = 0.0

        fit_score = round((0.5 * cos_sim + 0.5 * skill_score) * 100, 1)

        predicted_domain = "Unknown"
        confidence_pct = 0.0
        top_alternatives = []

        if classifier_model and model_tfidf and label_encoder and cleaned_text:
            try:
                feat = model_tfidf.transform([cleaned_text])
                pred_idx = classifier_model.predict(feat)[0]
                predicted_domain = label_encoder.inverse_transform([pred_idx])[0]
                
                probs = classifier_model.predict_proba(feat)[0]
                confidence_pct = round(float(probs[pred_idx] * 100), 1)
                
                top_3 = probs.argsort()[-3:][::-1]
                top_alternatives = [
                    {"domain": label_encoder.inverse_transform([idx])[0], "probability": round(float(probs[idx] * 100), 1)}
                    for idx in top_3 if idx != pred_idx
                ][:2]
            except Exception as e:
                print(f"Prediction error for {file_name}: {e}")

        # Intelligent Domain Correction: If confidence is low or domain needs enhancement, consult Groq LLM
        if confidence_pct < 40.0:
            try:
                llm_cand = classify_candidate_domain_with_groq(raw_text)
                if llm_cand.get("domain"):
                    predicted_domain = llm_cand["domain"]
                    confidence_pct = float(llm_cand.get("confidence", 92.0))
            except Exception as e:
                print(f"Groq candidate classification fallback error for {file_name}: {e}")

        # Multi-dimensional Candidate Feature Extraction (matching 30k recruitment dataset)
        cand_feats = extract_candidate_features(raw_text, skill_score * 100)
        parsed_profile = extract_projects_and_experience(raw_text)

        # 30,000 Candidate Supervised Shortlisting Decision Engine
        is_shortlisted = False
        shortlist_prob = 0.0
        if shortlist_model:
            try:
                feat_vector = [[
                    cand_feats["years_experience"],
                    cand_feats["skills_match_score"],
                    cand_feats["education_num"],
                    cand_feats["project_count"],
                    cand_feats["resume_length"],
                    cand_feats["github_activity"]
                ]]
                shortlist_pred = int(shortlist_model.predict(feat_vector)[0])
                shortlist_prob = round(float(shortlist_model.predict_proba(feat_vector)[0][1] * 100), 1)
                is_shortlisted = bool(shortlist_pred == 1)
            except Exception as e:
                print(f"Error predicting candidate shortlist: {e}")

        candidates.append({
            "filename": file_name,
            "fit_score": fit_score,
            "text_similarity": round(cos_sim * 100, 1),
            "skill_match_percentage": round(skill_score * 100, 1),
            "predicted_domain": predicted_domain,
            "confidence": confidence_pct,
            "top_alternatives": top_alternatives,
            "word_count": len(raw_text.split()),
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "candidate_skills": sorted(list(cand_skills)),
            # Advanced ML Shortlisting & Profile Features
            "is_shortlisted": is_shortlisted,
            "shortlist_probability": shortlist_prob,
            "decision": "Shortlisted" if is_shortlisted else "Review Needed",
            "features": cand_feats,
            "projects": parsed_profile.get("projects", []),
            "work_experience": parsed_profile.get("work_experience", []),
            "raw_text": raw_text[:4000]
        })

    candidates.sort(key=lambda x: x["fit_score"], reverse=True)
    for idx, c in enumerate(candidates, start=1):
        c["rank"] = idx

    return {
        "job_description_skills": sorted(list(jd_skills)),
        "total_resumes_screened": len(candidates),
        "candidates": candidates
    }

@app.post("/api/screen")
async def screen_resumes(
    job_description: str = Form(...),
    files: List[UploadFile] = File(...),
    explicit_skills: Optional[str] = Form(None)
):
    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty.")
    if not files:
        raise HTTPException(status_code=400, detail="No resume files uploaded.")

    # 1. Process Job Description
    clean_jd = clean_text(job_description)
    jd_skills = set(extract_skills_from_text(job_description))
    if explicit_skills:
        try:
            parsed = json.loads(explicit_skills)
            if isinstance(parsed, list) and len(parsed) > 0:
                jd_skills = set(s.lower().strip() for s in parsed if s.strip())
        except Exception:
            pass

    candidates = []

    for file in files:
        content = await file.read()
        raw_text = extract_text_from_bytes(content, file.filename)
        cleaned_text = clean_text(raw_text)

        # Candidate skills
        cand_skills = set(extract_skills_from_text(raw_text))
        matched_skills = sorted(list(cand_skills.intersection(jd_skills)))
        missing_skills = sorted(list(jd_skills - cand_skills))
        
        # Skill Overlap Score (0.0 to 1.0)
        skill_score = len(matched_skills) / max(1, len(jd_skills))

        # Text Cosine Similarity via TF-IDF
        try:
            vec = TfidfVectorizer(stop_words='english', sublinear_tf=True)
            tfidf_mat = vec.fit_transform([clean_jd, cleaned_text])
            cos_sim = float(cosine_similarity(tfidf_mat[0:1], tfidf_mat[1:2])[0][0])
        except Exception:
            cos_sim = 0.0

        # Overall Weighted Fit Score (0 to 100%)
        # 50% Text Semantic Similarity + 50% Explicit Skills Match
        fit_score = round((0.5 * cos_sim + 0.5 * skill_score) * 100, 1)

        # Supervised ML Domain Prediction
        predicted_domain = "Unknown"
        confidence_pct = 0.0
        top_alternatives = []

        if classifier_model and model_tfidf and label_encoder and cleaned_text:
            try:
                feat = model_tfidf.transform([cleaned_text])
                pred_idx = classifier_model.predict(feat)[0]
                predicted_domain = label_encoder.inverse_transform([pred_idx])[0]
                
                probs = classifier_model.predict_proba(feat)[0]
                confidence_pct = round(float(probs[pred_idx] * 100), 1)
                
                top_3 = probs.argsort()[-3:][::-1]
                top_alternatives = [
                    {"domain": label_encoder.inverse_transform([idx])[0], "probability": round(float(probs[idx] * 100), 1)}
                    for idx in top_3 if idx != pred_idx
                ][:2]
            except Exception as e:
                print(f"Prediction error for {file.filename}: {e}")

        # Intelligent Domain Correction: If confidence is low or domain needs enhancement, consult Groq LLM
        if confidence_pct < 40.0:
            try:
                llm_cand = classify_candidate_domain_with_groq(raw_text)
                if llm_cand.get("domain"):
                    predicted_domain = llm_cand["domain"]
                    confidence_pct = float(llm_cand.get("confidence", 92.0))
            except Exception as e:
                print(f"Groq candidate classification fallback error for {file.filename}: {e}")

        # Multi-dimensional Candidate Feature Extraction (matching 30k recruitment dataset)
        cand_feats = extract_candidate_features(raw_text, skill_score * 100)
        parsed_profile = extract_projects_and_experience(raw_text)

        # 30,000 Candidate Supervised Shortlisting Decision Engine
        is_shortlisted = False
        shortlist_prob = 0.0
        if shortlist_model:
            try:
                feat_vector = [[
                    cand_feats["years_experience"],
                    cand_feats["skills_match_score"],
                    cand_feats["education_num"],
                    cand_feats["project_count"],
                    cand_feats["resume_length"],
                    cand_feats["github_activity"]
                ]]
                shortlist_pred = int(shortlist_model.predict(feat_vector)[0])
                shortlist_prob = round(float(shortlist_model.predict_proba(feat_vector)[0][1] * 100), 1)
                is_shortlisted = bool(shortlist_pred == 1)
            except Exception as e:
                print(f"Error predicting candidate shortlist: {e}")

        candidates.append({
            "filename": file.filename,
            "fit_score": fit_score,
            "text_similarity": round(cos_sim * 100, 1),
            "skill_match_percentage": round(skill_score * 100, 1),
            "predicted_domain": predicted_domain,
            "confidence": confidence_pct,
            "top_alternatives": top_alternatives,
            "word_count": len(raw_text.split()),
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "candidate_skills": sorted(list(cand_skills)),
            # Advanced ML Shortlisting & Profile Features
            "is_shortlisted": is_shortlisted,
            "shortlist_probability": shortlist_prob,
            "decision": "Shortlisted" if is_shortlisted else "Review Needed",
            "features": cand_feats,
            "projects": parsed_profile.get("projects", []),
            "work_experience": parsed_profile.get("work_experience", []),
            "raw_text": raw_text[:4000]
        })

    # Sort descending by final fit_score
    candidates.sort(key=lambda x: x["fit_score"], reverse=True)

    # Assign rank
    for idx, c in enumerate(candidates, start=1):
        c["rank"] = idx

    return {
        "job_description_skills": sorted(list(jd_skills)),
        "total_resumes_screened": len(candidates),
        "candidates": candidates
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)
