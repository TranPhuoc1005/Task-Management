import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // 🔒 server-only
);

export async function GET() {
    const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: true });
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json(data);
}

export async function POST(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const status = searchParams.get("status");

    if (!id || !status) {
        return Response.json(
            { error: "Missing id or status" },
            { status: 400 }
        );
    }

    const { error } = await supabase
        .from("tasks")
        .update({ status })
        .eq("id", id);
    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ success: true });
}
