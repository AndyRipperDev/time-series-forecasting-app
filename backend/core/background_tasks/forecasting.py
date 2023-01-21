from core.crud import forecasting as forecasting_crud
from core.schemas import forecasting as forecasting_schema

from sqlalchemy.orm import Session
from core.enums.forecasting_model_enum import ForecastingModel, ForecastingStatus

from api import dependencies
# from core.forecasting.forecasting import


def start_forecasting(db: Session,  db_forecasting: forecasting_schema.ForecastingSchema):
    pass
