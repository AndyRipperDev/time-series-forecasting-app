from fastapi import APIRouter, Depends, status, HTTPException, Body, BackgroundTasks

from sqlalchemy.orm import Session

from core.crud import forecasting as forecasting_crud
from core.schemas import forecasting as forecasting_schema
from core.models import user as user_model

from core.enums.forecasting_model_enum import ForecastingModel, ForecastingStatus
from api import dependencies
from core.background_tasks.forecasting import start_forecasting

router = APIRouter(
    prefix="/forecast",
    tags=["forecast"]
)


@router.post('/', status_code=status.HTTP_201_CREATED)
def create_forecast(background_tasks: BackgroundTasks,
                    payload: dict = Body(...),
                    db: Session = Depends(dependencies.get_db),
                    current_user: user_model.User = Depends(dependencies.get_current_active_user)):

    db_forecasting = forecasting_crud.get_all(db)
    # forecasting_crud.create(db, payload, 1)
    background_tasks.add_task(start_forecasting, db, db_forecasting)

    return payload

@router.get("/models/", status_code=status.HTTP_200_OK)
def read_forecasting_models(db: Session = Depends(dependencies.get_db),
                             current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    return {'models': list(ForecastingModel)}


@router.get("/", status_code=status.HTTP_200_OK)
def read_forecasting_status(db: Session = Depends(dependencies.get_db),
                             current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_forecasting = forecasting_crud.get_all(db)
    if db_forecasting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    return db_forecasting


@router.get("/forecasting/{forecast_id}", status_code=status.HTTP_200_OK)
def read_forecasting_status(forecast_id: int, db: Session = Depends(dependencies.get_db),
                             current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_forecasting = forecasting_crud.get(db, forecasting_id=forecast_id)
    if db_forecasting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    return db_forecasting


@router.get("/forecasting/{forecast_id}/status", status_code=status.HTTP_200_OK)
def read_forecasting_status(forecast_id: int, db: Session = Depends(dependencies.get_db),
                             current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_forecasting = forecasting_crud.get(db, forecasting_id=forecast_id)
    if db_forecasting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    return {'status': db_forecasting.status}
