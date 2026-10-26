"""End-to-end smoke test for the backend API (no external deps, uses urllib)."""
import io
import json
import urllib.request
import urllib.error
from docx import Document

BASE = "http://localhost:8000"


def post_json(path, payload, token=None):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(BASE + path, data=data, headers={"Content-Type": "application/json"})
    if token:
        req.add_header("Authorization", "Bearer " + token)
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())


def get(path, token=None):
    req = urllib.request.Request(BASE + path)
    if token:
        req.add_header("Authorization", "Bearer " + token)
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())


def make_resume():
    d = Document()
    d.add_paragraph("Aarav Sharma")
    d.add_paragraph("aarav.sharma@example.com | +91 9876543210")
    d.add_heading("Summary", level=2)
    d.add_paragraph("Backend developer experienced in Java, Spring Boot and REST APIs.")
    d.add_heading("Skills", level=2)
    d.add_paragraph("Java, Spring Boot, REST API, MySQL, Git, OOP, Python, JavaScript, React")
    d.add_heading("Education", level=2)
    d.add_paragraph("B.Tech Computer Science, XYZ Institute, 2022")
    d.add_heading("Experience", level=2)
    d.add_paragraph("Software Intern at ABC Corp (2021-2022): Built REST APIs in Spring Boot with MySQL backend.")
    d.add_heading("Projects", level=2)
    d.add_paragraph("E-Commerce API: Spring Boot REST service with JWT auth and MySQL. Reduced response time by 30%.")
    d.add_paragraph("Resume Analyzer: Python FastAPI app for resume skill extraction.")
    d.add_heading("Certifications", level=2)
    d.add_paragraph("AWS Certified Developer Associate")
    buf = io.BytesIO()
    d.save(buf)
    return buf.getvalue()


def upload_resume(token, filename, content):
    boundary = "----testboundary1234"
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
        "Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document\r\n\r\n"
    ).encode() + content + f"\r\n--{boundary}--\r\n".encode()
    req = urllib.request.Request(
        BASE + "/api/resume/upload",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
    )
    req.add_header("Authorization", "Bearer " + token)
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())


if __name__ == "__main__":
    # Register the test user (ignore 409 if already exists), then login.
    try:
        post_json("/api/auth/register", {
            "full_name": "Test User", "email": "test@example.com",
            "password": "password123", "confirm_password": "password123",
        })
    except urllib.error.HTTPError as e:
        print("register (already exists):", e.code)
    login = post_json("/api/auth/login", {"email": "test@example.com", "password": "password123"})
    token = login["access_token"]
    print("Login OK:", login["user"]["email"])

    # Upload resume
    content = make_resume()
    res = upload_resume(token, "sample_resume.docx", content)
    print("Resume score:", res["score"], "/100")
    print("Skills:", res["technical_skills"])
    print("Name/Email:", res["name"], "/", res["email"])
    rid = res["id"]

    # Skill gap vs Backend Developer (career_id=4)
    gap = post_json("/api/careers/skill-gap", {"resume_id": rid, "career_id": 4}, token)
    print("Skill gap:", gap["career_name"], "-> readiness", gap["readiness"], "%")
    print("  matched:", gap["matched_skills"])
    print("  missing:", gap["missing_skills"])

    # Job recommendations
    recs = get(f"/api/jobs/recommendations/{rid}", token)
    print("Recommendations:", len(recs), "| Top:", recs[0]["role"], recs[0]["match_percentage"], "%")

    # Job match against a description
    jd = "We need a Java developer with Spring Boot, REST API, MySQL and Git. 1+ years experience. Bachelor degree required."
    jm = post_json("/api/jobs/match", {"resume_id": rid, "job_description": jd}, token)
    print("Job match:", jm["match_score"], "% | matched:", jm["matched_skills"], "| missing:", jm["missing_skills"])
    print("  details:", jm["details"])

    # Roadmap for Backend Developer
    rm = get("/api/careers/roadmap/4", token)
    print("Roadmap for", rm["career_name"], "->", len(rm["stages"]), "stages")
    for s in rm["stages"]:
        print("  Stage", s["stage"], s["label"], ":", [sk["skill"] + "(" + sk["status"] + ")" for sk in s["skills"]])

    # Performance prediction
    perf = post_json("/api/performance/predict", {
        "attendance": 72, "internal_marks": 58, "prev_semester": 65,
        "assignment_score": 70, "study_hours": 1.5,
        "subject_marks": {"Maths": 70, "DBMS": 80, "OS": 55},
    }, token)
    print("Performance: risk", perf["risk_level"], "predicted", perf["predicted_performance"], "%")
    print("  factors:", perf["factors"])
    print("  model:", perf["model_used"])

    # Dashboard
    dash = get("/api/dashboard", token)
    print("Dashboard: resume_score", dash.get("resume_score"), "skills", dash.get("skills_detected"),
          "readiness", dash.get("career_readiness"), "risk", dash.get("performance_risk"))

    # History
    hist = get("/api/history", token)
    print("History entries:", len(hist), "| types:", sorted({h["analysis_type"] for h in hist}))
    print("\nALL TESTS PASSED")
