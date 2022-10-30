from pydantic import BaseModel
import core.schemas.role as role
import core.schemas.project as project


class UserBase(BaseModel):
    email: str
    full_name: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True


class UserSchema(User):
    roles: list[role.Role] = []
    projects: list[project.Project] = []


class UserUpdateSchema(BaseModel):
    email: str | None = None
    full_name: str | None = None
    is_active: bool | None = None
