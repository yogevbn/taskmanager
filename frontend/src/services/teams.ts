import { api } from '@/lib/api';
import { Team } from '@/types';

export const teamsApi = {
    getTeams: async (): Promise<Team[]> => {
        const response = await api.get('/teams');
        return response.data;
    },

    createTeam: async (name: string): Promise<Team> => {
        const response = await api.post('/teams', { name });
        return response.data;
    },

    addMember: async (teamId: number, userId: number): Promise<void> => {
        await api.post(`/teams/${teamId}/members`, { user_id: userId });
    },

    removeMember: async (teamId: number, userId: number): Promise<void> => {
        await api.delete(`/teams/${teamId}/members/${userId}`);
    },
}; 