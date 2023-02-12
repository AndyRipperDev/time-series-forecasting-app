from sqlalchemy.orm import Session

from core.schemas import dataset_column as dataset_column_schema
from core.models import dataset_column as dataset_column_model


def get_all(db: Session, skip: int = 0, limit: int = 100):
    return db.query(dataset_column_model.DatasetColumn).offset(skip).limit(limit).all()


def get_by_dataset_id(db: Session, dataset_id: int):
    return db.query(dataset_column_model.DatasetColumn).filter(dataset_column_model.DatasetColumn.dataset_id == dataset_id).all()


def get_active_by_dataset_id(db: Session, dataset_id: int):
    return db.query(dataset_column_model.DatasetColumn).filter(dataset_column_model.DatasetColumn.dataset_id == dataset_id, dataset_column_model.DatasetColumn.is_removed == False).all()


def get_by_dataset_id_column_name(db: Session, dataset_id: int, column_name: str):
    return db.query(dataset_column_model.DatasetColumn).filter(dataset_column_model.DatasetColumn.dataset_id == dataset_id and dataset_column_model.DatasetColumn.name == column_name).first()


def get(db: Session, column_id: int):
    return db.query(dataset_column_model.DatasetColumn).filter(dataset_column_model.DatasetColumn.id == column_id).first()


def create(db: Session, dataset_column: dataset_column_schema.DatasetColumnCreate, dataset_id: int):
    db_dataset_column = dataset_column_model.DatasetColumn(**dataset_column.dict())
    db_dataset_column.dataset_id = dataset_id
    db.add(db_dataset_column)
    db.commit()
    db.refresh(db_dataset_column)
    return db_dataset_column


def update(db: Session, dataset_column: dataset_column_model.DatasetColumn, updates: dataset_column_schema.DatasetColumnUpdateSchema):
    update_data = updates.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(dataset_column, key, value)
    db.commit()
    return dataset_column


def delete(db: Session, dataset_column: dataset_column_model.DatasetColumn):
    result = True
    try:
        db.delete(dataset_column)
        db.commit()
    except:
        result = False
    return result
