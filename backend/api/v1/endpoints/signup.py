from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.config import settings
from core import security
from core.crud import user as user_crud
from core.schemas.token import Token, UserToken
from core.schemas import user as user_schema

from api import dependencies

router = APIRouter(
    prefix="/signup",
    tags=["signup"]
)


@router.post("/", response_model=UserToken, status_code=status.HTTP_201_CREATED)
def login(user: user_schema.UserCreate, db: Session = Depends(dependencies.get_db)):
    db_user = user_crud.get_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    db_user = user_crud.create(db=db, user=user)

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(data={"sub": db_user.email}, expires_delta=access_token_expires)
    return {"user": db_user, "token": {"access_token": access_token, "token_type": "bearer"}}