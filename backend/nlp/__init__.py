"""NLP package: resume text extraction + skill extraction + matching."""
from .skills import (
    SKILL_ALIASES,
    TECHNICAL_SKILLS,
    SOFT_SKILLS,
    canonicalize_skill,
    extract_skills,
    normalize_skills,
)
from .matcher import (
    job_match_score,
    resume_score,
    skill_gap,
    job_recommendations,
)

__all__ = [
    "SKILL_ALIASES",
    "TECHNICAL_SKILLS",
    "SOFT_SKILLS",
    "canonicalize_skill",
    "extract_skills",
    "normalize_skills",
    "job_match_score",
    "resume_score",
    "skill_gap",
    "job_recommendations",
]
