import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { userId, role } = body;

        if (!userId || !role) {
            return NextResponse.json(
                { error: "userId and role are required" },
                { status: 400 }
            );
        }

        const supabase = await createServerSupabaseClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Cannot change your own role
        if (user.id === userId) {
            return NextResponse.json(
                { error: "You cannot change your own role" },
                { status: 400 }
            );
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

        const { data, error } = await supabase
            .from("profiles")
            .update({ role })
            .eq("id", userId)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}