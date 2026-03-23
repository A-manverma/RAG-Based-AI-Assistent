import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.core.config import settings
from app.db.session import engine
from app.db.models import Base

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ensure pgvector extension and tables are created
try:
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        conn.commit()
except Exception as e:
    logger.warning(f"Could not create vector extension (ensure pgvector is installed in Postgres): {e}")

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update for restrict origing in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": settings.PROJECT_NAME}

from app.api import routes_chat, routes_images, routes_ingest, routes_eval

app.include_router(routes_chat.router, prefix=f"{settings.API_V1_STR}/chat", tags=["chat"])
app.include_router(routes_images.router, prefix=f"{settings.API_V1_STR}/images", tags=["images"])
app.include_router(routes_ingest.router, prefix=f"{settings.API_V1_STR}/ingest", tags=["ingestion"])
app.include_router(routes_eval.router, prefix=f"{settings.API_V1_STR}/eval", tags=["evaluation"])
