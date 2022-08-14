from fastapi import FastAPI, status

from core.config import settings
from core.models import role as role_model
from core.models import user as user_model

from core.models.database import engine

from api.v1.api import api_router

role_model.Base.metadata.create_all(bind=engine)
user_model.Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.APP_NAME)


app.include_router(api_router)


@app.get("/", status_code=status.HTTP_200_OK)
async def root():
    return {"message": "Time Series Forecast API"}



