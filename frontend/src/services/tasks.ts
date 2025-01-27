import { api } from '@/lib/api';
import { Task } from '@/types';

interface CreateTaskData {
    title: string;
    description: string;
    due_date: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    project_id: number;
    assigned_to: number;
}

interface UpdateTaskData {
    title?: string;
    description?: string;
    status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
    assigned_to?: number;
    due_date?: string;
}

export const tasksApi = {
    getTasks: async (): Promise<Task[]> => {
        try {
            const response = await api.get('/tasks');
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || 'Failed to fetch tasks';
            throw new Error(errorMessage);
        }
    },

    getTask: async (id: string): Promise<Task> => {
        try {
            const response = await api.get(`/tasks/${id}`);
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || 'Failed to fetch task';
            throw new Error(errorMessage);
        }
    },

    createTask: async (data: CreateTaskData): Promise<Task> => {
        try {
            const response = await api.post('/projects/tasks/', data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error creating task:', error);
            const errorMessage = error.response?.data?.detail || 'Failed to create task';
            throw new Error(errorMessage);
        }
    },

    updateTask: async (taskId: number, data: UpdateTaskData): Promise<Task> => {
        try {
            const response = await api.put(`/projects/tasks/${taskId}`, data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error updating task:', error);
            const errorMessage = error.response?.data?.detail || 'Failed to update task';
            throw new Error(errorMessage);
        }
    },

    deleteTask: async (id: number): Promise<void> => {
        await api.delete(`/tasks/${id}`);
    },

    getComments: async (taskId: number): Promise<Comment[]> => {
        const response = await api.get(`/tasks/${taskId}/comments`);
        return response.data;
    },

    addComment: async (taskId: number, content: string): Promise<Comment> => {
        const response = await api.post(`/tasks/${taskId}/comments`, { content });
        return response.data;
    },
}; 