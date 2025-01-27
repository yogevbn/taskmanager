from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from src.database.config import Base
from datetime import datetime

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    role = Column(SQLEnum(UserRole), default=UserRole.USER)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    teams = relationship("Team", secondary="team_members", back_populates="members")
    managed_teams = relationship("Team", back_populates="manager", foreign_keys="Team.manager_id")
    managed_projects = relationship("Project", back_populates="manager", foreign_keys="Project.manager_id")
    tasks = relationship("Task", back_populates="assignee")
    comments = relationship("Comment", back_populates="user")
    notifications = relationship("Notification", back_populates="user") 