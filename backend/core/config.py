import secrets

from typing import List
from pydantic import BaseSettings,  AnyHttpUrl


class Settings(BaseSettings):
    APP_NAME: str = "Time Series Forecast API"
    SECRET_KEY: str = "dHkeyJNWZvIv6e8riTERj7LgwKPAIsZMkYq9uedmuYE"  # secrets.token_urlsafe(32)
    # 60 minutes * 24 hours * 7 days = 7 days
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = ["http://localhost", "http://localhost:4200", "http://localhost:3000"]

    DB_SERVER: str = "127.0.0.1"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_CONNECTOR: str = "mariadb+mariadbconnector"
    DB_NAME: str = "time_series_forecast4"

    SQLALCHEMY_DATABASE_URI: str = DB_CONNECTOR + "://" + DB_USER + (
        (":" + DB_PASSWORD) if DB_PASSWORD != "" else DB_PASSWORD) + "@" + DB_SERVER + ":" + str(DB_PORT) + "/" + DB_NAME

    FIRST_SUPERUSER_EMAIL: str = "test@test.com"
    FIRST_SUPERUSER_PASSWORD: str = "Test"
    FIRST_SUPERUSER_FULL_NAME: str = "Admin"

    FIRST_ROLE_TITLE: str = "Admin"
    FIRST_ROLE_DESC: str = "This role is only for administrative purposes"


settings = Settings()
