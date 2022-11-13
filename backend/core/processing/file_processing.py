import pandas as pd
from pathlib import Path


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
    df = df.dropna()

    df = retype_columns(df, db_columns)

    df_to_csv(df, file_name_processed, delimiter)


def load_processed_dataset(file_name_processed, delimiter):
    df2 = df_from_csv(file_name_processed, delimiter)
