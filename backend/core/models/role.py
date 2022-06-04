from sqlalchemy import Column, Integer, String, DateTime, func

from core.models.database import Base


class Role(Base):
    __tablename__ = "role"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(50), nullable=False, index=True)
    description = Column(String(250))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
