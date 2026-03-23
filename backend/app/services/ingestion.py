import logging
import uuid
import tiktoken
from sqlalchemy.orm import Session
from app.db.models import Document, DocumentChunk
from app.services.embedding import generate_embeddings

logger = logging.getLogger(__name__)

def chunk_text(text: str, chunk_size: int = 512, overlap: int = 50, encoding_name: str = "cl100k_base") -> list[str]:
    """Token-aware semantic chunking ensuring chunks remain within LLM context limits."""
    encoding = tiktoken.get_encoding(encoding_name)
    tokens = encoding.encode(text)
    
    chunks = []
    i = 0
    while i < len(tokens):
        chunk_tokens = tokens[i:i + chunk_size]
        chunks.append(encoding.decode(chunk_tokens))
        # Move forward by the chunk size minus the exact token overlap
        i += chunk_size - overlap
    return chunks

async def process_and_store_document(db: Session, title: str, content: str, owner_id: uuid.UUID, source_uri: str = None) -> Document:
    """Takes normalized text, chunks it, embeds it, and stores in PostgreSQL/pgvector."""
    # 1. Create document entry
    doc = Document(title=title, owner_id=owner_id, source_uri=source_uri)
    db.add(doc)
    db.flush() # Get doc ID before committing
    
    # 2. Token-aware Chunking
    chunks_text = chunk_text(content)
    
    # 3. Generate embeddings in batches to respect API limits
    batch_size = 100
    all_embeddings = []
    for i in range(0, len(chunks_text), batch_size):
        batch = chunks_text[i:i + batch_size]
        emb_batch = await generate_embeddings(batch)
        all_embeddings.extend(emb_batch)
    
    # 4. Store chunks with their vector embeddings
    for idx, (chunk_text_data, emb) in enumerate(zip(chunks_text, all_embeddings)):
        chunk_record = DocumentChunk(
            document_id=doc.id,
            content=chunk_text_data,
            chunk_index=float(idx),
            embedding=emb,
            metadata_json={"token_count": len(tiktoken.get_encoding("cl100k_base").encode(chunk_text_data))}
        )
        db.add(chunk_record)
    
    db.commit()
    db.refresh(doc)
    return doc
