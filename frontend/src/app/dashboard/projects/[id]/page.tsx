'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/services/projects';
import { tasksApi } from '@/services/tasks';
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Task } from '@/types';

export default function ProjectDetailsPage({
    params,
}: {
    params: { id: string };
}) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    const { data: project, isLoading } = useQuery({
        queryKey: ['projects', params.id],
        queryFn: () => projectsApi.getProject(params.id),
    });

    const updateTaskMutation = useMutation({
        mutationFn: (data: { taskId: number; status: Task['status'] }) =>
            tasksApi.updateTask(data.taskId, { status: data.status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects', params.id] });
        },
    });

    const handleDragStart = (e: React.DragEvent, taskId: number) => {
        e.dataTransfer.setData('taskId', taskId.toString());
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, status: Task['status']) => {
        e.preventDefault();
        const taskId = parseInt(e.dataTransfer.getData('taskId'));
        if (taskId) {
            updateTaskMutation.mutate({ taskId, status });
        }
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!project) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-gray-900">Project not found</h2>
            </div>
        );
    }

    const priorityColors = {
        LOW: 'bg-green-100 text-green-800',
        MEDIUM: 'bg-yellow-100 text-yellow-800',
        HIGH: 'bg-red-100 text-red-800',
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">{project.name}</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Created: {new Date(project.created_at).toLocaleDateString()}
                    </p>
                </div>
                <button
                    onClick={() => router.push(`/dashboard/tasks/new?project=${project.id}`)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                    Add Task
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* To Do Column */}
                <div
                    className="space-y-4"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'TODO')}
                >
                    <div className="bg-gray-50 px-4 py-2 rounded-t-lg border-b">
                        <h2 className="text-lg font-medium text-gray-900">To Do</h2>
                    </div>
                    <div className="space-y-3">
                        {project.tasks
                            .filter((task) => task.status === 'TODO')
                            .map((task) => (
                                <div
                                    key={task.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, task.id)}
                                    onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                                    className="bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                >
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-sm font-medium text-gray-900">
                                            {task.title}
                                        </h3>
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]
                                                }`}
                                        >
                                            {task.priority}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                                        {task.description}
                                    </p>
                                    <div className="mt-2 text-xs text-gray-500">
                                        Due: {new Date(task.due_date).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                {/* In Progress Column */}
                <div
                    className="space-y-4"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'IN_PROGRESS')}
                >
                    <div className="bg-blue-50 px-4 py-2 rounded-t-lg border-b">
                        <h2 className="text-lg font-medium text-gray-900">In Progress</h2>
                    </div>
                    <div className="space-y-3">
                        {project.tasks
                            .filter((task) => task.status === 'IN_PROGRESS')
                            .map((task) => (
                                <div
                                    key={task.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, task.id)}
                                    onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                                    className="bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                >
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-sm font-medium text-gray-900">
                                            {task.title}
                                        </h3>
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]
                                                }`}
                                        >
                                            {task.priority}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                                        {task.description}
                                    </p>
                                    <div className="mt-2 text-xs text-gray-500">
                                        Due: {new Date(task.due_date).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Done Column */}
                <div
                    className="space-y-4"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'DONE')}
                >
                    <div className="bg-green-50 px-4 py-2 rounded-t-lg border-b">
                        <h2 className="text-lg font-medium text-gray-900">Done</h2>
                    </div>
                    <div className="space-y-3">
                        {project.tasks
                            .filter((task) => task.status === 'DONE')
                            .map((task) => (
                                <div
                                    key={task.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, task.id)}
                                    onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                                    className="bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                >
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-sm font-medium text-gray-900">
                                            {task.title}
                                        </h3>
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]
                                                }`}
                                        >
                                            {task.priority}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                                        {task.description}
                                    </p>
                                    <div className="mt-2 text-xs text-gray-500">
                                        Due: {new Date(task.due_date).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
} 