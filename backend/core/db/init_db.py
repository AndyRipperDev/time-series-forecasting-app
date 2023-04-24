from sqlalchemy.orm import Session

from core.config import settings
import core.db.base as base

from core.crud import role as role_crud
from core.crud import user as user_crud
from core.schemas import role as role_schema, user as user_schema
from core.db.session import engine

from core.crud import forecasting as forecasting_crud
from core.crud import evaluation_metrics as evaluation_metrics_crud
from core.crud import project as project_crud
from core.crud import dataset as dataset_crud
from core.crud import dataset_column as dataset_column_crud
from core.crud import time_period as time_period_crud
from core.schemas import project as project_schema
from core.schemas import dataset as dataset_schema
from core.schemas import dataset_column as dataset_column_schema
from core.schemas import time_period as time_period_schema
from core.schemas import evaluation_metrics as evaluation_metrics_schema
from core.schemas import forecasting as forecasting_schema
from core.enums.forecasting_model_enum import ForecastingModel, ForecastingStatus, ForecastingEvalMetricType
from core.enums.dataset_column_enum import ColumnMissingValuesMethod
from core.enums.time_period_enum import TimePeriodUnit


def init_db(db: Session) -> None:
    base.Base.metadata.create_all(bind=engine)

    role_db = role_crud.get_by_title(db, settings.FIRST_ROLE_TITLE)
    if not role_db:
        role_in = role_schema.RoleCreate(
            title=settings.FIRST_ROLE_TITLE,
            description=settings.FIRST_ROLE_DESC,
        )
        role_db = role_crud.create(db=db, role=role_in)

    user_db = user_crud.get_by_email(db, email=settings.FIRST_SUPERUSER_EMAIL)
    if not user_db:
        user_in = user_schema.UserCreate(
            email=settings.FIRST_SUPERUSER_EMAIL,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            full_name=settings.FIRST_SUPERUSER_FULL_NAME,
        )
        user_db = user_crud.create(db=db, user=user_in)
        user_crud.add_role(db, db_user=user_db, db_role=role_db)

    user_db = user_crud.get_by_email(db, email=settings.FIRST_DEMOUSER_EMAIL)
    if not user_db:
        user_in = user_schema.UserCreate(
            email=settings.FIRST_DEMOUSER_EMAIL,
            password=settings.FIRST_DEMOUSER_PASSWORD,
            full_name=settings.FIRST_DEMOUSER_FULL_NAME,
        )
        user_db = user_crud.create(db=db, user=user_in)
        try:
            db_project = project_schema.ProjectCreate(title='Natural gas consumption forecasting',
                                                      description='Short-term natural gas consumption forecasting from long-term data collection')
            db_project = project_crud.create(db=db, project=db_project, user_id=user_db.id)

            db_dataset = dataset_schema.DatasetCreate(filename='ppnet_metar_v7.csv',
                                                      filename_processed='ppnet_metar_v7_processed.csv',
                                                      delimiter=';')
            db_dataset = dataset_crud.create(db=db, dataset=db_dataset, project_id=db_project.id)

            time_period_create = time_period_schema.TimePeriodCreate(value=24, unit=TimePeriodUnit.Hour)
            time_period_crud.create(db=db, time_period=time_period_create, dataset_id=db_dataset.id)

            col_sch = dataset_column_schema.DatasetColumnCreate(name='Datetime', data_type='datetime64', is_date=True,
                                                                scaling=None, is_removed=False,
                                                                missing_values_handler=ColumnMissingValuesMethod.FillZeros)
            dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)

            col_sch = dataset_column_schema.DatasetColumnCreate(name='Year', data_type='int64', is_date=False,
                                                                scaling=None, is_removed=False,
                                                                missing_values_handler=ColumnMissingValuesMethod.FillZeros)
            dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)
            col_sch = dataset_column_schema.DatasetColumnCreate(name='Month', data_type='int64', is_date=False,
                                                                scaling=None, is_removed=False,
                                                                missing_values_handler=ColumnMissingValuesMethod.FillZeros)
            dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)
            col_sch = dataset_column_schema.DatasetColumnCreate(name='Day', data_type='int64', is_date=False,
                                                                scaling=None, is_removed=False,
                                                                missing_values_handler=ColumnMissingValuesMethod.FillZeros)
            dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)
            col_sch = dataset_column_schema.DatasetColumnCreate(name='Hour', data_type='int64', is_date=False,
                                                                scaling=None, is_removed=False,
                                                                missing_values_handler=ColumnMissingValuesMethod.FillZeros)
            dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)
            col_sch = dataset_column_schema.DatasetColumnCreate(name='Day_of_week', data_type='int64', is_date=False,
                                                                scaling=None, is_removed=False,
                                                                missing_values_handler=ColumnMissingValuesMethod.FillZeros)
            dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)
            col_sch = dataset_column_schema.DatasetColumnCreate(name='Before_holiday', data_type='int64', is_date=False,
                                                                scaling=None, is_removed=False,
                                                                missing_values_handler=ColumnMissingValuesMethod.FillZeros)
            dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)
            col_sch = dataset_column_schema.DatasetColumnCreate(name='Holiday', data_type='int64', is_date=False,
                                                                scaling=None, is_removed=False,
                                                                missing_values_handler=ColumnMissingValuesMethod.FillZeros)
            dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)

            col_sch = dataset_column_schema.DatasetColumnCreate(name='Consumption', data_type='float64', is_date=False,
                                                                scaling=None, is_removed=False,
                                                                missing_values_handler=ColumnMissingValuesMethod.FillMean)
            target_col_db = dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)
            col_sch = dataset_column_schema.DatasetColumnCreate(name='Temperature', data_type='float64', is_date=False,
                                                                scaling=None, is_removed=False,
                                                                missing_values_handler=ColumnMissingValuesMethod.FillMean)
            dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)
            col_sch = dataset_column_schema.DatasetColumnCreate(name='Pressure', data_type='float64', is_date=False,
                                                                scaling=None, is_removed=False,
                                                                missing_values_handler=ColumnMissingValuesMethod.FillMean)
            dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)
            col_sch = dataset_column_schema.DatasetColumnCreate(name='Pressure2', data_type='float64', is_date=False,
                                                                scaling=None, is_removed=False,
                                                                missing_values_handler=ColumnMissingValuesMethod.FillMean)
            dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)
            col_sch = dataset_column_schema.DatasetColumnCreate(name='Humidity', data_type='float64', is_date=False,
                                                                scaling=None, is_removed=False,
                                                                missing_values_handler=ColumnMissingValuesMethod.FillMean)
            dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)

            col_sch = dataset_column_schema.DatasetColumnCreate(name='Wind_direction', data_type='object',
                                                                is_date=False, scaling=None, is_removed=True,
                                                                missing_values_handler=ColumnMissingValuesMethod.FillZeros)
            dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)

            col_sch = dataset_column_schema.DatasetColumnCreate(name='Wind_speed', data_type='float64', is_date=False,
                                                                scaling=None, is_removed=False,
                                                                missing_values_handler=ColumnMissingValuesMethod.FillMean)
            dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)

            col_sch = dataset_column_schema.DatasetColumnCreate(name='Phenomena', data_type='object', is_date=False,
                                                                scaling=None, is_removed=True,
                                                                missing_values_handler=ColumnMissingValuesMethod.FillZeros)
            dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)
            col_sch = dataset_column_schema.DatasetColumnCreate(name='Recent_phenomena', data_type='object',
                                                                is_date=False, scaling=None, is_removed=True,
                                                                missing_values_handler=ColumnMissingValuesMethod.FillZeros)
            dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)

            col_sch = dataset_column_schema.DatasetColumnCreate(name='Visibility', data_type='float64', is_date=False,
                                                                scaling=None, is_removed=False,
                                                                missing_values_handler=ColumnMissingValuesMethod.FillMean)
            dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)
            col_sch = dataset_column_schema.DatasetColumnCreate(name='Dewpoint', data_type='float64', is_date=False,
                                                                scaling=None, is_removed=False,
                                                                missing_values_handler=ColumnMissingValuesMethod.FillMean)
            dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)

            col_sch = dataset_column_schema.DatasetColumnCreate(name='Datetime.1', data_type='object', is_date=False,
                                                                scaling=None, is_removed=True,
                                                                missing_values_handler=ColumnMissingValuesMethod.FillZeros)
            dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)
            col_sch = dataset_column_schema.DatasetColumnCreate(name='Clouds_low_text', data_type='object',
                                                                is_date=False, scaling=None, is_removed=True,
                                                                missing_values_handler=ColumnMissingValuesMethod.FillZeros)
            dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)
            col_sch = dataset_column_schema.DatasetColumnCreate(name='Clouds_low_m', data_type='float64', is_date=False,
                                                                scaling=None, is_removed=True,
                                                                missing_values_handler=ColumnMissingValuesMethod.FillZeros)
            dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)
            col_sch = dataset_column_schema.DatasetColumnCreate(name='Clouds_medium_text', data_type='object',
                                                                is_date=False, scaling=None, is_removed=True,
                                                                missing_values_handler=ColumnMissingValuesMethod.FillZeros)
            dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)
            col_sch = dataset_column_schema.DatasetColumnCreate(name='Clouds_medium_m', data_type='int64',
                                                                is_date=False, scaling=None, is_removed=True,
                                                                missing_values_handler=ColumnMissingValuesMethod.FillZeros)
            dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)
            col_sch = dataset_column_schema.DatasetColumnCreate(name='Clouds_high_text', data_type='object',
                                                                is_date=False, scaling=None, is_removed=True,
                                                                missing_values_handler=ColumnMissingValuesMethod.FillZeros)
            dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)
            col_sch = dataset_column_schema.DatasetColumnCreate(name='Clouds_high_m', data_type='int64', is_date=False,
                                                                scaling=None, is_removed=True,
                                                                missing_values_handler=ColumnMissingValuesMethod.FillZeros)
            dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)
            col_sch = dataset_column_schema.DatasetColumnCreate(name='IsMissing', data_type='int64', is_date=False,
                                                                scaling=None, is_removed=True,
                                                                missing_values_handler=ColumnMissingValuesMethod.FillZeros)
            dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)
            col_sch = dataset_column_schema.DatasetColumnCreate(name='PreviousTemp_lag24', data_type='float64',
                                                                is_date=False, scaling=None, is_removed=True,
                                                                missing_values_handler=ColumnMissingValuesMethod.FillZeros)
            dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)
            col_sch = dataset_column_schema.DatasetColumnCreate(name='PreviousTemp_lag48', data_type='float64',
                                                                is_date=False, scaling=None, is_removed=True,
                                                                missing_values_handler=ColumnMissingValuesMethod.FillZeros)
            dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)
            col_sch = dataset_column_schema.DatasetColumnCreate(name='Trend', data_type='float64', is_date=False,
                                                                scaling=None, is_removed=True,
                                                                missing_values_handler=ColumnMissingValuesMethod.FillZeros)
            dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)
            col_sch = dataset_column_schema.DatasetColumnCreate(name='Mnozstvi', data_type='float64', is_date=False,
                                                                scaling=None, is_removed=True,
                                                                missing_values_handler=ColumnMissingValuesMethod.FillZeros)
            dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)
            col_sch = dataset_column_schema.DatasetColumnCreate(name='Mnozstvi_bfill', data_type='float64',
                                                                is_date=False, scaling=None, is_removed=True,
                                                                missing_values_handler=ColumnMissingValuesMethod.FillZeros)
            dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)
            col_sch = dataset_column_schema.DatasetColumnCreate(name='Cena', data_type='float64', is_date=False,
                                                                scaling=None, is_removed=True,
                                                                missing_values_handler=ColumnMissingValuesMethod.FillZeros)
            dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)
            col_sch = dataset_column_schema.DatasetColumnCreate(name='Cena_bfill', data_type='float64', is_date=False,
                                                                scaling=None, is_removed=True,
                                                                missing_values_handler=ColumnMissingValuesMethod.FillZeros)
            dataset_column_crud.create(db=db, dataset_column=col_sch, dataset_id=db_dataset.id)

            forecast_sch = forecasting_schema.ForecastingCreate(model=ForecastingModel.LightGBM,
                                                                status=ForecastingStatus.Ready,
                                                                split_ratio=80, auto_tune=True, tune_brute_force=False,
                                                                tune_level=3,
                                                                use_log_transform=False, use_decomposition=True,
                                                                forecast_horizon=24,
                                                                lag_window=12,
                                                                lagged_features='Holiday;Temperature;Dewpoint',
                                                                params='{"boosting_type": "gbdt", "n_estimators": 246, "reg_alpha": 0.0010228161974984188, "reg_lambda": 0.49004944047165305, "colsample_bytree": 0.7, "subsample": 0.7, "learning_rate": 0.02, "max_depth": 20, "num_leaves": 621, "min_child_samples": 109, "min_data_per_groups": 32}')
            db_forecasting = forecasting_crud.create(db=db, forecasting=forecast_sch, column_id=target_col_db.id)

            forecasting_updates = forecasting_schema.ForecastingUpdateSchema(status=ForecastingStatus.Finished)
            db_forecasting = forecasting_crud.update(db, forecasting=db_forecasting, updates=forecasting_updates)

            db_eval_metrics = evaluation_metrics_schema.EvaluationMetricsCreate(type=ForecastingEvalMetricType.Forecast,
                                                                                MAE=2825.18,
                                                                                MSE=19946500,
                                                                                MAPE=3.95179,
                                                                                SMAPE=3.82619,
                                                                                R2=0.995581,
                                                                                WAPE=3.07959)
            db_eval_metrics = evaluation_metrics_crud.create(db=db, evaluation_metrics=db_eval_metrics,
                                                             forecasting_id=db_forecasting.id)

            db_eval_metrics = evaluation_metrics_schema.EvaluationMetricsCreate(type=ForecastingEvalMetricType.Baseline,
                                                                                MAE=10882.1,
                                                                                MSE=264944000,
                                                                                MAPE=13.1713,
                                                                                SMAPE=12.7383,
                                                                                R2=0.941302,
                                                                                WAPE=11.8621)
            db_eval_metrics = evaluation_metrics_crud.create(db=db, evaluation_metrics=db_eval_metrics,
                                                             forecasting_id=db_forecasting.id)
        except:
            return
