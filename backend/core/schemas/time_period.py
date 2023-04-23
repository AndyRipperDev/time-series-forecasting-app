from pydantic import BaseModel
from core.enums.time_period_enum import TimePeriodUnit


class TimePeriodBase(BaseModel):
    value: int
    unit: TimePeriodUnit

    class Config:
        use_enum_values = True


class TimePeriodCreate(TimePeriodBase):
    pass


class TimePeriod(TimePeriodBase):
    id: int

    class Config:
        orm_mode = True


class TimePeriodSchema(TimePeriod):
    dataset_id: int


class TimePeriodUpdateSchema(BaseModel):
    id: int
    value: int | None = None
    unit: TimePeriodUnit | None = None
