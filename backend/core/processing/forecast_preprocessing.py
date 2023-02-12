import pandas as pd
import numpy as np
import math
from core.enums.dataset_column_enum import ColumnScalingMethod
from core.enums.time_period_enum import TimePeriodUnit
from sklearn.preprocessing import MinMaxScaler, PowerTransformer, StandardScaler
from rstl import STL
from core.processing import file_processing
from sklearn.model_selection import train_test_split


def get_original_processed_dataset(df, df_train, df_test, db_forecasting):
    if db_forecasting.use_log_transform:
        df, df_train, df_test = exp_transform(df, df_train, df_test)

    return df, df_train, df_test


def get_log_transform(df):
    return np.log(df)


def log_transform(df, df_train, df_test):
    df = np.log(df)
    df_train = np.log(df_train)
    df_test = np.log(df_test)
    return df, df_train, df_test


def exp_transform(df, df_train, df_test):
    df = np.exp(df)
    df_train = np.exp(df_train)
    df_test = np.exp(df_test)
    return df, df_train, df_test


def split_dataset(df, split_ratio):
    split_bound = int(len(df) * split_ratio / 100)
    df_train = df[:split_bound]
    df_test = df[split_bound:]
    return df_train, df_test


def split_dataset_ML(X, y, split_ratio):
    return train_test_split(X, y, test_size=((100 - split_ratio) / 100), shuffle=False)


def has_dataset_negative_values(df):
    if isinstance(df, pd.Series):
        return (df <= 0).any()
    else:
        has_zeros = (df[df.select_dtypes(include=np.number).columns.tolist()] <= 0).any()
        return True in has_zeros.values


def init_df(df, dataset_columns, target_column_name: str = None):
    index_col_name = None
    for column in dataset_columns:
        if column.is_date:
            index_col_name = column.name
            break

    if index_col_name is None:
        raise Exception()

    df.set_index(index_col_name, inplace=True)
    if target_column_name is not None:
        df = df[target_column_name]
    df = df.sort_index()

    return df


def get_splitted_dataset(df, split_ratio, dataset_columns, target_column_name, seasonal_period, use_decomposition: bool = True):
    df = init_df(df, dataset_columns, target_column_name)
    seasonal_df = None
    if use_decomposition:
        df, seasonal_df = apply_decomposition_for_column(df, seasonal_period, target_column_name)

    df_train, df_test = split_dataset(df, split_ratio)
    return df, seasonal_df, df_train, df_test


def get_lagged_features_to_list(lagged_features_str):
    if lagged_features_str is None:
        return []
    else:
        return lagged_features_str.split(';')


def make_lags(ts, feature_name, lags, lead_time=1):
    return pd.concat(
        {
            f'{feature_name}_lag_{i}': ts.shift(i)
            for i in range(lead_time, lags + lead_time)
        },
        axis=1)


def make_feature_lags(df, feature_name, lags, lead_time=1):
    return make_lags(df[feature_name].copy(), feature_name, lags, lead_time).fillna(0.00001)


def make_target(ts, feature_name):
    return ts[feature_name].copy()


def make_multistep_target(ts, steps):
    return pd.concat(
        {f'y_step_{i + 1}': ts.shift(-i)
         for i in range(steps + 1)},
        axis=1)


def make_multi_features(df, feature_cols, target_name, lags, lead_time=1):
    X = make_feature_lags(df, target_name, lags, lead_time).fillna(0.00001)
    for i, column in enumerate(df):
        if column in feature_cols:
            X = X.join(make_feature_lags(df, column, lags, lead_time).fillna(0.00001))
    return X


def get_time_period_frequency(time_period_unit):
    match time_period_unit:
        case TimePeriodUnit.Second:
            return 'S'
        case TimePeriodUnit.Minute:
            return 'T'
        case TimePeriodUnit.Hour:
            return 'H'
        case TimePeriodUnit.Day:
            return 'D'
        case TimePeriodUnit.Week:
            return 'W'
        case TimePeriodUnit.Month:
            return 'MS'
        case TimePeriodUnit.Year:
            return 'YS'


def get_splitted_dataset_ML(df, time_period_unit, forecast_horizon, lag_window, lagged_features, split_ratio, dataset_columns, target_column_name, seasonal_period, use_decomposition: bool = True):
    df = init_df(df, dataset_columns, None)
    seasonal_df = None
    if use_decomposition:
        df, seasonal_df = apply_decomposition_for_column(df, seasonal_period, target_column_name)

    if forecast_horizon == 1:
        time_period_freq = get_time_period_frequency(time_period_unit)
        df = df.append(pd.DataFrame(index=[pd.date_range(df.index[-1], periods=2, freq=time_period_freq)[1]]))

    y = make_target(df, target_column_name)
    if forecast_horizon > 1:
        y = make_multistep_target(y, steps=forecast_horizon).fillna(0.00001)
    else:
        y = pd.DataFrame(y)
        y = y.fillna(0.00001)

    X = make_multi_features(df, lagged_features, target_column_name, lags=lag_window, lead_time=1).fillna(0.00001)
    y, X = y.align(X, join='inner', axis=0)

    X_train, X_test, y_train, y_test = split_dataset_ML(X, y, split_ratio)

    return df, seasonal_df, X, y, X_train, X_test, y_train, y_test


def apply_log_transform_ML(X, y, X_train, X_test, y_train, y_test):
    transform_used = False
    if not has_dataset_negative_values(X) and not has_dataset_negative_values(y):
        X = get_log_transform(X)
        X_train = get_log_transform(X_train)
        X_test = get_log_transform(X_test)
        y = get_log_transform(y)
        y_train = get_log_transform(y_train)
        y_test = get_log_transform(y_test)
        transform_used = True
    return (X, y, X_train, X_test, y_train, y_test), transform_used


def apply_log_transform(df, df_train, df_test):
    transform_used = False
    if not has_dataset_negative_values(df):
        df = get_log_transform(df)
        df_train = get_log_transform(df_train)
        df_test = get_log_transform(df_test)
        transform_used = True
    return (df, df_train, df_test), (transform_used)


def apply_scaling_ML(X, y, X_train, X_test, y_train, y_test, scaling):
    if scaling == ColumnScalingMethod.MinMax:
        scaler_X = MinMaxScaler()
        scaler_Xtrain = MinMaxScaler()
        scaler_Xtest = MinMaxScaler()

        scaler_y = MinMaxScaler()
        scaler_ytrain = MinMaxScaler()
        scaler_ytest = MinMaxScaler()
    elif scaling == ColumnScalingMethod.PowerTransformer:
        scaler_X = PowerTransformer()
        scaler_Xtrain = PowerTransformer()
        scaler_Xtest = PowerTransformer()

        scaler_y = PowerTransformer()
        scaler_ytrain = PowerTransformer()
        scaler_ytest = PowerTransformer()
    else:
        scaler_X = StandardScaler()
        scaler_Xtrain = StandardScaler()
        scaler_Xtest = StandardScaler()

        scaler_y = StandardScaler()
        scaler_ytrain = StandardScaler()
        scaler_ytest = StandardScaler()

    y_scaled = scaler_y.fit_transform(y.to_numpy())
    y = pd.DataFrame(y_scaled, index=y.index, columns=y.columns)
    y_train_scaled = scaler_ytrain.fit_transform(y_train.to_numpy())
    y_train = pd.DataFrame(y_train_scaled, index=y_train.index, columns=y_train.columns)
    y_test_scaled = scaler_ytest.fit_transform(y_test.to_numpy())
    y_test = pd.DataFrame(y_test_scaled, index=y_test.index, columns=y_test.columns)

    X_scaled = scaler_X.fit_transform(X)
    X = pd.DataFrame(X_scaled, index=X.index, columns=X.columns)
    X_train_scaled = scaler_Xtrain.fit_transform(X_train)
    X_train = pd.DataFrame(X_train_scaled, index=X_train.index, columns=X_train.columns)
    X_test_scaled = scaler_Xtest.fit_transform(X_test)
    X_test = pd.DataFrame(X_test_scaled, index=X_test.index, columns=X_test.columns)

    return (X, y, X_train, X_test, y_train, y_test), (scaler_X, scaler_y, scaler_Xtrain, scaler_Xtest, scaler_ytrain, scaler_ytest)


def apply_scaling(df, df_train, df_test, scaling):
    if scaling == ColumnScalingMethod.MinMax:
        scaler_df = MinMaxScaler()
        scaler_df_train = MinMaxScaler()
        scaler_df_test = MinMaxScaler()
    elif scaling == ColumnScalingMethod.PowerTransformer:
        scaler_df = PowerTransformer()
        scaler_df_train = PowerTransformer()
        scaler_df_test = PowerTransformer()
    else:
        scaler_df = StandardScaler()
        scaler_df_train = StandardScaler()
        scaler_df_test = StandardScaler()

    df_scaled = scaler_df.fit_transform(df.to_numpy()[:, np.newaxis])
    df = pd.Series(df_scaled.flatten(), index=df.index)
    df_train_scaled = scaler_df_train.fit_transform(df_train.to_numpy()[:, np.newaxis])
    df_train = pd.Series(df_train_scaled.flatten(), index=df_train.index)
    df_test_scaled = scaler_df_test.fit_transform(df_test.to_numpy()[:, np.newaxis])
    df_test = pd.Series(df_test_scaled.flatten(), index=df_test.index)

    return (df, df_train, df_test), (scaler_df, scaler_df_train, scaler_df_test)


def apply_decomposition_for_column(df, seasonal_period, target_column_name):
    if isinstance(df, pd.Series):
        stl = STL(df.values.flatten(), seasonal_period, "periodic")
    else:
        stl = STL(df[target_column_name].values.flatten(), seasonal_period, "periodic")

    trend = stl.trend
    seasonal = stl.seasonal
    remainder = stl.remainder

    if isinstance(df, pd.Series):
        df = pd.Series(trend + remainder, index=df.index)
    else:
        df[target_column_name] = trend + remainder

    df_season = pd.DataFrame(seasonal, index=df.index)
    return df, df_season


def apply_transformations_ML(df_seasonal, X, y, X_train, X_test, y_train, y_test, use_log_transform: bool = False, scaling=None):
    log_transform_used = False
    if use_log_transform:
        xy, log_transform_used = apply_log_transform_ML(X, y, X_train, X_test, y_train, y_test)
        X, y, X_train, X_test, y_train, y_test = xy

    scalers = ()
    if scaling is not None:
        xy, scalers = apply_scaling_ML(X, y, X_train, X_test, y_train, y_test, scaling)
        X, y, X_train, X_test, y_train, y_test = xy

    return (X, y, X_train, X_test, y_train, y_test), log_transform_used, scalers, df_seasonal


def apply_transformations(df_seasonal, df, df_train, df_test, use_log_transform: bool = False, scaling=None):
    log_transform_used = False
    if use_log_transform:
        xy, log_transform_used = apply_log_transform(df, df_train, df_test)
        df, df_train, df_test = xy

    scalers = ()
    if scaling is not None:
        xy, scalers = apply_scaling(df, df_train, df_test, scaling)
        df, df_train, df_test = xy

    return (df, df_train, df_test), log_transform_used, scalers, df_seasonal


def get_forecast_ready_dataset(db_forecasting, use_transformations: bool = True):
    file = file_processing.get_filename_with_path(db_forecasting.datasetcolumns.datasets.filename,
                                  db_forecasting.datasetcolumns.datasets.project.user_id,
                                  db_forecasting.datasetcolumns.datasets.project.id)
    df = file_processing.get_processed_dataset(file, db_forecasting.datasetcolumns.datasets.delimiter, db_forecasting.datasetcolumns.datasets.columns)
    df, df_seasonal, df_train, df_test = get_splitted_dataset(df, db_forecasting.split_ratio, db_forecasting.datasetcolumns.datasets.columns, db_forecasting.datasetcolumns.name, db_forecasting.datasetcolumns.datasets.time_period.value,
                                                                            db_forecasting.use_decomposition and use_transformations)

    if use_transformations:
        return apply_transformations(df_seasonal, df, df_train, df_test, db_forecasting.use_log_transform, db_forecasting.datasetcolumns.scaling)
    return df, df_train, df_test, df_seasonal


def get_forecast_ready_dataset_ML(db_forecasting, use_transformations: bool = True):
    file = file_processing.get_filename_with_path(db_forecasting.datasetcolumns.datasets.filename,
                                  db_forecasting.datasetcolumns.datasets.project.user_id,
                                  db_forecasting.datasetcolumns.datasets.project.id)

    df = file_processing.get_processed_dataset(file, db_forecasting.datasetcolumns.datasets.delimiter, db_forecasting.datasetcolumns.datasets.columns)
    lagged_features = get_lagged_features_to_list(db_forecasting.lagged_features)
    df, df_seasonal, X, y, X_train, X_test, y_train, y_test = get_splitted_dataset_ML(df, db_forecasting.datasetcolumns.datasets.time_period.unit,
                                                                            db_forecasting.forecast_horizon,
                                                                            db_forecasting.lag_window,
                                                                            lagged_features,
                                                                            db_forecasting.split_ratio,
                                                                            db_forecasting.datasetcolumns.datasets.columns,
                                                                            db_forecasting.datasetcolumns.name,
                                                                            db_forecasting.datasetcolumns.datasets.time_period.value,
                                                                            db_forecasting.use_decomposition and use_transformations)
    if use_transformations:
        return apply_transformations_ML(df_seasonal, X, y, X_train, X_test, y_train, y_test, db_forecasting.use_log_transform, db_forecasting.datasetcolumns.scaling)

    return df, X, y, X_train, X_test, y_train, y_test, df_seasonal


def get_forecast_prev_values_test(df, season_period, test_len):
    df_ts = df.copy()
    df_ts = df_ts.shift(season_period).fillna(0)
    return df_ts[-test_len:]


def get_forecast_prev_values_future(df, forecast_horizon, season_period, time_period_unit):
    df_ts = df.copy()

    iterations = math.floor(forecast_horizon/season_period)
    df_forecast = pd.DataFrame()
    for i in range(0, iterations):
        df_forecast = pd.concat([df_forecast, df.tail(season_period)])
    df_forecast = pd.concat([df_forecast, df.tail(season_period).head(forecast_horizon - iterations * season_period)])

    dti = pd.date_range(df_ts.index[-1], periods=forecast_horizon + 1, freq=time_period_unit)
    df_forecast.index = dti[1:]
    return df_forecast


def get_forecast_prev_values(df, forecast_horizon, season_period, time_period_unit, test_len):
    df_test = get_forecast_prev_values_test(df, season_period, test_len)
    df_forecast = get_forecast_prev_values_future(df, forecast_horizon, season_period, time_period_unit)
    return pd.concat([df_test, df_forecast])


def get_baseline_dataset(db_forecasting, test_len):
    file = file_processing.get_filename_with_path(db_forecasting.datasetcolumns.datasets.filename,
                                  db_forecasting.datasetcolumns.datasets.project.user_id,
                                  db_forecasting.datasetcolumns.datasets.project.id)

    df = file_processing.get_processed_dataset(file, db_forecasting.datasetcolumns.datasets.delimiter, db_forecasting.datasetcolumns.datasets.columns)
    df = init_df(df, db_forecasting.datasetcolumns.datasets.columns, db_forecasting.datasetcolumns.name)
    df_res = get_forecast_prev_values(df,
                                                 db_forecasting.forecast_horizon,
                                                 db_forecasting.datasetcolumns.datasets.time_period.value,
                                                 get_time_period_frequency(db_forecasting.datasetcolumns.datasets.time_period.unit),
                                                 test_len)
    df_res.rename(columns={df_res.columns[0]: db_forecasting.datasetcolumns.name}, inplace=True)
    return df_res
