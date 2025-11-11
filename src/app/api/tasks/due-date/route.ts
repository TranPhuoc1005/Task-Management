import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { id, due_date } = body;

        if (!id || !due_date) {
            return NextResponse.json(
                { error: "Task ID and due_date are required" },
                { status: 400 }
            );
        }

        const supabase = await createServerSupabaseClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data, error } = await supabase
            .from("tasks")
            .update({
                due_date,
                updated_at: new Date().toISOString()
            })
            .eq("id", id)
            .select(`
                *,
                profiles:user_id (
                    id,
                    email,
                    full_name,
                    department
                )
            `)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ data });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}