from sqlalchemy.orm import Session

from core.schemas import dataset as dataset_schema
from core.models import dataset as dataset_model


def get_all(db: Session, skip: int = 0, limit: int = 100):
    return db.query(dataset_model.Dataset).offset(skip).limit(limit).all()


def get_by_project_id(db: Session, project_id: int):
    return db.query(dataset_model.Dataset).filter(dataset_model.Dataset.project_id == project_id).first()


def get(db: Session, dataset_id: int):
    return db.query(dataset_model.Dataset).filter(dataset_model.Dataset.id == dataset_id).first()


def create(db: Session, dataset: dataset_schema.DatasetCreate, project_id: int):
    db_dataset = dataset_model.Dataset(**dataset.dict())
    db_dataset.project_id = project_id
    db.add(db_dataset)
    db.commit()
    db.refresh(db_dataset)
    return db_dataset


def update(db: Session, dataset: dataset_model.Dataset, updates: dataset_schema.DatasetUpdateSchema):
    update_data = updates.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(dataset, key, value)
    db.commit()
    return dataset


def delete(db: Session, dataset: dataset_model.Dataset):
    result = True
    try:
        db.delete(dataset)
        db.commit()
    except:
        result = False
    return result
