export function Badge({ children, color = 'primary' }) {
    const colors = {
        primary: 'bg-primary/20 text-green-400 border-primary/30',
        accent: 'bg-accent/20 text-accent border-accent/30',
        secondary: 'bg-secondary/20 text-secondary border-secondary/30',
        blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        red: 'bg-red-500/20 text-red-400 border-red-500/30',
        slate: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
        purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${colors[color] || colors.primary}`}>
            {children}
        </span>
    );
}
