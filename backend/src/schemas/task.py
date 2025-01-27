from pydantic import BaseModel, validator
from datetime import datetime, timezone
from typing import List, Optional
from .comment import CommentResponse
from src.models.task import TaskPriority, TaskStatus
from .user import UserResponse

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    status: TaskStatus = TaskStatus.TODO
    project_id: int
    assigned_to: Optional[int] = None

    @validator('due_date', pre=True)
    def ensure_timezone(cls, v):
        if not v:
            return None
            
        # If input is string, parse it first
        if isinstance(v, str):
            try:
                v = datetime.fromisoformat(v.replace('Z', '+00:00'))
            except ValueError:
                try:
                    v = datetime.strptime(v, "%Y-%m-%dT%H:%M:%S.%f")
                except ValueError:
                    try:
                        v = datetime.strptime(v, "%Y-%m-%dT%H:%M:%S")
                    except ValueError:
                        raise ValueError("Invalid datetime format")

        # Ensure timezone is set
        if not v.tzinfo:
            v = v.replace(tzinfo=timezone.utc)
        return v

class TaskCreate(TaskBase):
    pass  # Inherits all fields from TaskBase

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    assigned_to: Optional[int] = None

class TaskResponse(TaskBase):
    id: int
    project_id: int
    assignee_id: Optional[int] = None
    created_at: datetime
    assignee: Optional[UserResponse] = None
    comments: List[CommentResponse] = []

    class Config:
        from_attributes = True 