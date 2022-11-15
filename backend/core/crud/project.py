from sqlalchemy.orm import Session

from core.schemas import project as project_schema
from core.models import project as project_model


def get_all(db: Session, skip: int = 0, limit: int = 100):
    return db.query(project_model.Project).offset(skip).limit(limit).all()


def get_by_user_id(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(project_model.Project).filter(project_model.Project.user_id == user_id).offset(skip).limit(limit).all()


def get(db: Session, project_id: int):
    return db.query(project_model.Project).filter(project_model.Project.id == project_id).first()


def get_by_title(db: Session, project_title: str):
    return db.query(project_model.Project).filter(project_model.Project.title == project_title).first()


def create(db: Session, project: project_schema.ProjectCreate, user_id: int):
    db_project = project_model.Project(**project.dict())
    db_project.user_id = user_id
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


def update(db: Session, project: project_model.Project, updates: project_schema.ProjectUpdateSchema):
    update_data = updates.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(project, key, value)
    db.commit()
    return project

def update_dataset(db: Session, project: project_model.Project, updates: project_schema.ProjectDatasetUpdateSchema):
    update_data = updates.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(project, key, value)
    db.commit()
    return project


def delete(db: Session, project: project_model.Project):
    result = True
    try:
        db.delete(project)
        db.commit()
    except:
        result = False
    return result
