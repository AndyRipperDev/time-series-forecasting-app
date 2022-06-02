from fastapi import Depends, FastAPI, HTTPException
from fastapi.encoders import jsonable_encoder

from sqlalchemy.orm import Session

import crud
import models
import schemas
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}


@app.post("/users/", response_model=schemas.UserSchema)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)


@app.get("/users/", response_model=list[schemas.UserSchema])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users


@app.get("/users/{user_id}", response_model=schemas.UserSchema)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@app.patch("/users/{user_id}", response_model=schemas.UserSchema)
def update_user(user_id: int, user: schemas.UserUpdateSchema, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    db_user = crud.update_user(db, user=db_user, updates=user)

    return db_user


@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    if not crud.delete_user(db, user=db_user):
        raise HTTPException(status_code=404, detail="User not deleted")

    return {"message": "User successfully deleted"}


@app.post("/users/{user_id}/{role_id}/", response_model=schemas.UserSchema)
def add_role_to_user(user_id: int, role_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id)
    db_role = crud.get_role(db, role_id)

    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if db_role is None:
        raise HTTPException(status_code=404, detail="Role not found")

    for role in db_user.roles:
        if role.id == role_id:
            raise HTTPException(status_code=404, detail="Role already added")

    db_user = crud.add_role_to_user(db, db_user=db_user, db_role=db_role)
    if db_user is None:
        raise HTTPException(status_code=404, detail="Role not added")
    return db_user


@app.delete("/users/{user_id}/{role_id}/", response_model=schemas.UserSchema)
def remove_role_from_user(user_id: int, role_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id)
    db_role = crud.get_role(db, role_id)

    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if db_role is None:
        raise HTTPException(status_code=404, detail="Role not found")

    role_found = False
    for role in db_user.roles:
        if role.id == role_id:
            role_found = True
            break
    if not role_found:
        raise HTTPException(status_code=404, detail="User has no such role")

    db_user = crud.remove_role_from_user(db, db_user=db_user, db_role=db_role)
    if db_user is None:
        raise HTTPException(status_code=404, detail="Role not removed")
    return db_user


@app.post("/roles/", response_model=schemas.RoleSchema)
def create_role(role: schemas.RoleCreate, db: Session = Depends(get_db)):
    return crud.create_role(db=db, role=role)


@app.get("/roles/", response_model=list[schemas.RoleSchema])
def read_roles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    roles = crud.get_roles(db, skip=skip, limit=limit)
    return roles


@app.get("/roles/{role_id}", response_model=schemas.RoleSchema)
def read_role(role_id: int, db: Session = Depends(get_db)):
    db_role = crud.get_role(db, role_id=role_id)
    if db_role is None:
        raise HTTPException(status_code=404, detail="Role not found")
    return db_role


@app.patch("/roles/{role_id}", response_model=schemas.RoleSchema)
def update_role(role_id: int, role: schemas.RoleUpdateSchema,  db: Session = Depends(get_db)):
    db_role = crud.get_role(db, role_id=role_id)
    if db_role is None:
        raise HTTPException(status_code=404, detail="Role not found")

    db_role = crud.update_role(db, role=db_role, updates=role)

    return db_role


@app.delete("/roles/{role_id}")
def delete_role(role_id: int, db: Session = Depends(get_db)):
    db_role = crud.get_role(db, role_id=role_id)
    if db_role is None:
        raise HTTPException(status_code=404, detail="Role not found")

    if not crud.delete_role(db, role=db_role):
        raise HTTPException(status_code=404, detail="Role not deleted")

    return {"message": "Role successfully deleted"}
