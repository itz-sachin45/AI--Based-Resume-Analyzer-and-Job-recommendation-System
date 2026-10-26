from typing import List, Dict
from pydantic import BaseModel


class JobMatchRequest(BaseModel):
    resume_id: int
    job_description: str = ""


class JobMatchOut(BaseModel):
    job_skills: List[str]
    matched_skills: List[str]
    missing_skills: List[str]
    match_score: float
    details: Dict = {}
    suggestions: List[str] = []


class RecommendationOut(BaseModel):
    role: str
    category: str
    description: str = ""
    match_percentage: float
    required_skills: List[str]
    user_skills: List[str]
    missing_skills: List[str]
    reason: str
