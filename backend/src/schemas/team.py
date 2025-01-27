from pydantic import BaseModel
from datetime import datetime
from typing import List
from .user import UserResponse

class TeamBase(BaseModel):
    name: str

class TeamCreate(TeamBase):
    pass

class TeamResponse(TeamBase):
    id: int
    created_at: datetime
    manager_id: int
    members: List[UserResponse] = []

    class Config:
        from_attributes = True 