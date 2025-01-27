import logging
from fastapi import APIRouter, Depends, HTTPException, Body, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, desc
from sqlalchemy.orm import selectinload
from datetime import datetime, timezone
from typing import List
import traceback
from src.database.config import get_db
from src.models.task import Task, TaskPriority, TaskStatus
from src.models.project import Project
from src.models.team import Team
from src.models.user import User
from src.models.comment import Comment
from src.schemas.task import TaskCreate, TaskResponse, TaskUpdate
from src.schemas.comment import CommentCreate, CommentResponse
from src.auth.deps import get_current_user

# Configure logging with more detail
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

router = APIRouter(
    prefix="/projects/tasks",
    tags=["tasks"]
)

@router.post("/", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new task"""
    try:
        logger.info(f"User {current_user.id} attempting to create task. URL: {request.url}")
        logger.debug(f"Task data: {task_data.model_dump()}")

        # First check if project exists
        project_query = (
            select(Project)
            .options(
                selectinload(Project.team).selectinload(Team.members)
            )
            .where(Project.id == task_data.project_id)
        )
        logger.debug(f"Project query: {project_query}")
        
        project_result = await db.execute(project_query)
        project = project_result.scalar_one_or_none()

        if not project:
            logger.warning(f"Project {task_data.project_id} not found")
            raise HTTPException(
                status_code=404,
                detail=f"Project with id {task_data.project_id} not found"
            )

        # Check if user has access to the project
        team_members = [member.id for member in project.team.members] if project.team else []
        has_access = (
            project.manager_id == current_user.id or
            current_user.id in team_members
        )

        logger.debug(f"Access check - Manager ID: {project.manager_id}, Current User: {current_user.id}, Team Members: {team_members}")

        if not has_access:
            logger.warning(f"User {current_user.id} denied access to project {project.id}")
            raise HTTPException(
                status_code=403,
                detail="You don't have access to this project"
            )

        # Verify assignee exists if provided
        if task_data.assigned_to:
            assignee = await db.get(User, task_data.assigned_to)
            if not assignee:
                logger.warning(f"Assignee {task_data.assigned_to} not found")
                raise HTTPException(
                    status_code=404,
                    detail=f"User with id {task_data.assigned_to} not found"
                )

        # Create task with timezone-aware datetime
        task_dict = task_data.model_dump()
        if task_dict.get('due_date') and not task_dict['due_date'].tzinfo:
            task_dict['due_date'] = task_dict['due_date'].replace(tzinfo=timezone.utc)

        task = Task(**task_dict)
        db.add(task)
        await db.commit()
        await db.refresh(task)

        logger.info(f"Task {task.id} created successfully")

        # Reload task with all relationships
        result = await db.execute(
            select(Task)
            .options(
                selectinload(Task.project),
                selectinload(Task.assignee),
                selectinload(Task.comments).options(
                    selectinload(Comment.user)
                )
            )
            .where(Task.id == task.id)
        )
        return result.scalar_one()

    except HTTPException as e:
        await db.rollback()
        raise e
    except Exception as e:
        await db.rollback()
        error_details = {
            'error_type': type(e).__name__,
            'error_message': str(e),
            'user_id': current_user.id,
            'task_data': task_data.model_dump(),
            'url': str(request.url),
            'method': request.method,
            'traceback': traceback.format_exc()
        }
        logger.error(f"Error creating task: {error_details}")
        raise HTTPException(
            status_code=400,
            detail={
                'message': 'Error creating task',
                'error': str(e),
                'error_type': type(e).__name__
            }
        )

@router.get("/", response_model=List[TaskResponse])
async def get_tasks(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all tasks the user has access to"""
    try:
        logger.info(f"User {current_user.id} requesting tasks. URL: {request.url}")
        
        # Get tasks with all relationships loaded
        query = (
            select(Task)
            .distinct()
            .options(
                selectinload(Task.assignee),
                selectinload(Task.comments).options(
                    selectinload(Comment.user)
                ),
                selectinload(Task.project).options(
                    selectinload(Project.team).selectinload(Team.members)
                )
            )
            .join(Project)
            .outerjoin(Team, Project.team_id == Team.id)
            .where(
                or_(
                    Project.manager_id == current_user.id,
                    Team.members.any(User.id == current_user.id),
                    Task.assigned_to == current_user.id
                )
            )
            .order_by(Task.created_at.desc())
        )
        
        logger.debug(f"Executing query: {query}")
        result = await db.execute(query)
        tasks = result.unique().scalars().all()
        
        logger.info(f"Found {len(tasks)} tasks for user {current_user.id}")
        
        if not tasks:
            logger.warning(f"No tasks found for user {current_user.id}")
            return []
            
        return tasks

    except Exception as e:
        error_details = {
            'error_type': type(e).__name__,
            'error_message': str(e),
            'user_id': current_user.id,
            'url': str(request.url),
            'method': request.method,
            'traceback': traceback.format_exc()
        }
        logger.error(f"Error fetching tasks: {error_details}")
        raise HTTPException(
            status_code=400,
            detail={
                'message': 'Error fetching tasks',
                'error': str(e),
                'error_type': type(e).__name__
            }
        )

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific task if the user has access to it"""
    try:
        logger.info(f"User {current_user.id} requesting task {task_id}")
        
        query = (
            select(Task)
            .options(
                selectinload(Task.assignee),
                selectinload(Task.comments).options(
                    selectinload(Comment.user)
                ),
                selectinload(Task.project).options(
                    selectinload(Project.team).selectinload(Team.members)
                )
            )
            .join(Project)
            .outerjoin(Team, Project.team_id == Team.id)
            .where(
                Task.id == task_id,
                or_(
                    Project.manager_id == current_user.id,
                    Team.members.any(User.id == current_user.id),
                    Task.assigned_to == current_user.id
                )
            )
        )
        
        logger.debug(f"Executing query: {query}")
        result = await db.execute(query)
        task = result.unique().scalar_one_or_none()
        
        if not task:
            logger.warning(f"Task {task_id} not found or user {current_user.id} doesn't have access")
            raise HTTPException(
                status_code=404,
                detail="Task not found or you don't have access to it"
            )
        
        logger.info(f"Successfully retrieved task {task_id} for user {current_user.id}")
        return task

    except HTTPException as e:
        raise e
    except Exception as e:
        error_details = {
            'error_type': type(e).__name__,
            'error_message': str(e),
            'user_id': current_user.id,
            'task_id': task_id,
            'url': str(request.url),
            'method': request.method,
            'traceback': traceback.format_exc()
        }
        logger.error(f"Error fetching task: {error_details}")
        raise HTTPException(
            status_code=400,
            detail={
                'message': 'Error fetching task',
                'error': str(e),
                'error_type': type(e).__name__
            }
        )

@router.post("/{task_id}/assign/{user_id}")
async def assign_task(
    task_id: int,
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    task.assigned_to = user_id
    await db.commit()
    await db.refresh(task)
    return {"message": "Task assigned successfully"}

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update task by anyone who has access to it"""
    try:
        # Get task with relationships and verify access
        query = (
            select(Task)
            .join(Project)
            .outerjoin(Team, Project.team_id == Team.id)
            .options(
                selectinload(Task.project),
                selectinload(Task.assignee),
                selectinload(Task.comments).options(
                    selectinload(Comment.user)
                )
            )
            .where(
                Task.id == task_id,
                or_(
                    Project.manager_id == current_user.id,
                    Team.members.any(id=current_user.id),
                    Task.assigned_to == current_user.id
                )
            )
        )
        
        result = await db.execute(query)
        task = result.scalar_one_or_none()
        
        if not task:
            raise HTTPException(
                status_code=404,
                detail="Task not found or you don't have access to it"
            )

        # Verify new assignee exists if provided
        if task_update.assigned_to is not None:
            assignee = await db.get(User, task_update.assigned_to)
            if not assignee:
                raise HTTPException(
                    status_code=404,
                    detail=f"User with id {task_update.assigned_to} not found"
                )

        # Update task fields if provided
        update_data = task_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(task, field, value)

        await db.commit()
        await db.refresh(task)

        return task

    except HTTPException as e:
        await db.rollback()
        raise e
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{task_id}/status")
async def update_task_status(
    task_id: int,
    status: TaskStatus,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update task status by anyone who has access to the task"""
    try:
        # Get task with relationships and verify access
        query = (
            select(Task)
            .join(Project)
            .outerjoin(Team, Project.team_id == Team.id)
            .options(
                selectinload(Task.project),
                selectinload(Task.assignee),
                selectinload(Task.comments)
            )
            .where(
                Task.id == task_id,
                or_(
                    Project.manager_id == current_user.id,
                    Team.members.any(id=current_user.id),
                    Task.assigned_to == current_user.id
                )
            )
        )
        
        result = await db.execute(query)
        task = result.scalar_one_or_none()
        
        if not task:
            raise HTTPException(
                status_code=404,
                detail="Task not found or you don't have access to it"
            )

        # Update status
        task.status = status
        await db.commit()
        await db.refresh(task)

        return task

    except HTTPException as e:
        await db.rollback()
        raise e
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{task_id}/comments", response_model=CommentResponse)
async def create_task_comment(
    task_id: int,
    text: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a comment on a task"""
    try:
        # Verify task exists and user has access
        query = (
            select(Task)
            .join(Project)
            .outerjoin(Team, Project.team_id == Team.id)
            .where(
                Task.id == task_id,
                or_(
                    Project.manager_id == current_user.id,
                    Team.members.any(id=current_user.id),
                    Task.assigned_to == current_user.id
                )
            )
        )
        
        result = await db.execute(query)
        task = result.scalar_one_or_none()
        
        if not task:
            raise HTTPException(
                status_code=404,
                detail="Task not found or you don't have access to it"
            )

        # Create the comment
        comment = Comment(
            text=text,
            task_id=task_id,
            user_id=current_user.id
        )
        
        db.add(comment)
        await db.commit()
        await db.refresh(comment)

        # Reload comment with user relationship
        result = await db.execute(
            select(Comment)
            .options(selectinload(Comment.user))
            .where(Comment.id == comment.id)
        )
        return result.scalar_one()

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{task_id}/comments", response_model=List[CommentResponse])
async def get_task_comments(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all comments for a task"""
    try:
        # Verify task exists and user has access
        task_query = (
            select(Task)
            .join(Project)
            .outerjoin(Team, Project.team_id == Team.id)
            .where(
                Task.id == task_id,
                or_(
                    Project.manager_id == current_user.id,
                    Team.members.any(id=current_user.id),
                    Task.assigned_to == current_user.id
                )
            )
        )
        
        task_result = await db.execute(task_query)
        if not task_result.scalar_one_or_none():
            raise HTTPException(
                status_code=404,
                detail="Task not found or you don't have access to it"
            )

        # Get comments with user information
        query = (
            select(Comment)
            .options(selectinload(Comment.user))
            .where(Comment.task_id == task_id)
            .order_by(Comment.created_at.desc())
        )
        
        result = await db.execute(query)
        return result.scalars().all()

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 