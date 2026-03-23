import logging
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.db.models import DocumentChunk, Document
from app.services.embedding import generate_embeddings

logger = logging.getLogger(__name__)

async def search_documents(db: Session, query: str, owner_id: uuid.UUID, top_k: int = 5) -> list[DocumentChunk]:
    """
    Performs HNSW ANN search using pgvector.
    Filters by owner_id to ensure tenant isolation.
    """
    try:
        query_embeddings = await generate_embeddings([query])
        query_embedding = query_embeddings[0]
    except Exception as e:
        logger.error(f"Failed to embed search query: {e}")
        return []

    # pgvector cosine distance: embedding.cosine_distance(query_embedding)
    # the order_by uses pgvector's <-> operator natively under the hood in SQLAlchemy.
    stmt = (
        select(DocumentChunk)
        .join(Document, Document.id == DocumentChunk.document_id)
        .where(Document.owner_id == owner_id)
        .order_by(DocumentChunk.embedding.cosine_distance(query_embedding))
        .limit(top_k)
    )
    
    results = db.execute(stmt).scalars().all()
    return list(results)
