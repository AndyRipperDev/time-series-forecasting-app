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
    prefix="/dataset-columns",
    tags=["dataset-columns"]
)


@router.patch("/{dataset_id}", response_model=list[dataset_column_schema.DatasetColumnSchema], status_code=status.HTTP_200_OK)
def update_project(dataset_id: int, dataset_columns: list[dataset_column_schema.DatasetColumnUpdateSchema],
                   db: Session = Depends(dependencies.get_db),
                   current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_columns = dataset_column_crud.get_by_dataset_id(db, dataset_id=dataset_id)
    if db_columns is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    for column in db_columns:
        for col_update in dataset_columns:
            if column.id == col_update.id:
                db_project = dataset_column_crud.update(db, dataset_column=column, updates=col_update)

    db_columns = dataset_column_crud.get_by_dataset_id(db, dataset_id=dataset_id)

    db_dataset = dataset_crud.get(db, dataset_id)

    file_path = settings.FILE_STORAGE_DIR + '/' + str(current_user.id) + '/projects/' + str(
        db_dataset.project_id) + '/' + db_dataset.filename

    file_path_processed = settings.FILE_STORAGE_DIR + '/' + str(current_user.id) + '/projects/' + str(
        db_dataset.project_id) + '/' + db_dataset.filename_processed

    file_processing.process_dataset(file_path, file_path_processed, db_dataset.delimiter, db_columns)

    return db_columns
