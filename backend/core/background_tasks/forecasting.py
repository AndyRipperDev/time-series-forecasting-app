from core.crud import forecasting as forecasting_crud
from core.schemas import forecasting as forecasting_schema

from sqlalchemy.orm import Session
from core.enums.forecasting_model_enum import ForecastingModel, ForecastingStatus

from core.config import settings
from core.processing import file_processing
from api import dependencies
import time
from core.forecasting import forecasting_ARIMA
import json

def set_params_ARIMA(db_forecasting, params):
    new_params = json.loads(json.dumps(dict(db_forecasting.params)))
    new_params['p'] = params[0]
    new_params['d'] = params[1]
    new_params['q'] = params[2]
    return new_params


def update_forecast(db: Session, forecasting_id: int, status: ForecastingStatus = None):
    db_forecasting = forecasting_crud.get(db, forecasting_id=forecasting_id)
    forecasting_updates = forecasting_schema.ForecastingUpdateSchema(status=status)
    return forecasting_crud.update(db, forecasting=db_forecasting, updates=forecasting_updates)


def update_forecast_params(db: Session, db_forecasting, params):
    db_forecasting = forecasting_crud.get(db, forecasting_id=db_forecasting.id)
    params = set_params_ARIMA(db_forecasting, params)
    return forecasting_crud.update_params(db, forecasting=db_forecasting, params=params)


def start_forecasting(db: Session,  db_forecasting: forecasting_schema.ForecastingSchema):
    db_forecasting = update_forecast(db, db_forecasting.id, ForecastingStatus.Preprocessing)
    try:
        file = file_processing.get_filename_with_path(db_forecasting.datasetcolumns.datasets.filename_processed, db_forecasting.datasetcolumns.datasets.project.user_id, db_forecasting.datasetcolumns.datasets.project.id)
        df = file_processing.get_processed_dataset(file, db_forecasting.datasetcolumns.datasets.delimiter)
        df, df_train, df_test = file_processing.get_forecast_ready_dataset(df, db_forecasting.split_ratio, db_forecasting.datasetcolumns.datasets.columns, db_forecasting.datasetcolumns.name)

        db_forecasting = update_forecast(db, db_forecasting.id, ForecastingStatus.Training)

        if db_forecasting.model == ForecastingModel.ARIMA:
            params = ()
            if db_forecasting.auto_tune:
                params = forecasting_ARIMA.get_best_params(df, df_train, df_test, level=db_forecasting.tune_level, brute_force=db_forecasting.tune_brute_force)
                db_forecasting = update_forecast_params(db, db_forecasting, params)
            else:
                params = (db_forecasting.params['p'], db_forecasting.params['d'], db_forecasting.params['q'])


            db_forecasting = update_forecast(db, db_forecasting.id, ForecastingStatus.Forecasting)
            predicted_test_results = forecasting_ARIMA.get_predicted_test_results(df, df_train, params)
            predicted_results = forecasting_ARIMA.get_predicted_results(df, params, db_forecasting.forecast_horizon)

            file_processing.save_forecast_file(db_forecasting.datasetcolumns.datasets.project.user_id,
                                               db_forecasting.datasetcolumns.datasets.project.id,
                                               db_forecasting.id,
                                               settings.FILE_PREDICTED_TEST_RESULTS_FILENAME,
                                               db_forecasting.datasetcolumns.datasets.delimiter,
                                               predicted_test_results)
            file_processing.save_forecast_file(db_forecasting.datasetcolumns.datasets.project.user_id,
                                               db_forecasting.datasetcolumns.datasets.project.id,
                                               db_forecasting.id,
                                               settings.FILE_PREDICTED_RESULTS_FILENAME,
                                               db_forecasting.datasetcolumns.datasets.delimiter,
                                               predicted_results)

        db_forecasting = update_forecast(db, db_forecasting.id, ForecastingStatus.Finished)
    except:
        db_forecasting = update_forecast(db, db_forecasting.id, ForecastingStatus.Failed)

