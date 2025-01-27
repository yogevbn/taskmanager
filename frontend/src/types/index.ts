export * from './User';
export * from './Team';
export * from './Project';
export * from './Task';
export * from './Comment';

export interface User {
    id: number;
    email: string;
    full_name: string;
    created_at: string;
    updated_at: string;
}

export interface Project {
    id: number;
    name: string;
    created_at: string;
    tasks: Task[];
}

export interface Task {
    id: number;
    title: string;
    description: string;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    due_date: string;
    created_at: string;
    project_id: number;
    assigned_to: number;
    comments: Comment[];
}

export interface Comment {
    id: number;
    content: string;
    created_at: string;
    user_id: number;
    task_id: number;
}

export interface RegisterInput {
    email: string;
    full_name: string;
    password: string;
} 