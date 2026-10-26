from typing import Any, Dict, Optional
from datetime import datetime
from pydantic import BaseModel


class MessageOut(BaseModel):
    message: str
    detail: Optional[str] = None


class HistoryOut(BaseModel):
    id: int
    analysis_type: str
    title: str
    summary: str
    details: Dict = {}
    created_at: str


class HistoryItem(BaseModel):
    id: int
    user_id: int
    analysis_type: str
    title: str
    summary: str
    details: Dict[str, Any] = {}
    created_at: datetime
