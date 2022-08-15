from fastapi import FastAPI, status

from core.config import settings
from api.v1.api import api_router

from initial_data import init

init()

app = FastAPI(title=settings.APP_NAME)

app.include_router(api_router)


@app.get("/", status_code=status.HTTP_200_OK)
async def root():
    return {"message": "Time Series Forecast API"}
