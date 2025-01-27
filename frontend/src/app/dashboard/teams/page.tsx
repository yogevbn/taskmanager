'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Team, User } from '@/types';
import { teamsApi } from '@/services/teams';

export default function TeamsPage() {
    const queryClient = useQueryClient();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newTeam, setNewTeam] = useState({ name: '' });
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [newMemberId, setNewMemberId] = useState('');

    // Queries
    const { data: teams, isLoading, error } = useQuery<Team[]>({
        queryKey: ['teams'],
        queryFn: teamsApi.getTeams,
    });

    const { data: availableUsers } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await api.get('/users');
            return response.data;
        },
    });

    // Mutations
    const createTeamMutation = useMutation({
        mutationFn: (name: string) => teamsApi.createTeam(name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            setIsCreateModalOpen(false);
            setNewTeam({ name: '' });
        },
    });

    const addMemberMutation = useMutation({
        mutationFn: ({ teamId, userId }: { teamId: number; userId: number }) =>
            teamsApi.addMember(teamId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            setIsAddMemberModalOpen(false);
            setNewMemberId('');
        },
    });

    const removeMemberMutation = useMutation({
        mutationFn: ({ teamId, userId }: { teamId: number; userId: number }) =>
            teamsApi.removeMember(teamId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
        },
    });

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        createTeamMutation.mutate(newTeam.name);
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTeam) return;

        addMemberMutation.mutate({
            teamId: selectedTeam.id,
            userId: parseInt(newMemberId),
        });
    };

    const handleRemoveMember = async (teamId: number, userId: number) => {
        removeMemberMutation.mutate({ teamId, userId });
    };

    if (isLoading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">Teams</h1>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                    Create Team
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    {error.message}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {teams?.map((team) => (
                    <div key={team.id} className="bg-white shadow rounded-lg p-6">
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-medium text-gray-900">{team.name}</h3>
                            <button
                                onClick={() => {
                                    setSelectedTeam(team);
                                    setIsAddMemberModalOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                                Add Member
                            </button>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                            Created: {new Date(team.created_at).toLocaleDateString()}
                        </p>
                        <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-900">Members</h4>
                            <ul className="mt-2 divide-y divide-gray-200">
                                {team.members.map((member) => (
                                    <li key={member.id} className="py-2 flex justify-between items-center">
                                        <span className="text-sm text-gray-500">{member.full_name}</span>
                                        <button
                                            onClick={() => handleRemoveMember(team.id, member.id)}
                                            className="text-red-600 hover:text-red-700 text-sm"
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Team Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-xl font-semibold mb-4">Create New Team</h2>
                        <form onSubmit={handleCreateTeam}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Team Name
                                </label>
                                <input
                                    type="text"
                                    value={newTeam.name}
                                    onChange={(e) => setNewTeam({ name: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Member Modal */}
            {isAddMemberModalOpen && selectedTeam && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-xl font-semibold mb-4">
                            Add Member to {selectedTeam.name}
                        </h2>
                        <form onSubmit={handleAddMember}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Select User
                                </label>
                                <select
                                    value={newMemberId}
                                    onChange={(e) => setNewMemberId(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select a user</option>
                                    {availableUsers
                                        .filter(
                                            (user) =>
                                                !selectedTeam.members.some((member) => member.id === user.id)
                                        )
                                        .map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.full_name}
                                            </option>
                                        ))}
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddMemberModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                >
                                    Add Member
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
} 