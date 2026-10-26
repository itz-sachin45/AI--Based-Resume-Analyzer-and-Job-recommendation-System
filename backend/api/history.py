"""Analysis history endpoints."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import AnalysisHistory, User
from schemas.common import HistoryOut
from .deps import get_current_user

router = APIRouter(prefix="/api", tags=["history"])


@router.get("/history", response_model=list[HistoryOut])
def list_history(
    analysis_type: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    q = db.query(AnalysisHistory).filter(AnalysisHistory.user_id == current.id)
    if analysis_type and analysis_type != "all":
        q = q.filter(AnalysisHistory.analysis_type == analysis_type)
    rows = q.order_by(AnalysisHistory.created_at.desc()).limit(200).all()
    return [
        HistoryOut(
            id=r.id, analysis_type=r.analysis_type, title=r.title or "",
            summary=r.summary or "", details=r.details or {},
            created_at=r.created_at.strftime("%Y-%m-%d %H:%M") if r.created_at else "",
        )
        for r in rows
    ]


@router.get("/dashboard", tags=["dashboard"])
def dashboard(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Aggregated metrics for the main dashboard, all from real user data."""
    from database.models import Resume, SkillGapResult, JobRecommendation, PerformancePrediction

    latest_resume = db.query(Resume).filter(Resume.user_id == current.id).order_by(Resume.created_at.desc()).first()
    latest_gap = db.query(SkillGapResult).filter(SkillGapResult.user_id == current.id).order_by(SkillGapResult.created_at.desc()).first()
    latest_perf = db.query(PerformancePrediction).filter(PerformancePrediction.user_id == current.id).order_by(PerformancePrediction.created_at.desc()).first()
    rec_count = db.query(JobRecommendation).filter(JobRecommendation.user_id == current.id).count()

    return {
        "resume_score": latest_resume.score if latest_resume else None,
        "skills_detected": len(latest_resume.technical_skills) if latest_resume else 0,
        "skills_detected_list": latest_resume.technical_skills if latest_resume else [],
        "soft_skills": latest_resume.soft_skills if latest_resume else [],
        "missing_skills_count": len(latest_resume.improvements) if latest_resume else 0,
        "improvements": latest_resume.improvements if latest_resume else [],
        "strengths": latest_resume.strengths if latest_resume else [],
        "career_readiness": latest_gap.readiness if latest_gap else None,
        "career_name": latest_gap.career_name if latest_gap else None,
        "recommended_jobs": rec_count,
        "performance_risk": latest_perf.risk_level if latest_perf else None,
        "predicted_performance": latest_perf.predicted_performance if latest_perf else None,
        "has_resume": latest_resume is not None,
        "resume_id": latest_resume.id if latest_resume else None,
    }
