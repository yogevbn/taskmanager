import { Comment } from './Comment';

export interface Task {
    id: number;
    title: string;
    description: string;
    due_date: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    status: "TODO" | "IN_PROGRESS" | "DONE";
    project_id: number;
    assigned_to: number;
    created_at: string;
    comments: Comment[];
} 