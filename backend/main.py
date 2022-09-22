from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from api.v1.api import api_router

from initial_data import init

init()

app = FastAPI(title=settings.APP_NAME)

if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router)


@app.get("/", status_code=status.HTTP_200_OK)
async def root():
    return {"message": "Time Series Forecast API"}
