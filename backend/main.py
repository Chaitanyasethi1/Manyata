from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.database import engine, Base
from backend.api import intake_router, pipeline_router, review_router, reports_router

import backend.models
import backend.models.validation
import backend.models.audit
import backend.models.alert

@asynccontextmanager
async def lifespan(app: FastAPI):
    Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="AICTE Validator API",
    description="SIH26261 — AI-Powered Application Validation",
    version="0.5.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(intake_router)
app.include_router(pipeline_router)
app.include_router(review_router)
app.include_router(reports_router)
app.include_router(reports_router, prefix="/api/v1")

@app.get("/")
def root():
    return RedirectResponse(url="/docs")

@app.get("/health")
def health():
    return {"status": "ok", "version": "0.5.0"}
