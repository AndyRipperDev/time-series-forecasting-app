from sqlalchemy.orm import Session

from core.schemas import time_period as time_period_schema
from core.models import time_period as time_period_model


def get_all(db: Session, skip: int = 0, limit: int = 100):
    return db.query(time_period_model.TimePeriod).offset(skip).limit(limit).all()


def get_by_dataset_id(db: Session, dataset_id: int):
    return db.query(time_period_model.TimePeriod).filter(time_period_model.TimePeriod.dataset_id == dataset_id).first()


def get(db: Session, time_period_id: int):
    return db.query(time_period_model.TimePeriod).filter(time_period_model.TimePeriod.id == time_period_id).first()


def create(db: Session, time_period: time_period_schema.TimePeriodCreate, dataset_id: int):
    db_time_period = time_period_model.TimePeriod(**time_period.dict())
    db_time_period.dataset_id = dataset_id
    db.add(db_time_period)
    db.commit()
    db.refresh(db_time_period)
    return db_time_period


def update(db: Session, time_period: time_period_model.TimePeriod, updates: time_period_schema.TimePeriodUpdateSchema):
    update_data = updates.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(time_period, key, value)
    db.commit()
    return time_period


def delete(db: Session, time_period: time_period_model.TimePeriod):
    result = True
    try:
        db.delete(time_period)
        db.commit()
    except:
        result = False
    return result
