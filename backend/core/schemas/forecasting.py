from pydantic import BaseModel
import core.schemas.dataset as dataset
from core.enums.forecasting_model_enum import ForecastingModel, ForecastingStatus


class ForecastingBase(BaseModel):
    model: ForecastingModel
    status: ForecastingStatus
    split_ratio: int
    results_filename: str


class ForecastingCreate(ForecastingBase):
    pass


class Forecasting(ForecastingBase):
    id: int

    class Config:
        orm_mode = True


class ForecastingSchema(Forecasting):
    column_id: int


class ForecastingUpdateSchema(BaseModel):
    model: ForecastingModel | None = None
    status: ForecastingStatus | None = None
    split_ratio: int | None = None

