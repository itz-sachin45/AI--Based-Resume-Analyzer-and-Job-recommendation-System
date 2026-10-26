from typing import Dict, List
from pydantic import BaseModel, Field


class PerformanceRequest(BaseModel):
    attendance: float = Field(ge=0, le=100, description="Attendance percentage 0-100")
    internal_marks: float = Field(ge=0, le=100, description="Internal marks percentage 0-100")
    prev_semester: float = Field(ge=0, le=100, description="Previous semester percentage 0-100")
    assignment_score: float = Field(ge=0, le=100, description="Assignment score percentage 0-100")
    study_hours: float = Field(ge=0, le=24, description="Study hours per day")
    subject_marks: Dict[str, float] = Field(default_factory=dict, description="Optional subject-wise marks")


class PerformanceOut(BaseModel):
    predicted_performance: float
    risk_level: str
    factors: List[str]
    suggestions: List[str]
    inputs: Dict
    subject_marks: Dict[str, float] = {}
    model_used: str


class ModelInfoOut(BaseModel):
    best_model: str
    metrics: Dict
    features: List[str]
    dataset_rows: int
    dataset_path: str
