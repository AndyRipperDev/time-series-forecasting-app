from core.db.init_db import init_db
from core.db.session import SessionLocal


def init() -> None:
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()


def main() -> None:
    init()


if __name__ == "__main__":
    main()
