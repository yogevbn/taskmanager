'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { projectsApi } from '@/services/projects';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Project } from '@/types';

type ProjectFilters = {
    sortBy: 'name' | 'created_at' | 'tasks';
    sortOrder: 'asc' | 'desc';
    search: string;
};

export default function ProjectsPage() {
    const router = useRouter();
    const [filters, setFilters] = useState<ProjectFilters>({
        sortBy: 'created_at',
        sortOrder: 'desc',
        search: '',
    });

    const { data: projects, isLoading } = useQuery({
        queryKey: ['projects', 'all'],
        queryFn: projectsApi.getProjects,
    });

    if (isLoading) {
        return <LoadingSpinner />;
    }

    const filteredProjects = (projects || [])
        .filter((project) =>
            project.name.toLowerCase().includes(filters.search.toLowerCase())
        )
        .sort((a: Project, b: Project) => {
            const order = filters.sortOrder === 'asc' ? 1 : -1;
            switch (filters.sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name) * order;
                case 'created_at':
                    return (
                        (new Date(a.created_at).getTime() -
                            new Date(b.created_at).getTime()) *
                        order
                    );
                case 'tasks':
                    return (a.tasks.length - b.tasks.length) * order;
                default:
                    return 0;
            }
        });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
                <Link
                    href="/dashboard/projects/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                    New Project
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={filters.search}
                        onChange={(e) =>
                            setFilters({ ...filters, search: e.target.value })
                        }
                        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />

                    <select
                        value={filters.sortBy}
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                sortBy: e.target.value as ProjectFilters['sortBy'],
                            })
                        }
                        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="created_at">Sort by Date</option>
                        <option value="name">Sort by Name</option>
                        <option value="tasks">Sort by Tasks</option>
                    </select>

                    <select
                        value={filters.sortOrder}
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                sortOrder: e.target.value as ProjectFilters['sortOrder'],
                            })
                        }
                        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                    </select>
                </div>
            </div>

            {/* Project List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {filteredProjects.map((project) => (
                        <li
                            key={project.id}
                            onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                            className="hover:bg-gray-50 cursor-pointer"
                        >
                            <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-gray-900 truncate">
                                            {project.name}
                                        </h3>
                                        <div className="mt-2 flex items-center text-sm text-gray-500">
                                            <span className="truncate">
                                                Created: {new Date(project.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-500">Tasks:</span>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {project.tasks.length}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-500">Done:</span>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {project.tasks.filter((task) => task.status === 'DONE').length}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
} 