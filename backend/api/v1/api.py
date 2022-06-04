from fastapi import APIRouter

from api.v1.endpoints import roles, users

api_router = APIRouter()
api_router.include_router(users.router)
api_router.include_router(roles.router)
