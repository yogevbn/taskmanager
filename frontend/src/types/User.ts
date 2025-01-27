export interface User {
    id: number;
    email: string;
    full_name: string;
    role: "USER" | "ADMIN";
    is_active: boolean;
} 