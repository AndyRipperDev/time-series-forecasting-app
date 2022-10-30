from fastapi import APIRouter, Depends, HTTPException, status, UploadFile

from pathlib import Path
from sqlalchemy.orm import Session

from core.config import settings
from core.crud import project as project_crud
from core.schemas import project as project_schema
from core.models import user as user_model

from api import dependencies

router = APIRouter(
    prefix="/projects",
    tags=["projects"]
)


@router.post('/upload')
async def upload_file(file: UploadFile, current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    file_path = Path(settings.FILE_STORAGE_DIR + '/' + str(current_user.id) + '/projects/')
    file_path.mkdir(parents=True, exist_ok=True)

    path = file_path / file.filename
    size = path.write_bytes(await file.read())
    return {'file': path, 'bytes': size}


@router.post("/", response_model=project_schema.ProjectSchema, status_code=status.HTTP_201_CREATED)
def create_project(project: project_schema.ProjectCreate, db: Session = Depends(dependencies.get_db), current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    return project_crud.create(db=db, project=project, user_id=current_user.id)


@router.get("/", response_model=list[project_schema.ProjectSchema], status_code=status.HTTP_200_OK)
def read_projects(skip: int = 0, limit: int = 100, db: Session = Depends(dependencies.get_db), current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    projects = project_crud.get_all(db, skip=skip, limit=limit)
    return projects


@router.get("/user", response_model=list[project_schema.ProjectSchema], status_code=status.HTTP_200_OK)
def read_user_projects(skip: int = 0, limit: int = 100, db: Session = Depends(dependencies.get_db), current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    projects = project_crud.get_by_user_id(db, user_id=current_user.id, skip=skip, limit=limit)
    return projects


@router.get("/{project_id}", response_model=project_schema.ProjectSchema, status_code=status.HTTP_200_OK)
def read_project(project_id: int, db: Session = Depends(dependencies.get_db), current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_role = project_crud.get(db, project_id=project_id)
    if db_role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return db_role


@router.patch("/{project_id}", response_model=project_schema.ProjectSchema, status_code=status.HTTP_200_OK)
def update_project(project_id: int, project: project_schema.ProjectUpdateSchema,  db: Session = Depends(dependencies.get_db), current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_project = project_crud.get(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    db_project = project_crud.update(db, project=db_project, updates=project)

    return db_project


@router.delete("/{project_id}", status_code=status.HTTP_200_OK)
def delete_project(project_id: int, db: Session = Depends(dependencies.get_db), current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_project = project_crud.get(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if not project_crud.delete(db, project=db_project):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project not deleted")

    return {"message": "Project successfully deleted"}
