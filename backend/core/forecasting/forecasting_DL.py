import optuna
import numpy as np
import pandas as pd
from copy import deepcopy
from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error, mean_squared_error
from sklearn.multioutput import MultiOutputRegressor
from sklearn.neural_network import MLPRegressor
from core.enums.forecasting_model_enum import ForecastingModel
from core.processing.file_processing import get_time_period_frequency

def get_best_params_optimize_tuning_MLP(forecast_horizon, df, X, y, X_train, X_test, y_train, y_test, trials=100):
    def objective(trial, _forecast_horizon, _df, _X, _y, _X_train, _X_test, _y_train, _y_test):

        n_layers = trial.suggest_int('n_layers', 1, 6)
        layers = []
        for j in range(n_layers):
            layers.append(trial.suggest_int('n_units_l_{}'.format(j), 1, 128))

        param = {
            'hidden_layer_sizes': tuple(layers),
            'activation': trial.suggest_categorical('activation', ['relu', 'identity', 'tanh', 'logistic']),
            'solver': trial.suggest_categorical('solver', ['adam', 'sgd', 'lbfgs']),
            'learning_rate': trial.suggest_categorical('learning_rate', ['constant', 'invscaling', 'adaptive']),
            'learning_rate_init': trial.suggest_float('learning_rate_init', 0.0001, 0.1, step=0.005),
        }

        try:
            reg = MLPRegressor(**param, random_state=13, max_iter=100)
            model = reg if _forecast_horizon == 1 else MultiOutputRegressor(reg)
            model.fit(_X_train, _y_train)
            y_pred = pd.DataFrame(model.predict(_X_test), index=_X_test.index, columns=_y.columns)
            error = mean_squared_error(_y_test, y_pred, squared=False)
        except:
            error = 1000000000

        return error

    optimize_func = lambda trial: objective(trial, forecast_horizon, df, X, y, X_train, X_test, y_train, y_test)

    study = optuna.create_study()
    study.optimize(optimize_func, n_trials=trials)

    best_params = deepcopy(study.best_params)
    hidden_layer_sizes = []
    for i in range(best_params['n_layers']):
        hidden_layer_sizes.append(best_params['n_units_l_{}'.format(i)])
        best_params.pop('n_units_l_{}'.format(i), None)
    best_params.pop('n_layers', None)
    best_params['hidden_layer_sizes'] = tuple(hidden_layer_sizes)

    return best_params


def get_trials(level=1):
    match level:
        case 1:
            return 25
        case 2:
            return 50
        case 3:
            return 100
        case _:
            return 150


def get_best_params(model, forecast_horizon, df, X, y, X_train, X_test, y_train, y_test, level=1):
    trials = get_trials(level)

    match model:
        case ForecastingModel.MLP:
            return get_best_params_optimize_tuning_MLP(forecast_horizon, df, X, y, X_train, X_test, y_train, y_test, trials=trials)
        case _:
            return {}


def get_predicted_test_results(model, forecast_horizon, df, X, y, X_train, X_test, y_train, y_test, params):
    model_pred = get_model_fit(model, forecast_horizon, X_train, y_train, params)
    if model_pred is None:
        return None
    return pd.DataFrame(model_pred.predict(X_test), index=X_test.index, columns=y.columns)


def get_forecasted_data(df_pred, forecast_horizon, time_freq='H'):
    df = df_pred.copy()
    for i in range(2, forecast_horizon + 1):
        df = df.drop(f'y_step_{i}', axis=1)
    for i in range(2, forecast_horizon + 1):
        df = df.append(pd.DataFrame(index=[pd.date_range(df.index[-1], periods=2, freq=time_freq)[1]]))
        df['y_step_1'][-1] = df_pred[f'y_step_{i}'][-1]
    return df


def get_model_fit(model, forecast_horizon, X, y, params):
    match model:
        case ForecastingModel.MLP:
            reg = MLPRegressor(**params, random_state=13, max_iter=100)
        case _:
            return None

    return reg.fit(X, y) if forecast_horizon == 1 else MultiOutputRegressor(reg).fit(X, y)


def get_predicted_results_to_forecast_data(time_period_unit, forecast_horizon, y_pred):
    data = get_forecasted_data(y_pred, forecast_horizon, get_time_period_frequency(time_period_unit))
    return data.tail(forecast_horizon).copy()


def get_predicted_results(model, time_period_unit, forecast_horizon, df, X, y, X_train, X_test, y_train, y_test, params):
    model_pred = get_model_fit(model, forecast_horizon, X, y, params)
    if model_pred is None:
        return None
    return pd.DataFrame(model_pred.predict(X), index=X.index, columns=y.columns)
