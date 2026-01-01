import { cn } from '../../lib/utils';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: any;
    trend?: string;
    trendUp?: boolean;
    className?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, trendUp, className }: StatsCardProps) {
    return (
        <div className={cn("bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4", className)}>
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
                {trend && (
                    <p className={cn("text-xs font-medium mt-1", trendUp ? "text-green-600" : "text-red-500")}>
                        {trend}
                    </p>
                )}
            </div>
        </div>
    );
}
