"""Resume text extraction and structured-field parsing.

Supports PDF (pypdf) and DOCX (python-docx) uploads. After raw text is
extracted we run lightweight regex heuristics to pull out name, email,
phone, education, projects, experience and certifications. These heuristics
are intentionally conservative — they look for well-known section headers and
recognisable patterns rather than guessing.
"""
import io
import re
from typing import Dict, List

from .skills import extract_skills

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"(?:\+?\d[\d\s\-().]{8,}\d)")
GPA_RE = re.compile(r"\b(CGPA|GPA)\b\s*[:\-]?\s*(\d(?:\.\d{1,2})?)", re.IGNORECASE)
YEAR_RE = re.compile(r"\b(?:19|20)\d{2}\b")

EDU_KEYWORDS = ["education", "academic", "qualification", "school", "college", "university"]
PROJECT_KEYWORDS = ["project", "projects"]
EXP_KEYWORDS = ["experience", "employment", "work history", "professional experience", "internship"]
CERT_KEYWORDS = ["certification", "certifications", "certificate", "courses", "achievements"]


def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        from pypdf import PdfReader
    except ImportError as exc:  # pragma: no cover
        raise RuntimeError("pypdf is not installed") from exc
    reader = PdfReader(io.BytesIO(file_bytes))
    parts: List[str] = []
    for page in reader.pages:
        try:
            parts.append(page.extract_text() or "")
        except Exception:
            parts.append("")
    return "\n".join(parts)


def extract_text_from_docx(file_bytes: bytes) -> str:
    try:
        from docx import Document
    except ImportError as exc:  # pragma: no cover
        raise RuntimeError("python-docx is not installed") from exc
    doc = Document(io.BytesIO(file_bytes))
    parts: List[str] = []
    for p in doc.paragraphs:
        if p.text:
            parts.append(p.text)
    # Include table cell text as well
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                if cell.text:
                    parts.append(cell.text)
    return "\n".join(parts)


def extract_text(filename: str, file_bytes: bytes) -> str:
    name = (filename or "").lower()
    if name.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)
    if name.endswith(".docx"):
        return extract_text_from_docx(file_bytes)
    # Fallback: treat as plain text
    try:
        return file_bytes.decode("utf-8", errors="ignore")
    except Exception:
        return ""


def _find_name(lines: List[str], email: str) -> str:
    """Heuristic: the name is usually the first non-empty line that is not an
    email/phone/header keyword and contains mostly letters."""
    skip_words = {"curriculum", "vitae", "resume", "cv", "profile", "contact"}
    for line in lines[:8]:
        line = line.strip()
        if not line:
            continue
        low = line.lower()
        if email and email.lower() in low:
            continue
        if "@" in line or PHONE_RE.search(line):
            continue
        if any(w in low for w in skip_words):
            continue
        # Only letters/spaces/dots, length reasonable
        if re.fullmatch(r"[A-Za-z][A-Za-z .\-]{2,40}", line):
            return line.title()
    return ""


def _section_blocks(text: str, keywords: List[str]) -> List[str]:
    """Return the text blocks under section headers matching `keywords`."""
    lines = text.splitlines()
    lower = [l.lower() for l in lines]
    blocks: List[str] = []
    for i, low in enumerate(lower):
        if any(k in low for k in keywords) and len(low) < 40:
            # collect following lines until next header-like line
            j = i + 1
            chunk: List[str] = []
            while j < len(lines):
                nxt = lines[j].strip()
                nxt_low = nxt.lower()
                if nxt and nxt_low.endswith(":") and len(nxt_low) < 45 and _is_header(nxt_low):
                    break
                if nxt:
                    chunk.append(nxt)
                j += 1
                if len(chunk) >= 15:
                    break
            if chunk:
                blocks.append("\n".join(chunk))
    return blocks


def _is_header(line: str) -> bool:
    headers = EDU_KEYWORDS + PROJECT_KEYWORDS + EXP_KEYWORDS + CERT_KEYWORDS + ["skills", "summary", "objective", "profile"]
    return any(h in line for h in headers)


def _split_list_items(block: str, limit: int = 12) -> List[str]:
    items = [b.strip().strip("-•*\u2022").strip() for b in re.split(r"\n|;", block) if b.strip()]
    items = [i for i in items if len(i) > 3]
    return items[:limit]


def parse_resume(filename: str, file_bytes: bytes) -> Dict:
    """Full pipeline: extract text -> parse structured fields -> skills."""
    text = extract_text(filename, file_bytes)
    if not text.strip():
        raise ValueError("Could not extract any text from the uploaded file. Is it a scanned/image PDF?")

    lines = [l for l in text.splitlines() if l.strip()]

    email = ""
    m = EMAIL_RE.search(text)
    if m:
        email = m.group(0).strip()
    phone = ""
    pm = PHONE_RE.search(text)
    if pm:
        phone = pm.group(0).strip()

    name = _find_name(lines, email)

    edu_blocks = _section_blocks(text, EDU_KEYWORDS)
    proj_blocks = _section_blocks(text, PROJECT_KEYWORDS)
    exp_blocks = _section_blocks(text, EXP_KEYWORDS)
    cert_blocks = _section_blocks(text, CERT_KEYWORDS)

    education = []
    for b in edu_blocks:
        education.extend(_split_list_items(b))
    projects = []
    for b in proj_blocks:
        projects.extend(_split_list_items(b))
    experience = []
    for b in exp_blocks:
        experience.extend(_split_list_items(b))
    certifications = []
    for b in cert_blocks:
        certifications.extend(_split_list_items(b))

    skills = extract_skills(text)

    gpa_match = GPA_RE.search(text)
    gpa = float(gpa_match.group(2)) if gpa_match else None
    years = YEAR_RE.findall(text)
    total_experience_years = _estimate_experience_years(exp_blocks, years)

    return {
        "raw_text": text,
        "name": name,
        "email": email,
        "phone": phone,
        "education": education,
        "technical_skills": skills["technical"],
        "soft_skills": skills["soft"],
        "projects": projects,
        "experience": experience,
        "certifications": certifications,
        "gpa": gpa,
        "experience_years": total_experience_years,
    }


def _estimate_experience_years(exp_blocks: List[str], years: List[str]) -> int:
    """Rough estimate: count distinct 4-digit years in experience blocks."""
    if not exp_blocks:
        return 0
    all_text = " ".join(exp_blocks)
    ys = YEAR_RE.findall(all_text)
    if not ys:
        return 0
    try:
        yints = sorted({int(y) for y in ys})
    except ValueError:
        return 0
    # Use spread of years found in experience blocks as a coarse estimate, capped at 30.
    return max(0, min(30, yints[-1] - yints[0]))
