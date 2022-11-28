from fastapi import APIRouter, Depends, HTTPException, status, UploadFile

from sqlalchemy.orm import Session

from core.models import user as user_model

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
