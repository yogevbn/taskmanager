import { api } from '@/lib/api';
import { User } from '@/types';

export const usersApi = {
    getUsers: async (): Promise<User[]> => {
        const response = await api.get('/users');
        return response.data;
    },

    getUser: async (id: number): Promise<User> => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },
}; 