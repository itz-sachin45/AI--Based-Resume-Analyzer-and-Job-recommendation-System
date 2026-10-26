"""Learning roadmap generation.

Each skill is assigned a tier (1-4). A career's required skills are grouped
into stages by tier, and a couple of universal "job-ready" items are appended
to stage 4 so every roadmap ends with portfolio + interview preparation.
"""
from typing import Dict, List

# Tier 1 = Foundation (Beginner), Tier 2 = Core (Intermediate),
# Tier 3 = Advanced, Tier 4 = Specialised/soft
SKILL_TIER: Dict[str, int] = {
    # Foundations
    "HTML": 1, "CSS": 1, "Excel": 1, "SQL": 1, "Git": 1, "Python": 1,
    "OOP": 1, "DSA": 1, "Communication": 1, "Statistics": 1, "GitHub": 1,
    # Core
    "JavaScript": 2, "Java": 2, "React": 2, "Pandas": 2, "NumPy": 2,
    "Scikit-learn": 2, "Machine Learning": 2, "REST API": 2, "Spring Boot": 2,
    "FastAPI": 2, "MySQL": 2, "Power BI": 2, "Tableau": 2, "CRM": 2,
    "Lead Generation": 2, "Data Structures": 2, "Algorithms": 2, "DBMS": 2,
    # Advanced
    "Deep Learning": 3, "Data Visualization": 3, "APIs": 3, "SaaS": 3,
    "Negotiation": 3, "Market Research": 3, "TensorFlow": 3, "PyTorch": 3,
    "Microservices": 3, "Docker": 3, "Kubernetes": 3, "AWS": 3, "NLP": 3,
    # Soft / specialised
    "Sales": 4, "Leadership": 4, "Presentation": 4, "Critical Thinking": 4,
    "Basic Technical Knowledge": 4,
}

STAGE_META = [
    (1, "Foundation", "Beginner"),
    (2, "Core Skills", "Intermediate"),
    (3, "Advanced", "Advanced"),
    (4, "Job Ready", "Job Ready"),
]

JOB_READY_EXTRAS = ["Portfolio Project", "Interview Preparation"]


def build_roadmap(required_skills: List[str], career_name: str = "") -> List[Dict]:
    """Group required skills into 4 stages by tier, append job-ready extras."""
    buckets: Dict[int, List[str]] = {1: [], 2: [], 3: [], 4: []}
    for skill in required_skills:
        # support "Java/Python" alternatives — take the first for staging
        primary = skill.split("/")[0].strip()
        tier = SKILL_TIER.get(primary, 2)
        buckets[tier].append(skill)
    buckets[4].extend(JOB_READY_EXTRAS)

    stages = []
    for stage, label, level in STAGE_META:
        skills = buckets[stage]
        if not skills:
            continue
        stages.append({"stage": stage, "label": label, "level": level, "skills": skills})
    return stages
