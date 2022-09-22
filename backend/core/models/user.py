from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, func, Table
from sqlalchemy.orm import relationship

from core.db.base_class import Base

user_role_association_table = Table(
    "user_role",
    Base.metadata,
    Column("user_id", ForeignKey("user.id"), primary_key=True),
    Column("role_id", ForeignKey("role.id"), primary_key=True),
)


class User(Base):
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(50), unique=True, index=True)
    full_name = Column(String(70))
    hashed_password = Column(String(128))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    roles = relationship("Role", secondary=user_role_association_table, backref="users")
