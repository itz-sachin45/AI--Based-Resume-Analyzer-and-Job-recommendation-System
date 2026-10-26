from typing import List
from pydantic import BaseModel


class CareerOut(BaseModel):
    id: int
    name: str
    category: str
    description: str = ""
    required_skills: List[str] = []


class SkillGapRequest(BaseModel):
    resume_id: int
    career_id: int


class SkillGapOut(BaseModel):
    career_name: str
    matched_skills: List[str]
    missing_skills: List[str]
    total_required: int
    total_matched: int
    readiness: float
    matched_canonical: List[str] = []


class RoadmapSkill(BaseModel):
    skill: str
    status: str = "not_started"  # not_started | learning | completed
    stage: int = 1


class RoadmapStage(BaseModel):
    stage: int
    label: str
    level: str
    skills: List[RoadmapSkill] = []


class RoadmapOut(BaseModel):
    career_name: str
    stages: List[RoadmapStage]


class RoadmapUpdateRequest(BaseModel):
    career_id: int
    skill: str
    status: str  # not_started | learning | completed
    stage: int = 1
