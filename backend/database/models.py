"""SQLAlchemy ORM models for the Career Guidance database.

Tables:
  users, resumes, career_roles, skill_gap_results, job_descriptions,
  job_recommendations, learning_progress, student_records,
  performance_predictions, analysis_history

Skill lists are stored as JSON columns for flexibility (a skill is a simple
string, and the set evolves over time). The relational design still uses
proper primary/foreign keys and timestamps throughout.
"""
from datetime import datetime

from sqlalchemy import (
    JSON,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from .connection import Base


def _now() -> datetime:
    return datetime.utcnow()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    is_demo = Column(Integer, default=0)  # 1 for the seeded demo account
    created_at = Column(DateTime, default=_now)

    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)

    # Extracted text + structured fields (JSON for list/dict data).
    raw_text = Column(Text, nullable=False)
    name = Column(String(150))
    email = Column(String(150))
    phone = Column(String(50))
    education = Column(JSON, default=list)
    technical_skills = Column(JSON, default=list)
    soft_skills = Column(JSON, default=list)
    projects = Column(JSON, default=list)
    experience = Column(JSON, default=list)
    certifications = Column(JSON, default=list)

    score = Column(Float, default=0.0)
    experience_years = Column(Integer, default=0)
    strengths = Column(JSON, default=list)
    improvements = Column(JSON, default=list)
    suggestions = Column(JSON, default=list)
    created_at = Column(DateTime, default=_now)

    user = relationship("User", back_populates="resumes")


class CareerRole(Base):
    """Reference data for careers and their required skills."""
    __tablename__ = "career_roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False, index=True)
    category = Column(String(80), nullable=False)
    description = Column(Text, default="")
    required_skills = Column(JSON, default=list)  # ["Java", "OOP", ...]


class SkillGapResult(Base):
    __tablename__ = "skill_gap_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    career_id = Column(Integer, ForeignKey("career_roles.id"), nullable=False)
    career_name = Column(String(150), nullable=False)
    matched_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    total_required = Column(Integer, default=0)
    total_matched = Column(Integer, default=0)
    readiness = Column(Float, default=0.0)
    created_at = Column(DateTime, default=_now)


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    text = Column(Text, nullable=False)
    match_score = Column(Float, default=0.0)
    matched_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    details = Column(JSON, default=dict)  # experience/education/skill match
    created_at = Column(DateTime, default=_now)


class JobRecommendation(Base):
    __tablename__ = "job_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(150), nullable=False)
    category = Column(String(80), default="")
    match_percentage = Column(Float, default=0.0)
    required_skills = Column(JSON, default=list)
    user_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    reason = Column(Text, default="")
    created_at = Column(DateTime, default=_now)


class LearningProgress(Base):
    """Per-user, per-skill roadmap progress.

    status: 'not_started' | 'learning' | 'completed'
    stage: 1..4 (Foundation, Core, Advanced, Job Ready)
    One row per (user, career, skill) combination.
    """
    __tablename__ = "learning_progress"
    __table_args__ = (UniqueConstraint("user_id", "career_id", "skill", name="uq_learning_progress"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    career_id = Column(Integer, ForeignKey("career_roles.id"), nullable=False)
    skill = Column(String(150), nullable=False)
    stage = Column(Integer, default=1)
    status = Column(String(20), default="not_started")
    updated_at = Column(DateTime, default=_now, onupdate=_now)


class StudentRecord(Base):
    """Raw student inputs used as features for the prediction."""
    __tablename__ = "student_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    attendance = Column(Float, nullable=False)        # %
    internal_marks = Column(Float, nullable=False)    # %
    prev_semester = Column(Float, nullable=False)     # %
    assignment_score = Column(Float, nullable=False)  # %
    study_hours = Column(Float, nullable=False)      # hours/day
    subject_marks = Column(JSON, default=dict)       # {"Maths": 78, ...}
    created_at = Column(DateTime, default=_now)


class PerformancePrediction(Base):
    __tablename__ = "performance_predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    attendance = Column(Float, nullable=False)
    internal_marks = Column(Float, nullable=False)
    prev_semester = Column(Float, nullable=False)
    assignment_score = Column(Float, nullable=False)
    study_hours = Column(Float, nullable=False)
    risk_level = Column(String(20), nullable=False)        # LOW / MEDIUM / HIGH
    predicted_performance = Column(Float, nullable=False)  # %
    factors = Column(JSON, default=list)
    suggestions = Column(JSON, default=list)
    created_at = Column(DateTime, default=_now)


class AnalysisHistory(Base):
    """Unified log of analyses for the History page."""
    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    analysis_type = Column(String(50), nullable=False)  # resume | job_match | career | performance
    title = Column(String(255), default="")
    summary = Column(Text, default="")
    details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=_now)
