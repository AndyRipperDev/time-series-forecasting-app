from fastapi import APIRouter, Depends, status

from sqlalchemy.orm import Session

from core.models import user as user_model

from core.enums.forecasting_model_enum import ForecastingModel
from api import dependencies

router = APIRouter(
    prefix="/forecast",
    tags=["forecast"]
)


@router.get("/models/", status_code=status.HTTP_200_OK)
def read_forecasting_models(db: Session = Depends(dependencies.get_db),
                             current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    return {'models': list(ForecastingModel)}
