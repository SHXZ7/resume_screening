import os
import re
import pickle
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.multiclass import OneVsRestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report, confusion_matrix

def clean_text(text: str) -> str:
    """Enhanced cleaner preserving technical keywords like c++, c#, .net, node.js."""
    if not isinstance(text, str):
        return ""
    text = re.sub(r'http\S+\s*', ' ', text)  # remove URLs
    text = re.sub(r'RT|cc', ' ', text)  # remove RT and cc
    text = re.sub(r'#\S+', '', text)  # remove hashtags
    text = re.sub(r'@\S+', ' ', text)  # remove mentions
    # Preserve compound words like c++, c#, .net, node.js before stripping punctuation
    text = text.replace("c++", "cpp").replace("c#", "csharp").replace(".net", "dotnet").replace("node.js", "nodejs")
    text = re.sub(r'[%s]' % re.escape("""!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~"""), ' ', text)  # remove punctuations
    text = re.sub(r'[^\x00-\x7f]', ' ', text)  # remove non-ASCII chars
    text = re.sub(r'\s+', ' ', text)  # remove extra whitespace
    return text.strip().lower()

def run_pipeline():
    print("=" * 60)
    print("NLP RESUME CLASSIFICATION & BENCHMARK PIPELINE (POLISHED)")
    print("=" * 60)
    
    # 1. Load Data
    data_path = os.path.join("data", "UpdatedResumeDataSet.csv")
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at {data_path}")
    
    df = pd.read_csv(data_path)
    print(f"\n[1] Loaded Dataset: {df.shape[0]} samples, {df['Category'].nunique()} categories.")
    
    # 2. Text Preprocessing
    print("\n[2] Preprocessing and cleaning text with technical term preservation...")
    df['Cleaned_Resume'] = df['Resume'].apply(clean_text)

    # 3. Label Encoding
    le = LabelEncoder()
    df['Category_Encoded'] = le.fit_transform(df['Category'])
    
    # 4. Train-Test Split (Stratified 80/20)
    X = df['Cleaned_Resume'].values
    y = df['Category_Encoded'].values
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"\n[3] Train/Test Split: {len(X_train)} training samples, {len(X_test)} testing samples.")

    # 5. Polished TF-IDF Vectorization with N-Grams (1, 2)
    print("\n[4] Fitting Polished TF-IDF Vectorizer with Unigrams + Bigrams (1, 2)...")
    tfidf = TfidfVectorizer(
        sublinear_tf=True,
        stop_words='english',
        ngram_range=(1, 2),
        max_features=5000
    )
    X_train_tfidf = tfidf.fit_transform(X_train)
    X_test_tfidf = tfidf.transform(X_test)
    print(f"    TF-IDF Feature Space: {X_train_tfidf.shape[1]} n-gram features")

    # 6. Multi-Model Benchmark
    print("\n[5] Training and Benchmarking 3 Candidate Models...")
    models = {
        "Multinomial Naive Bayes": MultinomialNB(alpha=0.1),
        "OneVsRest + KNeighbors": OneVsRestClassifier(KNeighborsClassifier(n_neighbors=5)),
        "Logistic Regression": LogisticRegression(max_iter=1000, C=2.0, class_weight='balanced', random_state=42)
    }

    results = []
    trained_models = {}

    for name, model in models.items():
        print(f"    --> Training {name}...")
        model.fit(X_train_tfidf, y_train)
        y_pred = model.predict(X_test_tfidf)
        
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, average='weighted', zero_division=0)
        rec = recall_score(y_test, y_pred, average='weighted', zero_division=0)
        f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
        
        results.append({
            "Model": name,
            "Accuracy": acc,
            "Precision": prec,
            "Recall": rec,
            "F1-Score": f1
        })
        trained_models[name] = (model, y_pred)

    # 7. Comparison Summary Table
    results_df = pd.DataFrame(results)
    print("\n" + "=" * 60)
    print("MODEL BENCHMARK RESULTS")
    print("=" * 60)
    print(results_df.to_string(index=False, formatters={
        'Accuracy': '{:.4f}'.format,
        'Precision': '{:.4f}'.format,
        'Recall': '{:.4f}'.format,
        'F1-Score': '{:.4f}'.format
    }))

    # Select Best Model based on F1-Score
    best_row = results_df.sort_values(by="F1-Score", ascending=False).iloc[0]
    best_name = best_row["Model"]
    best_model, best_pred = trained_models[best_name]
    print(f"\nWinning Model: {best_name} with Accuracy = {best_row['Accuracy']*100:.2f}% and F1 = {best_row['F1-Score']:.4f}")

    # 8. Detailed Classification Report for Winning Model
    print("\n" + "=" * 60)
    print(f"CLASSIFICATION REPORT FOR BEST MODEL: {best_name}")
    print("=" * 60)
    report = classification_report(y_test, best_pred, target_names=le.classes_, zero_division=0)
    print(report)

    # 9. Confusion Matrix Heatmap
    os.makedirs("reports", exist_ok=True)
    cm = confusion_matrix(y_test, best_pred)
    plt.figure(figsize=(14, 10))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=le.classes_, yticklabels=le.classes_)
    plt.title(f"Confusion Matrix: {best_name} (Acc: {best_row['Accuracy']*100:.1f}%)", fontsize=14)
    plt.xlabel("Predicted Category", fontsize=12)
    plt.ylabel("Actual Category", fontsize=12)
    plt.xticks(rotation=45, ha='right', fontsize=9)
    plt.yticks(fontsize=9)
    plt.tight_layout()
    cm_path = os.path.join("reports", "confusion_matrix.png")
    plt.savefig(cm_path, dpi=300)
    plt.close()
    print(f"[6] Saved Confusion Matrix visualization to: {cm_path}")

    # 10. Save Model Artifacts
    os.makedirs("models", exist_ok=True)
    with open(os.path.join("models", "best_model.pkl"), "wb") as f:
        pickle.dump(best_model, f)
    with open(os.path.join("models", "tfidf.pkl"), "wb") as f:
        pickle.dump(tfidf, f)
    with open(os.path.join("models", "label_encoder.pkl"), "wb") as f:
        pickle.dump(le, f)
    print("[7] Saved best model and vectorizers into models/ directory.")

    # 11. Sanity Test on Unseen Resumes
    print("\n" + "=" * 60)
    print("SANITY TEST ON SAMPLE RESUME EXCERPTS")
    print("=" * 60)
    test_samples = [
        ("Data Science Sample", "Experienced in machine learning, deep learning, PyTorch, Scikit-learn, regression models, neural networks, data analysis, pandas numpy sql visualization."),
        ("Web Development Sample", "Full stack web developer experienced in JavaScript, React, HTML5, CSS3, Node.js, Express, Redux, frontend responsive UI design."),
        ("Java Developer Sample", "Java developer with experience in Core Java, Spring Boot, Hibernate, microservices architecture, RESTful web services, multithreading, and Oracle DB.")
    ]

    for label, text in test_samples:
        cleaned = clean_text(text)
        vec = tfidf.transform([cleaned])
        pred_idx = best_model.predict(vec)[0]
        pred_label = le.inverse_transform([pred_idx])[0]
        
        # If model supports predict_proba
        confidence_str = ""
        if hasattr(best_model, "predict_proba"):
            probs = best_model.predict_proba(vec)[0]
            confidence_str = f" (Confidence: {probs[pred_idx]*100:.1f}%)"
        print(f"[{label}] -> Predicted: '{pred_label}'{confidence_str}")

    print("\nBenchmark and evaluation successfully completed!")

if __name__ == "__main__":
    run_pipeline()
