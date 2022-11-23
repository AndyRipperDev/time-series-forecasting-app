from enum import Enum, unique


@unique
class ColumnMissingValuesMethod(Enum):
    FillZeros = 'FillZeros'
    FillMedian = 'FillMedian'
    FillMean = 'FillMean'
    FillMostFrequent = 'FillMostFrequent'
    Drop = 'Drop'


@unique
class ColumnScalingMethod(Enum):
    MinMax = 'MinMax'
    PowerTransformer = 'PowerTransformer'
