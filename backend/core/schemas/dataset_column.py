from pydantic import BaseModel


class DatasetColumnBase(BaseModel):
    name: str
    data_type: str


class DatasetColumnCreate(DatasetColumnBase):
    pass


class DatasetColumn(DatasetColumnBase):
    id: int

    class Config:
        orm_mode = True


class DatasetColumnSchema(DatasetColumn):
    dataset_id: int


class DatasetColumnUpdateSchema(BaseModel):
    name: str | None = None
    data_type: str | None = None
