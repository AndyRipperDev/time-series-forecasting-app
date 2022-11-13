from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey

from core.db.base_class import Base


class DatasetColumn(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(250))
    data_type = Column(String(250))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    dataset_id = Column(Integer, ForeignKey("dataset.id"))
