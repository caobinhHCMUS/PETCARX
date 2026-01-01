import { cn } from '../../lib/utils';

export function Table({ className, ...props }: any) {
    return (
        <div className="w-full overflow-auto rounded-lg border border-slate-200">
            <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
        </div>
    );
}

export function TableHeader({ className, ...props }: any) {
    return <thead className={cn("[&_tr]:border-b bg-slate-50", className)} {...props} />;
}

export function TableBody({ className, ...props }: any) {
    return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

export function TableRow({ className, ...props }: any) {
    return (
        <tr
            className={cn(
                "border-b transition-colors hover:bg-slate-50/50 data-[state=selected]:bg-slate-50",
                className
            )}
            {...props}
        />
    );
}

export function TableHead({ className, ...props }: any) {
    return (
        <th
            className={cn(
                "h-10 px-4 text-left align-middle font-medium text-slate-500 [&:has([role=checkbox])]:pr-0",
                className
            )}
            {...props}
        />
    );
}

export function TableCell({ className, ...props }: any) {
    return (
        <td
            className={cn(
                "p-4 align-middle [&:has([role=checkbox])]:pr-0 text-slate-700",
                className
            )}
            {...props}
        />
    );
}
