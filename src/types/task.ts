export interface Task {
    id: number;
    title: string;
    description?: string;
    status: "todo" | "in-progress" | "review" | "done";
    priority: "low" | "medium" | "high";
    assignee?: string;
    due_date?: string;
    tags?: string[];
    user_id?: string | null;
    created_by?: string;
    created_at: string;
    updated_at: string;
    
    profiles?: {
        id: string;
        email: string;
        full_name?: string;
        department?: string;
    } | null;
}

export interface Column {
    id: string;
    title: string;
    status: Task["status"];
    tasks: Task[];
}