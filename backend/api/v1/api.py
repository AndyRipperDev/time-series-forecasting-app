from fastapi import APIRouter

from api.v1.endpoints import roles, users, login, signup, projects, dataset_columns, time_period, forecast

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(signup.router)
api_router.include_router(users.router)
api_router.include_router(roles.router)
api_router.include_router(projects.router)
api_router.include_router(dataset_columns.router)
api_router.include_router(time_period.router)
api_router.include_router(forecast.router)
