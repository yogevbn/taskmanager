 Task Management System

## Project Overview
A comprehensive task management system that enables teams to collaborate on projects efficiently. The system supports hierarchical organization with projects, tasks, and comments, along with team-based access control.

## Core Components

### Backend (Python/FastAPI)
- RESTful API built with FastAPI
- PostgreSQL database with SQLAlchemy ORM
- Async operations for improved performance
- JWT-based authentication
- Comprehensive error handling


### Frontend (Client)
**Framework**: Next.js 13+ with TypeScript
- **State Management**: React Query & Zustand
- **Styling**: Tailwind CSS
- **Authentication**: JWT with HTTP-only cookies
- **HTTP Client**: Axios

### Database Schema
- Users
- Teams
- Projects
- Tasks
- Comments

### User Types

1. **Project Manager**
   - Create and manage projects
   - Assign team members
   - Manage tasks
   - View all project analytics

2. **Team Member**
   - View assigned projects
   - Create and update tasks
   - Add comments
   - Update task status

## Core Features

### Project Management
- Create/update projects
- Assign teams to projects
- Track project progress

### Task Management
- Create/update tasks
- Assign tasks to users
- Task status tracking (TODO, IN_PROGRESS, DONE)
- Task priority levels
- Due date management

### Team Collaboration
- Team creation and management
- Member assignment
- Comment system on tasks
- Real-time updates

### Access Control
- Role-based permissions
- Team-based access
- Hierarchical project access

## API Endpoints

### Projects
- `GET /projects/` - List accessible projects
- `POST /projects/` - Create new project
- `GET /projects/{id}` - Get project details
- `PUT /projects/{id}` - Update project
- `POST /projects/{id}/assign/{user_id}` - Assign user to project

### Tasks
- `GET /projects/tasks/` - List accessible tasks
- `POST /projects/tasks/` - Create new task
- `GET /projects/tasks/{id}` - Get task details
- `PUT /projects/tasks/{id}` - Update task
- `PATCH /projects/tasks/{id}/status` - Update task status
- `POST /projects/tasks/{id}/comments/` - Add comment
- `GET /projects/tasks/{id}/comments/` - Get task comments

### Teams
- Team creation and management
- Member assignment
- Team-project association

## Technologies
- **Backend**: Python 3.11+, FastAPI, SQLAlchemy
- **Database**: PostgreSQL
- **Authentication**: JWT
- **API Documentation**: OpenAPI/Swagger

---

# מערכת ניהול משימות

## סקירת הפרויקט
מערכת ניהול משימות מקיפה המאפשרת לצוותים לשתף פעולה בפרויקטים ביעילות. המערכת תומכת בארגון היררכי של פרויקטים, משימות ותגובות, יחד עם בקרת גישה מבוססת צוות.

## רכיבים מרכזיים

### צד שרת (Python/FastAPI)
- API מבוסס REST בנוי עם FastAPI
- מסד נתונים PostgreSQL עם SQLAlchemy ORM
- פעולות אסינכרוניות לביצועים משופרים
- אימות מבוסס JWT
- טיפול מקיף בשגיאות

### סוגי משתמשים

1. **מנהל פרויקט**
   - יצירה וניהול פרויקטים
   - הקצאת חברי צוות
   - ניהול משימות
   - צפייה בכל נתוני הפרויקט

3. **חבר צוות**
   - צפייה בפרויקטים שהוקצו
   - יצירה ועדכון משימות
   - הוספת תגובות
   - עדכון סטטוס משימות

## תכונות מרכזיות
- ניהול פרויקטים ומשימות
- מערכת תגובות
- בקרת גישה מבוססת תפקידים
- מעקב אחר סטטוס משימות
- ניהול צוותים
- התראות ועדכונים

## טכנולוגיות
- **צד שרת**: Python/FastAPI
- **מסד נתונים**: PostgreSQL
- **אימות**: JWT
- **תיעוד API**: OpenAPI/Swagger

### Frontend Setup 
```bash
cd task-manager
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
touch new .env file include :(setup connection)
   DATABASE_URL=postgresql+asyncpg://postgres:qweqwe@localhost:5432/taskmanager
   SECRET_KEY=your-secret-key-here 
create a DB at postgres SQL(mine called taskmanager)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python init_db.py
uvicorn main:app --reload
```
