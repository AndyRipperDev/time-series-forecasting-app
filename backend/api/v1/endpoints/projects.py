from fastapi import APIRouter, Depends, HTTPException, status, UploadFile

from pathlib import Path

from fastapi.params import Form, File
from sqlalchemy.orm import Session

from core.config import settings
from core.crud import project as project_crud
from core.schemas import project as project_schema
from core.models import user as user_model
from core.processing import file_processing

from core.crud import dataset as dataset_crud
from core.schemas import dataset as dataset_schema


from core.crud import dataset_column as dataset_column_crud
from core.schemas import dataset_column as dataset_column_schema

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


# @router.post("/create", response_model=project_schema.ProjectSchema, status_code=status.HTTP_201_CREATED)
@router.post("/create2", status_code=status.HTTP_201_CREATED)
async def create_project_with_file2(
        title: str = Form(...),
        description: str = Form(...),
        delimiter: str = Form(...),
        file: UploadFile = File(...),
        db: Session = Depends(dependencies.get_db),
        current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_project = project_schema.ProjectCreate(title=title, description=description)
    db_project = project_crud.create(db=db, project=db_project, user_id=current_user.id)

    if db_project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not created")

    response_project = project_schema.ProjectSchema(title=db_project.title,
                                                    description=db_project.description,
                                                    id=db_project.id,
                                                    user_id=db_project.user_id)

    file_path = Path(settings.FILE_STORAGE_DIR + '/' + str(current_user.id) + '/projects/' + str(db_project.id) + '/')
    file_path.mkdir(parents=True, exist_ok=True)

    path = file_path / file.filename
    size = path.write_bytes(await file.read())
    columns = file_processing.check_columns_json(path, delimiter)

    print(columns)

    db_dataset = dataset_schema.DatasetCreate(filename=file.filename, filename_processed=file.filename,
                                              delimiter=delimiter)
    db_dataset = dataset_crud.create(db=db, dataset=db_dataset, project_id=db_project.id)


    return {'project': response_project, 'file': {'filename': file.filename, 'columns': columns}}

# @router.post("/create", response_model=project_schema.ProjectSchema, status_code=status.HTTP_201_CREATED)
@router.post("/create", response_model=project_schema.ProjectSchema, status_code=status.HTTP_201_CREATED)
async def create_project_with_file(
        title: str = Form(...),
        description: str = Form(...),
        delimiter: str = Form(...),
        file: UploadFile = File(...),
        db: Session = Depends(dependencies.get_db),
        current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_project = project_schema.ProjectCreate(title=title, description=description)
    db_project = project_crud.create(db=db, project=db_project, user_id=current_user.id)

    if db_project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not created")

    file_path = Path(settings.FILE_STORAGE_DIR + '/' + str(current_user.id) + '/projects/' + str(db_project.id) + '/')
    file_path.mkdir(parents=True, exist_ok=True)

    path = file_path / file.filename
    size = path.write_bytes(await file.read())
    columns = file_processing.check_columns_json(path, delimiter)

    print(columns)

    db_dataset = dataset_schema.DatasetCreate(filename=file.filename, filename_processed=file.filename,
                                              delimiter=delimiter)
    db_dataset = dataset_crud.create(db=db, dataset=db_dataset, project_id=db_project.id)

    for k, v in columns.items():
        col_sch = dataset_column_schema.DatasetColumnCreate(name=k, data_type=v)
        dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)

    # db_project = project_crud.get(db=db, project_id=db_project.id)
    db_project_scheme = project_schema.ProjectSchema(title=db_project.title, description=db_project.description, id=db_project.id, user_id=db_project.user_id, dataset=db_dataset)
    # return {'project': db_project, 'file': {'filename': file.filename, 'columns': columns}}
    return db_project_scheme


#    return db_project


@router.post("/", response_model=project_schema.ProjectSchema, status_code=status.HTTP_201_CREATED)
def create_project(project: project_schema.ProjectCreate, db: Session = Depends(dependencies.get_db),
                   current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    return project_crud.create(db=db, project=project, user_id=current_user.id)


@router.get("/", response_model=list[project_schema.ProjectSchema], status_code=status.HTTP_200_OK)
def read_projects(skip: int = 0, limit: int = 100, db: Session = Depends(dependencies.get_db),
                  current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    projects = project_crud.get_all(db, skip=skip, limit=limit)

    db_projects = []

    for project in projects:
        db_dataset = dataset_crud.get_by_project_id(db=db, project_id=project.id)
        db_project_scheme = project_schema.ProjectSchema(title=project.title, description=project.description, id=project.id,
                                       user_id=project.user_id, dataset=db_dataset)
        db_projects.append(db_project_scheme)
    # return projects
    return db_projects


@router.get("/get2/{project_id}", response_model=project_schema.ProjectSchema, status_code=status.HTTP_200_OK)
def read_project2(project_id: int, db: Session = Depends(dependencies.get_db),
                 current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_project = project_crud.get(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    response_project = project_schema.ProjectSchema(title=db_project.title,
                                                    description=db_project.description,
                                                    id=db_project.id,
                                                    user_id=db_project.user_id)

    file_path = Path(settings.FILE_STORAGE_DIR + '/' + str(current_user.id) + '/projects/' + str(db_project.id) + '/')

    file = list(filter(lambda x: x.is_file(), file_path.iterdir()))[0]

    columns = file_processing.check_columns_json(file, ',')
    print(columns)
    print(list(columns))
    # return {'project': response_project, 'file': {'filename': file.name, 'columns': columns}}
    return db_project

# @router.get("/get/{project_id}", status_code=status.HTTP_200_OK)
@router.get("/get/{project_id}", response_model=project_schema.ProjectSchema, status_code=status.HTTP_200_OK)
def read_project(project_id: int, db: Session = Depends(dependencies.get_db),
                 current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_project = project_crud.get(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    db_dataset = dataset_crud.get_by_project_id(db=db, project_id=db_project.id)

    file_path = settings.FILE_STORAGE_DIR + '/' + str(current_user.id) + '/projects/' + str(db_project.id) + '/' + db_dataset.filename
    print(file_path)
    columns = file_processing.check_columns_json(file_path, db_dataset.delimiter)
    print(columns)
    print(list(columns))

    # db_project = project_crud.get(db=db, project_id=db_project.id)
    db_project_scheme = project_schema.ProjectSchema(title=db_project.title, description=db_project.description, id=db_project.id,
                                       user_id=db_project.user_id, dataset=db_dataset)
    # return {'project': db_project, 'file': {'filename': file.filename, 'columns': columns}}
    return db_project_scheme

    # return db_project


@router.get("/user", response_model=list[project_schema.ProjectSchema], status_code=status.HTTP_200_OK)
def read_user_projects(skip: int = 0, limit: int = 100, db: Session = Depends(dependencies.get_db),
                       current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    projects = project_crud.get_by_user_id(db, user_id=current_user.id, skip=skip, limit=limit)

    db_projects = []

    for project in projects:
        db_dataset = dataset_crud.get_by_project_id(db=db, project_id=project.id)
        db_project_scheme = project_schema.ProjectSchema(title=project.title, description=project.description, id=project.id,
                                           user_id=project.user_id, dataset=db_dataset)
        db_projects.append(db_project_scheme)
    # return projects
    return db_projects



@router.get("/{project_id}", response_model=project_schema.ProjectSchema, status_code=status.HTTP_200_OK)
def read_project(project_id: int, db: Session = Depends(dependencies.get_db),
                 current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_project = project_crud.get(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    db_dataset = dataset_crud.get_by_project_id(db=db, project_id=db_project.id)
    db_project_scheme = project_schema.ProjectSchema(title=db_project.title, description=db_project.description, id=db_project.id,
                                       user_id=db_project.user_id, dataset=db_dataset)
    return db_project_scheme


@router.patch("/{project_id}", response_model=project_schema.ProjectSchema, status_code=status.HTTP_200_OK)
def update_project(project_id: int, project: project_schema.ProjectUpdateSchema,
                   db: Session = Depends(dependencies.get_db),
                   current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_project = project_crud.get(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    db_project = project_crud.update(db, project=db_project, updates=project)

    return db_project


@router.delete("/{project_id}", status_code=status.HTTP_200_OK)
def delete_project(project_id: int, db: Session = Depends(dependencies.get_db),
                   current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_project = project_crud.get(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if not project_crud.delete(db, project=db_project):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project not deleted")

    return {"message": "Project successfully deleted"}
