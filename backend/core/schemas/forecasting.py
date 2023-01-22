from pydantic import BaseModel, Json
import core.schemas.dataset as dataset
from core.enums.forecasting_model_enum import ForecastingModel, ForecastingStatus


class ForecastingBase(BaseModel):
    model: ForecastingModel
    status: ForecastingStatus
    split_ratio: int
    auto_tune: bool
    tune_brute_force: bool
    tune_level: int
    use_log_transform: bool
    use_decomposition: bool
    forecast_horizon: int
    params: Json | None = None
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
    auto_tune: bool | None = None
    tune_brute_force: bool | None = None
    tune_level: int | None = None
    use_log_transform: bool | None = None
    use_decomposition: bool | None = None
    forecast_horizon: int | None = None
    params: Json | None = None

