from fastapi import APIRouter, Depends, HTTPException, status

from sqlalchemy.orm import Session

from core.crud import role as role_crud
from core.crud import user as user_crud

from core.schemas import user as user_schema
from core.schemas import role as role_schema

from core.models import user as user_model

from api import dependencies

router = APIRouter(
    prefix="/users",
    tags=["users"]
)


@router.post("/", response_model=user_schema.UserSchema, status_code=status.HTTP_201_CREATED)
def create_user(user: user_schema.UserCreate, db: Session = Depends(dependencies.get_db)):
    db_user = user_crud.get_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    return user_crud.create(db=db, user=user)


@router.get("/", response_model=list[user_schema.UserSchema], status_code=status.HTTP_200_OK)
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(dependencies.get_db), current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    users = user_crud.get_all(db, skip=skip, limit=limit)
    return users


@router.get("/{user_id}", response_model=user_schema.UserSchema, status_code=status.HTTP_200_OK)
def read_user(user_id: int, db: Session = Depends(dependencies.get_db)):
    db_user = user_crud.get(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return db_user


@router.patch("/{user_id}", response_model=user_schema.UserSchema, status_code=status.HTTP_200_OK)
def update_user(user_id: int, user: user_schema.UserUpdateSchema, db: Session = Depends(dependencies.get_db)):
    db_user = user_crud.get(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    db_user = user_crud.update(db, user=db_user, updates=user)

    return db_user


@router.delete("/{user_id}", status_code=status.HTTP_200_OK)
def delete_user(user_id: int, db: Session = Depends(dependencies.get_db)):
    db_user = user_crud.get(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if not user_crud.delete(db, user=db_user):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User not deleted")

    return {"message": "User successfully deleted"}


@router.get("/{user_id}/roles/", response_model=list[role_schema.Role], status_code=status.HTTP_200_OK)
def read_user_roles(user_id: int, db: Session = Depends(dependencies.get_db)):
    db_user = user_crud.get(db, user_id)

    if db_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return db_user.roles


@router.post("/{user_id}/roles/{role_id}/", response_model=user_schema.UserSchema, status_code=status.HTTP_200_OK)
def add_role_to_user(user_id: int, role_id: int, db: Session = Depends(dependencies.get_db)):
    db_user = user_crud.get(db, user_id)
    db_role = role_crud.get(db, role_id)

    if db_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if db_role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")

    for role in db_user.roles:
        if role.id == role_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role already added")

    db_user = user_crud.add_role(db, db_user=db_user, db_role=db_role)
    if db_user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role not added")
    return db_user


@router.delete("/{user_id}/roles/{role_id}/", response_model=user_schema.UserSchema, status_code=status.HTTP_200_OK)
def remove_role_from_user(user_id: int, role_id: int, db: Session = Depends(dependencies.get_db)):
    db_user = user_crud.get(db, user_id)
    db_role = role_crud.get(db, role_id)

    if db_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if db_role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")

    role_found = False
    for role in db_user.roles:
        if role.id == role_id:
            role_found = True
            break
    if not role_found:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User has no such role")

    db_user = user_crud.remove_role(db, db_user=db_user, db_role=db_role)
    if db_user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role not removed")
    return db_user
