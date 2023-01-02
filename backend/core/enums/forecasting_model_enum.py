from enum import Enum, unique


@unique
class ForecastingModel(Enum):
    Arima = 'Arima'
    Sarima = 'Sarima'
    Sarimax = 'Sarimax'