import { cn } from '../../lib/utils';

export function Select({ label, error, className, options, ...props }: any) {
    return (
        <div className="space-y-2">
            {label && (
                <label className="text-sm font-medium text-slate-700">
                    {label}
                </label>
            )}
            <select
                className={cn(
                    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50",
                    error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                    className
                )}
                {...props}
            >
                <option value="">Chọn một giá trị</option>
                {options.map((opt: any) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="text-xs text-red-500">{error}</p>
            )}
        </div>
    );
}
