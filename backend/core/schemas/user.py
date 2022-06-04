from pydantic import BaseModel
import core.schemas.role as role


class UserBase(BaseModel):
    email: str
    first_name: str
    last_name: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True


class UserSchema(User):
    roles: list[role.Role] = []


class UserUpdateSchema(BaseModel):
    email: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    is_active: bool | None = None
