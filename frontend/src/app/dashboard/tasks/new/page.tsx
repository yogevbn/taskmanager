'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { tasksApi } from '@/services/tasks';
import { projectsApi } from '@/services/projects';
import { usersApi } from '@/services/users';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface TaskForm {
    title: string;
    description: string;
    due_date: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    project_id: string;
    assigned_to: string;
}

export default function NewTaskPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<TaskForm>({
        title: '',
        description: '',
        due_date: '',
        priority: 'MEDIUM',
        status: 'TODO',
        project_id: '',
        assigned_to: '',
    });

    const { data: projects, isLoading: projectsLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: projectsApi.getProjects,
    });

    const { data: users, isLoading: usersLoading } = useQuery({
        queryKey: ['users'],
        queryFn: usersApi.getUsers,
    });

    const createTaskMutation = useMutation({
        mutationFn: (data: {
            title: string;
            description: string;
            due_date: string;
            priority: 'LOW' | 'MEDIUM' | 'HIGH';
            status: 'TODO' | 'IN_PROGRESS' | 'DONE';
            project_id: number;
            assigned_to: number;
        }) => tasksApi.createTask(data),
        onSuccess: () => {
            router.push('/dashboard/tasks');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createTaskMutation.mutate({
            ...formData,
            project_id: parseInt(formData.project_id),
            assigned_to: parseInt(formData.assigned_to),
        });
    };

    if (projectsLoading || usersLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Create New Task</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Fill in the task details below.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {createTaskMutation.isError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                            {(createTaskMutation.error as Error)?.message ||
                                'Failed to create task'}
                        </div>
                    )}

                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            required
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Task title"
                            disabled={createTaskMutation.isPending}
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            required
                            rows={3}
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Task description"
                            disabled={createTaskMutation.isPending}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
                                Due Date
                            </label>
                            <input
                                type="date"
                                id="due_date"
                                name="due_date"
                                required
                                value={formData.due_date}
                                onChange={(e) =>
                                    setFormData({ ...formData, due_date: e.target.value })
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                disabled={createTaskMutation.isPending}
                            />
                        </div>

                        <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                                Priority
                            </label>
                            <select
                                id="priority"
                                name="priority"
                                value={formData.priority}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        priority: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH',
                                    })
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                disabled={createTaskMutation.isPending}
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label htmlFor="project" className="block text-sm font-medium text-gray-700">
                                Project
                            </label>
                            <select
                                id="project"
                                name="project"
                                required
                                value={formData.project_id}
                                onChange={(e) =>
                                    setFormData({ ...formData, project_id: e.target.value })
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                disabled={createTaskMutation.isPending}
                            >
                                <option value="">Select a project</option>
                                {projects?.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700">
                                Assign To
                            </label>
                            <select
                                id="assigned_to"
                                name="assigned_to"
                                required
                                value={formData.assigned_to}
                                onChange={(e) =>
                                    setFormData({ ...formData, assigned_to: e.target.value })
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                disabled={createTaskMutation.isPending}
                            >
                                <option value="">Select a user</option>
                                {users?.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.full_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                            disabled={createTaskMutation.isPending}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            disabled={createTaskMutation.isPending}
                        >
                            {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 