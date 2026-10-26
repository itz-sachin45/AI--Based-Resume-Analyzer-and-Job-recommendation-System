from typing import List
from pydantic import BaseModel


class ResumeOut(BaseModel):
    id: int
    filename: str
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    education: List[str] = []
    technical_skills: List[str] = []
    soft_skills: List[str] = []
    projects: List[str] = []
    experience: List[str] = []
    certifications: List[str] = []
    score: float = 0.0
    strengths: List[str] = []
    improvements: List[str] = []
    suggestions: List[str] = []
    created_at: str | None = None


class ResumeAnalysisOut(BaseModel):
    resume: ResumeOut
    score: float
    strengths: List[str]
    improvements: List[str]
    suggestions: List[str]
    total_skills: int
