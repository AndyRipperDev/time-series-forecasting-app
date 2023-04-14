from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey, Enum, JSON, Boolean

from core.db.base_class import Base
from core.enums.forecasting_model_enum import ForecastingModel, ForecastingStatus


class Forecasting(Base):
    id = Column(Integer, primary_key=True, index=True)
    model = Column(Enum(ForecastingModel), nullable=False, default=ForecastingModel.ARIMA)
    status = Column(Enum(ForecastingStatus), nullable=False, default=ForecastingStatus.Ready)
    split_ratio = Column(Integer, nullable=False, default=80)
    auto_tune = Column(Boolean, default=False, nullable=False)
    tune_brute_force = Column(Boolean, default=False, nullable=False)
    tune_level = Column(Integer, nullable=False, default=1)
    use_log_transform = Column(Boolean, default=False, nullable=False)
    use_decomposition = Column(Boolean, default=False, nullable=True)
    forecast_horizon = Column(Integer, nullable=False, default=1)
    lag_window = Column(Integer, nullable=True, default=3)
    lagged_features = Column(String(500), nullable=True)
    params = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    column_id = Column(Integer, ForeignKey("datasetcolumn.id", ondelete='CASCADE'))

