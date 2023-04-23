from pydantic import BaseModel
from core.enums.forecasting_model_enum import ForecastingEvalMetricType

class EvaluationMetricsBase(BaseModel):
    type: ForecastingEvalMetricType
    MAE: float | None = None
    MSE: float | None = None
    MAPE: float | None = None
    SMAPE: float | None = None
    R2: float | None = None
    WAPE: float | None = None


class EvaluationMetricsCreate(EvaluationMetricsBase):
    pass


class EvaluationMetrics(EvaluationMetricsBase):
    id: int

    class Config:
        orm_mode = True


class EvaluationMetricsSchema(EvaluationMetrics):
    forecasting_id: int


class EvaluationMetricsUpdateSchema(BaseModel):
    type: ForecastingEvalMetricType | None = None
    MAE: float | None = None
    MSE: float | None = None
    MAPE: float | None = None
    SMAPE: float | None = None
    R2: float | None = None
    WAPE: float | None = None
