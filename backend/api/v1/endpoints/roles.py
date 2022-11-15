from fastapi import APIRouter, Depends, HTTPException, status

from sqlalchemy.orm import Session

from core.crud import role as role_crud
from core.schemas import role as role_schema
from core.models import user as user_model

from api import dependencies

router = APIRouter(
    prefix="/roles",
    tags=["roles"]
)


@router.post("/", response_model=role_schema.RoleSchema, status_code=status.HTTP_201_CREATED)
def create_role(role: role_schema.RoleCreate, db: Session = Depends(dependencies.get_db), current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    return role_crud.create(db=db, role=role)


@router.get("/", response_model=list[role_schema.RoleSchema], status_code=status.HTTP_200_OK)
def read_roles(skip: int = 0, limit: int = 100, db: Session = Depends(dependencies.get_db), current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    roles = role_crud.get_all(db, skip=skip, limit=limit)
    return roles


@router.get("/{role_id}", response_model=role_schema.RoleSchema, status_code=status.HTTP_200_OK)
def read_role(role_id: int, db: Session = Depends(dependencies.get_db), current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_role = role_crud.get(db, role_id=role_id)
    if db_role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    return db_role


@router.patch("/{role_id}", response_model=role_schema.RoleSchema, status_code=status.HTTP_200_OK)
def update_role(role_id: int, role: role_schema.RoleUpdateSchema,  db: Session = Depends(dependencies.get_db), current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_role = role_crud.get(db, role_id=role_id)
    if db_role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")

    db_role = role_crud.update(db, role=db_role, updates=role)

    return db_role


@router.delete("/{role_id}", status_code=status.HTTP_200_OK)
def delete_role(role_id: int, db: Session = Depends(dependencies.get_db), current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_role = role_crud.get(db, role_id=role_id)
    if db_role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")

    if not role_crud.delete(db, role=db_role):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role not deleted")

    return {"message": "Role successfully deleted"}
