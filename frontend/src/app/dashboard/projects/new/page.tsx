'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { projectsApi } from '@/services/projects';
import { teamsApi } from '@/services/teams';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface ProjectForm {
    name: string;
    team_id: string;
}

export default function NewProjectPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<ProjectForm>({
        name: '',
        team_id: '',
    });

    const { data: teams, isLoading: teamsLoading } = useQuery({
        queryKey: ['teams'],
        queryFn: teamsApi.getTeams,
    });

    const createProjectMutation = useMutation({
        mutationFn: (data: { name: string; team_id?: number }) =>
            projectsApi.createProject(data),
        onSuccess: (data) => {
            router.push(`/dashboard/projects/${data.id}`);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createProjectMutation.mutate({
            name: formData.name,
            team_id: formData.team_id ? parseInt(formData.team_id) : undefined,
        });
    };

    if (teamsLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Create New Project</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Get started by filling in the information below to create your new project.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {createProjectMutation.isError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                            {(createProjectMutation.error as Error)?.message ||
                                'Failed to create project'}
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Project Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Enter project name"
                            disabled={createProjectMutation.isPending}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="team"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Team (Optional)
                        </label>
                        <select
                            id="team"
                            name="team"
                            value={formData.team_id}
                            onChange={(e) =>
                                setFormData({ ...formData, team_id: e.target.value })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            disabled={createProjectMutation.isPending}
                        >
                            <option value="">No team</option>
                            {teams?.map((team) => (
                                <option key={team.id} value={team.id}>
                                    {team.name}
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-sm text-gray-500">
                            Select a team if you want to collaborate with others.
                        </p>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                            disabled={createProjectMutation.isPending}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            disabled={createProjectMutation.isPending}
                        >
                            {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 