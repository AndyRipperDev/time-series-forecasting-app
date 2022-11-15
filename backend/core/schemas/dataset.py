from pydantic import BaseModel
import core.schemas.dataset_column as dataset_column


class DatasetBase(BaseModel):
    filename: str
    filename_processed: str
    delimiter: str


class DatasetCreate(DatasetBase):
    pass


class Dataset(DatasetBase):
    id: int

    class Config:
        orm_mode = True


class DatasetSchema(Dataset):
    project_id: int
    columns: list[dataset_column.DatasetColumn] = []


class DatasetUpdateSchema(BaseModel):
    filename: str | None = None
    filename_processed: str | None = None
    delimiter: str | None = None
