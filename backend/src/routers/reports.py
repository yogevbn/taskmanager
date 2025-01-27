from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from src.database.config import get_db
from src.models.task import Task, TaskStatus
from src.models.user import User
from src.auth.deps import get_current_user

router = APIRouter()

@router.get("/tasks-completed")
async def get_tasks_completed(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_result = await db.execute(select(func.count(Task.id)))
    total_tasks = total_result.scalar()
    
    completed_result = await db.execute(
        select(func.count(Task.id)).where(Task.status == TaskStatus.COMPLETED)
    )
    completed_tasks = completed_result.scalar()
    
    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks
    }

@router.get("/user-performance/{user_id}")
async def get_user_performance(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tasks_result = await db.execute(
        select(func.count(Task.id)).where(Task.assigned_to == user_id)
    )
    total_tasks = tasks_result.scalar()
    
    completed_result = await db.execute(
        select(func.count(Task.id)).where(
            Task.assigned_to == user_id,
            Task.status == TaskStatus.COMPLETED
        )
    )
    completed_tasks = completed_result.scalar()
    
    return {
        "tasks_completed": completed_tasks,
        "total_tasks": total_tasks,
        "completion_rate": completed_tasks / total_tasks if total_tasks > 0 else 0
    }

@router.get("/project-progress/{project_id}")
async def get_project_progress(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_result = await db.execute(
        select(func.count(Task.id)).where(Task.project_id == project_id)
    )
    total_tasks = total_result.scalar()
    
    completed_result = await db.execute(
        select(func.count(Task.id)).where(
            Task.project_id == project_id,
            Task.status == TaskStatus.COMPLETED
        )
    )
    completed_tasks = completed_result.scalar()
    
    return {
        "progress": completed_tasks / total_tasks if total_tasks > 0 else 0,
        "completed_tasks": completed_tasks,
        "total_tasks": total_tasks
    } 