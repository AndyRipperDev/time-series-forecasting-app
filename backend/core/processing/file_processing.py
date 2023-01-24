import pandas as pd
from pathlib import Path
from core.enums.dataset_column_enum import ColumnMissingValuesMethod, ColumnScalingMethod
from sklearn.preprocessing import MinMaxScaler, PowerTransformer, StandardScaler

from core.config import settings


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


def get_forecast_ready_dataset(df, split_ratio, dataset_columns, target_column_name):
    index_col_name = None
    for column in dataset_columns:
        if column.is_date:
            index_col_name = column.name
            break

    if index_col_name is None:
        raise Exception()

    if df.dtypes[target_column_name] == 'object':
        raise Exception()

    df.set_index(index_col_name, inplace=True)
    df = df[target_column_name]
    df_train, df_test = split_dataset(df, split_ratio)

    return df, df_train, df_test


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


def process_dataset(file_name, file_name_processed, delimiter, db_columns):
    df = pd.read_csv(file_name, sep=delimiter)

    df = handle_dropping_columns(df, db_columns)
    df = retype_columns(df, db_columns)
    df = handle_missing_values(df, db_columns)
    df = scale_columns(df, db_columns)

    df_to_csv(df, file_name_processed, delimiter)


def load_processed_dataset(file_name_processed, delimiter):
    df2 = df_from_csv(file_name_processed, delimiter)


def get_processed_dataset(file_name_processed, delimiter):
    return df_from_csv(file_name_processed, delimiter)
