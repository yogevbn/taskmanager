import { api } from '@/lib/api';
import { Comment } from '@/types';

export const commentsApi = {
    createComment: async (taskId: number, text: string): Promise<Comment> => {
        try {
            const response = await api.post(`/projects/tasks/${taskId}/comments`, {
                text: text  // Send in request body as JSON
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error creating comment:', error);
            const errorMessage = error.response?.data?.detail || 'Failed to create comment';
            throw new Error(errorMessage);
        }
    },
    // ... other methods
}; 