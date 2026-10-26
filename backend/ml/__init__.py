"""Machine-learning package: student performance prediction."""
from .predictor import (
    predict_performance,
    get_model_info,
    generate_dataset,
    train_models,
)

__all__ = [
    "predict_performance",
    "get_model_info",
    "generate_dataset",
    "train_models",
]
