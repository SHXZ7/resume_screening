import os
import re
import json
import pickle
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import classification_report, accuracy_score, roc_auc_score, f1_score

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
os.makedirs(MODELS_DIR, exist_ok=True)

def clean_text(text: str) -> str:
    text = re.sub(r'http\S+\s*', ' ', text)
    text = re.sub(r'RT|cc', ' ', text)
    text = re.sub(r'#\S+', '', text)
    text = re.sub(r'@\S+', ' ', text)
    text = text.replace('C++', 'cpp').replace('c++', 'cpp')
    text = text.replace('.NET', 'dotnet').replace('.net', 'dotnet')
    text = text.replace('Node.js', 'nodejs').replace('node.js', 'nodejs')
    text = text.replace('Next.js', 'nextjs').replace('next.js', 'nextjs')
    text = text.replace('FastAPI', 'fastapi')
    text = re.sub(r'[%s]' % re.escape("""!"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~"""), ' ', text)
    text = re.sub(r'[^\x00-\x7f]', r' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip().lower()

# ==============================================================================
# 1. BUILD AUGMENTED MODERN NLP DATASET & TRAIN CATEGORIZER
# ==============================================================================
def train_modern_nlp_classifier():
    print("=" * 60)
    print("TRAINING MODEL 1: MODERN NLP RESUME CATEGORIZATION MODEL")
    print("=" * 60)

    base_csv = os.path.join(DATA_DIR, "UpdatedResumeDataSet.csv")
    if not os.path.exists(base_csv):
        raise FileNotFoundError(f"Base dataset not found at {base_csv}")

    df_base = pd.read_csv(base_csv)
    print(f"Loaded base Kaggle dataset: {df_base.shape[0]} resumes across {df_base['Category'].nunique()} categories.")

    # Modern Role Synthetics to address modern engineering tech stacks
    modern_roles_data = [
        # Full Stack Developer
        {
            "Category": "Full Stack Developer",
            "Resume": "Full Stack Developer proficient in React, Next.js, Node.js, Express, TypeScript, Python, PostgreSQL, MongoDB, Docker, REST APIs, Git, Tailwind CSS, building responsive web applications and scalable backend microservices."
        },
        {
            "Category": "Full Stack Developer",
            "Resume": "Full Stack Software Engineer with hands-on experience building production-grade full stack applications, REST APIs, and AI integrations. Proficient in Next.js, React Flow, FastAPI, Python, PostgreSQL, Supabase, Redis, BullMQ, and Docker."
        },
        {
            "Category": "Full Stack Developer",
            "Resume": "Software Engineering Intern. Built full-stack team management portal using Node.js, Express.js, MongoDB (MERN stack), React, TypeScript. Scaled FastAPI automation platform, automated job scheduling, CI/CD pipelines, Git workflows."
        },
        {
            "Category": "Full Stack Developer",
            "Resume": "MERN Stack Developer experienced in React.js, Redux, Node.js, Express.js, MongoDB, GraphQL, Next.js, HTML5, CSS3, JavaScript ES6+, RESTful APIs, Webpack, responsive UI/UX design, AWS EC2, S3 deployment."
        },
        {
            "Category": "Full Stack Developer",
            "Resume": "Full Stack Web Developer. Developed responsive web applications using Next.js, React, Tailwind CSS, Python FastAPI, PostgreSQL database modeling, Prisma ORM, user authentication JWT, OAuth2, automated testing Jest, Docker."
        },
        # Frontend Developer
        {
            "Category": "Frontend Developer",
            "Resume": "Frontend Engineer specializing in React.js, Next.js, TypeScript, Tailwind CSS, Redux Toolkit, HTML5, CSS3, JavaScript ES6+, responsive UI design, web performance optimization, Figma to code, REST API integration, accessibility."
        },
        {
            "Category": "Frontend Developer",
            "Resume": "Senior Frontend Developer. Extensive experience building interactive single page applications using React, Vue.js, TypeScript, Next.js, state management, Vite, Storybook, component libraries, Shadcn UI, CSS Grid, mobile first design."
        },
        {
            "Category": "Frontend Developer",
            "Resume": "Frontend Developer with 3+ years experience designing dynamic web dashboards, interactive UI components using React, Next.js, Tailwind CSS, JavaScript, HTML, CSS, client-side routing, cross-browser compatibility, Jest unit testing."
        },
        # Backend Developer
        {
            "Category": "Backend Developer",
            "Resume": "Backend Software Engineer experienced in Node.js, Python, FastAPI, Express.js, Go, PostgreSQL, MongoDB, Redis caching, microservices architecture, RESTful APIs, gRPC, Docker containerization, database indexing, system design."
        },
        {
            "Category": "Backend Developer",
            "Resume": "Backend Developer proficient in Python, Django, FastAPI, PostgreSQL, MySQL, Redis, Celery background tasks, RabbitMQ, Docker, API authentication OAuth, data validation Pydantic, unit testing, AWS cloud infrastructure."
        },
        # Data Engineer
        {
            "Category": "Data Engineer",
            "Resume": "Data Engineer with experience building and orchestrating end-to-end ETL pipelines using Python, Apache Airflow, PostgreSQL, Apache Spark, Parquet, data transformation workflows, SQL data modeling, data warehousing Snowflake, BigQuery."
        },
        {
            "Category": "Data Engineer",
            "Resume": "Data Engineering Intern. Built and orchestrated ETL pipelines using Python, Apache Airflow, PostgreSQL for structured data ingestion. Designed data transformation workflows converting raw CSV to Parquet Bronze Silver Gold architecture, automated schema validation."
        },
        {
            "Category": "Data Engineer",
            "Resume": "Senior Data Engineer specializing in PySpark, Apache Airflow, Kafka real-time streaming, SQL, ETL pipeline design, AWS S3, Redshift data lakehouse, dbt data modeling, automated data quality testing."
        },
        # AI / ML Engineer
        {
            "Category": "AI / ML Engineer",
            "Resume": "AI Engineer and Machine Learning Developer. Experienced in LLM integrations, Retrieval-Augmented Generation RAG pipelines, LangChain, LlamaIndex, vector databases FAISS, Qdrant, OpenAI APIs, PyTorch, Hugging Face transformers, prompt engineering."
        },
        {
            "Category": "AI / ML Engineer",
            "Resume": "Machine Learning Engineer with experience developing computer vision and NLP models, XGBoost, Scikit-learn, PyTorch, TensorFlow, MLflow model tracking, FastAPI model serving, vector embeddings, fine-tuning LLMs, Docker."
        },
        {
            "Category": "AI / ML Engineer",
            "Resume": "AI Software Engineer building autonomous agent platforms, multi-turn LLM tool use, Qdrant vector RAG layer, Python, PyTorch, Scikit-learn predictive maintenance, Random Forest, XGBoost fault classifiers, FastAPI REST endpoints."
        },
    ]

    # Replicate synthetic modern examples to give balanced weight
    df_modern = pd.DataFrame(modern_roles_data * 12)
    df_combined = pd.concat([df_base[["Category", "Resume"]], df_modern], ignore_index=True)
    print(f"Total training corpus: {df_combined.shape[0]} resumes across {df_combined['Category'].nunique()} categories.")

    df_combined["cleaned_resume"] = df_combined["Resume"].apply(clean_text)

    from sklearn.preprocessing import LabelEncoder
    le = LabelEncoder()
    df_combined["target"] = le.fit_transform(df_combined["Category"])

    X_train, X_test, y_train, y_test = train_test_split(
        df_combined["cleaned_resume"], df_combined["target"],
        test_size=0.15, random_state=42, stratify=df_combined["target"]
    )

    tfidf = TfidfVectorizer(
        sublinear_tf=True,
        ngram_range=(1, 2),
        max_features=6000,
        stop_words='english'
    )
    X_train_vec = tfidf.fit_transform(X_train)
    X_test_vec = tfidf.transform(X_test)

    clf = LogisticRegression(max_iter=1000, C=2.0, class_weight='balanced', random_state=42)
    clf.fit(X_train_vec, y_train)

    y_pred = clf.predict(X_test_vec)
    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average='weighted')
    print(f"Modern NLP Classifier Accuracy: {acc * 100:.2f}%, Weighted F1: {f1:.4f}")

    with open(os.path.join(MODELS_DIR, "best_model.pkl"), "wb") as f:
        pickle.dump(clf, f)
    with open(os.path.join(MODELS_DIR, "tfidf.pkl"), "wb") as f:
        pickle.dump(tfidf, f)
    with open(os.path.join(MODELS_DIR, "label_encoder.pkl"), "wb") as f:
        pickle.dump(le, f)
    print("Saved modern NLP classifier artifacts to models/ directory.")


# ==============================================================================
# 2. TRAIN 30,000 CANDIDATE SHORTLISTING DECISION MODEL
# ==============================================================================
def train_candidate_shortlisting_model():
    print("\n" + "=" * 60)
    print("TRAINING MODEL 2: 30,000 CANDIDATE SHORTLISTING DECISION ENGINE")
    print("=" * 60)

    screening_csv = os.path.join(DATA_DIR, "ai_resume_screening.csv")
    if not os.path.exists(screening_csv):
        raise FileNotFoundError(f"Screening dataset not found at {screening_csv}")

    df = pd.read_csv(screening_csv)
    print(f"Loaded screening dataset: {df.shape[0]} candidate profiles.")

    edu_map = {"High School": 0, "Bachelors": 1, "Masters": 2, "PhD": 3}
    df["education_num"] = df["education_level"].map(edu_map)
    df["shortlisted_num"] = (df["shortlisted"] == "Yes").astype(int)

    feature_cols = [
        "years_experience",
        "skills_match_score",
        "education_num",
        "project_count",
        "resume_length",
        "github_activity"
    ]

    X = df[feature_cols]
    y = df["shortlisted_num"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    gb = GradientBoostingClassifier(
        n_estimators=180,
        learning_rate=0.08,
        max_depth=4,
        subsample=0.85,
        random_state=42
    )
    gb.fit(X_train, y_train)

    preds = gb.predict(X_test)
    probs = gb.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, preds)
    roc_auc = roc_auc_score(y_test, probs)
    f1 = f1_score(y_test, preds)

    print(f"Shortlist Classifier -> Accuracy: {acc * 100:.2f}%, ROC-AUC: {roc_auc:.4f}, F1: {f1:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, preds, target_names=["Not Shortlisted", "Shortlisted"]))

    # Feature Importances
    importances = {f: round(float(imp), 4) for f, imp in zip(feature_cols, gb.feature_importances_)}
    print("Feature Importances:", importances)

    # Save Model and Metadata
    with open(os.path.join(MODELS_DIR, "shortlist_model.pkl"), "wb") as f:
        pickle.dump(gb, f)

    meta = {
        "model_type": "GradientBoostingClassifier",
        "total_training_samples": len(df),
        "accuracy": round(float(acc * 100), 2),
        "roc_auc": round(float(roc_auc), 4),
        "f1_score": round(float(f1), 4),
        "feature_names": feature_cols,
        "feature_importances": importances,
        "education_mapping": edu_map
    }

    with open(os.path.join(MODELS_DIR, "shortlist_meta.json"), "w") as f:
        json.dump(meta, f, indent=2)

    print("Saved shortlist model and metadata to models/shortlist_model.pkl and shortlist_meta.json.")


if __name__ == "__main__":
    train_modern_nlp_classifier()
    train_candidate_shortlisting_model()
    print("\n>>> ALL MODELS TRAINED AND SAVED SUCCESSFULLY! <<<")

