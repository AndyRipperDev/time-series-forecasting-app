from fastapi import APIRouter, Depends, HTTPException, status, UploadFile

from pathlib import Path

from fastapi.params import Form, File
from sqlalchemy.orm import Session
from starlette.responses import FileResponse

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


@router.post('/upload-dataset')
async def upload_dataset(file: UploadFile,
                         current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    file_path = Path(settings.FILE_STORAGE_DIR + '/' + str(current_user.id) + '/projects/')
    file_path.mkdir(parents=True, exist_ok=True)

    path = file_path / file.filename
    size = path.write_bytes(await file.read())
    return {'file': path, 'bytes': size}


@router.post("/create-with-dataset", response_model=project_schema.ProjectSchema, status_code=status.HTTP_201_CREATED)
async def create_project_with_dataset(
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

    db_dataset = dataset_schema.DatasetCreate(filename=file.filename,
                                              filename_processed=file_processing.add_text_to_filename(file.filename,
                                                                                                      '_processed'),
                                              delimiter=delimiter)
    db_dataset = dataset_crud.create(db=db, dataset=db_dataset, project_id=db_project.id)

    for k, v in columns.items():
        col_sch = dataset_column_schema.DatasetColumnCreate(name=k, data_type=v)
        dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)

    db_columns = dataset_column_crud.get_by_dataset_id(db, dataset_id=db_dataset.id)

    file_path = settings.FILE_STORAGE_DIR + '/' + str(current_user.id) + '/projects/' + str(
        db_dataset.project_id) + '/' + db_dataset.filename

    file_path_processed = settings.FILE_STORAGE_DIR + '/' + str(current_user.id) + '/projects/' + str(
        db_dataset.project_id) + '/' + db_dataset.filename_processed

    file_processing.process_dataset(file_path, file_path_processed, db_dataset.delimiter, db_columns)

    return project_crud.get(db=db, project_id=db_project.id)


@router.post("/", response_model=project_schema.ProjectSchema, status_code=status.HTTP_201_CREATED)
def create_project(project: project_schema.ProjectCreate, db: Session = Depends(dependencies.get_db),
                   current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    return project_crud.create(db=db, project=project, user_id=current_user.id)


@router.get("/", response_model=list[project_schema.ProjectSchema], status_code=status.HTTP_200_OK)
def read_projects(skip: int = 0, limit: int = 100, db: Session = Depends(dependencies.get_db),
                  current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    projects = project_crud.get_all(db, skip=skip, limit=limit)

    return projects


@router.get("/user", response_model=list[project_schema.ProjectSchema], status_code=status.HTTP_200_OK)
def read_user_projects(skip: int = 0, limit: int = 100, db: Session = Depends(dependencies.get_db),
                       current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    projects = project_crud.get_by_user_id(db, user_id=current_user.id, skip=skip, limit=limit)

    return projects


@router.get("/{project_id}", response_model=project_schema.ProjectSchema, status_code=status.HTTP_200_OK)
def read_project(project_id: int, db: Session = Depends(dependencies.get_db),
                 current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_project = project_crud.get(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if db_project.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unauthorized user")

    return db_project


@router.get("/get-dataset-values/{project_id}", status_code=status.HTTP_200_OK)
def read_project_with_dataset_values(project_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(dependencies.get_db),
                 current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_project = project_crud.get(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if db_project.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unauthorized user")

    file_path_processed = settings.FILE_STORAGE_DIR + '/' + str(current_user.id) + '/projects/' + str(
        db_project.id) + '/' + db_project.dataset.filename_processed

    df = file_processing.get_processed_dataset(file_path_processed, db_project.dataset.delimiter)

    dataset = df.to_dict('records')

    first_page = 0
    prev_page = None if skip - limit < 0 else skip - limit
    next_page = None if skip + limit > len(dataset) else skip + limit
    last_page = len(dataset) - len(dataset) % limit
    count = len(dataset)
    current_page = skip

    return {'dataset': dataset[skip: skip + limit], 'currentPage': current_page, 'firstPage': first_page, 'prevPage': prev_page, 'nextPage': next_page, 'lastPage': last_page, 'count': count}


@router.get("/get-dataset-columns-with-values/{project_id}", status_code=status.HTTP_200_OK)
def read_project_with_dataset_columns_with_values(project_id: int, column: str = None, db: Session = Depends(dependencies.get_db),
                 current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_project = project_crud.get(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if db_project.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unauthorized user")

    file_path_processed = settings.FILE_STORAGE_DIR + '/' + str(current_user.id) + '/projects/' + str(
        db_project.id) + '/' + db_project.dataset.filename_processed

    df = file_processing.get_processed_dataset(file_path_processed, db_project.dataset.delimiter)

    dataset = df.to_dict('list')
    dataset_col = {}

    if column is not None:
        for k, v in dataset.items():
            if column == k:
                dataset_col[k] = v
                break

    return dataset_col if column is not None else dataset


@router.get("/download-dataset/{project_id}", status_code=status.HTTP_200_OK)
def read_project(project_id: int, db: Session = Depends(dependencies.get_db),
                 current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_project = project_crud.get(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if db_project.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unauthorized user")

    file_path = settings.FILE_STORAGE_DIR + '/' + str(current_user.id) + '/projects/' + str(
        db_project.id) + '/' + db_project.dataset.filename

    return FileResponse(file_path, media_type='application/octet-stream', filename=db_project.dataset.filename)


@router.patch("/{project_id}", response_model=project_schema.ProjectSchema, status_code=status.HTTP_200_OK)
def update_project(project_id: int, project: project_schema.ProjectUpdateSchema,
                   db: Session = Depends(dependencies.get_db),
                   current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_project = project_crud.get(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if db_project.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unauthorized user")

    db_project = project_crud.update(db, project=db_project, updates=project)

    return db_project


@router.patch("/update-with-dataset/{project_id}", response_model=project_schema.ProjectSchema,
              status_code=status.HTTP_200_OK)
def update_project_with_dataset(project_id: int, project: project_schema.ProjectDatasetUpdateSchema,
                                db: Session = Depends(dependencies.get_db),
                                current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_project = project_crud.get(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if db_project.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unauthorized user")

    db_project = project_crud.update_dataset(db, project=db_project, updates=project)

    db_dataset = dataset_crud.get_by_project_id(db=db, project_id=db_project.id)

    if db_dataset.delimiter != project.delimiter:
        db_columns = dataset_column_crud.get_by_dataset_id(db, dataset_id=db_dataset.id)
        for col in db_columns:
            dataset_column_crud.delete(db, col)

        file_path = settings.FILE_STORAGE_DIR + '/' + str(current_user.id) + '/projects/' + str(
            db_project.id) + '/' + db_dataset.filename
        columns = file_processing.check_columns_json(file_path, project.delimiter)
        for k, v in columns.items():
            col_sch = dataset_column_schema.DatasetColumnCreate(name=k, data_type=v)
            dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)

    updates_dataset = dataset_schema.DatasetUpdateSchema(delimiter=project.delimiter)
    db_dataset = dataset_crud.update(db=db, dataset=db_dataset, updates=updates_dataset)

    db_columns = dataset_column_crud.get_by_dataset_id(db, dataset_id=db_dataset.id)

    file_path = settings.FILE_STORAGE_DIR + '/' + str(current_user.id) + '/projects/' + str(
        db_dataset.project_id) + '/' + db_dataset.filename

    file_path_processed = settings.FILE_STORAGE_DIR + '/' + str(current_user.id) + '/projects/' + str(
        db_dataset.project_id) + '/' + db_dataset.filename_processed

    file_processing.process_dataset(file_path, file_path_processed, db_dataset.delimiter, db_columns)

    return project_crud.get(db, project_id=project_id)


@router.delete("/{project_id}", status_code=status.HTTP_200_OK)
def delete_project(project_id: int, db: Session = Depends(dependencies.get_db),
                   current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_project = project_crud.get(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if db_project.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unauthorized user")

    file_dir = settings.FILE_STORAGE_DIR + '/' + str(current_user.id) + '/projects/' + str(db_project.id) + '/'
    file_path = file_dir + db_project.dataset.filename
    file_path_processed = file_dir + db_project.dataset.filename_processed

    db_dataset = dataset_crud.get_by_project_id(db=db, project_id=db_project.id)
    db_columns = dataset_column_crud.get_by_dataset_id(db, dataset_id=db_dataset.id)
    for col in db_columns:
        dataset_column_crud.delete(db, col)
    dataset_crud.delete(db=db, dataset=db_dataset)


    if not project_crud.delete(db, project=db_project):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project not deleted")

    Path(file_path).unlink()
    Path(file_path_processed).unlink()
    Path(file_dir).rmdir()

    return {"message": "Project successfully deleted"}
