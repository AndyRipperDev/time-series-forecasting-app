import pandas as pd
import numpy as np
import math


def get_exp_transform(df):
    return np.exp(df)


def apply_exp_transform(y, y_train, y_test, y_test_pred, y_forecast_pred):
    y = get_exp_transform(y)
    y_train = get_exp_transform(y_train)
    y_test = get_exp_transform(y_test)
    y_test_pred = get_exp_transform(y_test_pred)
    y_forecast_pred = get_exp_transform(y_forecast_pred)
    return y, y_train, y_test, y_test_pred, y_forecast_pred


def apply_back_scaling(y, y_train, y_test, y_test_pred, y_forecast_pred, scalers):
    y_orig = scalers[0].inverse_transform(y.to_numpy()[:, np.newaxis])
    y = pd.Series(y_orig.flatten(), index=y.index)

    y_train_orig = scalers[1].inverse_transform(y_train.to_numpy()[:, np.newaxis])
    y_train = pd.Series(y_train_orig.flatten(), index=y_train.index)

    y_test_orig = scalers[2].inverse_transform(y_test.to_numpy()[:, np.newaxis])
    y_test = pd.Series(y_test_orig.flatten(), index=y_test.index)

    y_test_pred_orig = scalers[2].inverse_transform(y_test_pred.to_numpy()[:, np.newaxis])
    y_test_pred = pd.Series(y_test_pred_orig.flatten(), index=y_test_pred.index)

    y_forecast_pred_orig = scalers[0].inverse_transform(y_forecast_pred.to_numpy()[:, np.newaxis])
    y_forecast_pred = pd.Series(y_forecast_pred_orig.flatten(), index=y_forecast_pred.index)

    return y, y_train, y_test, y_test_pred, y_forecast_pred


def apply_back_scaling_ML(y, y_train, y_test, y_test_pred, y_forecast_pred, scalers):
    y_orig = scalers[1].inverse_transform(y.to_numpy())
    y = pd.DataFrame(y_orig, index=y.index, columns=y.columns)

    y_train_orig = scalers[4].inverse_transform(y_train.to_numpy())
    y_train = pd.DataFrame(y_train_orig, index=y_train.index, columns=y_train.columns)

    y_test_orig = scalers[5].inverse_transform(y_test.to_numpy())
    y_test = pd.DataFrame(y_test_orig, index=y_test.index, columns=y_test.columns)

    y_test_pred_orig = scalers[5].inverse_transform(y_test_pred.to_numpy())
    y_test_pred = pd.DataFrame(y_test_pred_orig, index=y_test_pred.index, columns=y_test_pred.columns)

    y_forecast_pred_orig = scalers[1].inverse_transform(y_forecast_pred.to_numpy())
    y_forecast_pred = pd.DataFrame(y_forecast_pred_orig, index=y_forecast_pred.index, columns=y_forecast_pred.columns)

    return y, y_train, y_test, y_test_pred, y_forecast_pred


def get_future_season_values(df_season, forecast_horizon, seasonal_period):
    iterations = math.floor(forecast_horizon/seasonal_period)
    df_fin = pd.DataFrame()
    for i in range(0, iterations):
        df_fin = pd.concat([df_fin, df_season.tail(seasonal_period)])
    df_fin = pd.concat([df_fin, df_season.tail(seasonal_period).head(forecast_horizon - iterations * seasonal_period)])
    return df_fin


def apply_back_decomposition_output(y_test, y_test_pred, y_forecast_pred, df_seasonal, seasonal_period, forecast_horizon):
    df_test_seasonal = df_seasonal[-len(y_test):]

    if isinstance(y_test, pd.Series):
        y_test = y_test + df_test_seasonal.values.flatten()
    else:
        y_test.iloc[:, 0] = y_test.values + df_test_seasonal

    if isinstance(y_test_pred, pd.Series):
        y_test_pred = y_test_pred + df_test_seasonal.values.flatten()
    else:
        y_test_pred.iloc[:, 0] = y_test_pred.values + df_test_seasonal

    df_forecast_seasonal_component = get_future_season_values(df_seasonal, forecast_horizon, seasonal_period)

    if isinstance(y_forecast_pred, pd.Series):
        y_forecast_pred = y_forecast_pred + df_forecast_seasonal_component.values.flatten()
    else:
        y_forecast_pred.iloc[:, 0] = y_forecast_pred.values + df_forecast_seasonal_component.values

    return y_test, y_test_pred, y_forecast_pred


def apply_back_transformations_ML(y, y_train, y_test, y_test_pred, y_forecast_pred, log_transform_used, scalers):
    if len(scalers) != 0:
        y, y_train, y_test, y_test_pred, y_forecast_pred = apply_back_scaling_ML(y, y_train, y_test, y_test_pred, y_forecast_pred, scalers)

    if log_transform_used:
        y, y_train, y_test, y_test_pred, y_forecast_pred = apply_exp_transform(y, y_train, y_test, y_test_pred, y_forecast_pred)

    return y, y_train, y_test, y_test_pred, y_forecast_pred


def apply_back_transformations(y, y_train, y_test, y_test_pred, y_forecast_pred, log_transform_used, scalers):
    if len(scalers) != 0:
        y, y_train, y_test, y_test_pred, y_forecast_pred = apply_back_scaling(y, y_train, y_test, y_test_pred, y_forecast_pred, scalers)

    if log_transform_used:
        y, y_train, y_test, y_test_pred, y_forecast_pred = apply_exp_transform(y, y_train, y_test, y_test_pred, y_forecast_pred)

    return y, y_train, y_test, y_test_pred, y_forecast_pred


def get_normalized_forecasted_outputs(db_forecasting, y_test, y_test_pred, y_forecast_pred, df_seasonal):
    if db_forecasting.use_decomposition:
        return apply_back_decomposition_output(y_test, y_test_pred, y_forecast_pred, df_seasonal, db_forecasting.datasetcolumns.datasets.time_period.value, db_forecasting.forecast_horizon)
    return y_test, y_test_pred, y_forecast_pred
