from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey

from core.db.base_class import Base


class Project(Base):
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(50), nullable=False, index=True)
    description = Column(String(250))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user_id = Column(Integer, ForeignKey("user.id"))
