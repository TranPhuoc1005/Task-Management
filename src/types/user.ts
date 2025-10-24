export interface UserProfile {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    role: string | null;
    department: string | null;
    phone: string | null;
    created_at: string | null;
    updated_at: string | null;
}