from pydantic import BaseModel


class EvaluationMetricsBase(BaseModel):
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
    MAE: float | None = None
    MSE: float | None = None
    MAPE: float | None = None
    SMAPE: float | None = None
    R2: float | None = None
    WAPE: float | None = None
