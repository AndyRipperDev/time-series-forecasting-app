from pydantic import BaseModel


class RoleBase(BaseModel):
    title: str
    description: str | None = None


class RoleCreate(RoleBase):
    pass


class Role(RoleBase):
    id: int

    class Config:
        orm_mode = True


import core.schemas.user as user


class RoleSchema(Role):
    users: list[user.User] = []


class RoleUpdateSchema(BaseModel):
    title: str | None = None
    description: str | None = None
