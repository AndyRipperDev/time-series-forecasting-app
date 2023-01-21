from core.crud import forecasting as forecasting_crud
from core.schemas import forecasting as forecasting_schema

from sqlalchemy.orm import Session
from core.enums.forecasting_model_enum import ForecastingModel, ForecastingStatus

from api import dependencies
import time
# from core.forecasting.forecasting import


def update_forecast(db: Session, forecasting_id: int, status: ForecastingStatus):
    db_forecasting = forecasting_crud.get(db, forecasting_id=forecasting_id)
    forecasting_updates = forecasting_schema.ForecastingUpdateSchema(status=status)
    return forecasting_crud.update(db, forecasting=db_forecasting, updates=forecasting_updates)


def start_forecasting(db: Session,  db_forecasting: forecasting_schema.ForecastingSchema):
    time.sleep(5)
    db_forecasting = update_forecast(db, db_forecasting.id, ForecastingStatus.Preprocessing)
    time.sleep(5)
    db_forecasting = update_forecast(db, db_forecasting.id, ForecastingStatus.Training)
    time.sleep(5)
    db_forecasting = update_forecast(db, db_forecasting.id, ForecastingStatus.Forecasting)
    time.sleep(5)
    db_forecasting = update_forecast(db, db_forecasting.id, ForecastingStatus.Finished)
    time.sleep(5)

