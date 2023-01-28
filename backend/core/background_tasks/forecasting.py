from core.crud import forecasting as forecasting_crud
from core.schemas import forecasting as forecasting_schema

from sqlalchemy.orm import Session
from core.enums.forecasting_model_enum import ForecastingModel, ForecastingStatus

from core.config import settings
from core.processing import file_processing
from api import dependencies
import time
from core.forecasting import forecasting_ARIMA, forecasting_SARIMA, evaluation_metrics
import json

from core.schemas import evaluation_metrics as evaluation_metrics_schema
from core.crud import evaluation_metrics as evaluation_metrics_crud


def create_eval_metrics(db: Session, df_test, df_pred, db_forecasting):
    df_metrics = evaluation_metrics.compute_metrics_raw(df_test, df_pred)
    db_eval_metrics = evaluation_metrics_schema.EvaluationMetricsCreate(MAE=df_metrics.iloc[0, 0],
                                                                        MSE=df_metrics.iloc[0, 1],
                                                                        MAPE=df_metrics.iloc[0, 2],
                                                                        SMAPE=df_metrics.iloc[0, 3],
                                                                        R2=df_metrics.iloc[0, 4],
                                                                        WAPE=df_metrics.iloc[0, 5])
    return evaluation_metrics_crud.create(db=db, evaluation_metrics=db_eval_metrics, forecasting_id=db_forecasting.id)


def set_params_ARIMA(db_forecasting, params):
    new_params = json.loads(json.dumps(dict(db_forecasting.params)))
    new_params['p'] = params[0]
    new_params['d'] = params[1]
    new_params['q'] = params[2]
    return new_params


def set_params_SARIMA(db_forecasting, params):
    new_params = json.loads(json.dumps(dict(db_forecasting.params)))
    new_params['p'] = params[0][0]
    new_params['d'] = params[0][1]
    new_params['q'] = params[0][2]
    new_params['P'] = params[1][0]
    new_params['D'] = params[1][1]
    new_params['Q'] = params[1][2]
    new_params['m'] = params[1][3]
    return new_params


def update_forecast(db: Session, forecasting_id: int, status: ForecastingStatus = None):
    db_forecasting = forecasting_crud.get(db, forecasting_id=forecasting_id)
    forecasting_updates = forecasting_schema.ForecastingUpdateSchema(status=status)
    return forecasting_crud.update(db, forecasting=db_forecasting, updates=forecasting_updates)


def update_forecast_params(db: Session, db_forecasting, params, model: ForecastingModel):
    db_forecasting = forecasting_crud.get(db, forecasting_id=db_forecasting.id)
    if model == ForecastingModel.ARIMA:
        params = set_params_ARIMA(db_forecasting, params)
    elif model == ForecastingModel.SARIMA:
        params = set_params_SARIMA(db_forecasting, params)

    return forecasting_crud.update_params(db, forecasting=db_forecasting, params=params)


def start_forecasting(db: Session, db_forecasting: forecasting_schema.ForecastingSchema):
    db_forecasting = update_forecast(db, db_forecasting.id, ForecastingStatus.Preprocessing)
    try:
        df, df_train, df_test = file_processing.get_forecast_df_train_test(db_forecasting)
        db_forecasting = update_forecast(db, db_forecasting.id, ForecastingStatus.Training)

        params = ()
        if db_forecasting.auto_tune:
            if db_forecasting.model == ForecastingModel.ARIMA:
                params = forecasting_ARIMA.get_best_params(df, df_train, df_test, level=db_forecasting.tune_level,
                                                           brute_force=db_forecasting.tune_brute_force)
            elif db_forecasting.model == ForecastingModel.SARIMA:
                params = forecasting_SARIMA.get_best_params(df, df_train, df_test, level=db_forecasting.tune_level,
                                                            brute_force=db_forecasting.tune_brute_force,
                                                            seasonal_period=db_forecasting.params['m'])
            db_forecasting = update_forecast_params(db, db_forecasting, params, db_forecasting.model)
        else:
            if db_forecasting.model == ForecastingModel.ARIMA:
                params = (db_forecasting.params['p'], db_forecasting.params['d'], db_forecasting.params['q'])
            elif db_forecasting.model == ForecastingModel.SARIMA:
                params = ((db_forecasting.params['p'], db_forecasting.params['d'], db_forecasting.params['q']), (
                    db_forecasting.params['P'], db_forecasting.params['D'], db_forecasting.params['Q'],
                    db_forecasting.params['m']))

        db_forecasting = update_forecast(db, db_forecasting.id, ForecastingStatus.Forecasting)

        if db_forecasting.use_log_transform:
            df, df_train, df_test = file_processing.exp_transform(df, df_train, df_test)

        predicted_test_results = predicted_results = None
        if db_forecasting.model == ForecastingModel.ARIMA:
            predicted_test_results = forecasting_ARIMA.get_predicted_test_results(df, df_train, params)
            predicted_results = forecasting_ARIMA.get_predicted_results(df, params, db_forecasting.forecast_horizon)
        elif db_forecasting.model == ForecastingModel.SARIMA:
            predicted_test_results = forecasting_SARIMA.get_predicted_test_results(df, df_train, params[0], params[1])
            predicted_results = forecasting_SARIMA.get_predicted_results(df, params[0], params[1],
                                                                         db_forecasting.forecast_horizon)

        if predicted_test_results is None or predicted_results is None:
            raise Exception()

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

        db_forecasting = update_forecast(db, db_forecasting.id, ForecastingStatus.Evaluating)
        create_eval_metrics(db, df_test, predicted_test_results, db_forecasting)
        db_forecasting = update_forecast(db, db_forecasting.id, ForecastingStatus.Finished)
    except:
        db_forecasting = update_forecast(db, db_forecasting.id, ForecastingStatus.Failed)
