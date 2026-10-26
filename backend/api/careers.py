"""Career endpoints: list/get careers, skill gap analysis, roadmap + progress."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import CareerRole, LearningProgress, Resume, SkillGapResult, User, AnalysisHistory
from nlp.matcher import skill_gap
from schemas.career import CareerOut, SkillGapRequest, SkillGapOut, RoadmapOut, RoadmapUpdateRequest
from services.roadmap import build_roadmap
from .deps import get_current_user

router = APIRouter(prefix="/api/careers", tags=["careers"])


@router.get("/", response_model=list[CareerOut])
def list_careers(category: str | None = None, db: Session = Depends(get_db)):
    q = db.query(CareerRole)
    if category and category.lower() != "all":
        q = q.filter(CareerRole.category.ilike(category))
    return q.order_by(CareerRole.name).all()


@router.get("/{career_id}", response_model=CareerOut)
def get_career(career_id: int, db: Session = Depends(get_db)):
    c = db.query(CareerRole).filter(CareerRole.id == career_id).first()
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Career not found")
    return c


@router.post("/skill-gap", response_model=SkillGapOut)
def compute_skill_gap(
    payload: SkillGapRequest,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(Resume.id == payload.resume_id, Resume.user_id == current.id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
    career = db.query(CareerRole).filter(CareerRole.id == payload.career_id).first()
    if not career:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Career not found")

    user_skills = (resume.technical_skills or []) + (resume.soft_skills or [])
    result = skill_gap(user_skills, career.required_skills, career.name)

    db.query(SkillGapResult).filter(
        SkillGapResult.user_id == current.id, SkillGapResult.career_id == career.id
    ).delete()
    db.add(SkillGapResult(
        user_id=current.id, resume_id=resume.id, career_id=career.id,
        career_name=career.name, matched_skills=result["matched_skills"],
        missing_skills=result["missing_skills"], total_required=result["total_required"],
        total_matched=result["total_matched"], readiness=result["readiness"],
    ))
    db.add(AnalysisHistory(
        user_id=current.id, analysis_type="career",
        title=f"Skill Gap: {career.name}", summary=f"Career Readiness {result['readiness']}%",
        details={"career": career.name, "matched": result["matched_skills"], "missing": result["missing_skills"], "readiness": result["readiness"]},
    ))
    db.commit()
    return result


@router.get("/roadmap/{career_id}", response_model=RoadmapOut)
def get_roadmap(career_id: int, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    career = db.query(CareerRole).filter(CareerRole.id == career_id).first()
    if not career:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Career not found")
    stages = build_roadmap(career.required_skills, career.name)
    # Attach current progress per skill
    progress = {
        p.skill: p.status
        for p in db.query(LearningProgress).filter(
            LearningProgress.user_id == current.id, LearningProgress.career_id == career.id
        ).all()
    }
    resume = db.query(Resume).filter(Resume.user_id == current.id).order_by(Resume.created_at.desc()).first()
    user_skills = set((resume.technical_skills or []) + (resume.soft_skills or [])) if resume else set()
    for stage in stages:
        enriched = []
        for skill in stage["skills"]:
            primary = skill.split("/")[0].strip()
            already_have = primary in user_skills
            status_val = progress.get(skill) or progress.get(primary) or ("completed" if already_have else "not_started")
            enriched.append({"skill": skill, "status": status_val, "stage": stage["stage"]})
        stage["skills"] = enriched  # type: ignore[assignment]
    return {"career_name": career.name, "stages": stages}


@router.post("/roadmap/progress")
def update_roadmap_progress(
    payload: RoadmapUpdateRequest,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    if payload.status not in ("not_started", "learning", "completed"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status")
    existing = db.query(LearningProgress).filter(
        LearningProgress.user_id == current.id,
        LearningProgress.career_id == payload.career_id,
        LearningProgress.skill == payload.skill,
    ).first()
    if existing:
        existing.status = payload.status
        existing.stage = payload.stage
    else:
        db.add(LearningProgress(
            user_id=current.id, career_id=payload.career_id,
            skill=payload.skill, stage=payload.stage, status=payload.status,
        ))
    db.commit()
    return {"message": "Progress updated", "skill": payload.skill, "status": payload.status}
