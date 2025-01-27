from pydantic import BaseModel
from datetime import datetime

class NotificationBase(BaseModel):
    message: str
    user_id: int

class NotificationCreate(NotificationBase):
    pass

class NotificationResponse(NotificationBase):
    id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True 