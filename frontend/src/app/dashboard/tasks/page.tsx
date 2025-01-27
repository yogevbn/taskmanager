'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { tasksApi } from '@/services/tasks';
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Task, Project } from '@/types';
import { projectsApi } from '@/services/projects';

type TaskFilters = {
    status: 'ALL' | 'TODO' | 'IN_PROGRESS' | 'DONE';
    priority: 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH';
    assignee: 'ALL' | 'ME';
    sortBy: 'due_date' | 'priority' | 'status';
    sortOrder: 'asc' | 'desc';
};

export default function DashboardTasksPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [filters, setFilters] = useState<TaskFilters>({
        status: 'ALL',
        priority: 'ALL',
        assignee: 'ALL',
        sortBy: 'due_date',
        sortOrder: 'asc',
    });
    const [selectedProject, setSelectedProject] = useState<string>('all');

    const { data: projects } = useQuery({
        queryKey: ['projects'],
        queryFn: projectsApi.getProjects,
    });

    const { data: tasks, isLoading, error } = useQuery({
        queryKey: ['tasks'],
        queryFn: tasksApi.getTasks,
    });

    if (isLoading) return <div className="p-4">Loading tasks...</div>;
    if (error) return <div className="p-4 text-red-600">Failed to load tasks</div>;

    const filteredTasks = selectedProject === 'all'
        ? tasks
        : tasks?.filter((task: Task) => task.project_id.toString() === selectedProject);

    const handleTaskClick = (id: number) => {
        router.push(`/dashboard/tasks/${id}`);
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">My Tasks</h2>
                <div className="flex gap-4 items-center">
                    <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="form-select text-sm"
                    >
                        <option value="all">All Projects</option>
                        {projects?.map((project: Project) => (
                            <option key={project.id} value={project.id.toString()}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                    <Link href="/tasks/new" className="btn-primary text-sm">
                        Add Task
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredTasks?.map((task: Task) => (
                                <tr
                                    key={task.id}
                                    onClick={() => handleTaskClick(task.id)}
                                    className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                                >
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        <span className="text-blue-600 hover:text-blue-800">
                                            {task.title}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        {projects?.find(p => p.id === task.project_id)?.name || '-'}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                                            ${task.status === 'TODO' ? 'bg-gray-100 text-gray-800' :
                                                task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-green-100 text-green-800'}`}>
                                            {task.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                                            ${task.priority === 'LOW' ? 'bg-gray-100 text-gray-800' :
                                                task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'}`}>
                                            {task.priority}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                                        {new Date(task.due_date).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
} 