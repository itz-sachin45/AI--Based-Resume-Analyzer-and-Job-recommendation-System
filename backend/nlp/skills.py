"""Skill knowledge base + extraction utilities.

`TECHNICAL_SKILLS` and `SOFT_SKILLS` are curated dictionaries of skills we
recognise. `SKILL_ALIASES` maps common spellings/abbreviations to a canonical
name so "MySQL" and "mysql" and "MySql" all resolve to the same token, and
"ML" resolves to "Machine Learning".

Extraction is done by scanning the resume text for known skill phrases
(case-insensitive, word-boundary aware). This is deterministic and fast and
does not require downloading an external NLP model, which keeps the project
fully runnable offline.
"""
import re
from typing import Dict, Iterable, List, Set

# ---- Canonical technical skills ----
TECHNICAL_SKILLS: List[str] = [
    # Languages
    "Java", "Python", "C", "C++", "C#", "JavaScript", "TypeScript", "Go", "Kotlin",
    "Swift", "Ruby", "PHP", "R", "Scala", "Rust",
    # Web / Frontend
    "HTML", "CSS", "React", "Angular", "Vue", "Next.js", "Redux", "Tailwind",
    "Bootstrap", "jQuery", "SASS",
    # Backend / Frameworks
    "Spring Boot", "Spring", "FastAPI", "Flask", "Django", "Node.js", "Express",
    "REST API", "GraphQL", "Microservices",
    # Databases
    "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "SQLite", "Oracle", "Firebase",
    # Data / ML
    "Pandas", "NumPy", "Scikit-learn", "Machine Learning", "Deep Learning",
    "TensorFlow", "PyTorch", "Keras", "NLP", "Data Visualization", "Matplotlib",
    "Seaborn", "Power BI", "Tableau", "Excel", "Statistics", "EDA",
    # DevOps / Tools
    "Git", "GitHub", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD",
    "Jenkins", "Linux", "Bash", "Jupyter",
    # CS fundamentals
    "OOP", "DSA", "DBMS", "Operating Systems", "Computer Networks",
    "Data Structures", "Algorithms",
    # Testing / Other
    "Junit", "Postman", "Selenium", "Jest",
]

# ---- Canonical soft skills ----
SOFT_SKILLS: List[str] = [
    "Communication", "Negotiation", "Lead Generation", "CRM", "Leadership",
    "Teamwork", "Problem Solving", "Time Management", "Adaptability",
    "Critical Thinking", "Presentation", "Market Research", "Sales",
    "Collaboration", "Mentoring",
]

# ---- Aliases -> canonical (lowercased keys) ----
SKILL_ALIASES: Dict[str, str] = {
    # SQL family
    "mysql": "MySQL",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "sqlite": "SQLite",
    "oracle db": "Oracle",
    "oracle database": "Oracle",
    "mssql": "SQL",
    "ms sql": "SQL",
    "sql server": "SQL",
    "rdbms": "SQL",
    # ML family
    "ml": "Machine Learning",
    "machine learning": "Machine Learning",
    "deep learning": "Deep Learning",
    "dl": "Deep Learning",
    "neural networks": "Deep Learning",
    "scikit learn": "Scikit-learn",
    "sklearn": "Scikit-learn",
    "tensorflow": "TensorFlow",
    "pytorch": "PyTorch",
    "nlp": "NLP",
    "natural language processing": "NLP",
    # Web
    "js": "JavaScript",
    "typescript": "TypeScript",
    "ts": "TypeScript",
    "react.js": "React",
    "reactjs": "React",
    "angularjs": "Angular",
    "vuejs": "Vue",
    "nodejs": "Node.js",
    "node js": "Node.js",
    "expressjs": "Express",
    "rest": "REST API",
    "restful": "REST API",
    "rest api": "REST API",
    "restful api": "REST API",
    "api": "REST API",
    "apis": "REST API",
    # Java/Spring
    "springboot": "Spring Boot",
    "spring-boot": "Spring Boot",
    "spring framework": "Spring",
    # Python frameworks
    "fast api": "FastAPI",
    "fast-api": "FastAPI",
    # CS
    "data structures and algorithms": "DSA",
    "data structures": "Data Structures",
    "algorithms": "Algorithms",
    "object oriented programming": "OOP",
    "oops": "OOP",
    "object-oriented programming": "OOP",
    # Data tools
    "powerbi": "Power BI",
    "power bi": "Power BI",
    "tableau software": "Tableau",
    "matplotlib": "Matplotlib",
    "data visualisation": "Data Visualization",
    "data visualization": "Data Visualization",
    # DevOps
    "ci/cd": "CI/CD",
    "cicd": "CI/CD",
    "github": "GitHub",
    # Business
    "customer relationship management": "CRM",
    "lead-gen": "Lead Generation",
    "lead gen": "Lead Generation",
    "market research": "Market Research",
    "saas": "SaaS",
    "software as a service": "SaaS",
    "basic technical knowledge": "Basic Technical Knowledge",
    "technical knowledge": "Basic Technical Knowledge",
}

# ---- Build a lookup of every known phrase (canonical + aliases) ----
_ALL_CANONICAL = {s.lower(): s for s in TECHNICAL_SKILLS + SOFT_SKILLS}
# Merge canonical names and aliases into a single phrase -> canonical map.
_PHRASE_MAP: Dict[str, str] = {}
for canon in TECHNICAL_SKILLS + SOFT_SKILLS:
    _PHRASE_MAP[canon.lower()] = canon
for alias, canon in SKILL_ALIASES.items():
    _PHRASE_MAP[alias.lower()] = canon


def canonicalize_skill(token: str) -> str:
    """Return the canonical skill name for a token, or '' if unknown."""
    key = token.strip().lower()
    return _PHRASE_MAP.get(key, "")


def normalize_skills(tokens: Iterable[str]) -> List[str]:
    """Canonicalize + de-duplicate a list of raw skill strings."""
    seen: Set[str] = set()
    out: List[str] = []
    for t in tokens:
        c = canonicalize_skill(t)
        if c and c not in seen:
            seen.add(c)
            out.append(c)
    return out


def _phrase_patterns() -> List[tuple]:
    """Pre-compile regex patterns for every known phrase, longest first so
    'Machine Learning' matches before 'ML'-style substrings."""
    phrases = sorted(_PHRASE_MAP.keys(), key=len, reverse=True)
    patterns = []
    for p in phrases:
        # \b word boundaries; allow . - _ as internal chars
        pattern = r"\b" + re.escape(p).replace(r"\ ", r"[\s\-_]*") + r"\b"
        patterns.append((re.compile(pattern, re.IGNORECASE), _PHRASE_MAP[p]))
    return patterns


_PATTERNS = _phrase_patterns()


def extract_skills(text: str) -> dict:
    """Scan `text` and return canonical technical & soft skills found.

    Returns {"technical": [...], "soft": [...], "all": [...]} with canonical,
    de-duplicated, ordered-by-first-appearance lists.
    """
    if not text:
        return {"technical": [], "soft": [], "all": []}

    tech_set: Set[str] = set()
    soft_set: Set[str] = set()
    ordered: List[str] = []

    for pattern, canon in _PATTERNS:
        if pattern.search(text):
            if canon in TECHNICAL_SKILLS:
                tech_set.add(canon)
            else:
                soft_set.add(canon)
            if canon not in ordered:
                ordered.append(canon)

    # Preserve first-appearance order
    tech_ordered = [s for s in ordered if s in tech_set]
    soft_ordered = [s for s in ordered if s in soft_set]
    return {"technical": tech_ordered, "soft": soft_ordered, "all": ordered}
