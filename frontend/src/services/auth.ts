import { api } from '@/lib/api';
import { User } from '@/types';

interface LoginResponse {
    access_token: string;
    token_type: 'bearer';
}

interface RegisterData {
    email: string;
    full_name: string;
    password: string;
}

export const authApi = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        try {
            const response = await api.post('/auth/login', formData.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                maxRedirects: 0,
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || 'An error occurred during login';
            throw new Error(errorMessage);
        }
    },

    register: async (data: RegisterData): Promise<User> => {
        try {
            console.log('Registration request data:', data);

            const response = await api.post('/auth/register', data, {
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json'
                }
            });
            return response.data;
        } catch (error: any) {
            console.error('Registration error details:', error.response?.data);
            const errorMessage = error.response?.data?.detail || 'Registration failed';
            throw new Error(errorMessage);
        }
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    logout: async (): Promise<void> => {
        try {
            await api.post('/auth/logout');
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || 'Failed to logout');
        }
    },
}; 