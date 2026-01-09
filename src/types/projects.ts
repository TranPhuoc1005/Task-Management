export type ProjectType = 'web_development' | 'mobile_app' | 'design' | 'infrastructure' | 'data_science' | 'other';
export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type ProjectMemberRole = 'project_manager' | 'tech_lead' | 'developer' | 'designer' | 'qa_tester' | 'devops' | 'business_analyst';

export interface Project {
    id: string;
    name: string;
    description?: string;
    project_type: ProjectType;
    status: ProjectStatus;
    
    technologies?: string[];
    programming_languages?: string[];
    
    start_date?: string;
    deadline?: string;
    actual_completion_date?: string;
    
    budget?: number;
    currency: string;
    
    project_manager_id?: string;
    client_name?: string;
    client_email?: string;
    
    priority: 'low' | 'medium' | 'high' | 'critical';
    progress: number;
    color: string;
    
    created_by?: string;
    created_at: string;
    updated_at: string;
    
    // Relations
    project_manager?: {
        id: string;
        full_name: string;
        email: string;
    };
    members?: ProjectMember[];
    tasks_count?: number;
}

export interface ProjectMember {
    id: string;
    project_id: string;
    user_id: string;
    role: ProjectMemberRole;
    hourly_rate?: number;
    allocated_hours?: number;
    joined_at: string;
    
    // Relations
    profile?: {
        id: string;
        full_name: string;
        email: string;
        avatar_url?: string;
    };
}