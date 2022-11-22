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


"""
FillZeros = 'Fill with zeros'
FillMedian = 'Fill with median'
FillMean = 'Fill with mean'
FillMostFrequent = 'Fill with most frequent value'
Drop = 'Drop column'
"""
