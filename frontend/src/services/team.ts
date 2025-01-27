import { api } from '@/lib/api';

export const teamApi = {
    // ... other team methods

    addTeamMember: async (teamId: number, userId: number): Promise<void> => {
        try {
            await api.post(`/teams/${teamId}/members`, null, {
                params: { user_id: userId }
            });
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || 'Failed to add team member';
            throw new Error(errorMessage);
        }
    },
}; 