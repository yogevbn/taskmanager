from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional
from .task import TaskResponse
from .user import UserResponse
from .team import TeamResponse

class ProjectBase(BaseModel):
    name: str

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    manager_id: int
    team_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime
    manager_id: int
    team_id: Optional[int] = None
    manager: UserResponse
    team: Optional[TeamResponse] = None
    tasks: List[TaskResponse] = []

    class Config:
        from_attributes = True 