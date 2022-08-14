import secrets

from pydantic import BaseSettings, validator


class Settings(BaseSettings):
    APP_NAME: str = "Time Series Forecast API"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    # 60 minutes * 24 hours * 8 days = 8 days
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8

    DB_SERVER: str = "127.0.0.1"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = "root"
    DB_CONNECTOR: str = "mariadb+mariadbconnector"
    DB_NAME: str = "time_series_forecast"

    SQLALCHEMY_DATABASE_URI: str = DB_CONNECTOR + "://" + DB_USER + "@" + DB_SERVER + ":" + str(DB_PORT) + "/" + DB_NAME


settings = Settings()
