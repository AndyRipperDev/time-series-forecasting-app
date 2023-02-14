from sqlalchemy.orm import Session

from core.schemas import evaluation_metrics as evaluation_metrics_schema
from core.models import evaluation_metrics as evaluation_metrics_model


def get_all(db: Session, skip: int = 0, limit: int = 100):
    return db.query(evaluation_metrics_model.EvaluationMetrics).offset(skip).limit(limit).all()


def get(db: Session, evaluation_metrics_id: int):
    return db.query(evaluation_metrics_model.EvaluationMetrics).filter(evaluation_metrics_model.EvaluationMetrics.id == evaluation_metrics_id).first()


def create(db: Session, evaluation_metrics: evaluation_metrics_schema.EvaluationMetricsCreate, forecasting_id: int):
    db_evaluation_metrics = evaluation_metrics_model.EvaluationMetrics(**evaluation_metrics.dict())
    db_evaluation_metrics.forecasting_id = forecasting_id
    db.add(db_evaluation_metrics)
    db.commit()
    db.refresh(db_evaluation_metrics)
    return db_evaluation_metrics


def update(db: Session, evaluation_metrics: evaluation_metrics_model.EvaluationMetrics, updates: evaluation_metrics_schema.EvaluationMetricsUpdateSchema):
    update_data = updates.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(evaluation_metrics, key, value)
    db.commit()
    return evaluation_metrics


def delete(db: Session, evaluation_metrics: evaluation_metrics_model.EvaluationMetrics):
    result = True
    try:
        db.delete(evaluation_metrics)
        db.commit()
    except:
        result = False
    return result
