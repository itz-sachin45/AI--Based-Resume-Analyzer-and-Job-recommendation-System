-- ============================================================
-- MySQL schema for the Career Guidance platform.
-- The app auto-creates tables on startup via SQLAlchemy (so running
-- this is optional), but this file documents the relational design
-- and is the recommended way to set up a real MySQL database.
--
-- Usage:
--   mysql -u root -p < database/schema.sql
--   (or open MySQL Workbench and run it)
-- ============================================================

CREATE DATABASE IF NOT EXISTS career_guidance
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE career_guidance;

-- ---------- users ----------
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(150) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_demo       TINYINT DEFAULT 0,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ---------- resumes ----------
CREATE TABLE IF NOT EXISTS resumes (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  user_id           INT NOT NULL,
  filename          VARCHAR(255) NOT NULL,
  raw_text          MEDIUMTEXT NOT NULL,
  name              VARCHAR(150),
  email             VARCHAR(150),
  phone             VARCHAR(50),
  education          JSON,
  technical_skills   JSON,
  soft_skills        JSON,
  projects           JSON,
  experience         JSON,
  certifications      JSON,
  score             FLOAT DEFAULT 0,
  experience_years  INT DEFAULT 0,
  strengths         JSON,
  improvements      JSON,
  suggestions       JSON,
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_resume_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_resume_user (user_id)
);

-- ---------- career_roles ----------
CREATE TABLE IF NOT EXISTS career_roles (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(150) NOT NULL UNIQUE,
  category        VARCHAR(80) NOT NULL,
  description     TEXT,
  required_skills JSON
);

-- ---------- skill_gap_results ----------
CREATE TABLE IF NOT EXISTS skill_gap_results (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT NOT NULL,
  resume_id      INT NOT NULL,
  career_id      INT NOT NULL,
  career_name    VARCHAR(150) NOT NULL,
  matched_skills JSON,
  missing_skills JSON,
  total_required INT DEFAULT 0,
  total_matched  INT DEFAULT 0,
  readiness      FLOAT DEFAULT 0,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_gap_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_gap_resume FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
  CONSTRAINT fk_gap_career FOREIGN KEY (career_id) REFERENCES career_roles(id),
  INDEX idx_gap_user (user_id)
);

-- ---------- job_descriptions ----------
CREATE TABLE IF NOT EXISTS job_descriptions (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  resume_id       INT NOT NULL,
  text            TEXT NOT NULL,
  match_score     FLOAT DEFAULT 0,
  matched_skills  JSON,
  missing_skills  JSON,
  details         JSON,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_jd_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_jd_resume FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
  INDEX idx_jd_user (user_id)
);

-- ---------- job_recommendations ----------
CREATE TABLE IF NOT EXISTS job_recommendations (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL,
  resume_id        INT NOT NULL,
  role             VARCHAR(150) NOT NULL,
  category         VARCHAR(80),
  match_percentage FLOAT DEFAULT 0,
  required_skills  JSON,
  user_skills      JSON,
  missing_skills   JSON,
  reason           TEXT,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rec_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_rec_resume FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
  INDEX idx_rec_user (user_id)
);

-- ---------- learning_progress ----------
CREATE TABLE IF NOT EXISTS learning_progress (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  career_id  INT NOT NULL,
  skill      VARCHAR(150) NOT NULL,
  stage      INT DEFAULT 1,
  status     VARCHAR(20) DEFAULT 'not_started',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_lp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_lp_career FOREIGN KEY (career_id) REFERENCES career_roles(id),
  UNIQUE KEY uq_learning_progress (user_id, career_id, skill)
);

-- ---------- student_records ----------
CREATE TABLE IF NOT EXISTS student_records (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL,
  attendance        FLOAT NOT NULL,
  internal_marks    FLOAT NOT NULL,
  prev_semester     FLOAT NOT NULL,
  assignment_score  FLOAT NOT NULL,
  study_hours       FLOAT NOT NULL,
  subject_marks     JSON,
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sr_user (user_id)
);

-- ---------- performance_predictions ----------
CREATE TABLE IF NOT EXISTS performance_predictions (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  user_id               INT NOT NULL,
  attendance             FLOAT NOT NULL,
  internal_marks         FLOAT NOT NULL,
  prev_semester          FLOAT NOT NULL,
  assignment_score       FLOAT NOT NULL,
  study_hours            FLOAT NOT NULL,
  risk_level             VARCHAR(20) NOT NULL,
  predicted_performance  FLOAT NOT NULL,
  factors                JSON,
  suggestions            JSON,
  created_at             DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_pp_user (user_id)
);

-- ---------- analysis_history ----------
CREATE TABLE IF NOT EXISTS analysis_history (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  analysis_type VARCHAR(50) NOT NULL,
  title         VARCHAR(255),
  summary       TEXT,
  details       JSON,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_hist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_hist_user (user_id)
);
