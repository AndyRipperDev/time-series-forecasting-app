from pydantic import BaseModel
from core.schemas.user import UserSchema


class Token(BaseModel):
    access_token: str
    token_type: str


class UserToken(BaseModel):
    user: UserSchema
    token: Token


class TokenData(BaseModel):
    username: str | None = None
