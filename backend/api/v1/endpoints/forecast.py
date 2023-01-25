import json
import copy
from fastapi.responses import StreamingResponse
import io
from starlette.responses import FileResponse
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

from core.config import settings
from core.processing import file_processing
from collections import defaultdict
import pandas as pd

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
        time_period = forecasting.datasetcolumns.datasets.time_period
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

    time_period = db_forecasting.datasetcolumns.datasets.time_period

    return db_forecasting


@router.get("/{forecast_id}/results/", status_code=status.HTTP_200_OK)
def read_forecasting_results(forecast_id: int, db: Session = Depends(dependencies.get_db),
                     current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_forecasting = forecasting_crud.get(db, forecasting_id=forecast_id)
    if db_forecasting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Forecasting not found")

    if db_forecasting.datasetcolumns.datasets.project.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unauthorized user")

    if db_forecasting.status != ForecastingStatus.Finished:
        return {'results': {}}

    file_path_results = file_processing.get_filename_with_path(settings.FILE_PREDICTED_RESULTS_FILENAME, db_forecasting.datasetcolumns.datasets.project.user_id, db_forecasting.datasetcolumns.datasets.project.id, db_forecasting.id)
    df = pd.read_csv(file_path_results, sep=db_forecasting.datasetcolumns.datasets.delimiter)

    dataset = df.to_dict('list')
    dataset_keys = list(dataset.keys())
    if len(dataset_keys) > 1:
        dataset['timestamp'] = dataset.pop(dataset_keys[0])

    return {'results': dataset}


@router.get("/{forecast_id}/test-results/", status_code=status.HTTP_200_OK)
def read_forecasting_test_results(forecast_id: int, db: Session = Depends(dependencies.get_db),
                     current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_forecasting = forecasting_crud.get(db, forecasting_id=forecast_id)
    if db_forecasting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Forecasting not found")

    if db_forecasting.datasetcolumns.datasets.project.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unauthorized user")

    if db_forecasting.status != ForecastingStatus.Finished:
        return {'results': {}}

    file_path_results = file_processing.get_filename_with_path(settings.FILE_PREDICTED_TEST_RESULTS_FILENAME, db_forecasting.datasetcolumns.datasets.project.user_id, db_forecasting.datasetcolumns.datasets.project.id, db_forecasting.id)
    df = pd.read_csv(file_path_results, sep=db_forecasting.datasetcolumns.datasets.delimiter)

    dataset = df.to_dict('list')
    dataset_keys = list(dataset.keys())
    if len(dataset_keys) > 1:
        dataset['timestamp'] = dataset.pop(dataset_keys[0])

    return {'results': dataset}


@router.get("/{forecast_id}/results/download/", status_code=status.HTTP_200_OK)
def download_forecast(forecast_id: int, db: Session = Depends(dependencies.get_db),
                 current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_forecasting = forecasting_crud.get(db, forecasting_id=forecast_id)
    if db_forecasting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Forecasting not found")

    if db_forecasting.datasetcolumns.datasets.project.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unauthorized user")

    file_path = file_processing.get_filename_with_path(settings.FILE_PREDICTED_RESULTS_FILENAME,
                                                               db_forecasting.datasetcolumns.datasets.project.user_id,
                                                               db_forecasting.datasetcolumns.datasets.project.id,
                                                               db_forecasting.id)

    return FileResponse(file_path, media_type='application/octet-stream', filename=settings.FILE_PREDICTED_RESULTS_FILENAME)


@router.get("/{forecast_id}/test-results/download/", status_code=status.HTTP_200_OK)
def download_forecast_test(forecast_id: int, db: Session = Depends(dependencies.get_db),
                 current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_forecasting = forecasting_crud.get(db, forecasting_id=forecast_id)
    if db_forecasting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Forecasting not found")

    if db_forecasting.datasetcolumns.datasets.project.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unauthorized user")

    file_path = file_processing.get_filename_with_path(settings.FILE_PREDICTED_TEST_RESULTS_FILENAME,
                                                               db_forecasting.datasetcolumns.datasets.project.user_id,
                                                               db_forecasting.datasetcolumns.datasets.project.id,
                                                               db_forecasting.id)

    return FileResponse(file_path, media_type='application/octet-stream', filename=settings.FILE_PREDICTED_TEST_RESULTS_FILENAME)


@router.get("/{forecast_id}/combined-test-results/download/", status_code=status.HTTP_200_OK)
def download_forecast_combined_test(forecast_id: int, db: Session = Depends(dependencies.get_db),
                 current_user: user_model.User = Depends(dependencies.get_current_active_user)):
    db_forecasting = forecasting_crud.get(db, forecasting_id=forecast_id)
    if db_forecasting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Forecasting not found")

    if db_forecasting.datasetcolumns.datasets.project.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unauthorized user")

    file_path_test = file_processing.get_filename_with_path(settings.FILE_PREDICTED_TEST_RESULTS_FILENAME,
                                                               db_forecasting.datasetcolumns.datasets.project.user_id,
                                                               db_forecasting.datasetcolumns.datasets.project.id,
                                                               db_forecasting.id)
    df, df_train, df_test = file_processing.get_forecast_df_train_test(db_forecasting)
    df_test_results = pd.read_csv(file_path_test, sep=db_forecasting.datasetcolumns.datasets.delimiter)

    df_res = pd.DataFrame()
    df_res['timestamp'] = df_test_results.iloc[:, 0]
    df_test_col = pd.DataFrame(df_test)
    df_test_col = df_test_col.set_index(df_res.index)
    df_res['y_test'] = df_test_col.iloc[:, 0].values
    df_res['y_pred'] = df_test_results.iloc[:, 1]

    stream = io.StringIO()
    df_res.to_csv(stream, index=False)
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=export.csv"

    return response

