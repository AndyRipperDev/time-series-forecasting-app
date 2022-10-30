from pydantic import BaseModel


class ProjectBase(BaseModel):
    title: str
    description: str | None = None


class ProjectCreate(ProjectBase):
    pass


class Project(ProjectBase):
    id: int

    class Config:
        orm_mode = True


class ProjectSchema(Project):
    user_id: int


class ProjectUpdateSchema(BaseModel):
    title: str | None = None
    description: str | None = None
