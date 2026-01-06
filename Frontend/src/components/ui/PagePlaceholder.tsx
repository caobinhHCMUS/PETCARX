

export function PagePlaceholder({ title }: { title: string }) {
    return (
        <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
            <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
                <p className="text-slate-500">This page is under construction.</p>
            </div>
        </div>
    );
}
