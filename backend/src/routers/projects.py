from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from sqlalchemy.orm import selectinload, joinedload
from typing import List
from src.database.config import get_db
from src.models.project import Project
from src.models.team import Team
from src.models.user import User
from src.models.task import Task
from src.models.comment import Comment
from src.schemas.project import ProjectCreate, ProjectResponse
from src.schemas.comment import CommentCreate, CommentResponse
from src.auth.deps import get_current_user

router = APIRouter(
    prefix="/projects",
    tags=["projects"]
)

@router.post("/", response_model=ProjectResponse)
async def create_project(
    project_data: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new project for the user's team"""
    try:
        # Get user's team
        team_query = (
            select(Team)
            .join(Team.members)
            .where(User.id == current_user.id)
            .order_by(Team.created_at.desc())  # Get most recent team if user has multiple
        )
        team = await db.execute(team_query)
        user_team = team.scalar_one_or_none()

        project = Project(
            name=project_data.name,
            team_id=user_team.id if user_team else None,
            manager_id=current_user.id
        )
        
        db.add(project)
        await db.commit()
        await db.refresh(project)

        # Reload with relationships
        result = await db.execute(
            select(Project)
            .options(
                selectinload(Project.team).selectinload(Team.members),
                selectinload(Project.manager),
                selectinload(Project.tasks)
            )
            .where(Project.id == project.id)
        )
        return result.scalar_one()

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[ProjectResponse])
async def get_projects(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get projects where:
    1. User is the project manager, OR
    2. Project belongs to a team where user is a member
    """
    try:
        # Get user's teams
        teams_query = (
            select(Team)
            .join(Team.members)
            .where(User.id == current_user.id)
        )
        teams_result = await db.execute(teams_query)
        user_teams = teams_result.scalars().all()
        team_ids = [team.id for team in user_teams]

        # Get projects with all relationships loaded
        query = (
            select(Project)
            .distinct()
            .options(
                selectinload(Project.team).selectinload(Team.members),
                selectinload(Project.manager),
                selectinload(Project.tasks).options(
                    selectinload(Task.assignee),
                    selectinload(Task.comments).selectinload(Comment.user)
                )
            )
            .where(
                or_(
                    Project.manager_id == current_user.id,
                    Project.team_id.in_(team_ids)
                )
            )
        )
        
        result = await db.execute(query)
        return result.unique().scalars().all()

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific project if the user has access to it"""
    try:
        # First get user's teams
        teams_query = (
            select(Team)
            .join(Team.members)
            .where(User.id == current_user.id)
        )
        teams_result = await db.execute(teams_query)
        user_teams = teams_result.scalars().all()
        team_ids = [team.id for team in user_teams]

        query = (
            select(Project)
            .distinct()
            .options(
                selectinload(Project.team).selectinload(Team.members),
                selectinload(Project.manager),
                selectinload(Project.tasks).options(
                    selectinload(Task.assignee),
                    selectinload(Task.comments).selectinload(Comment.user)
                )
            )
            .where(
                Project.id == project_id,
                or_(
                    Project.manager_id == current_user.id,
                    Project.team_id.in_(team_ids)
                )
            )
        )
        
        result = await db.execute(query)
        project = result.unique().scalar_one_or_none()
        
        if not project:
            raise HTTPException(
                status_code=404,
                detail="Project not found or you don't have access to it"
            )
            
        return project

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{project_id}/assign/{user_id}")
async def assign_user_to_project(
    project_id: int,
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get project and verify current user is manager
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.manager_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Only project manager can assign users"
        )
    
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Logic for assigning user to project can be added here
    
    await db.commit()
    return {"message": "User assigned to project successfully"}

@router.post("/projects/{project_id}/tasks/{task_id}/comments/", response_model=CommentResponse)
async def create_comment(
    project_id: int,
    task_id: int,
    comment_data: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new comment on a task"""
    try:
        # First verify task exists and belongs to the project
        task_query = (
            select(Task)
            .join(Project)  # Join with Project
            .outerjoin(Team, Project.team_id == Team.id)  # Optional join with Team
            .where(
                Task.id == task_id,
                Task.project_id == project_id,
                or_(
                    Project.manager_id == current_user.id,
                    Team.members.any(id=current_user.id)
                )
            )
        )
        task = await db.execute(task_query)
        if not task.scalar_one_or_none():
            raise HTTPException(
                status_code=404,
                detail="Task not found or you don't have access to it"
            )

        # Create the comment
        comment = Comment(
            text=comment_data.text,
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