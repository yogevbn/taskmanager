# Task Manager API Documentation

## Base URL
```http
http://localhost:8000
```

## Database Models & TypeScript Interfaces

### User
```typescript
interface User {
  id: number;
  email: string;
  full_name: string;
  role: "USER" | "ADMIN";
  is_active: boolean;
}
```

### Team
```typescript
interface Team {
  id: number;
  name: string;
  created_at: string;  // ISO datetime
  created_by: number;  // User ID
  members: User[];
}
```

### Project
```typescript
interface Project {
  id: number;
  name: string;
  team_id: number | null;
  created_at: string;  // ISO datetime
  tasks: Task[];
}
```

### Task
```typescript
interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string;  // ISO datetime
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  project_id: number;
  assigned_to: number;  // User ID
  created_at: string;  // ISO datetime
  comments: Comment[];
}
```

### Comment
```typescript
interface Comment {
  id: number;
  content: string;
  task_id: number;
  user_id: number;
  created_at: string;  // ISO datetime
}
```

## API Endpoints

### Authentication
```typescript
// Register
POST /auth/register
Body: {
  email: string;
  full_name: string;
  password: string;
}

// Login
POST /auth/login
Body: FormData {
  username: string;  // email
  password: string;
}
Response: {
  access_token: string;
  token_type: "bearer";
}
```

### Teams
```typescript
// Get all teams
GET /teams/

// Create team
POST /teams/
Body: {
  name: string;
}

// Get team by ID
GET /teams/{team_id}

// Add member to team
POST /teams/{team_id}/members
Body: {
  user_id: number;
}

// Remove member from team
DELETE /teams/{team_id}/members/{user_id}
```

### Projects
```typescript
// Get all projects
GET /projects/

// Create project
POST /projects/
Body: {
  name: string;
  team_id?: number;
}

// Get project by ID
GET /projects/{project_id}

// Assign user to project
POST /projects/{project_id}/assign/{user_id}
```

### Tasks
```typescript
// Get all tasks
GET /tasks/

// Create task
POST /tasks/
Body: {
  title: string;
  description: string;
  due_date: string;  // ISO datetime
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  project_id: number;
  assigned_to: number;
}

// Get task by ID
GET /tasks/{task_id}

// Update task
PUT /tasks/{task_id}

// Delete task
DELETE /tasks/{task_id}

// Get task comments
GET /tasks/{task_id}/comments

// Add comment to task
POST /tasks/{task_id}/comments
Body: {
  content: string;
}
```

## Authentication Flow
1. Register user or login to get access token
2. Store token in localStorage/cookies
3. Include token in all API requests:
```typescript
headers: {
  'Authorization': `Bearer ${token}`
}
```

## Error Handling
```typescript
interface APIError {
  detail: string;
}

// Common Status Codes:
// 400 - Bad Request
// 401 - Unauthorized
// 403 - Forbidden
// 404 - Not Found
// 422 - Validation Error
```

## Required Frontend Dependencies
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0",
    "@tanstack/react-query": "^5.0.0",
    "date-fns": "^2.30.0",
    "zod": "^3.22.0",
    "zustand": "^4.4.0"
  }
}
```

## Recommended Frontend Structure
```
src/
  ├── app/                    # Next.js 14 app router
  │   ├── (auth)/            # Auth routes
  │   │   ├── login/
  │   │   └── register/
  │   ├── dashboard/         # Protected routes
  │   │   ├── projects/
  │   │   ├── tasks/
  │   │   └── teams/
  │   ├── layout.tsx
  │   └── page.tsx
  ├── components/            # Reusable components
  │   ├── auth/             # Auth related components
  │   ├── common/           # Common UI components
  │   ├── projects/         # Project related components
  │   ├── tasks/           # Task related components
  │   └── teams/           # Team related components
  ├── hooks/                # Custom hooks
  │   ├── useAuth.ts
  │   ├── useProjects.ts
  │   ├── useTasks.ts
  │   └── useTeams.ts
  ├── lib/                  # Utilities and helpers
  │   ├── api.ts           # API client setup
  │   ├── auth.ts          # Auth utilities
  │   └── utils.ts         # Common utilities
  ├── services/            # API service functions
  │   ├── auth.ts
  │   ├── projects.ts
  │   ├── tasks.ts
  │   └── teams.ts
  ├── stores/              # State management
  │   ├── authStore.ts
  │   └── themeStore.ts
  └── types/               # TypeScript types
      └── index.ts         # Type exports
```

## Key Features to Implement

### Authentication & Authorization
- User registration and login
- Token management
- Protected routes
- Role-based access control

### Team Management
- Create and manage teams
- Add/remove team members
- Team dashboard
- Team activity feed

### Project Management
- Create and edit projects
- Assign projects to teams
- Project overview dashboard
- Project progress tracking

### Task Management
- Create, edit, delete tasks
- Task status updates
- Task assignments
- Due date tracking
- Priority management
- Task filtering and sorting

### Comments & Collaboration
- Add comments to tasks
- @mentions in comments
- Activity history
- Real-time updates (optional)

### UI/UX Features
- Responsive design
- Dark/Light theme
- Loading states
- Error handling
- Toast notifications
- Form validation
- Search functionality
- Filtering and sorting
- Pagination

### Performance Optimizations
- API request caching
- Optimistic updates
- Infinite scrolling
- Lazy loading
- Debounced search

## Development Tools
```json
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^18.2.0",
    "@types/node": "^20.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "tailwindcss": "^3.0.0",
    "@tailwindcss/forms": "^0.5.0",
    "postcss": "^8.0.0",
    "autoprefixer": "^10.0.0"
  }
}
```

## API Integration Tips
1. Use React Query for data fetching and caching
2. Implement axios interceptors for token management
3. Create custom hooks for API calls
4. Handle loading and error states consistently
5. Use TypeScript for better type safety
6. Implement proper error boundaries

## State Management Strategy
1. Use Zustand for global state
2. React Query for server state
3. Local state for component-specific data
4. Context for theme and auth state

## Deployment Considerations
1. Environment variables setup
2. API base URL configuration
3. Error tracking setup
4. Analytics integration
5. Performance monitoring
6. SEO optimization

## Security Best Practices
1. Secure token storage
2. XSS prevention
3. CSRF protection
4. Input sanitization
5. Rate limiting
6. Error message sanitization
