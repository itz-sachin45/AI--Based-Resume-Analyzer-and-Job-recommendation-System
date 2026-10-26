"""Shared FastAPI dependencies: database session + current user."""
from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import User
from utils.security import decode_access_token


def get_current_user(
    authorization: str = Header(default=""),
    db: Session = Depends(get_db),
) -> User:
    """Extract and validate the JWT bearer token, returning the User row.

    Raises 401 if the header is missing/malformed, the token is invalid, or the
    user no longer exists.
    """
    creds_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not authorization or not authorization.lower().startswith("bearer "):
        raise creds_error
    token = authorization.split(" ", 1)[1].strip()
    try:
        payload = decode_access_token(token)
    except ValueError:
        raise creds_error
    user_id = payload.get("sub")
    if not user_id:
        raise creds_error
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise creds_error
    return user
