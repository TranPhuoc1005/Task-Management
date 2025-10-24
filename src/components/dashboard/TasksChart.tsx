"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface TasksChartData {
  color?: string;
  [key: string]: string | number | undefined;
}

interface TasksChartProps {
  title: string;
  data: TasksChartData[];
  dataKey: string;
  nameKey: string;
}

export default function TasksChart({ title, data, dataKey, nameKey }: TasksChartProps) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">{title}</h2>
            
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                        dataKey={nameKey} 
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis 
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <Tooltip 
                        contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                        cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                    />
                    <Bar dataKey={dataKey} radius={[8, 8, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color ?? "#3b82f6"} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-6 justify-center">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color ?? "#3b82f6" }}
                        />
                        <span className="text-sm text-slate-600">
                            {item[nameKey]}: <span className="font-semibold">{item[dataKey]}</span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}