from enum import Enum, unique


@unique
class ForecastingModel(Enum):
    ARIMA = 'ARIMA'
    SARIMA = 'SARIMA'
    DecisionTreeRegressor = 'DecisionTreeRegressor'
    LGBMRegressor = 'LGBMRegressor'


@unique
class ForecastingStatus(Enum):
    Ready = 'Ready'
    Preprocessing = 'Preprocessing'
    Training = 'Training'
    Forecasting = 'Forecasting'
    Evaluating = 'Evaluating'
    Finished = 'Finished'
    Failed = 'Failed'


