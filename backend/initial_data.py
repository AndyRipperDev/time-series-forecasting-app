from core.db.init_db import init_db
from core.db.session import SessionLocal
from core.config import settings

from pathlib import Path

def init() -> None:
    db = SessionLocal()
    try:
        init_db(db)
        Path(settings.FILE_STORAGE_DIR).mkdir(parents=True, exist_ok=True)
    finally:
        db.close()


def main() -> None:
    init()


if __name__ == "__main__":
    main()
