# AI-Powered Career Guidance, Resume Analyzer & Student Performance Prediction System

An AI-powered full-stack platform that analyzes resumes, extracts skills with
NLP, recommends suitable careers, performs skill-gap analysis, generates
personalized learning roadmaps, and predicts student academic performance with
machine learning.

Built as a B.Tech Computer Science major project — suitable for college
demonstration, a GitHub portfolio, and technical interviews.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Problem Statement](#problem-statement)
3. [Objectives](#objectives)
4. [Features](#features)
5. [Technologies Used](#technologies-used)
6. [Architecture](#architecture)
7. [Project Structure](#project-structure)
8. [Installation & Setup](#installation--setup)
9. [MySQL Setup](#mysql-setup)
10. [Backend Setup](#backend-setup)
11. [Frontend Setup](#frontend-setup)
12. [Running the Complete Project](#running-the-complete-project)
13. [ML Model Information](#ml-model-information)
14. [How the NLP Module Works](#how-the-nlp-module-works)
15. [How the ML Prediction Works](#how-the-ml-prediction-works)
16. [API Reference](#api-reference)
17. [Database Design](#database-design)
18. [Demo Mode & Login](#demo-mode--login)
19. [Security](#security)
20. [Screenshots](#screenshots)
21. [Future Scope](#future-scope)
22. [Conclusion](#conclusion)

---

## Project Overview

CareerAI helps students and early-career developers make informed decisions
about their careers. Upload a resume and the system extracts your skills,
projects, education and experience; scores the resume; recommends career
roles with transparent match percentages; shows your skill gaps against a
target role; generates a staged learning roadmap; and predicts your academic
performance risk using a trained machine-learning model.

Everything is backed by real logic — no random scores. The resume score is a
weighted completeness checklist, skill matching uses a curated skill knowledge
base with alias normalization, and the performance predictor trains and
evaluates multiple scikit-learn models and keeps the best one.

## Problem Statement

Students often lack clarity on:
- How strong their resume actually is and what it's missing.
- Which career paths match their current skills.
- Which specific skills to learn to reach a target role.
- How their study habits relate to likely academic outcomes.

Existing tools are either generic or locked behind paid services. This project
provides an integrated, explainable, free alternative.

## Objectives
- Parse PDF/DOCX resumes and extract structured data with NLP.
- Score resumes transparently (0–100) with actionable feedback.
- Match resumes against job descriptions with sub-scores.
- Recommend careers ranked by skill overlap.
- Compute skill gaps and career readiness against a target role.
- Generate a personalized, stage-wise learning roadmap with progress tracking.
- Predict student performance and risk level with a trained ML model.
- Persist every analysis to MySQL for a full history view.
- Provide a polished, responsive, dark-mode UI.

## Features
- **Landing page** with hero, feature sections, how-it-works, career categories, benefits, footer.
- **Authentication** — register, login, logout (bcrypt password hashing + JWT).
- **Dashboard** with real metrics, charts and recent activity.
- **AI Resume Analyzer** — upload PDF/DOCX, extract skills/projects/experience/certs, score 0–100 with strengths/improvements/suggestions.
- **Job Description Matching** — paste a JD, get overall + technical + experience + education match scores.
- **Job Recommendations** — ranked career roles with match %, required/user/missing skills and reasoning.
- **Career Guidance** — "What do you want to become?" with category filters and curated required skills.
- **Skill Gap Analysis** — matched/missing skills, readiness %, donut chart.
- **Learning Roadmap** — beginner → job-ready stages with Not Started / Learning / Completed progress (saved).
- **Student Performance Predictor** — ML estimate + risk level + factors + suggestions + charts.
- **Analysis History** — timestamped log of every analysis, filterable by type.
- **Light & Dark mode**, responsive sidebar + mobile navigation, loading/empty/toast states.

## Technologies Used
**Frontend:** React.js, Vite, JavaScript, Tailwind CSS, Recharts, React Router, Axios, lucide-react.
**Backend:** Python, FastAPI, SQLAlchemy, Pydantic, Uvicorn.
**Database:** MySQL (recommended) — with a local SQLite demo fallback so it runs out-of-the-box.
**AI/NLP:** Python regex + curated skill knowledge base (PDF/DOCX text extraction via pypdf & python-docx). spaCy can be swapped in.
**ML/Analytics:** scikit-learn, pandas, NumPy, matplotlib.
**Auth:** bcrypt (password hashing) + python-jose (JWT).

## Architecture

```
Browser (React SPA)
        │  REST/JSON (JWT bearer)
        ▼
FastAPI Backend  ──►  SQLAlchemy ORM  ──►  MySQL
  ├─ api/        (route handlers)
  ├─ services/   (roadmap generation)
  ├─ nlp/        (resume parsing + skill extraction + matching)
  ├─ ml/         (dataset generation + model training + prediction)
  └─ database/   (models + connection + seed)
```

A clean three-tier architecture: presentation (React), application/logic
(FastAPI services, NLP, ML), and data (MySQL via SQLAlchemy ORM). The NLP and ML
modules are decoupled service layers the API calls into.

## Project Structure
```
CollegeProject/
├── README.md
├── .gitignore
├── database/
│   └── schema.sql              # MySQL schema (reference / setup)
├── backend/
│   ├── requirements.txt
│   ├── .env.example
│   ├── main.py                 # FastAPI app entry point
│   ├── api/                    # route handlers (auth, resume, careers, jobs, performance, history)
│   ├── schemas/                # Pydantic request/response models
│   ├── services/               # roadmap generation
│   ├── nlp/                    # skills.py, extractor.py, matcher.py
│   ├── ml/                     # predictor.py (+ generated dataset)
│   ├── database/               # connection.py, models.py, seed.py
│   └── utils/                  # config.py, security.py
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    ├── .env.example
    └── src/
        ├── main.jsx, App.jsx, index.css
        ├── contexts/   (Auth, Theme, Toast)
        ├── services/   (api + feature clients)
        ├── components/ (Sidebar, Topbar, StatCard, Donut, ProgressBar, ...)
        ├── layouts/    (DashboardLayout)
        └── pages/      (Landing, Login, Register, Dashboard, ResumeAnalyzer,
                         CareerGuidance, JobRecommendations, SkillGap,
                         LearningRoadmap, PerformancePredictor, History,
                         Profile, Settings)
```

## Installation & Setup

Prerequisites: **Node.js 18+**, **Python 3.10+**, **MySQL 8** (optional — SQLite
fallback works for a quick demo).

### MySQL Setup

1. Start MySQL and create the database:
```bash
mysql -u root -p
```
```sql
CREATE DATABASE career_guidance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
(Optional) create a dedicated user and grant access. The full schema is in
`database/schema.sql` — the app also auto-creates tables on startup, so running
it is optional but recommended for a real MySQL install:
```bash
mysql -u root -p < database/schema.sql
```

### Backend Setup
```bash
cd backend
python -m venv .venv
# Windows:  .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt

# Configure the database URL
copy .env.example .env       # Windows
# cp .env.example .env        # macOS/Linux
# Edit .env and set DATABASE_URL to your MySQL connection string, e.g.
# DATABASE_URL=mysql+pymysql://root:yourpassword@localhost:3306/career_guidance
```

### Frontend Setup
```bash
cd frontend
npm install
copy .env.example .env      # Windows
# cp .env.example .env       # macOS/Linux
# VITE_API_URL defaults to http://localhost:8000 — change it if the backend moves
```

## Running the Complete Project

You need **two terminals**.

**Terminal 1 — Backend** (from `backend/`):
```bash
uvicorn main:app --reload --port 8000
```
API docs (Swagger UI): http://localhost:8000/docs

**Terminal 2 — Frontend** (from `frontend/`):
```bash
npm run dev
```
App: http://localhost:5173 (Vite uses 5174 if 5173 is taken)

That's it — open the app, register or use the demo account.

## ML Model Information

The performance predictor lives in `backend/ml/predictor.py`.

- **Dataset:** A synthetic but realistic dataset of 800 student records (generated
  deterministically with a fixed seed, also written to
  `backend/ml/data/student_performance.csv` for inspection). Features: attendance,
  internal marks, previous semester %, assignment score, study hours. The target
  `final_performance` is a weighted blend of the inputs plus Gaussian noise so the
  models can learn and generalize.
- **Models trained:** Linear Regression, Decision Tree Regressor, Random Forest
  Regressor. Each is evaluated on a held-out 20% test split with R² and MAE.
- **Selection:** The model with the highest R² is selected automatically and cached
  in memory. (In practice Linear Regression wins on this linear dataset — which is
  the honest, expected result.)
- **Prediction:** Inputs are standardized with the fitted scaler; the chosen model
  predicts `final_performance` (clamped 0–100). Risk level is derived from the
  predicted score: <50 → HIGH, 50–70 → MEDIUM, >70 → LOW. Factors and suggestions
  come from rule-based thresholds on the inputs.
- **Note:** Predictions are estimates based on the model and available data, not
  definitive outcomes. A real dataset (e.g. Kaggle student-performance data) can be
  dropped in as `student_performance.csv` to replace the synthetic one.

## How the NLP Module Works

Located in `backend/nlp/`.

1. **Text extraction** (`extractor.py`): `pypdf` reads PDFs, `python-docx` reads
   DOCX files. The raw text is then parsed with regex heuristics to find email,
   phone, name (first plausible non-header line), and section blocks under
   Education / Projects / Experience / Certifications headers.
2. **Skill extraction** (`skills.py`): A curated knowledge base of technical and
   soft skills plus an alias map (e.g. `mysql`→`MySQL`, `ml`→`Machine Learning`,
   `restful`→`REST API`). The resume text is scanned with compiled regex patterns
   (longest phrases first, word-boundary aware) to find canonical skills. This is
   deterministic, fast, and runs fully offline (no model download).
3. **Matching & scoring** (`matcher.py`):
   - `resume_score`: a weighted completeness checklist (contact 15, technical 25,
     soft 10, education 10, projects 15, experience 15, certifications 10).
   - `job_match_score`: extracts skills from the job description and computes the
     overlap percentage, plus experience (required years vs detected) and education
     sub-scores, blended into an overall match.
   - `skill_gap`: handles "/" alternatives (e.g. `Java/Python` means either
     satisfies the requirement); readiness = matched / total required × 100.
   - `job_recommendations`: ranks all careers by readiness for the user's resume.

## How the ML Prediction Works

See [ML Model Information](#ml-model-information) above. In short: the 5 numeric
inputs are scaled, the best-trained regressor predicts a performance percentage,
the percentage is bucketed into a risk level, and rule-based thresholds explain
which inputs are pulling the prediction down (factors) and what to do (suggestions).

## API Reference

Base URL: `http://localhost:8000`. Full interactive docs at `/docs`.

| Method | Endpoint | Auth | Description |
|-------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register (full_name, email, password, confirm_password) |
| POST | `/api/auth/login` | — | Login (email, password) |
| GET | `/api/auth/me` | ✅ | Current user |
| POST | `/api/resume/upload` | ✅ | Upload PDF/DOCX (multipart `file`) |
| POST | `/api/resume/analyze/{id}` | ✅ | Re-score a resume |
| GET | `/api/resume/{id}` | ✅ | Get a resume |
| GET | `/api/resume/` | ✅ | List resumes |
| GET | `/api/resume/latest/summary` | ✅ | Latest resume summary |
| GET | `/api/careers/` | — | List careers (?category=) |
| GET | `/api/careers/{id}` | — | Get a career |
| POST | `/api/careers/skill-gap` | ✅ | Skill gap (resume_id, career_id) |
| GET | `/api/careers/roadmap/{id}` | ✅ | Staged roadmap with progress |
| POST | `/api/careers/roadmap/progress` | ✅ | Update skill progress |
| POST | `/api/jobs/match` | ✅ | Match resume vs job description |
| GET | `/api/jobs/recommendations/{id}` | ✅ | Ranked careers (?category=) |
| POST | `/api/performance/predict` | ✅ | Predict performance |
| GET | `/api/performance/model-info` | — | Model metrics |
| GET | `/api/history` | ✅ | Analysis history (?analysis_type=) |
| GET | `/api/dashboard` | ✅ | Aggregated dashboard metrics |

Auth uses `Authorization: Bearer <jwt>`.

## Database Design

10 tables with primary keys, foreign keys, JSON columns for skill lists, and
timestamps. Full DDL in `database/schema.sql`.

`users`, `resumes`, `career_roles`, `skill_gap_results`, `job_descriptions`,
`job_recommendations`, `learning_progress`, `student_records`,
`performance_predictions`, `analysis_history`.

**Relationships:** users 1→N resumes; users 1→N skill_gap_results /
job_descriptions / job_recommendations / student_records /
performance_predictions / analysis_history; resumes N→1 users;
skill_gap_results N→1 career_roles; learning_progress (user, career, skill)
unique.

## Demo Mode & Login

A demo account is seeded on first startup so you can present instantly without
registering:

```
Email:    demo@careerguidance.ai
Password: demo1234
```

The demo user is flagged `is_demo = 1` so it's clearly separated from real users.
Use the "Use demo credentials" button on the login page.

### Demo walkthrough
1. Login with the demo account.
2. Go to Resume Analyzer → upload a PDF/DOCX.
3. Review extracted skills + resume score.
4. Career Guidance → pick "Java Developer".
5. Skill Gap Analysis → see readiness %.
6. Learning Roadmap → mark skills as Learning/Completed.
7. Jobs → Job Description Match (paste a JD) + Recommendations.
8. Performance Predictor → set sliders → predict.

## Security
- Passwords hashed with **bcrypt** (never stored in plain text).
- **JWT** bearer authentication on protected routes.
- File upload validation (PDF/DOCX only, 6MB max).
- Pydantic input validation on every endpoint.
- **Parameterized queries** via SQLAlchemy ORM (SQL-injection safe).
- CORS restricted to the configured frontend origins.
- Secrets via environment variables (`.env`); `.env` is gitignored; `.env.example` provided.

## Screenshots

Add screenshots here after running the app (landing, dashboard, resume analysis,
skill gap, roadmap, performance prediction). Recommended captures:

- `docs/screenshots/landing.png`
- `docs/screenshots/dashboard.png`
- `docs/screenshots/resume-analysis.png`
- `docs/screenshots/skill-gap.png`
- `docs/screenshots/roadmap.png`
- `docs/screenshots/performance.png`

## Future Scope
- Integrate a real job-listings API (e.g. a job board) for live recommendations.
- Train the performance model on a real student dataset (Kaggle) for higher accuracy.
- Add spaCy-based named-entity extraction for finer resume parsing.
- Resume-to-job ATS keyword optimization and one-click improvement rewrites.
- PDF export of the learning roadmap and reports.
- Email-based password reset and OAuth (Google) login.
- Multi-language resume parsing.

## Conclusion

CareerAI delivers an end-to-end, explainable career-guidance platform combining
NLP resume analysis, transparent skill matching, ranked career recommendations,
personalized roadmaps, and machine-learning performance prediction — all in a
modern, responsive interface backed by a relational database. It demonstrates a
complete full-stack + AI/ML pipeline suitable for a B.Tech major project.
