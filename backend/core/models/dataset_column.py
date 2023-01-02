import enum
from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey, Boolean, Enum

from core.db.base_class import Base
from core.enums.dataset_column_enum import ColumnMissingValuesMethod, ColumnScalingMethod


class DatasetColumn(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(250))
    data_type = Column(String(30))
    is_date = Column(Boolean, default=False, nullable=False)
    is_removed = Column(Boolean, default=False, nullable=False)
    scaling = Column(Enum(ColumnScalingMethod), nullable=True, default=None)
    missing_values_handler = Column(Enum(ColumnMissingValuesMethod), nullable=True, default=ColumnMissingValuesMethod.FillZeros)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    dataset_id = Column(Integer, ForeignKey("dataset.id"))
