import optuna
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error, mean_squared_error
import lightgbm as lgb
from sklearn.multioutput import MultiOutputRegressor
from xgboost import XGBRegressor
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from core.enums.forecasting_model_enum import ForecastingModel
from core.processing.file_processing import get_time_period_frequency



def get_best_params_optimize_tuning_LinearRegression(forecast_horizon, df, X, y, X_train, X_test, y_train, y_test, trials=100):
    def objective(trial, _forecast_horizon, _df, _X, _y, _X_train, _X_test, _y_train, _y_test):
        param = {
            'copy_X': trial.suggest_categorical("copy_X", [True, False]),
            'fit_intercept': trial.suggest_categorical('fit_intercept', [True, False]),
            'positive': trial.suggest_categorical('positive', [True, False]),
        }

        try:
            reg = LinearRegression(**param)
            model = reg if _forecast_horizon == 1 else MultiOutputRegressor(reg)
            model.fit(_X_train, _y_train)
            y_pred = pd.DataFrame(model.predict(_X_test), index=_X_test.index, columns=_y.columns)
            error = mean_squared_error(_y_test, y_pred, squared=False)
        except:
            error = 100

        return error

    optimize_func = lambda trial: objective(trial, forecast_horizon, df, X, y, X_train, X_test, y_train, y_test)

    study = optuna.create_study()
    study.optimize(optimize_func, n_trials=trials)

    return study.best_params


def get_best_params_optimize_tuning_RandomForest(forecast_horizon, df, X, y, X_train, X_test, y_train, y_test, trials=100):
    def objective(trial, _forecast_horizon, _df, _X, _y, _X_train, _X_test, _y_train, _y_test):
        param = {
            'n_estimators': trial.suggest_int('n_estimators', 10, 300),
            'max_depth': trial.suggest_categorical('max_depth', [None, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]),
            'min_samples_split': trial.suggest_int('min_samples_split', 1, 150),
            'min_samples_leaf': trial.suggest_int('min_samples_leaf', 1, 60),
            'bootstrap': trial.suggest_categorical('bootstrap', [True, False]),
            'max_features': trial.suggest_categorical('max_features', ['sqrt', 'log2', None]),
        }

        try:
            reg = RandomForestRegressor(**param, random_state=13)
            model = reg if _forecast_horizon == 1 else MultiOutputRegressor(reg)
            model.fit(_X_train, _y_train)
            y_pred = pd.DataFrame(model.predict(_X_test), index=_X_test.index, columns=_y.columns)
            error = mean_squared_error(_y_test, y_pred, squared=False)
        except:
            error = 100

        return error

    optimize_func = lambda trial: objective(trial, forecast_horizon, df, X, y, X_train, X_test, y_train, y_test)

    study = optuna.create_study()
    study.optimize(optimize_func, n_trials=trials)

    return study.best_params


def get_best_params_optimize_tuning_XGBoost(forecast_horizon, df, X, y, X_train, X_test, y_train, y_test, trials=100):
    def objective(trial, _forecast_horizon, _df, _X, _y, _X_train, _X_test, _y_train, _y_test):
        param = {
            'booster': trial.suggest_categorical('booster', ['gbtree', 'gblinear', 'dart']),
            'n_estimators': trial.suggest_int('n_estimators', 10, 300),
            'lambda': trial.suggest_loguniform('lambda', 1e-3, 10.0),
            'alpha': trial.suggest_loguniform('alpha', 1e-3, 10.0),
            "gamma": trial.suggest_loguniform("gamma", 1e-3, 10.0),
            'colsample_bytree': trial.suggest_categorical('colsample_bytree', [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]),
            'subsample': trial.suggest_categorical('subsample', [0.4, 0.5, 0.6, 0.7, 0.8, 1.0]),
            'learning_rate': trial.suggest_categorical('learning_rate', [0.008, 0.01, 0.012, 0.014, 0.016, 0.018, 0.02]),
            "max_depth": trial.suggest_int("max_depth", 4, 20),
            'min_child_weight': trial.suggest_int('min_child_weight', 1, 300),
        }

        try:
            reg = XGBRegressor(**param, random_state=13)
            model = reg if _forecast_horizon == 1 else MultiOutputRegressor(reg)
            if _forecast_horizon == 1:
                model.fit(_X_train, _y_train, eval_set=[(_X_test, _y_test)], early_stopping_rounds=100, verbose=False)
            else:
                model.fit(_X_train, _y_train)
            y_pred = pd.DataFrame(model.predict(_X_test), index=_X_test.index, columns=_y.columns)
            error = mean_squared_error(_y_test, y_pred, squared=False)
        except:
            error = 100

        return error

    optimize_func = lambda trial: objective(trial, forecast_horizon, df, X, y, X_train, X_test, y_train, y_test)

    study = optuna.create_study()
    study.optimize(optimize_func, n_trials=trials)

    return study.best_params


def get_best_params_optimize_tuning_LightGBM(forecast_horizon, df, X, y, X_train, X_test, y_train, y_test, trials=100):
    def objective(trial, _forecast_horizon, _df, _X, _y, _X_train, _X_test, _y_train, _y_test):
        param = {
            'metric': 'rmse',
            'boosting_type': trial.suggest_categorical('boosting_type', ['gbdt', 'dart']),
            'n_estimators': trial.suggest_int('n_estimators', 10, 300),
            'reg_alpha': trial.suggest_loguniform('reg_alpha', 1e-3, 10.0),
            'reg_lambda': trial.suggest_loguniform('reg_lambda', 1e-3, 10.0),
            'colsample_bytree': trial.suggest_categorical('colsample_bytree', [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]),
            'subsample': trial.suggest_categorical('subsample', [0.4, 0.5, 0.6, 0.7, 0.8, 1.0]),
            'learning_rate': trial.suggest_categorical('learning_rate', [0.006, 0.008, 0.01, 0.014, 0.017, 0.02]),
            'max_depth': trial.suggest_categorical('max_depth', [10, 20, 100]),
            'num_leaves': trial.suggest_int('num_leaves', 1, 1000),
            'min_child_samples': trial.suggest_int('min_child_samples', 1, 300),
            'cat_smooth': trial.suggest_int('min_data_per_groups', 1, 100)
        }

        try:
            reg = lgb.LGBMRegressor(**param, random_state=13)
            model = reg if _forecast_horizon == 1 else MultiOutputRegressor(reg)
            if _forecast_horizon == 1:
                model.fit(_X_train, _y_train, eval_set=[(_X_test, _y_test)], early_stopping_rounds=100, verbose=False)
            else:
                model.fit(_X_train, _y_train)
            y_pred = pd.DataFrame(model.predict(_X_test), index=_X_test.index, columns=_y.columns)
            error = mean_squared_error(_y_test, y_pred, squared=False)
        except:
            error = 100

        return error

    optimize_func = lambda trial: objective(trial, forecast_horizon, df, X, y, X_train, X_test, y_train, y_test)

    study = optuna.create_study()
    study.optimize(optimize_func, n_trials=trials)

    return study.best_params


def get_trials(model, level=1):
    match level:
        case 1:
            return 3 if model == ForecastingModel.LinearRegression else 25
        case 2:
            return 9 if model == ForecastingModel.LinearRegression else 50
        case 3:
            return 15 if model == ForecastingModel.LinearRegression else 100
        case _:
            return 25 if model == ForecastingModel.LinearRegression else 150


def get_best_params(model, forecast_horizon, df, X, y, X_train, X_test, y_train, y_test, level=1):
    trials = get_trials(model, level)

    match model:
        case ForecastingModel.LinearRegression:
            return get_best_params_optimize_tuning_LinearRegression(forecast_horizon, df, X, y, X_train, X_test, y_train, y_test, trials=trials)
        case ForecastingModel.RandomForest:
            return get_best_params_optimize_tuning_RandomForest(forecast_horizon, df, X, y, X_train, X_test, y_train, y_test, trials=trials)
        case ForecastingModel.XGBoost:
            return get_best_params_optimize_tuning_XGBoost(forecast_horizon, df, X, y, X_train, X_test, y_train, y_test, trials=trials)
        case ForecastingModel.LightGBM:
            return get_best_params_optimize_tuning_LightGBM(forecast_horizon, df, X, y, X_train, X_test, y_train, y_test, trials=trials)
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
        case ForecastingModel.LinearRegression:
            reg = LinearRegression(**params)
        case ForecastingModel.RandomForest:
            reg = RandomForestRegressor(**params, random_state=13)
        case ForecastingModel.XGBoost:
            reg = XGBRegressor(**params, random_state=13)
        case ForecastingModel.LightGBM:
            reg = lgb.LGBMRegressor(**params, bagging_fraction=1.0, random_state=13)
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
