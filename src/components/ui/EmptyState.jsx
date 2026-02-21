// eslint-disable-next-line no-unused-vars
export function EmptyState({ icon: Icon, title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                <Icon size={28} className="text-slate-500" />
            </div>
            <h3 className="text-base md:text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-8 max-w-sm mx-auto">{description}</p>
            {action}
        </div>
    );
}
