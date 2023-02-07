from core.crud import forecasting as forecasting_crud
from core.schemas import forecasting as forecasting_schema
import pandas as pd
import numpy as np
from core.enums.dataset_column_enum import ColumnScalingMethod
from sklearn.preprocessing import MinMaxScaler, PowerTransformer, StandardScaler
from sqlalchemy.orm import Session
from core.enums.forecasting_model_enum import ForecastingModel, ForecastingStatus

from core.config import settings
from core.processing import file_processing
from api import dependencies
import time
from core.forecasting import forecasting_ARIMA, forecasting_SARIMA, evaluation_metrics, forecasting_ML, forecasting_DL
import json
import math
from core.schemas import evaluation_metrics as evaluation_metrics_schema
from core.crud import evaluation_metrics as evaluation_metrics_crud


def normalize_eval_metric(value):
    return None if math.isnan(value) or math.isinf(value) else value


def create_eval_metrics(db: Session, df_test, df_pred, db_forecasting):
    df_metrics = evaluation_metrics.compute_metrics_raw(df_test, df_pred)
    db_eval_metrics = evaluation_metrics_schema.EvaluationMetricsCreate(MAE=normalize_eval_metric(df_metrics.iloc[0, 0]),
                                                                        MSE=normalize_eval_metric(df_metrics.iloc[0, 1]),
                                                                        MAPE=normalize_eval_metric(df_metrics.iloc[0, 2]),
                                                                        SMAPE=normalize_eval_metric(df_metrics.iloc[0, 3]),
                                                                        R2=normalize_eval_metric(df_metrics.iloc[0, 4]),
                                                                        WAPE=normalize_eval_metric(df_metrics.iloc[0, 5]))
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


def update_forecast_log(db: Session, forecasting_id: int, use_log: bool = False):
    db_forecasting = forecasting_crud.get(db, forecasting_id=forecasting_id)
    forecasting_updates = forecasting_schema.ForecastingUpdateSchema(use_log_transform=use_log)
    return forecasting_crud.update(db, forecasting=db_forecasting, updates=forecasting_updates)


def start_statsmodels_pipeline(db: Session, db_forecasting: forecasting_schema.ForecastingSchema):
    db_forecasting = update_forecast(db, db_forecasting.id, ForecastingStatus.Preprocessing)
    df, df_train, df_test = file_processing.get_forecast_df_train_test(db_forecasting)

    if db_forecasting.use_log_transform:
        if file_processing.has_dataset_negative_values(df):
            db_forecasting = update_forecast_log(db, db_forecasting.id)

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
    # df, df_train, df_test = file_processing.get_original_processed_dataset(df, df_train, df_test, db_forecasting)

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

    if db_forecasting.use_log_transform:
        df_test = file_processing.get_exp_transform(df_test)
        predicted_test_results = file_processing.get_exp_transform(predicted_test_results)
        predicted_results = file_processing.get_exp_transform(predicted_results)

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
    return db_forecasting


def start_DL_pipeline(db: Session, db_forecasting: forecasting_schema.ForecastingSchema):
    db_forecasting = update_forecast(db, db_forecasting.id, ForecastingStatus.Preprocessing)
    df, X, y, X_train, X_test, y_train, y_test = file_processing.get_forecast_df_train_test_ML(db_forecasting)

    scaler_y = scaler_ytrain = scaler_ytest = None
    if db_forecasting.datasetcolumns.scaling is not None:
        df_base, X_base, y_base, X_train_base, X_test_base, y_train_base, y_test_base = file_processing.get_forecast_df_train_test_ML(
            db_forecasting, use_scaling=False)
        if db_forecasting.datasetcolumns.scaling == ColumnScalingMethod.MinMax:
            scaler_y = MinMaxScaler()
            scaler_ytrain = MinMaxScaler()
            scaler_ytest = MinMaxScaler()
        elif db_forecasting.datasetcolumns.scaling == ColumnScalingMethod.PowerTransformer:
            scaler_y = PowerTransformer()
            scaler_ytrain = PowerTransformer()
            scaler_ytest = PowerTransformer()
        else:
            scaler_y = StandardScaler()
            scaler_ytrain = StandardScaler()
            scaler_ytest = StandardScaler()

        y = scaler_y.fit_transform(y_base.to_numpy())
        y = pd.DataFrame(y, index=y_base.index, columns=y_base.columns)
        y_train = scaler_ytrain.fit_transform(y_train_base.to_numpy())
        y_train = pd.DataFrame(y_train, index=y_train_base.index, columns=y_train_base.columns)
        y_test = scaler_ytest.fit_transform(y_test_base.to_numpy())
        y_test = pd.DataFrame(y_test, index=y_test_base.index, columns=y_test_base.columns)

    db_forecasting = update_forecast(db, db_forecasting.id, ForecastingStatus.Training)
    params = {}
    if db_forecasting.auto_tune:
        params = forecasting_DL.get_best_params(db_forecasting.model, db_forecasting.forecast_horizon, df, X, y,
                                                X_train, X_test, y_train, y_test, level=db_forecasting.tune_level)
        if db_forecasting.model == ForecastingModel.MLP:
            params['hidden_layer_sizes'] = ','.join(map(str, params['hidden_layer_sizes']))

        db_forecasting = update_forecast_params(db, db_forecasting, params, db_forecasting.model)
    else:
        params = db_forecasting.params

    if db_forecasting.model == ForecastingModel.MLP:
        params['hidden_layer_sizes'] = tuple([int(x) for x in params['hidden_layer_sizes'].split(',') if x.strip().isdigit()])

    db_forecasting = update_forecast(db, db_forecasting.id, ForecastingStatus.Forecasting)
    predicted_test_results = predicted_results = None
    predicted_test_results = forecasting_DL.get_predicted_test_results(db_forecasting.model,
                                                                       db_forecasting.forecast_horizon, df, X, y,
                                                                       X_train, X_test, y_train, y_test, params)
    predicted_results = forecasting_DL.get_predicted_results(db_forecasting.model,
                                                             db_forecasting.datasetcolumns.datasets.time_period.unit,
                                                             db_forecasting.forecast_horizon, df, X, y, X_train, X_test,
                                                             y_train, y_test, params)

    if predicted_test_results is None or predicted_results is None:
        raise Exception()

    if scaler_ytest is not None and scaler_y is not None:
        y_test_orig = scaler_ytest.inverse_transform(y_test.to_numpy())
        y_test = pd.DataFrame(y_test_orig, index=y_test.index, columns=y_test.columns)

        predicted_test_results_orig = scaler_ytest.inverse_transform(predicted_test_results.to_numpy())
        predicted_test_results = pd.DataFrame(predicted_test_results_orig, index=predicted_test_results.index, columns=predicted_test_results.columns)

        predicted_results_orig = scaler_y.inverse_transform(predicted_results.to_numpy())
        predicted_results = pd.DataFrame(predicted_results_orig, index=predicted_results.index, columns=predicted_results.columns)

    predicted_results = forecasting_DL.get_predicted_results_to_forecast_data(db_forecasting.datasetcolumns.datasets.time_period.unit, db_forecasting.forecast_horizon, predicted_results)

    if db_forecasting.forecast_horizon == 1:
        predicted_test_results.drop(predicted_test_results.tail(1).index, inplace=True)
        y_test.drop(y_test.tail(1).index, inplace=True)
    else:
        predicted_test_results.rename(columns={'y_step_1': 'predicted_mean'}, inplace=True)
        predicted_test_results = predicted_test_results['predicted_mean']
        predicted_results.rename(columns={'y_step_1': 'predicted_mean'}, inplace=True)
        y_test = y_test['y_step_1']

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
    create_eval_metrics(db, y_test.values, predicted_test_results.values, db_forecasting)

    db_forecasting = update_forecast(db, db_forecasting.id, ForecastingStatus.Finished)
    return db_forecasting


def start_ML_pipeline(db: Session, db_forecasting: forecasting_schema.ForecastingSchema):
    db_forecasting = update_forecast(db, db_forecasting.id, ForecastingStatus.Preprocessing)
    df, X, y, X_train, X_test, y_train, y_test = file_processing.get_forecast_df_train_test_ML(db_forecasting)

    if db_forecasting.use_log_transform:
        if file_processing.has_dataset_negative_values(df):
            db_forecasting = update_forecast_log(db, db_forecasting.id)

    scaler_y = scaler_ytrain = scaler_ytest = None
    if db_forecasting.datasetcolumns.scaling is not None:
        df_base, X_base, y_base, X_train_base, X_test_base, y_train_base, y_test_base = file_processing.get_forecast_df_train_test_ML(
            db_forecasting, use_scaling=False)
        if db_forecasting.datasetcolumns.scaling == ColumnScalingMethod.MinMax:
            scaler_y = MinMaxScaler()
            scaler_ytrain = MinMaxScaler()
            scaler_ytest = MinMaxScaler()
        elif db_forecasting.datasetcolumns.scaling == ColumnScalingMethod.PowerTransformer:
            scaler_y = PowerTransformer()
            scaler_ytrain = PowerTransformer()
            scaler_ytest = PowerTransformer()
        else:
            scaler_y = StandardScaler()
            scaler_ytrain = StandardScaler()
            scaler_ytest = StandardScaler()

        y = scaler_y.fit_transform(y_base.to_numpy())
        y = pd.DataFrame(y, index=y_base.index, columns=y_base.columns)
        y_train = scaler_ytrain.fit_transform(y_train_base.to_numpy())
        y_train = pd.DataFrame(y_train, index=y_train_base.index, columns=y_train_base.columns)
        y_test = scaler_ytest.fit_transform(y_test_base.to_numpy())
        y_test = pd.DataFrame(y_test, index=y_test_base.index, columns=y_test_base.columns)

        if db_forecasting.use_log_transform:
            y = file_processing.get_log_transform(y)
            y_train = file_processing.get_log_transform(y_train)
            y_test = file_processing.get_log_transform(y_test)

    db_forecasting = update_forecast(db, db_forecasting.id, ForecastingStatus.Training)
    params = {}
    if db_forecasting.auto_tune:
        params = forecasting_ML.get_best_params(db_forecasting.model, db_forecasting.forecast_horizon, df, X, y, X_train, X_test, y_train, y_test, level=db_forecasting.tune_level)
        db_forecasting = update_forecast_params(db, db_forecasting, params, db_forecasting.model)
    else:
        params = db_forecasting.params

    db_forecasting = update_forecast(db, db_forecasting.id, ForecastingStatus.Forecasting)
    predicted_test_results = predicted_results = None
    predicted_test_results = forecasting_ML.get_predicted_test_results(db_forecasting.model, db_forecasting.forecast_horizon, df, X, y, X_train, X_test, y_train, y_test, params)
    predicted_results = forecasting_ML.get_predicted_results(db_forecasting.model, db_forecasting.datasetcolumns.datasets.time_period.unit, db_forecasting.forecast_horizon, df, X, y, X_train, X_test, y_train, y_test, params)

    if predicted_test_results is None or predicted_results is None:
        raise Exception()

    if db_forecasting.use_log_transform:
        y_test = file_processing.get_exp_transform(y_test)
        predicted_test_results = file_processing.get_exp_transform(predicted_test_results)
        predicted_results = file_processing.get_exp_transform(predicted_results)

    if scaler_ytest is not None and scaler_y is not None:
        y_test_orig = scaler_ytest.inverse_transform(y_test.to_numpy())
        y_test = pd.DataFrame(y_test_orig, index=y_test.index, columns=y_test.columns)

        predicted_test_results_orig = scaler_ytest.inverse_transform(predicted_test_results.to_numpy())
        predicted_test_results = pd.DataFrame(predicted_test_results_orig, index=predicted_test_results.index, columns=predicted_test_results.columns)

        predicted_results_orig = scaler_y.inverse_transform(predicted_results.to_numpy())
        predicted_results = pd.DataFrame(predicted_results_orig, index=predicted_results.index, columns=predicted_results.columns)

    predicted_results = forecasting_ML.get_predicted_results_to_forecast_data(db_forecasting.datasetcolumns.datasets.time_period.unit, db_forecasting.forecast_horizon, predicted_results)

    if db_forecasting.forecast_horizon == 1:
        predicted_test_results.drop(predicted_test_results.tail(1).index, inplace=True)
        y_test.drop(y_test.tail(1).index, inplace=True)
    else:
        predicted_test_results.rename(columns={'y_step_1': 'predicted_mean'}, inplace=True)
        predicted_test_results = predicted_test_results['predicted_mean']
        predicted_results.rename(columns={'y_step_1': 'predicted_mean'}, inplace=True)
        y_test = y_test['y_step_1']

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
    create_eval_metrics(db, y_test.values, predicted_test_results.values, db_forecasting)

    db_forecasting = update_forecast(db, db_forecasting.id, ForecastingStatus.Finished)
    return db_forecasting


def start_forecasting(db: Session, db_forecasting: forecasting_schema.ForecastingSchema):
    try:
        if db_forecasting.model == ForecastingModel.ARIMA or db_forecasting.model == ForecastingModel.SARIMA:
            db_forecasting = start_statsmodels_pipeline(db, db_forecasting)
        elif db_forecasting.model == ForecastingModel.MLP:
            db_forecasting = start_DL_pipeline(db, db_forecasting)
        else:
            db_forecasting = start_ML_pipeline(db, db_forecasting)
    except:
        db_forecasting = update_forecast(db, db_forecasting.id, ForecastingStatus.Failed)
