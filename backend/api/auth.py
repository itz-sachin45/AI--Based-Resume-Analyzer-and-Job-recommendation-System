"""Authentication endpoints: register, login, current user."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import User
from schemas.auth import UserCreate, UserLogin, UserOut, Token
from utils.security import create_access_token, hash_password, verify_password
from .deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    user = User(
        full_name=payload.full_name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        is_demo=0,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id, extra={"name": user.full_name})
    return {
        "access_token": token,
        "user": UserOut(id=user.id, full_name=user.full_name, email=user.email, is_demo=bool(user.is_demo)),
    }


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    token = create_access_token(user.id, extra={"name": user.full_name})
    return {
        "access_token": token,
        "user": UserOut(id=user.id, full_name=user.full_name, email=user.email, is_demo=bool(user.is_demo)),
    }


@router.get("/me", response_model=UserOut)
def me(current: User = Depends(get_current_user)):
    return UserOut(id=current.id, full_name=current.full_name, email=current.email, is_demo=bool(current.is_demo))
