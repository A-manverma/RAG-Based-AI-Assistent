from pydantic import BaseModel, UUID4, EmailStr
from datetime import datetime
from typing import Optional

class DocumentResponse(BaseModel):
    id: UUID4
    title: str
    created_at: datetime
    owner_id: UUID4

    class Config:
        from_attributes = True
