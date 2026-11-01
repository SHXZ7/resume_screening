import re
from typing import Dict, Any

def extract_candidate_features(text: str, skill_match_score: float) -> Dict[str, Any]:
    """
    Extracts multi-dimensional recruitment features from raw candidate resume text
    matching the 30,000 candidate dataset schema:
    - years_experience (int)
    - skills_match_score (float 0-100)
    - education_level (str: 'PhD', 'Masters', 'Bachelors', 'High School')
    - education_num (int: 0 to 3)
    - project_count (int)
    - resume_length (int word count)
    - github_activity (int: estimated score based on repos/activity/links)
    """
    lower = text.lower()
    words = text.split()
    resume_length = len(words)

    # 1. Education Level
    edu_level = "Bachelors"
    edu_num = 1

    if any(k in lower for k in ["ph.d", "phd", "doctor of philosophy", "doctorate"]):
        edu_level = "PhD"
        edu_num = 3
    elif any(k in lower for k in ["master", "m.tech", "mtech", "m.s.", "ms in", "m.sc", "msc", "mba", "post graduate"]):
        edu_level = "Masters"
        edu_num = 2
    elif any(k in lower for k in ["bachelor", "b.tech", "btech", "b.e.", "be in", "b.s.", "bs in", "b.sc", "bsc", "bca"]):
        edu_level = "Bachelors"
        edu_num = 1
    elif any(k in lower for k in ["high school", "secondary school", "higher secondary"]):
        edu_level = "High School"
        edu_num = 0

    # 2. Years of Experience
    # Look for explicit statements like "X+ years", "X years of experience"
    exp_matches = re.findall(r'(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:experience|exp)', lower)
    if exp_matches:
        years_exp = max(int(m) for m in exp_matches)
    else:
        # Check date ranges (e.g. 2023 - 2026, 2024 - present)
        year_ranges = re.findall(r'(20\d\d)\s*[-–—to]+\s*(20\d\d|present|current)', lower)
        if year_ranges:
            total_span = 0
            for start_yr, end_yr in year_ranges:
                start_val = int(start_yr)
                end_val = 2026 if end_yr in ["present", "current"] else int(end_yr)
                span = max(0, end_val - start_val)
                total_span += span
            years_exp = min(15, max(1, total_span))
        else:
            # Check for internships or junior/student keywords
            if any(k in lower for k in ["intern", "student", "undergraduate", "pre-final"]):
                years_exp = 2
            else:
                years_exp = 3

    # 3. Project Count
    # Look for project section or count project titles
    project_indicators = [
        m.start() for m in re.finditer(r'(?:projects?|key projects?|academic projects?)', lower)
    ]
    # Count bullet items or numbered projects after project section
    project_count = 3  # sensible default
    if "projects" in lower:
        # Check occurrences of github links, project links or typical project bullets
        link_matches = len(re.findall(r'github\.com|link|project', lower))
        # Estimate between 2 and 7 projects
        project_count = min(8, max(2, int(len(re.findall(r'(\b[A-Z][a-zA-Z0-9_\-\+]{2,}\s*[-–—|]\s*)', text)) or 3)))

    # 4. GitHub Activity
    # Look for github link and presence of open source / repositories
    github_activity = 150  # baseline
    if "github.com" in lower:
        github_activity += 150
    if any(k in lower for k in ["hackathon", "winner", "open source", "contribution", "commits"]):
        github_activity += 120
    if any(k in lower for k in ["vercel", "deployed", "live", "portfolio"]):
        github_activity += 80

    return {
        "years_experience": years_exp,
        "skills_match_score": round(float(skill_match_score), 1),
        "education_level": edu_level,
        "education_num": edu_num,
        "project_count": project_count,
        "resume_length": resume_length,
        "github_activity": min(800, max(50, github_activity))
    }

def extract_projects_and_experience(text: str) -> Dict[str, Any]:
    """
    Parses specific project names, tech stacks, and work experience entries
    directly from resume text as an immediate local extraction.
    """
    projects = []
    experience = []
    
    # 1. Parse Projects
    proj_sec = re.search(
        r'(?:PROJECTS|KEY PROJECTS|ACADEMIC PROJECTS|PERSONAL PROJECTS)[\s\:\-]+(.*?)(?:SKILLS|EDUCATION|CERTIFICATES|EXPERIENCE|ACHIEVEMENTS|$)',
        text, re.DOTALL | re.IGNORECASE
    )
    if proj_sec:
        raw_proj = proj_sec.group(1).strip()
        lines = [l.strip() for l in raw_proj.split('\n') if l.strip()]
        current_proj = None
        for line in lines:
            is_bullet = line.startswith(('•', 'o', '-', '*', '○', ''))
            has_tech_hint = any(k in line.lower() for k in [
                'react', 'next', 'fastapi', 'python', 'node', 'app', 'platform',
                'system', 'dashboard', 'assistant', 'model', 'api', 'iot', 'commerce',
                'bot', 'tool', 'portal', 'pipeline', 'workflow', 'web'
            ])
            is_header = (('(' in line and ')' in line) or '–' in line or '—' in line or '|' in line or not is_bullet) and len(line) < 180 and has_tech_hint

            if is_header:
                if current_proj and current_proj.get('title'):
                    projects.append(current_proj)
                
                techs = []
                tech_match = re.search(r'\((.*?)\)', line)
                if tech_match:
                    techs = [t.strip() for t in tech_match.group(1).split(',') if t.strip()]
                
                clean_title = re.sub(r'\(.*?\)|\|.*$', '', line).strip(' •o-*○–—:')
                # Also strip trailing dates like January 2026 - March 2026
                clean_title = re.sub(r'(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}\s*[-–—to]+\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?[a-z]*\s*\d{4}', '', clean_title, flags=re.I).strip(' -–—|')
                current_proj = {
                    "title": clean_title,
                    "tech_stack": techs,
                    "highlights": []
                }
            elif current_proj:
                clean_line = re.sub(r'^[•o\-\*○]\s*', '', line).strip()
                if clean_line and len(clean_line) > 10:
                    current_proj["highlights"].append(clean_line)

        if current_proj and current_proj.get('title'):
            projects.append(current_proj)

    for p in projects:
        p["description"] = " ".join(p.pop("highlights", []))[:280]

    # 2. Parse Experience / Internships
    exp_sec = re.search(
        r'(?:WORK EXPERIENCE|EXPERIENCE|PROFESSIONAL EXPERIENCE|INTERNSHIPS)[\s\:\-]+(.*?)(?:PROJECTS|SKILLS|EDUCATION|CERTIFICATES|$)',
        text, re.DOTALL | re.IGNORECASE
    )
    if exp_sec:
        raw_exp = exp_sec.group(1).strip()
        lines = [l.strip() for l in raw_exp.split('\n') if l.strip()]
        current_exp = None
        for line in lines:
            if '|' in line or any(k in line.lower() for k in ['intern', 'engineer', 'developer', 'consultant', 'analyst', 'manager']):
                if current_exp and current_exp.get('title'):
                    experience.append(current_exp)
                parts = [p.strip() for p in line.split('|')]
                role = parts[0].strip(' •o-*○')
                company = parts[1].strip() if len(parts) > 1 else ""
                current_exp = {
                    "title": line.strip(' •o-*○'),
                    "role": role,
                    "company": company,
                    "highlights": []
                }
            elif current_exp:
                clean_line = re.sub(r'^[•o\-\*○]\s*', '', line).strip()
                if clean_line and len(clean_line) > 10:
                    current_exp["highlights"].append(clean_line)

        if current_exp and current_exp.get('title'):
            experience.append(current_exp)

    for e in experience:
        e["summary"] = " ".join(e.pop("highlights", []))[:220]

    return {
        "projects": projects[:6],
        "work_experience": experience[:5]
    }

