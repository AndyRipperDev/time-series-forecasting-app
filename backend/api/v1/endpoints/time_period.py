from fastapi import APIRouter, Depends, HTTPException, status, UploadFile

from sqlalchemy.orm import Session

from core.models import user as user_model

from core.crud import project as project_crud
from core.enums.time_period_enum import TimePeriodUnit
from api import dependencies

router = APIRouter(
    prefix="/time-period",
    tags=["time-period"]
)


@router.get("/", status_code=status.HTTP_200_OK)
def read_time_period_options(db: Session = Depends(dependencies.get_db),
                             current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    return {'time_period_units': list(TimePeriodUnit)}


@router.get("/project/{project_id}", status_code=status.HTTP_200_OK)
def read_project_time_period(project_id: int,
                             db: Session = Depends(dependencies.get_db),
                             current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_project = project_crud.get(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    return {'project_time_period': db_project.dataset.time_period}
