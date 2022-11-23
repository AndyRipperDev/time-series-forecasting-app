from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey, Enum
from sqlalchemy.orm import relationship, backref

from core.db.base_class import Base
from core.enums.time_period_enum import TimePeriodUnit


class TimePeriod(Base):
    id = Column(Integer, primary_key=True, index=True)
    value = Column(Integer)
    unit = Column(Enum(TimePeriodUnit), nullable=False, default=TimePeriodUnit.Year)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    dataset_id = Column(Integer, ForeignKey("dataset.id"))
    dataset = relationship("Dataset", backref=backref("time_period", uselist=False))
