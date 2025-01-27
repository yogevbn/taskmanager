import { Task } from './index';
import { User } from './User';

interface TeamMember {
    id: number;
    email: string;
    full_name: string;
}

interface Team {
    id: number;
    name: string;
    members: TeamMember[];
}

export interface Project {
    id: number;
    name: string;
    team_id: number | null;
    created_at: string;
    manager_id: number;
    manager: User;
    team?: Team;
    tasks: Task[];
} 