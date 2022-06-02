from pydantic import BaseModel


class RoleBase(BaseModel):
    title: str
    description: str | None = None


class UserBase(BaseModel):
    email: str
    first_name: str
    last_name: str


class RoleCreate(RoleBase):
    pass


class UserCreate(UserBase):
    password: str


class Role(RoleBase):
    id: int

    class Config:
        orm_mode = True


class User(UserBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True


class RoleSchema(Role):
    users: list[User] = []


class UserSchema(User):
    roles: list[Role] = []
