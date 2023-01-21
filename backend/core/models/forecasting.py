from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey, Enum

from core.db.base_class import Base
from core.enums.forecasting_model_enum import ForecastingModel, ForecastingStatus


class Forecasting(Base):
    id = Column(Integer, primary_key=True, index=True)
    model = Column(Enum(ForecastingModel), nullable=False, default=ForecastingModel.ARIMA)
    status = Column(Enum(ForecastingStatus), nullable=False, default=ForecastingStatus.Ready)
    split_ratio = Column(Integer, nullable=False, default=80)
    results_filename = Column(String(250))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    column_id = Column(Integer, ForeignKey("datasetcolumn.id"))
