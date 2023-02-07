import pandas as pd
import numpy as np
from pathlib import Path
from core.enums.dataset_column_enum import ColumnMissingValuesMethod, ColumnScalingMethod
from core.enums.forecasting_model_enum import ForecastingModel
from core.enums.time_period_enum import TimePeriodUnit
from sklearn.preprocessing import MinMaxScaler, PowerTransformer, StandardScaler

from sklearn.model_selection import train_test_split
from core.config import settings


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


def get_exp_transform(df):
    return np.exp(df)


def exp_transform(df, df_train, df_test):
    df = np.exp(df)
    df_train = np.exp(df_train)
    df_test = np.exp(df_test)
    return df, df_train, df_test


def save_forecast_file(user_id, project_id, forecast_id, forecast_filename, delimiter, df):
    file_path_base = settings.FILE_STORAGE_DIR + '/' + str(user_id) + '/projects/' + str(project_id) + '/forecasting/' + str(forecast_id) + '/'
    file_path = Path(file_path_base)
    file_path.mkdir(parents=True, exist_ok=True)

    df.to_csv(file_path_base + '/' + forecast_filename, sep=delimiter, index=True)
    return file_path_base + '/' + forecast_filename


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


def get_basic_preprocessing(df, dataset_columns, target_column_name: str = None, use_log_transform: bool = False):
    index_col_name = None
    for column in dataset_columns:
        if column.is_date:
            index_col_name = column.name
            break

    if index_col_name is None:
        raise Exception()

    # if df.dtypes[target_column_name] == 'object':
    #     raise Exception()

    df.set_index(index_col_name, inplace=True)
    if target_column_name is not None:
        df = df[target_column_name]
    df = df.sort_index()

    if use_log_transform and not has_dataset_negative_values(df):
        df = get_log_transform(df)

    return df


def get_forecast_ready_dataset(df, split_ratio, dataset_columns, target_column_name, use_log_transform: bool = False):
    df = get_basic_preprocessing(df, dataset_columns, target_column_name, use_log_transform)
    df_train, df_test = split_dataset(df, split_ratio)
    return df, df_train, df_test


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
    return make_lags(df[feature_name].copy(), feature_name, lags, lead_time).fillna(0.0)


def make_target(ts, feature_name):
    return ts[feature_name].copy()


def make_multistep_target(ts, steps):
    return pd.concat(
        {f'y_step_{i + 1}': ts.shift(-i)
         for i in range(steps)},
        axis=1)


def make_multi_features(df, feature_cols, target_name, lags, lead_time=1):
    X = make_feature_lags(df, target_name, lags, lead_time).fillna(0.0)
    for i, column in enumerate(df):
        if column in feature_cols:
            X = X.join(make_feature_lags(df, column, lags, lead_time).fillna(0.0))
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



def get_forecast_ready_dataset_ML(df, time_period_unit, forecast_horizon, lag_window, lagged_features, split_ratio, dataset_columns, target_column_name, use_log_transform: bool = False, make_future: bool = False):
    df = get_basic_preprocessing(df, dataset_columns, None, use_log_transform)

    # if make_future and forecast_horizon == 1:
    if forecast_horizon == 1:
        time_period_freq = get_time_period_frequency(time_period_unit)
        df = df.append(pd.DataFrame(index=[pd.date_range(df.index[-1], periods=2, freq=time_period_freq)[1]]))

    y = make_target(df, target_column_name)
    if forecast_horizon > 1:
        y = make_multistep_target(y, steps=forecast_horizon).fillna(0.0)
    else:
        y = pd.DataFrame(y)
        y = y.fillna(0.0)

    X = make_multi_features(df, lagged_features, target_column_name, lags=lag_window, lead_time=1).fillna(0.0)
    y, X = y.align(X, join='inner', axis=0)

    X_train, X_test, y_train, y_test = split_dataset_ML(X, y, split_ratio)

    return df, X, y, X_train, X_test, y_train, y_test


def get_forecast_df_train_test(db_forecasting, use_scaling: bool = True, use_log_transform: bool = True):
    file = get_filename_with_path(db_forecasting.datasetcolumns.datasets.filename_processed if use_scaling else db_forecasting.datasetcolumns.datasets.filename,
                                  db_forecasting.datasetcolumns.datasets.project.user_id,
                                  db_forecasting.datasetcolumns.datasets.project.id)
    if use_scaling:
        df = get_processed_dataset(file, db_forecasting.datasetcolumns.datasets.delimiter)
    else:
        df = get_processed_dataset(file, db_forecasting.datasetcolumns.datasets.delimiter, db_forecasting.datasetcolumns.datasets.columns)
    return get_forecast_ready_dataset(df, db_forecasting.split_ratio, db_forecasting.datasetcolumns.datasets.columns, db_forecasting.datasetcolumns.name, db_forecasting.use_log_transform and use_log_transform)


def get_forecast_df_train_test_ML(db_forecasting, use_scaling: bool = True, use_log_transform: bool = True):
    file = get_filename_with_path(db_forecasting.datasetcolumns.datasets.filename_processed if use_scaling else db_forecasting.datasetcolumns.datasets.filename,
                                  db_forecasting.datasetcolumns.datasets.project.user_id,
                                  db_forecasting.datasetcolumns.datasets.project.id)
    if use_scaling:
        df = get_processed_dataset(file, db_forecasting.datasetcolumns.datasets.delimiter)
    else:
        df = get_processed_dataset(file, db_forecasting.datasetcolumns.datasets.delimiter, db_forecasting.datasetcolumns.datasets.columns)
    lagged_features = get_lagged_features_to_list(db_forecasting.lagged_features)
    return get_forecast_ready_dataset_ML(df, db_forecasting.datasetcolumns.datasets.time_period.unit,
                                        db_forecasting.forecast_horizon,
                                        db_forecasting.lag_window,
                                        lagged_features,
                                        db_forecasting.split_ratio,
                                        db_forecasting.datasetcolumns.datasets.columns,
                                        db_forecasting.datasetcolumns.name, db_forecasting.use_log_transform and use_log_transform)


def get_filename_with_path(filename, user_id, project_id, forecast_id=None):
    return settings.FILE_STORAGE_DIR + '/' + str(user_id) + '/projects/' + str(
        project_id) + ('/' if forecast_id is None else '/forecasting/' + str(forecast_id) + '/') + filename


def add_text_to_filename(filename, text):
    file_path = Path(filename)
    file_ext = file_path.suffix
    filename_without_ext = file_path.with_suffix('').name
    return filename_without_ext + text + file_ext


def check_columns(file_name, delimiter):
    df = pd.read_csv(file_name, sep=delimiter)
    return df.dtypes


def check_columns_df(file_name, delimiter):
    df = pd.read_csv(file_name, sep=delimiter)
    return df.dtypes.to_frame('dtypes').reset_index()


def check_columns_json(file_name, delimiter):
    df = pd.read_csv(file_name, sep=delimiter)
    return df.dtypes.to_frame('dtypes').reset_index().set_index('index')['dtypes'].astype(str).to_dict()


def retype_columns(df, db_columns):
    for db_column in db_columns:
        for i, column in enumerate(df):
            try:
                if column == db_column.name and df.dtypes[column] != db_column.data_type:
                    df[column] = df[column].astype(db_column.data_type)
            except:
                continue
    return df


def get_db_column_names(db_columns):
    col_names = []
    for column in db_columns:
        col_names.append(column.name)

    return col_names


def handle_dropping_columns(df, db_columns):
    col_names = get_db_column_names(db_columns)
    for i, column in enumerate(df):
        if column not in col_names:
            df = df.drop(column, axis=1)

    return df


def handle_missing_values(df, db_columns):
    for db_column in db_columns:
        if db_column.missing_values_handler is None:
            continue
        for i, column in enumerate(df):
            if column == db_column.name:
                try:
                    if db_column.missing_values_handler == ColumnMissingValuesMethod.FillZeros:
                        df[column] = df[column].fillna(0)
                    elif db_column.missing_values_handler == ColumnMissingValuesMethod.FillMean:
                        df[column] = df[column].fillna(df[column].mean())
                    elif db_column.missing_values_handler == ColumnMissingValuesMethod.FillMedian:
                        df[column] = df[column].fillna(df[column].median())
                    elif db_column.missing_values_handler == ColumnMissingValuesMethod.FillMostFrequent:
                        df[column] = df[column].fillna(df[column].value_counts().index[0])
                    elif db_column.missing_values_handler == ColumnMissingValuesMethod.Drop:
                        df[column] = df[column].dropna()
                except:
                    continue
    return df

def scale_columns(df, db_columns):
    for db_column in db_columns:
        if db_column.scaling is None:
            continue
        for i, column in enumerate(df):
            if column == db_column.name:
                try:
                    if db_column.scaling == ColumnScalingMethod.MinMax:
                        scaler = MinMaxScaler()
                        df[[column]] = scaler.fit_transform(df[[column]])
                    elif db_column.scaling == ColumnScalingMethod.PowerTransformer:
                        scaler = PowerTransformer()
                        df[[column]] = scaler.fit_transform(df[[column]])
                    elif db_column.scaling == ColumnScalingMethod.Standard:
                        scaler = StandardScaler()
                        df[[column]] = scaler.fit_transform(df[[column]])
                except:
                    continue
    return df


def df_to_csv(df, path, delimiter):
    # Prepend dtypes to the top of df
    df2 = df.copy()
    df2.loc[-1] = df2.dtypes
    df2.index = df2.index + 1
    df2.sort_index(inplace=True)
    # Then save it to a csv
    df2.to_csv(path, sep=delimiter, index=False)


def df_from_csv(path, delimiter):
    # Read types first line of csv
    dtypes = {key: value for (key, value) in pd.read_csv(path, sep=delimiter, nrows=1).iloc[0].to_dict().items() if
              'date' not in value.lower()}

    parse_dates = [key for (key, value) in pd.read_csv(path, sep=delimiter, nrows=1).iloc[0].to_dict().items() if
                   'date' in value.lower()]
    # Read the rest of the lines with the types from above
    return pd.read_csv(path, sep=delimiter, dtype=dtypes, parse_dates=parse_dates, skiprows=[1])


def apply_processing_to_dataset(df, db_columns, use_scaling: bool = True):
    df = handle_dropping_columns(df, db_columns)
    df = retype_columns(df, db_columns)
    df = handle_missing_values(df, db_columns)
    if use_scaling:
        df = scale_columns(df, db_columns)
    return df

def process_dataset(file_name, file_name_processed, delimiter, db_columns):
    df = pd.read_csv(file_name, sep=delimiter)
    df = apply_processing_to_dataset(df, db_columns)
    #
    # df = handle_dropping_columns(df, db_columns)
    # df = retype_columns(df, db_columns)
    # df = handle_missing_values(df, db_columns)
    # df = scale_columns(df, db_columns)

    df_to_csv(df, file_name_processed, delimiter)


def load_processed_dataset(file_name_processed, delimiter):
    df2 = df_from_csv(file_name_processed, delimiter)


def get_processed_dataset(file_name_processed, delimiter, db_columns=None):
    if db_columns is None:
        return df_from_csv(file_name_processed, delimiter)
    else:
        df = pd.read_csv(file_name_processed, sep=delimiter)
        return apply_processing_to_dataset(df, db_columns, False)
