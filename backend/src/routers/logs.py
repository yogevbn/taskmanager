from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from src.database.config import get_db
from src.models.task import Task
from src.models.comment import Comment
from src.models.user import User
from src.schemas.comment import CommentCreate, CommentResponse
from src.auth.deps import get_current_user

router = APIRouter()

@router.get("/{task_id}/logs")
async def get_task_logs(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Get task history (status changes, assignments, etc.)
    # This would require additional tracking in the Task model
    # For now, we'll return basic task info
    return {
        "task_id": task_id,
        "status_changes": [],
        "assignment_changes": [],
        "created_at": task.created_at
    }

@router.get("/{task_id}/comments", response_model=List[CommentResponse])
async def get_task_comments(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Comment)
        .where(Comment.task_id == task_id)
        .order_by(Comment.created_at.desc())
    )
    return result.scalars().all()

@router.post("/{task_id}/comments", response_model=CommentResponse)
async def create_comment(
    task_id: int,
    comment_data: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    comment = Comment(
        **comment_data.model_dump(),
        task_id=task_id,
        user_id=current_user.id
    )
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    
    # Create notification for task owner/assignee
    if task.assigned_to and task.assigned_to != current_user.id:
        from .notifications import create_notification
        await create_notification(
            db=db,
            user_id=task.assigned_to,
            message=f"New comment on task: {task.title}"
        )
    
    return comment 