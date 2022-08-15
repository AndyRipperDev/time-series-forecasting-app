from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from core import security
from core.crud.user import authenticate
from core.schemas.token import Token
from core.config import settings
from core.schemas import user as user_schema
from core.models import user as user_model

from api import dependencies

router = APIRouter(
    prefix="/login",
    tags=["login"]
)


@router.post("/access-token", response_model=Token)
def login_access_token(db: Session = Depends(dependencies.get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    db_user = authenticate(db, email=form_data.username, password=form_data.password)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not db_user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(data={"sub": db_user.email}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/test-token", response_model=user_schema.User)
def test_token(current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    """
    Test access token
    """
    return current_user
