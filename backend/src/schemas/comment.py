from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from .user import UserResponse

class CommentBase(BaseModel):
    text: str
    task_id: int

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: int
    user_id: int
    created_at: datetime
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True 