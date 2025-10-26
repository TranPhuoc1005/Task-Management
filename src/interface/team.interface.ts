export interface Team {
    id: string;
    name: string;
    color: string;
}

export interface TeamMember {
    id: string;
    team_id: string;
    user_id: string;
    role: "team_lead" | "member";
    team?: Team;
}