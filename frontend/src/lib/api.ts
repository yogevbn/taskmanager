import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Add request interceptor
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Don't set default Content-Type, let axios handle it based on the data
    return config;
});

// Add response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Don't handle 401 errors for login requests
        if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
); 