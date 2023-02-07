import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

"""
Computes MAPE
"""


def mean_absolute_percentage_error(y_true: np.array, y_pred: np.array) -> float:
    return np.mean(np.abs((y_true - y_pred) / y_true)) * 100


"""
Computes SMAPE
"""


def symetric_mean_absolute_percentage_error(y_true: np.array, y_pred: np.array) -> float:
    return np.mean(np.abs((y_pred - y_true) / ((np.abs(y_true) + np.abs(y_pred)) / 2.0))) * 100


def weighted_mean_absolute_percentage_error(y_true: np.array, y_pred: np.array) -> float:
    return (np.sum(np.abs(y_true - y_pred)) / np.sum(np.abs(y_true))) * 100


def compute_metrics(df: pd.DataFrame) -> pd.DataFrame:
    y_true, y_pred = df['y_true'].values, df['y_pred'].values
    return compute_metrics_raw(y_true, y_pred)


def compute_metrics_raw(y_true: pd.Series, y_pred: pd.Series) -> pd.DataFrame:
    mae, mse, mape, smape, r2, wape = mean_absolute_error(y_true=y_true, y_pred=y_pred), \
                                      mean_squared_error(y_true=y_true, y_pred=y_pred), \
                                      mean_absolute_percentage_error(y_true=y_true, y_pred=y_pred), \
                                      symetric_mean_absolute_percentage_error(y_true=y_true, y_pred=y_pred), \
                                      r2_score(y_true=y_true, y_pred=y_pred), \
                                      weighted_mean_absolute_percentage_error(y_true=y_true, y_pred=y_pred)
    return pd.DataFrame.from_records([{'MAE': mae, 'MSE': mse, 'MAPE': mape, 'SMAPE': smape, 'R2': r2, 'WAPE': wape}],
                                     index=[0])


"""
Evaluate CSV with results
csv_path: Path to CSV
sep: Separator in CSV (default = ;)

CSV header format: y_true;y_pred

Example csv:
y_true;y_pred
1.2;1.3
1.5;1.5
2.4;2.7
"""


def compute_metrics_csv(csv_path: str, sep=';') -> pd.DataFrame:
    return compute_metrics(load_csv(csv_path, sep))


def load_csv(csv_path: str, sep: str) -> pd.DataFrame:
    return pd.read_csv(csv_path, sep=sep)


if __name__ == "__main__":
    print('# Results - CSV example')
    print(compute_metrics_csv('test_data.csv'))

    print('# Results - Pandas example')
    df = pd.read_csv('test_data.csv', sep=';')
    print(compute_metrics(df))

    print('# Results - Raw example')
    print(compute_metrics_raw(df.y_true.values, df.y_pred))
