"""FastAPI application entry point.

Run with:
    uvicorn main:app --reload --port 8000
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from utils.config import settings
from database.connection import init_db
from database.seed import run_seed
from api import auth, resume, careers, jobs, performance, history


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables and seed reference data on startup.
    init_db()
    run_seed()
    yield


app = FastAPI(
    title=settings.app_name,
    description="AI-Powered Career Guidance, Resume Analyzer & Student Performance Prediction System",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(careers.router)
app.include_router(jobs.router)
app.include_router(performance.router)
app.include_router(history.router)


@app.get("/", tags=["health"])
def root():
    return {"status": "ok", "app": settings.app_name, "docs": "/docs"}


@app.get("/api/health", tags=["health"])
def health():
    return {"status": "healthy", "environment": settings.environment}
