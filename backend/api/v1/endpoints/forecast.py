import json
import copy

from fastapi import APIRouter, Depends, status, HTTPException, Body, BackgroundTasks

from sqlalchemy.orm import Session

from core.crud import project as project_crud
from core.schemas import project as project_schema
from core.crud import forecasting as forecasting_crud
from core.schemas import forecasting as forecasting_schema
from core.models import user as user_model

from core.enums.forecasting_model_enum import ForecastingModel, ForecastingStatus
from api import dependencies
from core.background_tasks.forecasting import start_forecasting

from collections import defaultdict

router = APIRouter(
    prefix="/forecast",
    tags=["forecast"]
)


@router.post("/{project_id}/", response_model=forecasting_schema.ForecastingSchema, status_code=status.HTTP_201_CREATED)
# @router.post("/{project_id}/", status_code=status.HTTP_201_CREATED)
def create_forecast(project_id: int, forecast: forecasting_schema.ForecastingCreate, background_tasks: BackgroundTasks,
                    column: str = None, db: Session = Depends(dependencies.get_db),
                    current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_project = project_crud.get(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if db_project.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unauthorized user")

    db_forecasting = None
    res_forecasting = None
    for col in db_project.dataset.columns:
        if col.name == column:
            db_forecasting = forecasting_crud.create(db=db, forecasting=forecast, column_id=col.id)
            break

    if db_forecasting is not None:
        background_tasks.add_task(start_forecasting, db, db_forecasting)
        res_forecasting = copy.deepcopy(db_forecasting)
        res_forecasting.params = json.dumps(res_forecasting.params)

    return res_forecasting


@router.post('/', status_code=status.HTTP_201_CREATED)
def create_forecast2(  # background_tasks: BackgroundTasks,
        payload: dict = Body(...),
        db: Session = Depends(dependencies.get_db),
        current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_forecasting = forecasting_crud.get_all(db)
    # forecasting_crud.create(db, payload, 1)
    # background_tasks.add_task(start_forecasting, db, db_forecasting)

    return payload


@router.get("/models/", status_code=status.HTTP_200_OK)
def read_forecasting_models(db: Session = Depends(dependencies.get_db),
                            current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    return {'models': list(ForecastingModel)}


@router.get("/", status_code=status.HTTP_200_OK)
def read_forecasting_all(db: Session = Depends(dependencies.get_db),
                         current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_forecasting = forecasting_crud.get_all(db)
    if db_forecasting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Forecasts not found")

    return db_forecasting


@router.get("/user/", status_code=status.HTTP_200_OK)
def read_forecasting_all_by_user(db: Session = Depends(dependencies.get_db),
                                 current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_forecasting = forecasting_crud.get_all_by_user_project(db, current_user.id)
    if db_forecasting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Forecasts not found")

    # d = defaultdict(dict)
    d = defaultdict(lambda: defaultdict(list))
    forecasting_dict = defaultdict(list)
    for row in db_forecasting:
        forecasting = row[0]
        project = forecasting.datasetcolumns.datasets.project
        d[row[1].id][forecasting.column_id].append(forecasting)
        forecasting_dict[row[1].id].append(forecasting)
        # d[row[1].id].append({'forecasting': forecasting, 'project': forecasting.datasetcolumns.datasets.project})

    # d = defaultdict(list)
    # for row in db_forecasting:
    #     d[row[1].title].append(row[0])

    return {'forecasting': d}


@router.get("/project/{project_id}/", status_code=status.HTTP_200_OK)
def read_forecasting_all_by_project(project_id: int, db: Session = Depends(dependencies.get_db),
                                    current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_forecasting = forecasting_crud.get_all_by_project(db, project_id)
    if db_forecasting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Forecasts not found")

    return db_forecasting


# @router.get("/forecasting/{forecast_id}", status_code=status.HTTP_200_OK)
# def read_forecasting_status(forecast_id: int, db: Session = Depends(dependencies.get_db),
#                              current_user: user_model.User = Depends(dependencies.get_current_active_user)):
#     db_forecasting = forecasting_crud.get(db, forecasting_id=forecast_id)
#     if db_forecasting is None:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Forecasting not found")
#
#     return db_forecasting


@router.get("/{forecast_id}/status/", status_code=status.HTTP_200_OK)
def read_forecasting_status(forecast_id: int, db: Session = Depends(dependencies.get_db),
                            current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_forecasting = forecasting_crud.get(db, forecasting_id=forecast_id)
    if db_forecasting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Forecasting not found")

    if db_forecasting.datasetcolumns.datasets.project.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unauthorized user")

    return {'status': db_forecasting.status}


@router.get("/{forecast_id}/", status_code=status.HTTP_200_OK)
def read_forecasting(forecast_id: int, db: Session = Depends(dependencies.get_db),
                     current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_forecasting = forecasting_crud.get(db, forecasting_id=forecast_id)
    if db_forecasting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Forecasting not found")

    if db_forecasting.datasetcolumns.datasets.project.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unauthorized user")

    return db_forecasting
