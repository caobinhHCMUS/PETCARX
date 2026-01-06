import { cn } from '../../lib/utils';
import { Button } from './Button';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, className }: any) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div
                className={cn(
                    "relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200",
                    className
                )}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 text-slate-500">
                        <X className="w-5 h-5" />
                    </Button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
}
