from fastapi import APIRouter

from api.v1.endpoints import roles, users, login, signup, projects

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(signup.router)
api_router.include_router(users.router)
api_router.include_router(roles.router)
api_router.include_router(projects.router)
