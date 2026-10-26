"""Student performance prediction using scikit-learn.

Pipeline:
  1. generate_dataset()  -> synthetic but realistic training data. A CSV is
     written to ml/data/student_performance.csv the first time so the dataset
     is inspectable for the report. If a real dataset CSV is provided it will
     be used instead.
  2. train_models()       -> trains Linear Regression, Decision Tree and
     Random Forest regressors, evaluates them on a held-out test split with
     R^2 and MAE, and keeps the best-performing model.
  3. predict_performance() -> scales the 5 input features, runs the chosen
     model, and derives a risk level + factor-based suggestions.

The model trains lazily on first use and is cached in memory. Training a few
hundred rows takes well under a second, so no serialized artifact is needed.
"""
import os
from threading import Lock
from typing import Dict, List, Tuple

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, r2_score

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
CSV_PATH = os.path.join(DATA_DIR, "student_performance.csv")

FEATURES = ["attendance", "internal_marks", "prev_semester", "assignment_score", "study_hours"]
RANDOM_STATE = 42
_lock = Lock()

_model_state: Dict = {}


# ----------------------------------------------------------------------
# Dataset
# ----------------------------------------------------------------------
def generate_dataset(n: int = 800, seed: int = RANDOM_STATE) -> pd.DataFrame:
    """Generate a realistic synthetic student dataset.

    The target (final_performance) is a weighted blend of the inputs plus
    Gaussian noise, so the learned models can recover the relationships and
    generalise. Thresholds used for risk labelling match the prediction logic.
    """
    rng = np.random.RandomState(seed)
    attendance = rng.uniform(55, 100, n)
    internal_marks = rng.uniform(30, 95, n)
    prev_semester = rng.uniform(40, 95, n)
    assignment_score = rng.uniform(30, 100, n)
    study_hours = rng.uniform(0.5, 9, n)

    study_score = np.minimum(study_hours / 8.0, 1.0) * 100
    final = (
        0.22 * attendance
        + 0.23 * internal_marks
        + 0.25 * prev_semester
        + 0.15 * assignment_score
        + 0.15 * study_score
        + rng.normal(0, 4, n)
    )
    final = np.clip(final, 0, 100)

    df = pd.DataFrame({
        "attendance": np.round(attendance, 1),
        "internal_marks": np.round(internal_marks, 1),
        "prev_semester": np.round(prev_semester, 1),
        "assignment_score": np.round(assignment_score, 1),
        "study_hours": np.round(study_hours, 1),
        "final_performance": np.round(final, 1),
    })
    df["risk_level"] = pd.cut(
        df["final_performance"],
        bins=[-np.inf, 50, 70, np.inf],
        labels=["HIGH", "MEDIUM", "LOW"],
    )
    return df


def _ensure_dataset() -> pd.DataFrame:
    """Use a real CSV if present, otherwise generate + cache one to disk."""
    if os.path.exists(CSV_PATH):
        try:
            return pd.read_csv(CSV_PATH)
        except Exception:
            pass
    os.makedirs(DATA_DIR, exist_ok=True)
    df = generate_dataset()
    df.to_csv(CSV_PATH, index=False)
    return df


# ----------------------------------------------------------------------
# Training
# ----------------------------------------------------------------------
def train_models() -> Dict:
    """Train candidate regressors, evaluate, and cache the best one."""
    with _lock:
        if _model_state.get("ready"):
            return _model_state
        df = _ensure_dataset()
        X = df[FEATURES].values
        y = df["final_performance"].values
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=RANDOM_STATE
        )

        scaler = StandardScaler().fit(X_train)
        X_train_s = scaler.transform(X_train)
        X_test_s = scaler.transform(X_test)

        candidates = {
            "Linear Regression": LinearRegression(),
            "Decision Tree": DecisionTreeRegressor(random_state=RANDOM_STATE, max_depth=8),
            "Random Forest": RandomForestRegressor(n_estimators=150, random_state=RANDOM_STATE, max_depth=10),
        }
        results = {}
        best_name, best_model, best_r2 = None, None, -np.inf
        for name, model in candidates.items():
            # Tree models don't strictly need scaling, but scaling is harmless.
            model.fit(X_train_s, y_train)
            pred = model.predict(X_test_s)
            r2 = r2_score(y_test, pred)
            mae = mean_absolute_error(y_test, pred)
            results[name] = {"r2": round(float(r2), 3), "mae": round(float(mae), 2)}
            if r2 > best_r2:
                best_r2 = r2
                best_name, best_model = name, model

        _model_state.update({
            "ready": True,
            "model": best_model,
            "scaler": scaler,
            "best_model_name": best_name,
            "metrics": results,
            "feature_names": FEATURES,
            "rows": int(len(df)),
        })
        return _model_state


# ----------------------------------------------------------------------
# Prediction
# ----------------------------------------------------------------------
def _risk_from_score(score: float) -> str:
    if score < 50:
        return "HIGH"
    if score < 70:
        return "MEDIUM"
    return "LOW"


def _derive_factors(inputs: Dict) -> Tuple[List[str], List[str]]:
    """Return (factors, suggestions) from rule-based thresholds."""
    factors: List[str] = []
    suggestions: List[str] = []
    if inputs["attendance"] < 75:
        factors.append("Low Attendance")
        suggestions.append("Increase attendance above the required threshold (75%)")
    if inputs["internal_marks"] < 50:
        factors.append("Low Internal Marks")
        suggestions.append("Improve internal assessment scores and regular class tests")
    if inputs["prev_semester"] < 60:
        factors.append("Low Previous Semester Performance")
        suggestions.append("Strengthen weak subjects carried over from the last semester")
    if inputs["assignment_score"] < 60:
        factors.append("Low Assignment Score")
        suggestions.append("Submit all assignments on time with quality work")
    if inputs["study_hours"] < 2:
        factors.append("Low Study Hours")
        suggestions.append("Follow a weekly study schedule of at least 2-3 focused hours/day")
    if not factors:
        factors.append("Strong Academic Profile")
        suggestions.append("Maintain consistency and focus on advanced topics and projects")
    return factors, suggestions


def predict_performance(inputs: Dict, subject_marks: Dict | None = None) -> Dict:
    """Predict final performance %, risk level, factors and suggestions.

    inputs keys: attendance, internal_marks, prev_semester, assignment_score,
    study_hours (all percentages except study_hours in hours/day).
    subject_marks is optional, used only for subject-level visualization.
    """
    state = train_models()  # lazy + cached
    row = np.array([[float(inputs[f]) for f in FEATURES]])
    row_s = state["scaler"].transform(row)
    pred = float(state["model"].predict(row_s)[0])
    pred = max(0.0, min(100.0, pred))

    factors, suggestions = _derive_factors(inputs)
    risk = _risk_from_score(pred)

    return {
        "predicted_performance": round(pred, 1),
        "risk_level": risk,
        "factors": factors,
        "suggestions": suggestions,
        "inputs": inputs,
        "subject_marks": subject_marks or {},
        "model_used": state["best_model_name"],
    }


def get_model_info() -> Dict:
    state = train_models()
    return {
        "best_model": state["best_model_name"],
        "metrics": state["metrics"],
        "features": state["feature_names"],
        "dataset_rows": state["rows"],
        "dataset_path": CSV_PATH,
    }
