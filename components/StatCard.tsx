import { LucideIcon } from "lucide-react";

type StatCardProps = {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color?: string;
};

export default function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
    return (
        <div className="rounded-2xl border border-gray-200 shadow-sm p-5 bg-white">
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <span className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-white ${color ?? "bg-indigo-500"}`}>
                    <Icon className="w-5 h-5" />
                </span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900">{value ?? "-"}</h3>
        </div>
    );
}
