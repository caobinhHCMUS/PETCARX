import { cn } from '../../lib/utils';

export function Button({ className, variant = 'primary', size = 'md', children, ...props }: any) {
    const variants: any = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20',
        secondary: 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50',
        outline: 'bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-50',
        ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
        danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20',
    };

    const sizes: any = {
        sm: 'h-9 px-3 text-xs',
        md: 'h-11 px-6 text-sm',
        lg: 'h-13 px-8 text-base font-semibold',
    };

    return (
        <button
            className={cn(
                'inline-flex items-center justify-center rounded-xl transition-all active:scale-95 disabled:opacity-50',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
