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
    return df_diff


def get_df_diff_shift(df, shift_val=1):
    df_diff = df - df.shift(shift_val)
    df_diff = df_diff.dropna()
    return df_diff


def get_stationary_series(df, sig_level=0.05, seasonal=False, seasonal_period=12):
    df_param = df.copy()
    res = get_adf_test(df_param)
    diff_order = 0
    while res[1] > sig_level:
        if seasonal:
            df_param = get_df_diff_shift(df_param, 1)
            df_param = get_df_diff_shift(df_param, seasonal_period)
        else:
            df_param = get_df_diff(df_param)
        res = get_adf_test(df_param)
        diff_order += 1
    return diff_order, df_param


def get_best_params_brute_force(df, df_train, df_test, min_p=0, max_p=15, min_q=0, max_q=15, d=None,
                                seasonal_period=12):
    p = range(min_p, max_p if max_p < seasonal_period else seasonal_period - 1)
    q = range(min_q, max_q if max_q < seasonal_period else seasonal_period - 1)
    P = range(min_p, max_p)
    Q = range(min_q, max_q)

    if d is None:
        d = get_stationary_series(df_train, seasonal=True, seasonal_period=seasonal_period)[0]

    pq_combinations = list(itertools.product(p, q))
    pq_seasonal_combinations = list(itertools.product(P, Q))

    rmse = []
    order1 = []
    order2 = []
    order_index = []

    for pq in pq_combinations:
        for pq_seasonal in pq_seasonal_combinations:
            try:
                model = sm.tsa.statespace.SARIMAX(df_train, order=(pq[0], d, pq[1]), seasonal_order=(pq_seasonal[0], d, pq_seasonal[1], seasonal_period)).fit(low_memory=True)
                pred = model.predict(start=len(df_train), end=(len(df) - 1))
                error = np.sqrt(mean_squared_error(df_test, pred))
                order1.append((pq[0], d, pq[1]))
                order2.append((pq_seasonal[0], d, pq_seasonal[1], seasonal_period))
                order_index.append((order1[-1], order2[-1]))
                rmse.append(error)
            except:
                continue

    results = pd.DataFrame(index=order_index, data=rmse, columns=['RMSE'])

    return results[results.RMSE == results.RMSE.min()].index.item()


def get_best_params_optimize_tuning(df, df_train, df_test, max_p=15, max_q=15, max_P=15, max_Q=15, d=None,
                                    seasonal_period=12, trials=100):
    def objective(trial, _df, _df_train, _df_test, _max_p, _max_q, _max_P, _max_Q, _d, _seasonal_period):
        p = trial.suggest_int('p', 0, _max_p)
        q = trial.suggest_int('q', 0, _max_q)
        P = trial.suggest_int('P', 0, _max_P)
        Q = trial.suggest_int('Q', 0, _max_Q)
        D = _d if _d != 0 else trial.suggest_int('d', 0, 2)



        try:
            model = sm.tsa.statespace.SARIMAX(_df_train, order=(p, D, q),
                                              seasonal_order=(P, D, Q, _seasonal_period)).fit(low_memory=True)
            pred = model.predict(start=len(_df_train), end=(len(_df) - 1))
            error = np.sqrt(mean_squared_error(_df_test, pred))
        except:
            error = 1000000000
        return error

    if d is None:
        d = get_stationary_series(df_train)[0]

    optimize_func = lambda trial: objective(trial, df, df_train, df_test,
                                            max_p if max_p < seasonal_period else seasonal_period - 1,
                                            max_q if max_q < seasonal_period else seasonal_period - 1, max_P, max_Q, d,
                                            seasonal_period)

    study = optuna.create_study()
    study.optimize(optimize_func, n_trials=trials)

    d = d if d != 0 else study.best_params.get('d')

    return (study.best_params.get('p'), d, study.best_params.get('q')), (
    study.best_params.get('P'), d, study.best_params.get('Q'), seasonal_period)


def get_best_params(df, df_train, df_test, level=1, brute_force=False, seasonal_period=12):
    if level == 1:
        return get_best_params_brute_force(df, df_train, df_test, max_p=3, max_q=3,
                                           seasonal_period=seasonal_period) if brute_force else get_best_params_optimize_tuning(
            df, df_train,
            df_test,
            max_p=10,
            max_q=10,
            seasonal_period=seasonal_period,
            trials=10)
    elif level == 2:
        return get_best_params_brute_force(df, df_train, df_test, max_p=8,
                                           max_q=8,
                                           seasonal_period=seasonal_period) if brute_force else get_best_params_optimize_tuning(
            df, df_train,
            df_test,
            max_p=15,
            max_q=15,
            seasonal_period=seasonal_period,
            trials=20)
    elif level == 3:
        return get_best_params_brute_force(df, df_train, df_test, max_p=15,
                                           max_q=15,
                                           seasonal_period=seasonal_period) if brute_force else get_best_params_optimize_tuning(
            df, df_train,
            df_test,
            max_p=20,
            max_q=20,
            seasonal_period=seasonal_period,
            trials=30)
    else:
        return get_best_params_brute_force(df, df_train, df_test, max_p=20,
                                           max_q=20,
                                           seasonal_period=seasonal_period) if brute_force else get_best_params_optimize_tuning(
            df, df_train,
            df_test,
            max_p=25,
            max_q=25,
            seasonal_period=seasonal_period,
            trials=50)


def get_predicted_test_results(df, df_train, params, seasonal_params):
    model = sm.tsa.statespace.SARIMAX(df_train, order=params, seasonal_order=seasonal_params).fit(low_memory=True)
    return model.predict(start=len(df_train), end=(len(df) - 1))


def get_predicted_results(df, params, seasonal_params, forecast_horizon):
    model = sm.tsa.statespace.SARIMAX(df, order=params, seasonal_order=seasonal_params).fit(low_memory=True)
    return model.predict(start=len(df), end=(len(df) + forecast_horizon - 1))
