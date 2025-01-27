import { User } from './User';

export interface Team {
    id: number;
    name: string;
    created_at: string;
    created_by: number;
    members: User[];
} 