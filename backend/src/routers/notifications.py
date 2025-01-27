from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from src.database.config import get_db
from src.models.notification import Notification
from src.models.user import User
from src.schemas.notification import NotificationResponse
from src.auth.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Notification).where(Notification.user_id == current_user.id)
    )
    return result.scalars().all()

@router.post("/mark-read")
async def mark_notification_read(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notification = await db.get(Notification, notification_id)
    if not notification or notification.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    await db.commit()
    return {"message": "Notification marked as read"}

# Utility function to create notifications (to be used by other routers)
async def create_notification(
    db: AsyncSession,
    user_id: int,
    message: str
) -> Notification:
    notification = Notification(
        user_id=user_id,
        message=message
    )
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    return notification 