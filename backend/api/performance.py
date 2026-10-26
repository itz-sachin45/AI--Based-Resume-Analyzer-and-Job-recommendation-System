"""Student performance prediction endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import AnalysisHistory, PerformancePrediction, StudentRecord, User
from ml.predictor import predict_performance, get_model_info
from schemas.performance import PerformanceRequest, PerformanceOut, ModelInfoOut
from .deps import get_current_user

router = APIRouter(prefix="/api/performance", tags=["performance"])


@router.post("/predict", response_model=PerformanceOut)
def predict(
    payload: PerformanceRequest,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    inputs = {
        "attendance": payload.attendance,
        "internal_marks": payload.internal_marks,
        "prev_semester": payload.prev_semester,
        "assignment_score": payload.assignment_score,
        "study_hours": payload.study_hours,
    }
    result = predict_performance(inputs, payload.subject_marks)

    db.add(StudentRecord(
        user_id=current.id,
        attendance=payload.attendance, internal_marks=payload.internal_marks,
        prev_semester=payload.prev_semester, assignment_score=payload.assignment_score,
        study_hours=payload.study_hours, subject_marks=payload.subject_marks,
    ))
    db.add(PerformancePrediction(
        user_id=current.id,
        attendance=payload.attendance, internal_marks=payload.internal_marks,
        prev_semester=payload.prev_semester, assignment_score=payload.assignment_score,
        study_hours=payload.study_hours, risk_level=result["risk_level"],
        predicted_performance=result["predicted_performance"],
        factors=result["factors"], suggestions=result["suggestions"],
    ))
    db.add(AnalysisHistory(
        user_id=current.id, analysis_type="performance",
        title="Performance Prediction",
        summary=f"Risk {result['risk_level']} — Predicted {result['predicted_performance']}%",
        details=result,
    ))
    db.commit()
    return result


@router.get("/model-info", response_model=ModelInfoOut)
def model_info():
    return get_model_info()
