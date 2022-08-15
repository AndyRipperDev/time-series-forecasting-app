from sqlalchemy.orm import Session

from core.schemas import role as role_schema
from core.models import role as role_model


def get_all(db: Session, skip: int = 0, limit: int = 100):
    return db.query(role_model.Role).offset(skip).limit(limit).all()


def get(db: Session, role_id: int):
    return db.query(role_model.Role).filter(role_model.Role.id == role_id).first()


def get_by_title(db: Session, role_title: str):
    return db.query(role_model.Role).filter(role_model.Role.title == role_title).first()


def create(db: Session, role: role_schema.RoleCreate):
    db_role = role_model.Role(**role.dict())
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role


def update(db: Session, role: role_model.Role, updates: role_schema.RoleUpdateSchema):
    update_data = updates.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(role, key, value)
    db.commit()
    return role


def delete(db: Session, role: role_model.Role):
    result = True
    try:
        db.delete(role)
        db.commit()
    except:
        result = False
    return result
