"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function TaskTrendsChart() {
    const { data, isLoading } = useQuery({
        queryKey: ["dashboard", "trends"],
        queryFn: async () => {
            const days = 7;
            const trends = [];

            for (let i = days - 1; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split("T")[0];

                const { data: created, error: createdError } = await supabase
                    .from("tasks")
                    .select("id", { count: "exact", head: true })
                    .gte("created_at", `${dateStr}T00:00:00`)
                    .lt("created_at", `${dateStr}T23:59:59`);

                const { data: completed, error: completedError } = await supabase
                    .from("tasks")
                    .select("id", { count: "exact", head: true })
                    .eq("status", "done")
                    .gte("updated_at", `${dateStr}T00:00:00`)
                    .lt("updated_at", `${dateStr}T23:59:59`);

                if (!createdError && !completedError) {
                    trends.push({
                        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                        created: created || 0,
                        completed: completed || 0,
                    });
                }
            }

            return trends;
        },
        refetchInterval: 60 * 1000, // Refresh mỗi 1 phút
    });

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-center h-80">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Task Trends (Last 7 Days)</h2>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "#e2e8f0" }} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "#e2e8f0" }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="created"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Created"
                        dot={{ fill: "#3b82f6", r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="completed"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Completed"
                        dot={{ fill: "#10b981", r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
