from pydantic import BaseModel
from enum import Enum
from core.enums.dataset_column_enum import ColumnMissingValuesMethod, ColumnScalingMethod


class DatasetColumnBase(BaseModel):
    name: str
    data_type: str
    is_date: bool
    is_removed: bool
    scaling: ColumnScalingMethod | None = None
    missing_values_handler: ColumnMissingValuesMethod | None = None

    class Config:
        use_enum_values = True


class DatasetColumnCreate(DatasetColumnBase):
    pass


class DatasetColumn(DatasetColumnBase):
    id: int

    class Config:
        orm_mode = True


class DatasetColumnSchema(DatasetColumn):
    dataset_id: int


class DatasetColumnUpdateSchema(BaseModel):
    id: int
    name: str | None = None
    data_type: str | None = None
    is_date: bool | None = None
    is_removed: bool | None = None
    scaling: ColumnScalingMethod | None = None
    missing_values_handler: ColumnMissingValuesMethod | None = None
