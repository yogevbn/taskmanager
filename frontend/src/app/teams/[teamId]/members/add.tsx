'use client';

import { useMutation } from '@tanstack/react-query';
import { teamApi } from '@/services/team';

export function AddTeamMember({ teamId }: { teamId: number }) {
    const addMemberMutation = useMutation({
        mutationFn: (userId: number) => teamApi.addTeamMember(teamId, userId),
        onError: (error) => {
            console.error('Failed to add member:', error);
        },
    });

    const handleAddMember = (userId: number) => {
        addMemberMutation.mutate(userId);
    };

    return (
        // Your component JSX
    );
} 