from pydantic import BaseModel, UUID4, EmailStr
from typing import List, Optional
from datetime import datetime

class MessageCreate(BaseModel):
    content: str
    
class MessageResponse(BaseModel):
    id: UUID4
    role: str
    content: str
    sources: Optional[List[dict]] = []
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: UUID4
    title: str
    messages: List[MessageResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True
