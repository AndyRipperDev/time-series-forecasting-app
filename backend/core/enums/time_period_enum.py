from enum import Enum, unique


@unique
class TimePeriodUnit(Enum):
    Year = 'Year'
    Month = 'Month'
    Week = 'Week'
    Day = 'Day'
    Hour = 'Hour'
    Minute = 'Minute'
    Second = 'Second'
