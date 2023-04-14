import itertools
import optuna
import numpy as np
import pandas as pd
import math
import sklearn.preprocessing, sklearn.cluster, sklearn.metrics
import scipy.spatial
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf
from statsmodels.tsa.stattools import adfuller
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.stattools import acf
import statsmodels.api as sm
from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error, mean_squared_error


def get_adf_test(df):
    result = adfuller(df, autolag='AIC')
    print(f'ADF Statistic: {result[0]}')
    print(f'n_lags: {result[1]}')
    print(f'p-value: {result[1]}')
    for key, value in result[4].items():
        print('Critial Values:')
        print(f'   {key}, {value}')
    return result


def get_df_diff(df):
    df_diff = df.diff().dropna()
    # df_diff.plot()
    return df_diff


def get_stationary_series(df, sig_level=0.05):
    df_param = df.copy()
    res = get_adf_test(df_param)
    diff_order = 0
    while res[1] > sig_level:
        df_param = get_df_diff(df_param)
        res = get_adf_test(df_param)
        diff_order += 1
    return diff_order, df_param


def get_best_params_brute_force(df, df_train, df_test, min_p=0, max_p=15, min_q=0, max_q=15, d=None):
    p = range(min_p, max_p)
    q = range(min_q, max_q)
    if d is None:
        d = get_stationary_series(df_train)[0]

    pq_combinations = list(itertools.product(p, q))

    rmse = []
    order1 = []

    for pq in pq_combinations:
        try:
            model = ARIMA(df_train, order=(pq[0], d, pq[1]), trend="t").fit()
            pred = model.predict(start=len(df_train), end=(len(df) - 1))
            error = np.sqrt(mean_squared_error(df_test, pred))
            order1.append((pq[0], d, pq[1]))
            rmse.append(error)
        except:
            continue

    results = pd.DataFrame(index=order1, data=rmse, columns=['RMSE'])

    return results[results.RMSE == results.RMSE.min()].index.item()


def get_best_params_optimize_tuning(df, df_train, df_test, max_p=15, max_q=15, d=None, trials=100):
    def objective(trial, _df, _df_train, _df_test, _max_p, _max_q, _d):
        p = trial.suggest_int('p', 0, _max_p)
        q = trial.suggest_int('q', 0, _max_q)
        D = _d if _d != 0 else trial.suggest_int('d', 0, 2)

        try:
            model = ARIMA(_df_train, order=(p, D, q), trend="t").fit()
            pred = model.predict(start=len(_df_train), end=(len(_df) - 1))
            error = np.sqrt(mean_squared_error(_df_test, pred))
        except:
            error = 1000000000

        return error

    if d is None:
        d = get_stationary_series(df_train)[0]

    optimize_func = lambda trial: objective(trial, df, df_train, df_test, max_p, max_q, d)

    study = optuna.create_study()
    study.optimize(optimize_func, n_trials=trials)

    d = d if d != 0 else study.best_params.get('d')

    return study.best_params.get('p'), d, study.best_params.get('q')


def get_best_params(df, df_train, df_test, level=1, brute_force=False):
    if level == 1:
        return get_best_params_brute_force(df, df_train, df_test, max_p=5, max_q=5) if brute_force else get_best_params_optimize_tuning(df, df_train, df_test, max_p=10, max_q=10, trials=25)
    elif level == 2:
        return get_best_params_brute_force(df, df_train, df_test, max_p=10, max_q=10) if brute_force else get_best_params_optimize_tuning(df, df_train, df_test, max_p=15, max_q=15, trials=50)
    elif level == 3:
        return get_best_params_brute_force(df, df_train, df_test, max_p=15, max_q=15) if brute_force else get_best_params_optimize_tuning(df, df_train, df_test, max_p=20, max_q=20, trials=100)
    else:
        return get_best_params_brute_force(df, df_train, df_test, max_p=20, max_q=20) if brute_force else get_best_params_optimize_tuning(df, df_train, df_test, max_p=25, max_q=25, trials=100)


def get_predicted_test_results(df, df_train, params):
    model = ARIMA(df_train, order=params, trend="t").fit()
    return model.predict(start=len(df_train), end=(len(df) - 1))


def get_predicted_results(df, params, forecast_horizon):
    model = ARIMA(df, order=params, trend="t").fit()
    return model.predict(start=len(df), end=(len(df) + forecast_horizon - 1))


