'use client';

import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/services/tasks';
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { commentsApi } from '@/services/comments';

interface PageProps {
    params: {
        id: string;
    };
}

const TaskDetailsPage: React.FC<PageProps> = ({ params }) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const [newComment, setNewComment] = useState('');
    const [commentText, setCommentText] = useState('');

    const { data: task, isLoading, error } = useQuery({
        queryKey: ['task', params.id],
        queryFn: () => tasksApi.getTask(params.id),
    });

    const updateTaskMutation = useMutation({
        mutationFn: (status: 'TODO' | 'IN_PROGRESS' | 'DONE') =>
            tasksApi.updateTask(parseInt(params.id), {
                status,
                title: task.title,
                description: task.description,
                assigned_to: task.assigned_to,
                due_date: task.due_date
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['task', params.id] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
        onError: (error) => {
            console.error('Failed to update task status:', error);
        },
    });

    const addCommentMutation = useMutation({
        mutationFn: (content: string) =>
            tasksApi.addComment(parseInt(params.id), content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', params.id] });
            setNewComment('');
        },
    });

    const createCommentMutation = useMutation({
        mutationFn: (text: string) => commentsApi.createComment(Number(params.id), text),
        onSuccess: () => {
            queryClient.invalidateQueries(['tasks', params.id, 'comments']);
            setCommentText('');
        },
    });

    const handleStatusChange = (newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
        if (task.status !== newStatus) {
            updateTaskMutation.mutate(newStatus);
        }
    };

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim()) {
            addCommentMutation.mutate(newComment);
        }
    };

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        createCommentMutation.mutate(commentText);
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!task) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-gray-900">Task not found</h2>
            </div>
        );
    }

    const statusColors = {
        TODO: 'bg-gray-100 text-gray-800',
        IN_PROGRESS: 'bg-blue-100 text-blue-800',
        DONE: 'bg-green-100 text-green-800',
    };

    const priorityColors = {
        LOW: 'bg-green-100 text-green-800',
        MEDIUM: 'bg-yellow-100 text-yellow-800',
        HIGH: 'bg-red-100 text-red-800',
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">{task.title}</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Created: {new Date(task.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                            {task.priority}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                            {task.status.replace('_', ' ')}
                        </span>
                    </div>
                </div>

                <p className="mt-4 text-gray-700">{task.description}</p>

                <div className="mt-6 border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-sm font-medium text-gray-700">Due Date</h3>
                            <p className="text-sm text-gray-500">
                                {new Date(task.due_date).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handleStatusChange('TODO')}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 
                                    ${task.status === 'TODO'
                                        ? 'bg-gray-200 text-gray-800'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                disabled={updateTaskMutation.isPending || task.status === 'TODO'}
                            >
                                {task.status === 'TODO' ? '✓ To Do' : 'To Do'}
                            </button>
                            <button
                                onClick={() => handleStatusChange('IN_PROGRESS')}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 
                                    ${task.status === 'IN_PROGRESS'
                                        ? 'bg-blue-200 text-blue-800'
                                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                                disabled={updateTaskMutation.isPending || task.status === 'IN_PROGRESS'}
                            >
                                {task.status === 'IN_PROGRESS' ? '✓ In Progress' : 'In Progress'}
                            </button>
                            <button
                                onClick={() => handleStatusChange('DONE')}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 
                                    ${task.status === 'DONE'
                                        ? 'bg-green-200 text-green-800'
                                        : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                                disabled={updateTaskMutation.isPending || task.status === 'DONE'}
                            >
                                {task.status === 'DONE' ? '✓ Done' : 'Done'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Optional: Add a loading indicator during status update */}
            {updateTaskMutation.isPending && (
                <div className="mt-2 text-sm text-gray-500">
                    Updating status...
                </div>
            )}

            {/* Optional: Add error message display */}
            {updateTaskMutation.isError && (
                <div className="mt-2 text-sm text-red-600">
                    Failed to update status. Please try again.
                </div>
            )}

            {/* Comments Section */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Comments</h2>

                <form onSubmit={handleSubmitComment} className="mb-6">
                    <div>
                        <label htmlFor="comment" className="sr-only">
                            Add a comment
                        </label>
                        <textarea
                            id="comment"
                            rows={3}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Add a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            disabled={createCommentMutation.isPending}
                        />
                    </div>
                    <div className="mt-2 flex justify-end">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            disabled={createCommentMutation.isPending || !commentText.trim()}
                        >
                            {createCommentMutation.isPending ? 'Adding...' : 'Add Comment'}
                        </button>
                    </div>
                </form>

                <div className="space-y-4">
                    {task.comments?.map((comment) => (
                        <div
                            key={comment.id}
                            className="bg-gray-50 rounded-lg p-4"
                        >
                            <div className="flex justify-between items-start">
                                <p className="text-sm text-gray-900">{comment.text}</p>
                                <span className="text-xs text-gray-500">
                                    {new Date(comment.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TaskDetailsPage; 