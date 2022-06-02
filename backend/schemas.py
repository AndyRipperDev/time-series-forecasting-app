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


class UserUpdateSchema(BaseModel):
    email: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    is_active: bool | None = None


class RoleUpdateSchema(BaseModel):
    title: str | None = None
    description: str | None = None
