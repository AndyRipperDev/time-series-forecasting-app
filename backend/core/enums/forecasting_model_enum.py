from enum import Enum, unique


@unique
class ForecastingModel(Enum):
    ARIMA = 'ARIMA'
    SARIMA = 'SARIMA'
    LinearRegression = 'LinearRegression'
    RandomForest = 'RandomForest'
    XGBoost = 'XGBoost'
    LightGBM = 'LightGBM'
    MLP = 'MLP'


@unique
class ForecastingStatus(Enum):
    Ready = 'Ready'
    Preprocessing = 'Preprocessing'
    Training = 'Training'
    Forecasting = 'Forecasting'
    Evaluating = 'Evaluating'
    Finished = 'Finished'
    Failed = 'Failed'


