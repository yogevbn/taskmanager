import { api } from '@/lib/api';
import { Project } from '@/types';

export const projectsApi = {
    getProjects: async (): Promise<Project[]> => {
        try {
            console.log('Fetching projects...');
            const response = await api.get('/projects/projects/');
            console.log('Projects response:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching projects:', error);
            const errorMessage = error.response?.data?.detail || 'Failed to fetch projects';
            throw new Error(errorMessage);
        }
    },

    getProject: async (id: string): Promise<Project> => {
        try {
            const response = await api.get(`/projects/projects/${id}/`);
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || 'Failed to fetch project';
            throw new Error(errorMessage);
        }
    },

    createProject: async (data: { name: string; team_id?: number }): Promise<Project> => {
        try {
            const response = await api.post('/projects/projects/', {
                name: data.name,
                team_id: data.team_id || null
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || 'Failed to create project';
            throw new Error(errorMessage);
        }
    },

    deleteProject: async (id: number): Promise<void> => {
        try {
            await api.delete(`/projects/projects/${id}/`);
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || 'Failed to delete project';
            throw new Error(errorMessage);
        }
    },
}; 