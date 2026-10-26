"""Job endpoints: job-description matching + career recommendations."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import CareerRole, JobDescription, JobRecommendation, Resume, User, AnalysisHistory
from nlp.matcher import job_match_score, job_recommendations
from schemas.job import JobMatchRequest, JobMatchOut, RecommendationOut
from .deps import get_current_user

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.post("/match", response_model=JobMatchOut)
def match_job(
    payload: JobMatchRequest,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(Resume.id == payload.resume_id, Resume.user_id == current.id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
    if not payload.job_description.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Job description is required")

    parsed = {
        "education": resume.education or [],
        "experience": resume.experience or [],
        "experience_years": resume.experience_years or 0,
    }
    user_skills = (resume.technical_skills or []) + (resume.soft_skills or [])
    result = job_match_score(user_skills, parsed, payload.job_description)

    db.add(JobDescription(
        user_id=current.id, resume_id=resume.id, text=payload.job_description,
        match_score=result["match_score"], matched_skills=result["matched_skills"],
        missing_skills=result["missing_skills"], details=result["details"],
    ))
    db.add(AnalysisHistory(
        user_id=current.id, analysis_type="job_match",
        title="Job Description Match", summary=f"Match {result['match_score']}%",
        details={"match_score": result["match_score"], "matched": result["matched_skills"], "missing": result["missing_skills"]},
    ))
    db.commit()
    return result


@router.get("/recommendations/{resume_id}", response_model=list[RecommendationOut])
def recommend(resume_id: int, category: str | None = None, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current.id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")

    q = db.query(CareerRole)
    if category and category.lower() != "all":
        q = q.filter(CareerRole.category.ilike(category))
    careers = q.all()
    careers_data = [{"name": c.name, "category": c.category, "description": c.description or "", "required_skills": c.required_skills} for c in careers]
    user_skills = (resume.technical_skills or []) + (resume.soft_skills or [])
    recs = job_recommendations(user_skills, careers_data, top_n=12)

    # Persist for history (replace previous recs for this resume)
    db.query(JobRecommendation).filter(JobRecommendation.user_id == current.id, JobRecommendation.resume_id == resume.id).delete()
    for r in recs:
        db.add(JobRecommendation(
            user_id=current.id, resume_id=resume.id, role=r["role"], category=r["category"],
            match_percentage=r["match_percentage"], required_skills=r["required_skills"],
            user_skills=r["user_skills"], missing_skills=r["missing_skills"], reason=r["reason"],
        ))
    db.add(AnalysisHistory(
        user_id=current.id, analysis_type="job_match",
        title="Job Recommendations", summary=f"{len(recs)} roles ranked",
        details={"top": recs[0]["role"] if recs else None, "count": len(recs)},
    ))
    db.commit()
    return recs
