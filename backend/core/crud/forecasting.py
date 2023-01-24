from sqlalchemy.orm import Session
from sqlalchemy import desc
from core.schemas import forecasting as forecasting_schema
from core.models import forecasting as forecasting_model
from core.models import dataset_column as dataset_column_model
from core.models import dataset as dataset_model
from core.models import project as project_model

from sqlalchemy.orm.attributes import flag_modified

def get_all(db: Session, skip: int = 0, limit: int = 100):
    return db.query(forecasting_model.Forecasting).offset(skip).limit(limit).all()


def get_all_by_column(db: Session, column_id: int):
    return db.query(forecasting_model.Forecasting).filter(forecasting_model.Forecasting.column_id == column_id).all()


def get_all_by_project(db: Session, project_id: int):
    return db.query(
        forecasting_model.Forecasting
    ).filter(
        forecasting_model.Forecasting.column_id == dataset_column_model.DatasetColumn.id,
    ).filter(
        dataset_column_model.DatasetColumn.dataset_id == dataset_model.Dataset.id,
    ).filter(
        dataset_model.Dataset.project_id == project_id,
    ).all()


def get_all_by_user(db: Session, user_id: int):
    return db.query(
        forecasting_model.Forecasting
    ).filter(
        forecasting_model.Forecasting.column_id == dataset_column_model.DatasetColumn.id,
    ).filter(
        dataset_column_model.DatasetColumn.dataset_id == dataset_model.Dataset.id,
    ).filter(
        dataset_model.Dataset.project_id == project_model.Project.id,
    ).filter(
        project_model.Project.user_id == user_id,
    ).all()


def get_all_by_user_project(db: Session, user_id: int):
    return db.query(
        forecasting_model.Forecasting, project_model.Project
    ).filter(
        forecasting_model.Forecasting.column_id == dataset_column_model.DatasetColumn.id,
    ).filter(
        dataset_column_model.DatasetColumn.dataset_id == dataset_model.Dataset.id,
    ).filter(
        dataset_model.Dataset.project_id == project_model.Project.id,
    ).filter(
        project_model.Project.user_id == user_id,
    ).order_by(
        desc(forecasting_model.Forecasting.created_at)
    ).all()


def get(db: Session, forecasting_id: int):
    return db.query(forecasting_model.Forecasting).filter(forecasting_model.Forecasting.id == forecasting_id).first()


def create(db: Session, forecasting: forecasting_schema.ForecastingCreate, column_id: int):
    db_forecasting = forecasting_model.Forecasting(**forecasting.dict())
    db_forecasting.column_id = column_id
    db.add(db_forecasting)
    db.commit()
    db.refresh(db_forecasting)
    return db_forecasting


def update(db: Session, forecasting: forecasting_model.Forecasting, updates: forecasting_schema.ForecastingUpdateSchema):
    update_data = updates.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(forecasting, key, value)
    db.commit()
    return forecasting


def update_params(db: Session, forecasting: forecasting_model.Forecasting, params):
    forecasting.params = params
    db.commit()
    return forecasting


def delete(db: Session, forecasting: forecasting_model.Forecasting):
    result = True
    try:
        db.delete(forecasting)
        db.commit()
    except:
        result = False
    return result
