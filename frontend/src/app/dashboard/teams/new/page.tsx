'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { teamsApi } from '@/services/teams';

export default function NewTeamPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const createTeamMutation = useMutation({
        mutationFn: () => teamsApi.createTeam({ name }),
        onSuccess: () => {
            router.replace('/dashboard/teams');
        },
        onError: (error: any) => {
            setErrorMessage(error.response?.data?.detail || 'Failed to create team');
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setErrorMessage('Team name is required');
            return;
        }
        await createTeamMutation.mutateAsync();
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-black">Create New Team</h1>
                    <p className="mt-1 text-sm font-medium text-black">
                        Get started by entering your team name below.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {errorMessage && (
                        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                            <span className="block sm:inline font-medium">{errorMessage}</span>
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-semibold text-black"
                        >
                            Team Name
                        </label>
                        <div className="mt-1">
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-black bg-white placeholder-gray-600 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm font-medium"
                                placeholder="Enter team name"
                                disabled={createTeamMutation.isPending}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-4 py-2 text-sm font-medium text-black hover:text-gray-800"
                            disabled={createTeamMutation.isPending}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            disabled={createTeamMutation.isPending}
                        >
                            {createTeamMutation.isPending ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating...
                                </span>
                            ) : (
                                'Create Team'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 