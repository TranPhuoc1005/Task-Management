export interface User {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    department: string | null;
    avatar_url: string | null;
    created_at: string;
}