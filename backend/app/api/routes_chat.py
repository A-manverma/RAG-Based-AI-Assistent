from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import uuid
from app.api.dependencies import get_db
from app.services.llm_orchestrator import generate_rag_response_stream
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    query: str
    owner_id: str
    conversation_id: str | None = None
    use_local_llm: bool = False

@router.post("/stream")
async def chat_stream(request: Request, payload: ChatRequest, db: Session = Depends(get_db)):
    """
    Streams the LLM generation back to the frontend using SSE (Server-Sent Events).
    """
    owner_uuid = uuid.UUID(payload.owner_id)
    
    # History fetching would go here using conversation_id
    history = []
    
    return StreamingResponse(
        generate_rag_response_stream(
            db=db,
            query=payload.query,
            owner_id=owner_uuid,
            conversation_history=history,
            use_local_llm=payload.use_local_llm
        ),
        media_type="text/event-stream"
    )
