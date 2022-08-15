from sqlalchemy.orm import Session

from core.config import settings
import core.db.base as base

from core.crud import role as role_crud
from core.crud import user as user_crud
from core.schemas import role as role_schema, user as user_schema
from core.db.session import engine


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
            first_name=settings.FIRST_SUPERUSER_FIRST_NAME,
            last_name=settings.FIRST_SUPERUSER_LAST_NAME,
        )
        user_db = user_crud.create(db=db, user=user_in)
        user_crud.add_role(db, db_user=user_db, db_role=role_db)
