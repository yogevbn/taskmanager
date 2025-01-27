'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectApi } from '@/services/project';
import Link from 'next/link';
import { Task, Project } from '@/types';

export default function TasksPage() {
    const [selectedProject, setSelectedProject] = useState<string>('all');

    const { data: projects } = useQuery({
        queryKey: ['projects'],
        queryFn: projectApi.getProjects,
    });

    const { data: tasks, isLoading, error } = useQuery({
        queryKey: ['tasks'],
        queryFn: async () => {
            const response = await fetch('/api/tasks');
            if (!response.ok) throw new Error('Failed to fetch tasks');
            return response.json();
        },
    });

    if (isLoading) return <div className="p-6">Loading tasks...</div>;
    if (error) return <div className="p-6 text-red-600">Failed to load tasks</div>;

    const filteredTasks = selectedProject === 'all'
        ? tasks
        : tasks?.filter((task: Task) => task.project_id.toString() === selectedProject);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Tasks</h1>
                <div className="flex gap-4 items-center">
                    <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="form-select"
                    >
                        <option value="all">All Projects</option>
                        {projects?.map((project: Project) => (
                            <option key={project.id} value={project.id.toString()}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                    <Link href="/tasks/new" className="btn-primary">
                        Create Task
                    </Link>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Project
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Priority
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Due Date
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTasks?.map((task: Task) => (
                            <tr key={task.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Link href={`/tasks/${task.id}`} className="text-blue-600 hover:underline">
                                        {task.title}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {projects?.find(p => p.id === task.project_id)?.name || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${task.status === 'TODO' ? 'bg-gray-100 text-gray-800' :
                                            task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                                'bg-green-100 text-green-800'}`}>
                                        {task.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${task.priority === 'LOW' ? 'bg-gray-100 text-gray-800' :
                                            task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'}`}>
                                        {task.priority}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(task.due_date).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
} 