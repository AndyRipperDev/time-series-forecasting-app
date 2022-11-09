import pandas as pd
import json


def check_columns(file_name, delimiter):
    df = pd.read_csv(file_name, sep=delimiter)
    return df.dtypes


def check_columns_df(file_name, delimiter):
    df = pd.read_csv(file_name, sep=delimiter)
    return df.dtypes.to_frame('dtypes').reset_index()


def check_columns_json(file_name, delimiter):
    df = pd.read_csv(file_name, sep=delimiter)
    return df.dtypes.to_frame('dtypes').reset_index().set_index('index')['dtypes'].astype(str).to_dict()
