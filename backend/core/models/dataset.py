from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship, backref

from core.db.base_class import Base


class Dataset(Base):
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(250))
    filename_processed = Column(String(250))
    delimiter = Column(String(2))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    project_id = Column(Integer, ForeignKey("project.id", ondelete='CASCADE'))
    project = relationship("Project", backref=backref("dataset", uselist=False, passive_deletes='all'))
    columns = relationship("DatasetColumn", backref="datasets", passive_deletes='all')
