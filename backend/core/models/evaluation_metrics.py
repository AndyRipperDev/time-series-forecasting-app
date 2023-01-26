from sqlalchemy import Column, Integer, Float, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship, backref

from core.db.base_class import Base


class EvaluationMetrics(Base):
    id = Column(Integer, primary_key=True, index=True)
    MAE = Column(Float, nullable=False)
    MSE = Column(Float, nullable=False)
    MAPE = Column(Float, nullable=False)
    SMAPE = Column(Float, nullable=False)
    R2 = Column(Float, nullable=False)
    WAPE = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    forecasting_id = Column(Integer, ForeignKey("forecasting.id"))
    forecasting = relationship("Forecasting", backref=backref("evaluationmetrics", uselist=False))
