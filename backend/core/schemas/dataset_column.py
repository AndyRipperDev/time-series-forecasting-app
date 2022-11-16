from pydantic import BaseModel


class DatasetColumnBase(BaseModel):
    name: str
    data_type: str
    is_date: bool


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
