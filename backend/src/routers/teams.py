from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List
from src.database.config import get_db
from src.models.team import Team, team_members
from src.models.user import User
from src.schemas.team import TeamCreate, TeamResponse
from src.auth.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=TeamResponse)
async def create_team(
    team_data: TeamCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Create team with current user as manager
        team = Team(
            name=team_data.name,
            manager_id=current_user.id  # Set the creator as manager
        )
        
        # Add the manager as a team member automatically
        team.members.append(current_user)
        
        db.add(team)
        await db.commit()
        
        # Reload team with relationships
        result = await db.execute(
            select(Team)
            .options(selectinload(Team.members))
            .where(Team.id == team.id)
        )
        return result.scalar_one()

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[TeamResponse])
async def get_teams(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Team).options(selectinload(Team.members))
    )
    return result.scalars().all()

@router.get("/{team_id}", response_model=TeamResponse)
async def get_team(
    team_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Team)
        .options(selectinload(Team.members))
        .where(Team.id == team_id)
    )
    team = result.scalar_one_or_none()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team

@router.post("/{team_id}/members")
async def add_team_member(
    team_id: int,
    user_id: int = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get team with members loaded
    result = await db.execute(
        select(Team)
        .options(selectinload(Team.members))
        .where(Team.id == team_id)
    )
    team = result.scalar_one_or_none()
    
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    if team.manager_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Only team manager can add members"
        )
    
    # Get user to add
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user is already a member
    if any(member.id == user.id for member in team.members):
        raise HTTPException(
            status_code=400,
            detail="User is already a team member"
        )
    
    team.members.append(user)
    await db.commit()
    
    # Reload team with members
    result = await db.execute(
        select(Team)
        .options(selectinload(Team.members))
        .where(Team.id == team_id)
    )
    updated_team = result.scalar_one()
    return {"message": "Member added successfully", "team": updated_team}

@router.post("/{team_id}/members/{user_id}")
async def add_team_member_by_path(
    team_id: int,
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get team with members loaded
    result = await db.execute(
        select(Team)
        .options(selectinload(Team.members))
        .where(Team.id == team_id)
    )
    team = result.scalar_one_or_none()
    
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    if team.manager_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Only team manager can add members"
        )
    
    # Get user to add
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user is already a member
    if any(member.id == user.id for member in team.members):
        raise HTTPException(
            status_code=400,
            detail="User is already a team member"
        )
    
    team.members.append(user)
    await db.commit()
    
    # Reload team with members
    result = await db.execute(
        select(Team)
        .options(selectinload(Team.members))
        .where(Team.id == team_id)
    )
    updated_team = result.scalar_one()
    return {"message": "Member added successfully", "team": updated_team}

@router.delete("/{team_id}/members/{user_id}")
async def remove_team_member(
    team_id: int,
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    team = await db.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    team.members.remove(user)
    await db.commit()
    return {"message": "Member removed successfully"} 
    return {"message": "Member removed successfully"} 