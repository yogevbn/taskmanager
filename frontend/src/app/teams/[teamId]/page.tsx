'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teamApi } from '@/services/team';

export default function TeamPage({ params }: { params: { teamId: string } }) {
    const [userId, setUserId] = useState('');
    const [error, setError] = useState('');
    const queryClient = useQueryClient();
    const teamId = parseInt(params.teamId);

    const addMemberMutation = useMutation({
        mutationFn: (newUserId: number) => teamApi.addTeamMember(teamId, newUserId),
        onSuccess: () => {
            setUserId('');
            queryClient.invalidateQueries(['team', teamId]);
        },
        onError: (error: any) => {
            setError(error.message || 'Failed to add member');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const userIdNum = parseInt(userId);
        if (!userIdNum) {
            setError('Please enter a valid user ID');
            return;
        }

        addMemberMutation.mutate(userIdNum);
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Add Team Member</h2>
            <form onSubmit={handleSubmit} className="max-w-md">
                {error && (
                    <div className="mb-4 text-red-600">{error}</div>
                )}
                <div className="mb-4">
                    <label htmlFor="userId" className="block mb-2">
                        User ID
                    </label>
                    <input
                        id="userId"
                        type="number"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="form-input"
                        placeholder="Enter user ID"
                        disabled={addMemberMutation.isPending}
                    />
                </div>
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={addMemberMutation.isPending}
                >
                    {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
                </button>
            </form>
        </div>
    );
} 