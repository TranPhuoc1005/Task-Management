import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
    try {
        const supabase = await createServerSupabaseClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data, error } = await supabase
            .from("team_members")
            .select(`
                id,
                team_id,
                user_id,
                role,
                team:team_id (
                    id,
                    name,
                    color
                )
            `);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/team-members
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, teamId, role = "member" } = body;

        if (!userId || !teamId) {
            return NextResponse.json(
                { error: "userId and teamId are required" },
                { status: 400 }
            );
        }

        const supabase = await createServerSupabaseClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check role
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!profile || (profile.role !== "admin" && profile.role !== "manager")) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Check if already exists
        const { data: existing } = await supabase
            .from("team_members")
            .select("id")
            .eq("user_id", userId)
            .eq("team_id", teamId)
            .single();

        if (existing) {
            return NextResponse.json(
                { error: "User is already in this team" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("team_members")
            .insert({
                user_id: userId,
                team_id: teamId,
                role,
            })
            .select(`
                id,
                team_id,
                user_id,
                role,
                team:team_id (
                    id,
                    name,
                    color
                )
            `)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/team-members?id=xxx
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const membershipId = searchParams.get("id");

        if (!membershipId) {
            return NextResponse.json(
                { error: "Membership ID is required" },
                { status: 400 }
            );
        }

        const supabase = await createServerSupabaseClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check role
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!profile || (profile.role !== "admin" && profile.role !== "manager")) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { error } = await supabase
            .from("team_members")
            .delete()
            .eq("id", membershipId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ message: "Team member removed successfully" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}