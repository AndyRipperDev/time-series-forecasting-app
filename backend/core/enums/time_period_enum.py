from enum import Enum, unique


@unique
class TimePeriodUnit(Enum):
    Second = 'Second'
    Minute = 'Minute'
    Hour = 'Hour'
    Day = 'Day'
    Week = 'Week'
    Month = 'Month'
    Year = 'Year'
    Decade = 'Decade'
