from sqlalchemy.orm import Session

from core import security
from core.schemas import role as role_schema, user as user_schema
from core.models import user as user_model
from core.security import verify_password


def get_user(db: Session, user_id: int):
    return db.query(user_model.User).filter(user_model.User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(user_model.User).filter(user_model.User.email == email).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(user_model.User).offset(skip).limit(limit).all()


def create_user(db: Session, user: user_schema.UserCreate):
    db_user = user_model.User(email=user.email, first_name=user.first_name, last_name=user.last_name, hashed_password=security.get_password_hash(user.password))
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user: user_model.User, updates: user_schema.UserUpdateSchema):
    update_data = updates.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    db.commit()
    return user


def delete_user(db: Session, user: user_model.User):
    result = True
    try:
        db.delete(user)
        db.commit()
    except:
        result = False
    return result


def add_role_to_user(db: Session, db_user: user_schema.UserSchema, db_role: role_schema.RoleSchema):
    db_user.roles.append(db_role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def remove_role_from_user(db: Session, db_user: user_schema.UserSchema, db_role: role_schema.RoleSchema):
    db_user.roles.remove(db_role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, email: str, password: str):
    db_user = get_user_by_email(db, email=email)
    if not db_user:
        return None
    if not verify_password(password, db_user.hashed_password):
        return None
    return db_user
