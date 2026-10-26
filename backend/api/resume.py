"""Resume endpoints: upload + analyze, list, get by id."""
from datetime import datetime
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import Resume, User, AnalysisHistory
from nlp.extractor import parse_resume
from nlp.matcher import resume_score
from schemas.resume import ResumeOut
from .deps import get_current_user

router = APIRouter(prefix="/api/resume", tags=["resume"])

ALLOWED = {".pdf", ".docx"}
MAX_BYTES = 6 * 1024 * 1024  # 6 MB


def _to_out(r: Resume) -> ResumeOut:
    return ResumeOut(
        id=r.id,
        filename=r.filename,
        name=r.name,
        email=r.email,
        phone=r.phone,
        education=r.education or [],
        technical_skills=r.technical_skills or [],
        soft_skills=r.soft_skills or [],
        projects=r.projects or [],
        experience=r.experience or [],
        certifications=r.certifications or [],
        score=r.score,
        strengths=r.strengths or [],
        improvements=r.improvements or [],
        suggestions=r.suggestions or [],
        created_at=r.created_at.strftime("%Y-%m-%d %H:%M") if r.created_at else None,
    )


@router.post("/upload", response_model=ResumeOut, status_code=status.HTTP_201_CREATED)
def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    filename = (file.filename or "").lower()
    if not any(filename.endswith(ext) for ext in ALLOWED):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF or DOCX files are supported")
    data = file.file.read()
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty file")
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large (max 6MB)")
    try:
        parsed = parse_resume(file.filename, data)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Could not parse resume: {exc}")

    score, strengths, improvements, suggestions = resume_score(parsed)
    resume = Resume(
        user_id=current.id,
        filename=file.filename,
        raw_text=parsed["raw_text"],
        name=parsed.get("name"),
        email=parsed.get("email"),
        phone=parsed.get("phone"),
        education=parsed.get("education", []),
        technical_skills=parsed.get("technical_skills", []),
        soft_skills=parsed.get("soft_skills", []),
        projects=parsed.get("projects", []),
        experience=parsed.get("experience", []),
        certifications=parsed.get("certifications", []),
        experience_years=parsed.get("experience_years", 0) or 0,
        score=score,
        strengths=strengths,
        improvements=improvements,
        suggestions=suggestions,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    db.add(AnalysisHistory(
        user_id=current.id,
        analysis_type="resume",
        title=f"Resume: {file.filename}",
        summary=f"Score {score}/100 — {len(parsed.get('technical_skills', []))} skills detected",
        details={"resume_id": resume.id, "score": score, "skills": parsed.get("technical_skills", [])},
    ))
    db.commit()
    return _to_out(resume)


@router.post("/analyze/{resume_id}", response_model=ResumeOut)
def reanalyze(resume_id: int, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    r = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current.id).first()
    if not r:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
    # Re-score from the stored parsed data
    parsed = {
        "name": r.name, "email": r.email, "phone": r.phone,
        "education": r.education, "technical_skills": r.technical_skills,
        "soft_skills": r.soft_skills, "projects": r.projects,
        "experience": r.experience, "certifications": r.certifications,
        "experience_years": r.experience_years or 0,
    }
    score, strengths, improvements, suggestions = resume_score(parsed)
    r.score, r.strengths, r.improvements, r.suggestions = score, strengths, improvements, suggestions
    db.commit()
    db.refresh(r)
    return _to_out(r)


@router.get("/{resume_id}", response_model=ResumeOut)
def get_resume(resume_id: int, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    r = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current.id).first()
    if not r:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
    return _to_out(r)


@router.get("/", response_model=list[ResumeOut])
def list_resumes(db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    rows = db.query(Resume).filter(Resume.user_id == current.id).order_by(Resume.created_at.desc()).all()
    return [_to_out(r) for r in rows]


@router.get("/latest/summary")
def latest_summary(db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    """Lightweight summary of the user's latest resume for the dashboard."""
    r = db.query(Resume).filter(Resume.user_id == current.id).order_by(Resume.created_at.desc()).first()
    if not r:
        return {"has_resume": False}
    return {
        "has_resume": True,
        "resume_id": r.id,
        "filename": r.filename,
        "score": r.score,
        "skills": r.technical_skills or [],
        "soft_skills": r.soft_skills or [],
        "strengths": r.strengths or [],
        "improvements": r.improvements or [],
        "missing_count": len(r.improvements or []),
        "created_at": r.created_at.strftime("%Y-%m-%d %H:%M") if r.created_at else None,
    }
