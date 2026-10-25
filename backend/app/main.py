import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import health, movies

app = FastAPI(title="N-finder API", version="0.1.0")

origins = os.getenv("NFINDER_CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins if o.strip()],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(movies.router, prefix="/api")
