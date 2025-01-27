import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from src.routers.auth import router as auth_router
from src.routers.users import router as users_router
from src.routers.teams import router as teams_router
from src.routers.projects import router as projects_router
from src.routers.tasks import router as tasks_router
from src.database.config import engine, Base
from src.auth.deps import get_current_user
from fastapi.responses import RedirectResponse
import uvicorn
import time

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('app.log')
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Task Manager API")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    # Log request details
    logger.info(f"Request started: {request.method} {request.url}")
    logger.debug(f"Headers: {request.headers}")
    
    try:
        response = await call_next(request)
        
        # Log response details
        process_time = time.time() - start_time
        logger.info(
            f"Request completed: {request.method} {request.url} "
            f"- Status: {response.status_code} "
            f"- Time: {process_time:.2f}s"
        )
        
        return response
    except Exception as e:
        logger.error(f"Request failed: {request.method} {request.url} - Error: {str(e)}")
        raise

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
try:
    app.include_router(auth_router, prefix="/auth", tags=["auth"])
    app.include_router(users_router, prefix="/users", tags=["users"])
    app.include_router(teams_router, prefix="/teams", tags=["teams"])
    app.include_router(projects_router, prefix="/projects", tags=["projects"])
    app.include_router(tasks_router)  # No prefix here since it's in the router
    logger.info("All routers included successfully")
except Exception as e:
    logger.error(f"Error including routers: {e}")
    raise

# Add redirect for old tasks URL
@app.get("/tasks", include_in_schema=False)
@app.get("/tasks/{path:path}", include_in_schema=False)
async def redirect_tasks(path: str = ""):
    return RedirectResponse(url=f"/projects/tasks/{path}")

@app.get("/")
async def root():
    return {"message": "Task Manager API"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 