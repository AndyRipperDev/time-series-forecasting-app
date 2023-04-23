from sqlalchemy import Column, Integer, Float, DateTime, func, ForeignKey, Enum
from sqlalchemy.orm import relationship, backref
from core.enums.forecasting_model_enum import ForecastingEvalMetricType

from core.db.base_class import Base


class EvaluationMetrics(Base):
    id = Column(Integer, primary_key=True, index=True)
    type = Column(Enum(ForecastingEvalMetricType), nullable=False, default=ForecastingEvalMetricType.Forecast)
    MAE = Column(Float, nullable=True)
    MSE = Column(Float, nullable=True)
    MAPE = Column(Float, nullable=True)
    SMAPE = Column(Float, nullable=True)
    R2 = Column(Float, nullable=True)
    WAPE = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    forecasting_id = Column(Integer, ForeignKey("forecasting.id", ondelete='CASCADE'))
    forecasting = relationship("Forecasting", backref=backref("evaluationmetrics", passive_deletes='all'))
