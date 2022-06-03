import bcrypt
from fastapi import HTTPException
from sqlalchemy.orm import Session

import models
import schemas


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
    db_user = models.User(email=user.email, first_name=user.first_name, last_name=user.last_name,
                          hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user: models.User, updates: schemas.UserUpdateSchema):
    update_data = updates.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    db.commit()
    return user


def delete_user(db: Session, user: models.User):
    result = True
    try:
        db.delete(user)
        db.commit()
    except:
        result = False
    return result


def get_roles(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Role).offset(skip).limit(limit).all()


def get_role(db: Session, role_id: int):
    return db.query(models.Role).filter(models.Role.id == role_id).first()


def create_role(db: Session, role: schemas.RoleCreate):
    db_role = models.Role(**role.dict())
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role


def update_role(db: Session, role: models.Role, updates: schemas.RoleUpdateSchema):
    update_data = updates.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(role, key, value)
    db.commit()
    return role


def delete_role(db: Session, role: models.Role):
    result = True
    try:
        db.delete(role)
        db.commit()
    except:
        result = False
    return result


def add_role_to_user(db: Session, db_user: schemas.UserSchema, db_role: schemas.RoleSchema):
    db_user.roles.append(db_role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def remove_role_from_user(db: Session, db_user: schemas.UserSchema, db_role: schemas.RoleSchema):
    db_user.roles.remove(db_role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
