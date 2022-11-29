from pydantic import BaseModel
import core.schemas.dataset as dataset
from core.enums.time_period_enum import TimePeriodUnit


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
    dataset: dataset.DatasetSchema # | None = None  # list[dataset.DatasetSchema] = []


class ProjectUpdateSchema(BaseModel):
    title: str | None = None
    description: str | None = None


class ProjectDatasetUpdateSchema(BaseModel):
    title: str | None = None
    description: str | None = None
    delimiter: str | None = None
    time_period_value: int | None = None
    time_period_unit: TimePeriodUnit | None = None
