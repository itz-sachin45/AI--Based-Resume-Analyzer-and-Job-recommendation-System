"""Scoring + matching engine.

All scores are computed from transparent rules (no randomness):
  * resume_score       -> 0..100 weighted checklist of resume completeness
  * job_match_score    -> % of job-required skills the resume contains
  * skill_gap          -> matched/missing skills vs a target career + readiness %
  * job_recommendations -> rank careers by readiness for the resume
"""
import re
from typing import Dict, List, Tuple

from .skills import canonicalize_skill, extract_skills


# ----------------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------------
def _alternatives(item: str) -> List[str]:
    """A required skill may be 'Java/Python' meaning Java OR Python.
    Split on '/' and canonicalize each alternative."""
    parts = [p.strip() for p in item.split("/")]
    canon = []
    for p in parts:
        c = canonicalize_skill(p) or p
        canon.append(c)
    return canon


def _is_group_matched(item: str, user_skills: set) -> bool:
    """True if any alternative of `item` (already canonical) is in user_skills."""
    for alt in _alternatives(item):
        if alt in user_skills:
            return True
    return False


def _round(x: float, nd: int = 1) -> float:
    return round(float(x), nd)


# ----------------------------------------------------------------------
# Resume score (0-100) — weighted completeness checklist
# ----------------------------------------------------------------------
def resume_score(parsed: Dict) -> Tuple[float, List[str], List[str], List[str]]:
    """Return (score, strengths, improvements, suggestions).

    Weighting (documented, deterministic):
      contact info (name+email+phone) ........ 15
      technical skills ........................ 25  (scales to 25 at 12 skills)
      soft skills .............................. 10  (scales to 10 at 5 skills)
      education ............................... 10
      projects ................................. 15  (scales to 15 at 3 projects)
      experience .............................. 15  (scales to 15 at 2+ yrs)
      certifications .......................... 10
    """
    tech = parsed.get("technical_skills", []) or []
    soft = parsed.get("soft_skills", []) or []
    education = parsed.get("education", []) or []
    projects = parsed.get("projects", []) or []
    certifications = parsed.get("certifications", []) or []
    exp_years = parsed.get("experience_years", 0) or 0

    score = 0.0
    # Contact (15)
    if parsed.get("name"):
        score += 5
    if parsed.get("email"):
        score += 5
    if parsed.get("phone"):
        score += 5
    # Technical (25)
    score += min(len(tech) / 12, 1.0) * 25
    # Soft (10)
    score += min(len(soft) / 5, 1.0) * 10
    # Education (10)
    score += min(len(education) / 2, 1.0) * 10
    # Projects (15)
    score += min(len(projects) / 3, 1.0) * 15
    # Experience (15)
    score += min(exp_years / 2, 1.0) * 15
    # Certifications (10)
    score += min(len(certifications) / 2, 1.0) * 10

    strengths = tech[:8]
    if len(strengths) < 4:
        strengths = (tech + soft)[:8]

    improvements: List[str] = []
    suggestions: List[str] = []
    if not parsed.get("email") or not parsed.get("phone"):
        improvements.append("Add complete contact details (email and phone)")
        suggestions.append("Add a professional email and phone number at the top of your resume")
    if len(tech) < 8:
        improvements.append("Add more relevant technical skills")
        suggestions.append("List more technical skills relevant to your target role")
    if len(projects) < 2:
        improvements.append("Add measurable project achievements")
        suggestions.append("Add 2-3 projects with measurable outcomes (e.g. 'reduced load time by 40%')")
    if any(len(p) < 30 for p in projects):
        improvements.append("Improve project descriptions with concrete metrics")
        suggestions.append("Expand project descriptions: problem, your role, tech used, and quantified result")
    if not certifications:
        improvements.append("Add relevant certifications")
        suggestions.append("Add certifications (e.g. AWS, Coursera, NPTEL) to strengthen credibility")
    if exp_years == 0 and not projects:
        improvements.append("Add internship or work experience")
        suggestions.append("Add an internship, freelance work, or detailed academic projects")
    if len(education) == 0:
        improvements.append("Add an education section")
        suggestions.append("Add your degree, institution and graduation year")
    if not parsed.get("name"):
        improvements.append("Add your full name as the resume title")
        suggestions.append("Add your full name at the top of the resume")

    # Deduplicate while preserving order
    improvements = list(dict.fromkeys(improvements))
    suggestions = list(dict.fromkeys(suggestions))

    return _round(min(score, 100)), strengths, improvements, suggestions


# ----------------------------------------------------------------------
# Job description matching
# ----------------------------------------------------------------------
_YEARS_RE = re.compile(r"(\d+)\+?\s*(?:years?|yrs)", re.IGNORECASE)
_DEGREE_RE = re.compile(r"\b(bachelor|master|b\.?tech|m\.?tech|b\.?e|m\.?e|bca|mca|degree|graduation)\b", re.IGNORECASE)


def job_match_score(resume_skills: List[str], resume_parsed: Dict, job_text: str) -> Dict:
    """Compare resume skills against skills required in `job_text`.

    Returns matched_skills, missing_skills, match_score, and sub-scores for
    experience, education, technical skill and overall match.
    """
    job_skills = extract_skills(job_text)["all"]
    resume_set = set(resume_skills)

    matched = [s for s in job_skills if s in resume_set]
    missing = [s for s in job_skills if s not in resume_set]

    total = len(job_skills)
    skill_match_pct = (len(matched) / total * 100) if total else 0.0

    # Experience match: compare required years to detected experience years.
    yrs_match = _YEARS_RE.search(job_text)
    req_years = int(yrs_match.group(1)) if yrs_match else 0
    have_years = resume_parsed.get("experience_years", 0) or 0
    if req_years == 0:
        exp_match_pct = 100.0 if have_years > 0 else 60.0  # no explicit requirement
    else:
        exp_match_pct = min(have_years / req_years, 1.0) * 100

    # Education match: does the JD ask for a degree, and does resume list education?
    needs_degree = bool(_DEGREE_RE.search(job_text))
    has_education = bool(resume_parsed.get("education"))
    if not needs_degree:
        edu_match_pct = 100.0
    else:
        edu_match_pct = 100.0 if has_education else 40.0

    # Overall: weighted blend of skill, experience and education match.
    overall = 0.65 * skill_match_pct + 0.20 * exp_match_pct + 0.15 * edu_match_pct

    suggestions = []
    if missing:
        suggestions.append(f"Learn or highlight: {', '.join(missing[:6])}")
    if req_years and have_years < req_years:
        suggestions.append(f"Gain more experience — the role asks for {req_years}+ years")
    if needs_degree and not has_education:
        suggestions.append("Make sure your education section is clearly listed")

    return {
        "job_skills": job_skills,
        "matched_skills": matched,
        "missing_skills": missing,
        "match_score": _round(overall),
        "details": {
            "technical_skill_match": _round(skill_match_pct),
            "experience_match": _round(exp_match_pct),
            "education_match": _round(edu_match_pct),
            "overall_match": _round(overall),
            "required_years": req_years,
            "have_years": have_years,
        },
        "suggestions": suggestions,
    }


# ----------------------------------------------------------------------
# Skill gap analysis vs a target career
# ----------------------------------------------------------------------
def skill_gap(resume_skills: List[str], required_skills: List[str], career_name: str = "") -> Dict:
    """required_skills may contain '/' alternatives.

    A required item is 'matched' if any of its alternatives is present in the
    resume. Readiness = matched / total required * 100.
    """
    resume_set = set(resume_skills)
    matched_groups: List[str] = []
    missing_groups: List[str] = []
    matched_canonical: List[str] = []

    for item in required_skills:
        alts = _alternatives(item)
        present = [a for a in alts if a in resume_set]
        if present:
            matched_groups.append(item)
            matched_canonical.extend(present)
        else:
            missing_groups.append(item)

    total = len(required_skills) or 1
    readiness = len(matched_groups) / total * 100

    return {
        "career_name": career_name,
        "matched_skills": matched_groups,
        "missing_skills": missing_groups,
        "matched_canonical": list(dict.fromkeys(matched_canonical)),
        "total_required": len(required_skills),
        "total_matched": len(matched_groups),
        "readiness": _round(readiness),
    }


# ----------------------------------------------------------------------
# Job recommendations — rank careers by resume readiness
# ----------------------------------------------------------------------
def job_recommendations(resume_skills: List[str], careers: List[Dict], top_n: int = 12) -> List[Dict]:
    """`careers` items: {name, category, description, required_skills}."""
    results = []
    for c in careers:
        gap = skill_gap(resume_skills, c["required_skills"], c["name"])
        match_pct = gap["readiness"]
        reason = _recommendation_reason(c, match_pct, gap)
        results.append({
            "role": c["name"],
            "category": c["category"],
            "description": c.get("description", ""),
            "match_percentage": match_pct,
            "required_skills": c["required_skills"],
            "user_skills": gap["matched_canonical"],
            "missing_skills": gap["missing_skills"],
            "reason": reason,
        })
    results.sort(key=lambda r: r["match_percentage"], reverse=True)
    return results[:top_n]


def _recommendation_reason(career: Dict, match_pct: float, gap: Dict) -> str:
    matched = gap["matched_canonical"]
    missing = gap["missing_skills"]
    if match_pct >= 80:
        return f"Your resume covers {len(matched)} of {gap['total_required']} core skills for {career['name']} — a strong fit."
    if match_pct >= 50:
        return f"You meet {len(matched)} of {gap['total_required']} required skills. Close the gap on {', '.join(missing[:3])} to be job-ready."
    if matched:
        return f"Some overlap ({len(matched)} skills), but {len(missing)} key skills are missing for {career['name']}."
    return f"Your current skills are a limited match for {career['name']}. This could be a pivot target with focused upskilling."
