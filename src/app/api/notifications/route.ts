import { createClient } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = createClient();

        // Lấy tasks sắp hết hạn (due soon)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const today = new Date().toISOString().split("T")[0];

        const { data: dueSoonTasks, error: dueSoonError } = await supabase
            .from("tasks")
            .select("*")
            .neq("status", "done")
            .gte("due_date", today)
            .lte("due_date", tomorrow.toISOString().split("T")[0])
            .order("due_date", { ascending: true });

        if (dueSoonError) throw dueSoonError;

        // Lấy activity gần đây (trong 1 giờ gần nhất)
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);

        const { data: activities, error: activitiesError } = await supabase
            .from("task_activities")
            .select(`
        *,
        task:tasks(*)
      `)
            .gte("created_at", oneHourAgo.toISOString())
            .order("created_at", { ascending: false });

        if (activitiesError) throw activitiesError;

        // Gom dữ liệu
        const result = {
            dueSoonTasks: dueSoonTasks || [],
            recentActivities: activities || [],
            totalNotifications:
                (dueSoonTasks?.length || 0) + (activities?.length || 0),
        };

        return NextResponse.json(result);
    } catch (error: unknown) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json(
            { error: "Unknown error occurred" },
            { status: 500 }
        );
    }
}
