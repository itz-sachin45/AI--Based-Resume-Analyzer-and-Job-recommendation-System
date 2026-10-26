"""Seed reference data: career roles + a demo user, created on first run.

Career required-skills use "/" to denote alternatives that satisfy a single
requirement, e.g. "Java/Python" means the candidate needs Java OR Python.
The matcher splits on "/" so partial credit is handled correctly.
"""
from sqlalchemy.orm import Session

from .connection import SessionLocal, init_db
from .models import CareerRole, User
from utils.security import hash_password

CAREERS = [
    {
        "name": "Java Developer",
        "category": "Technical",
        "description": "Builds robust backend services and enterprise applications using Java and the Spring ecosystem.",
        "required_skills": ["Java", "OOP", "DSA", "Spring Boot", "REST API", "MySQL", "Git"],
    },
    {
        "name": "Full-Stack Developer",
        "category": "Technical",
        "description": "Works across the stack — building user interfaces and the APIs and databases behind them.",
        "required_skills": ["HTML", "CSS", "JavaScript", "React", "Java/Spring Boot", "MySQL", "Git"],
    },
    {
        "name": "Frontend Developer",
        "category": "Technical",
        "description": "Crafts responsive, accessible user interfaces with modern JavaScript frameworks.",
        "required_skills": ["HTML", "CSS", "JavaScript", "React", "Git"],
    },
    {
        "name": "Backend Developer",
        "category": "Technical",
        "description": "Designs APIs, services and data layers that power applications at scale.",
        "required_skills": ["Java/Python", "Spring Boot/FastAPI", "REST API", "SQL", "Git"],
    },
    {
        "name": "Data Analyst",
        "category": "Data",
        "description": "Turns raw data into insights using SQL, BI tools and Python data libraries.",
        "required_skills": ["Excel", "SQL", "Power BI", "Python", "Pandas", "Statistics"],
    },
    {
        "name": "Data Scientist",
        "category": "Data",
        "description": "Builds predictive models and extracts value from complex datasets.",
        "required_skills": ["Python", "Pandas", "NumPy", "Statistics", "Machine Learning", "Scikit-learn"],
    },
    {
        "name": "ML Engineer",
        "category": "Data",
        "description": "Productionises machine-learning models and integrates them into applications.",
        "required_skills": ["Python", "Machine Learning", "Scikit-learn", "Deep Learning", "APIs"],
    },
    {
        "name": "Sales",
        "category": "Business",
        "description": "Drives revenue by managing relationships and closing deals.",
        "required_skills": ["Communication", "Negotiation", "Lead Generation", "CRM", "Excel"],
    },
    {
        "name": "Technical Sales",
        "category": "Business",
        "description": "Sells technical/SaaS products, combining domain knowledge with sales skills.",
        "required_skills": ["Communication", "CRM", "SaaS", "Basic Technical Knowledge", "Negotiation"],
    },
    {
        "name": "Business Development",
        "category": "Business",
        "description": "Identifies opportunities, builds partnerships and grows the business.",
        "required_skills": ["Communication", "Lead Generation", "CRM", "Sales", "Market Research"],
    },
]

DEMO_USER = {
    "full_name": "Demo Student",
    "email": "demo@careerguidance.ai",
    "password": "demo1234",
}


def seed_careers(db: Session) -> None:
    for c in CAREERS:
        existing = db.query(CareerRole).filter(CareerRole.name == c["name"]).first()
        if not existing:
            db.add(CareerRole(**c))
        else:
            existing.category = c["category"]
            existing.description = c["description"]
            existing.required_skills = c["required_skills"]
    db.commit()


def seed_demo_user(db: Session) -> None:
    existing = db.query(User).filter(User.email == DEMO_USER["email"]).first()
    if existing:
        return
    db.add(
        User(
            full_name=DEMO_USER["full_name"],
            email=DEMO_USER["email"],
            password_hash=hash_password(DEMO_USER["password"]),
            is_demo=1,
        )
    )
    db.commit()


def run_seed() -> None:
    init_db()
    db = SessionLocal()
    try:
        seed_careers(db)
        seed_demo_user(db)
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
    print("Seed complete.")
