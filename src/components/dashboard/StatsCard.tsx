import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string;
    change: number;
    icon: LucideIcon;
    color: string;
}

export default function StatsCard({
    title,
    value,
    change,
    icon: Icon,
    color,
}: StatsCardProps) {
    return (
        <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-600">
                        {title}
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">
                        {value}
                    </p>
                    <p
                        className={`text-sm mt-2 ${
                            change >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                    >
                        {change >= 0 ? "↑" : "↓"} {Math.abs(change)}% from last
                        week
                    </p>
                </div>
                <div
                    className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}
                >
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );
}
