'use client';

import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '@/services/projects';
import Link from 'next/link';

export default function ProjectsPage() {
    const { data: projects, isLoading, error } = useQuery({
        queryKey: ['projects'],
        queryFn: projectsApi.getProjects,
    });

    if (isLoading) {
        return <div className="p-6">Loading projects...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-600">Failed to load projects</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Projects</h1>
                <Link
                    href="/projects/new"
                    className="btn-primary"
                >
                    Create Project
                </Link>
            </div>

            {projects?.length === 0 ? (
                <p>No projects found. Create your first project!</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects?.map((project) => (
                        <Link
                            key={project.id}
                            href={`/projects/${project.id}`}
                            className="card p-4 hover:shadow-md transition-shadow"
                        >
                            <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
                            <p className="text-sm text-gray-600">
                                Tasks: {project.tasks?.length || 0}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                                Created: {new Date(project.created_at).toLocaleDateString()}
                            </p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
} 