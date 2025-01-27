'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { projectsApi } from '@/services/projects';
import { tasksApi } from '@/services/tasks';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuthStore } from '@/stores/authStore';

export default function DashboardPage() {
    const { user } = useAuthStore();

    const {
        data: projects,
        isLoading: projectsLoading,
        error: projectsError
    } = useQuery({
        queryKey: ['projects', 'recent'],
        queryFn: () => projectsApi.getProjects()
    });

    const {
        data: tasks,
        isLoading: tasksLoading,
        error: tasksError
    } = useQuery({
        queryKey: ['tasks', 'recent'],
        queryFn: () => tasksApi.getTasks()
    });

    if (projectsLoading || tasksLoading) {
        return <LoadingSpinner />;
    }

    if (projectsError) {
        return (
            <div className="text-red-600 p-4">
                Error loading projects: {(projectsError as Error).message}
            </div>
        );
    }

    if (tasksError) {
        return (
            <div className="text-red-600 p-4">
                Error loading tasks: {(tasksError as Error).message}
            </div>
        );
    }

    const recentProjects = projects?.slice(0, 5) || [];
    const recentTasks = tasks?.slice(0, 5) || [];
    const myTasks = tasks?.filter((task) => task.assigned_to === user?.id) || [];
    const urgentTasks = myTasks.filter(
        (task) => task.priority === 'HIGH' && task.status !== 'DONE'
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Welcome, {user?.full_name}
                </h1>
                <div className="flex space-x-4">
                    <Link
                        href="/dashboard/projects/new"
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        New Project
                    </Link>
                    <Link
                        href="/dashboard/tasks/new"
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                        New Task
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Projects */}
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-gray-900">Recent Projects</h2>
                        <Link
                            href="/dashboard/projects"
                            className="text-sm text-blue-600 hover:text-blue-500"
                        >
                            View all
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentProjects.map((project) => (
                            <Link
                                key={project.id}
                                href={`/dashboard/projects/${project.id}`}
                                className="block border-b border-gray-200 pb-3 last:border-0 hover:bg-gray-50"
                            >
                                <h3 className="text-sm font-medium text-gray-900">
                                    {project.name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {project.tasks.length} tasks
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* My Tasks */}
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-gray-900">My Tasks</h2>
                        <Link
                            href="/dashboard/tasks"
                            className="text-sm text-blue-600 hover:text-blue-500"
                        >
                            View all
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {myTasks.slice(0, 5).map((task) => (
                            <div
                                key={task.id}
                                className="border-b border-gray-200 pb-3 last:border-0"
                            >
                                <h3 className="text-sm font-medium text-gray-900">
                                    {task.title}
                                </h3>
                                <div className="flex justify-between items-center mt-1">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${{
                                            LOW: 'bg-green-100 text-green-800',
                                            MEDIUM: 'bg-yellow-100 text-yellow-800',
                                            HIGH: 'bg-red-100 text-red-800',
                                        }[task.priority]
                                            }`}
                                    >
                                        {task.priority}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        Due: {new Date(task.due_date).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Urgent Tasks */}
                {urgentTasks.length > 0 && (
                    <div className="bg-red-50 shadow rounded-lg p-6 md:col-span-2">
                        <h2 className="text-lg font-medium text-red-900 mb-4">
                            Urgent Tasks ({urgentTasks.length})
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {urgentTasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="bg-white shadow rounded-lg p-4 border-l-4 border-red-500"
                                >
                                    <h3 className="text-sm font-medium text-gray-900">
                                        {task.title}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                                        {task.description}
                                    </p>
                                    <p className="mt-2 text-sm text-red-600">
                                        Due: {new Date(task.due_date).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}