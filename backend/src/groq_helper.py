import os
import json
from dotenv import load_dotenv
from groq import Groq

# Load environment variables from .env
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_PRIMARY_MODEL", "openai/gpt-oss-120b")
GROQ_FALLBACK_MODEL = os.getenv("GROQ_FALLBACK_MODEL", "qwen/qwen3.8-27b")

def analyze_jd_with_groq(jd_text: str):
    client = Groq(api_key=GROQ_API_KEY)
    prompt = f"""
    Analyze the following Job Description.
    Extract the following in strictly valid JSON format:
    {{
        "job_title": "Extracted exact job title/role",
        "category": "Broad career domain (e.g. Data Science, Web Development, DevOps, etc.)",
        "key_skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
        "brief_summary": "1-sentence summary of what this role is looking for"
    }}

    Job Description:
    {jd_text[:2000]}
    """
    
    # Try models in order of capability
    for model_name in ["openai/gpt-oss-120b", "qwen/qwen3.8-27b", "openai/gpt-oss-20b"]:
        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1
            )
            content = response.choices[0].message.content
            # Clean possible markdown fences
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            data = json.loads(content)
            data["model_used"] = model_name
            return data
        except Exception as e:
            print(f"Error with model {model_name}: {e}")
            continue

    return {
        "job_title": "Custom Role",
        "category": "Technical",
        "key_skills": [],
        "brief_summary": "Job description analyzed",
        "model_used": "fallback"
    }

def enhance_and_expand_jd(raw_input: str) -> dict:
    """Expands a generic or brief job description into a high-standard, structured JD with explicit skills."""
    client = Groq(api_key=GROQ_API_KEY)
    prompt = f"""
    You are an elite Technical Recruiter and Hiring Manager.
    The user entered this role or brief job description:
    "{raw_input.strip()}"

    Task:
    Expand and refine this into a comprehensive, industry-grade technical Job Description.
    Include Job Overview, Key Responsibilities, Technical Stack/Skills, and Qualifications.

    Return STRICTLY a JSON object with this exact structure:
    {{
        "role_title": "Exact specific title (e.g. Full Stack Software Engineer)",
        "category": "Domain (e.g. Web Development, Data Science, DevOps, Java Developer)",
        "enhanced_jd_text": "Complete formatted job description with overview, responsibilities, and qualifications",
        "key_skills": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6"],
        "summary": "1-sentence executive summary of the role"
    }}
    """

    for model_name in ["openai/gpt-oss-120b", "qwen/qwen3.8-27b", "openai/gpt-oss-20b"]:
        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2
            )
            content = response.choices[0].message.content
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            data = json.loads(content)
            data["model_used"] = model_name
            return data
        except Exception as e:
            print(f"Error enhancing JD with {model_name}: {e}")
            continue

    return {
        "role_title": raw_input.strip().title(),
        "category": "Software Development",
        "enhanced_jd_text": f"Job Title: {raw_input.strip().title()}\nResponsibilities: Design, develop, test, and deploy scalable software systems.\nRequired Skills: Programming, Data Structures, Git, Problem Solving.",
        "key_skills": ["python", "git", "sql"],
        "summary": f"Seeking a skilled {raw_input.strip().title()} to join our engineering team.",
        "model_used": "fallback"
    }

def classify_candidate_domain_with_groq(resume_text: str) -> dict:
    """Accurately identifies candidate domain/role (e.g. Full Stack Developer, Frontend Developer, Data Engineer) using Groq LLM."""
    client = Groq(api_key=GROQ_API_KEY)
    prompt = f"""
    Analyze this candidate's resume:
    \"\"\"{resume_text[:2500]}\"\"\"

    Task:
    Identify the candidate's primary professional domain or job role title (e.g. Full Stack Developer, Frontend Developer, Backend Developer, Data Engineer, AI/ML Engineer, DevOps Engineer, Mobile Developer, etc.).
    
    Return STRICTLY JSON:
    {{
        "domain": "Detected Role Title (e.g. Full Stack Developer)",
        "confidence": 94.0
    }}
    """
    for model_name in ["openai/gpt-oss-120b", "qwen/qwen3.8-27b", "openai/gpt-oss-20b"]:
        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1
            )
            content = response.choices[0].message.content
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            data = json.loads(content)
            return data
        except Exception:
            continue
    return {"domain": "Software Engineer", "confidence": 88.0}

def generate_deep_candidate_report(resume_text: str, jd_text: str, candidate_filename: str) -> dict:
    """Generates an in-depth recruiter evaluation report analyzing projects, tech stack, strengths, and technical interview questions."""
    client = Groq(api_key=GROQ_API_KEY)
    prompt = f"""
    You are an elite Senior Staff Engineering Hiring Manager and Technical Recruiter.
    Evaluate the candidate's resume thoroughly against the target Job Description. Focus especially on their real-world projects and hands-on experience.

    Target Job Description:
    \"\"\"{jd_text[:1800]}\"\"\"

    Candidate Resume ({candidate_filename}):
    \"\"\"{resume_text[:2800]}\"\"\"

    Task:
    Provide an in-depth, structured candidate assessment in STRICT JSON:
    {{
        "projects": [
            {{
                "title": "Project Name",
                "tech_stack": ["Tech1", "Tech2"],
                "description": "2-sentence summary of architecture and impact",
                "jd_relevance": "High / Medium / Low - specific reason why it matches or differs from the JD"
            }}
        ],
        "work_experience": [
            {{
                "role": "Job / Internship Title",
                "company": "Organization Name",
                "duration": "Dates / Duration",
                "summary": "Key achievement or responsibility"
            }}
        ],
        "recruiter_evaluation": {{
            "overall_verdict": "2-3 sentence executive assessment of candidate fit and readiness",
            "key_strengths": [
                "Strength 1 with specific evidence from projects",
                "Strength 2 with specific evidence",
                "Strength 3 with specific evidence"
            ],
            "project_alignment_analysis": "Detailed analysis of how the candidate's projects demonstrate hands-on competence for this exact role",
            "technical_interview_questions": [
                "Specific deep technical question based on their project",
                "Specific question probing architectural trade-offs or scalability",
                "Question addressing any missing stack requirement"
            ]
        }}
    }}
    """

    for model_name in ["openai/gpt-oss-120b", "qwen/qwen3.8-27b", "openai/gpt-oss-20b"]:
        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1
            )
            content = response.choices[0].message.content
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            data = json.loads(content)
            return data
        except Exception as e:
            print(f"Error generating deep report with {model_name}: {e}")
            continue

    return {
        "projects": [],
        "work_experience": [],
        "recruiter_evaluation": {
            "overall_verdict": "Candidate matches core technical requirements. Review detailed project portfolio.",
            "key_strengths": ["Hands-on software development experience", "Relevant technical stack competence"],
            "project_alignment_analysis": "Projects demonstrate foundational alignment with the role.",
            "technical_interview_questions": ["Walk through the architecture of your primary project."]
        }
    }


if __name__ == "__main__":
    sample = "software engineer"
    res = enhance_and_expand_jd(sample)
    print("Enhanced generic role 'software engineer':\n", json.dumps(res, indent=2))

