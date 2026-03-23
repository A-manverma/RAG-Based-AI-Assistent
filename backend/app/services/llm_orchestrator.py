import logging
import json
import uuid
from typing import AsyncGenerator
from openai import AsyncOpenAI
import litellm
import time
from app.core.config import settings
from app.services.retrieval import search_documents
from app.services.evaluation import eval_logger
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

async def generate_rag_response_stream(
    db: Session, 
    query: str, 
    owner_id: uuid.UUID, 
    conversation_history: list[dict] = None,
    use_local_llm: bool = False
) -> AsyncGenerator[str, None]:
    """
    1. Retrieves relevant documents.
    2. Constructs augmented prompt.
    3. Streams response from LLM (OpenAI or Local via LiteLLM).
    4. Yields Server-Sent Events (SSE).
    """
    if not use_local_llm and not openai_client:
        logger.warning("OPENAI_API_KEY not configured, falling back to local LLM.")
        use_local_llm = True
        
    # 1. Retrieve top K chunks
    relevant_chunks = await search_documents(db, query, owner_id, top_k=5)
    
    # 2. Context Assembly
    context_text = "\n\n---\n\n".join([
        f"Source ID: {chunk.id}\nContent: {chunk.content}" 
        for chunk in relevant_chunks
    ])
    
    system_message = f"""You are a helpful, expert AI assistant.
Answer the user's question based strictly on the provided context.
If the answer is not contained in the context, say "I don't have enough information to answer that."
When you use information from the context, please cite the Source ID using [Source: <ID>].

<context>
{context_text}
</context>
"""

    messages = [{"role": "system", "content": system_message}]
    
    if conversation_history:
        messages.extend(conversation_history[-5:])
        
    messages.append({"role": "user", "content": query})
    
    # 3. Stream Metadata First
    start_time = time.time()
    source_ids = [str(c.id) for c in relevant_chunks]
    yield f"data: {json.dumps({'type': 'sources', 'data': source_ids})}\n\n"
    
    full_answer = ""
    
    # 4. Stream LLM Generation
    try:
        if use_local_llm:
            response = await litellm.acompletion(
                model="ollama/llama3",
                messages=messages,
                api_base=settings.OLLAMA_BASE_URL,
                stream=True
            )
            async for chunk in response:
                if chunk.choices[0].delta.content is not None:
                    content = chunk.choices[0].delta.content
                    full_answer += content
                    yield f"data: {json.dumps({'type': 'token', 'data': content})}\n\n"
        else:
            response = await openai_client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                temperature=0.2,
                stream=True
            )
            async for chunk in response:
                if chunk.choices[0].delta.content is not None:
                    content = chunk.choices[0].delta.content
                    full_answer += content
                    yield f"data: {json.dumps({'type': 'token', 'data': content})}\n\n"
                    
    except Exception as e:
        logger.error(f"Error generating LLM response: {e}")
        yield f"data: {json.dumps({'type': 'error', 'data': str(e)})}\n\n"
        
    yield "data: [DONE]\n\n"

    end_time = time.time()
    eval_logger.log_trace(
        query=query,
        contexts=[c.content for c in relevant_chunks],
        answer=full_answer,
        latency_ms=round((end_time - start_time) * 1000, 2)
    )
