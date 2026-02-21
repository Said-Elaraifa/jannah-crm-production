import { TrendingUp, TrendingDown } from 'lucide-react';

// eslint-disable-next-line no-unused-vars
export function TabButton({ id, label, icon: Icon, active, onClick }) {
    return (
        <button
            onClick={() => onClick(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${active
                ? 'bg-accent text-primary shadow-lg shadow-accent/20'
                : 'text-slate-500 hover:text-white'
                }`}
        >
            <Icon size={16} />
            {label}
        </button>
    );
}

// eslint-disable-next-line no-unused-vars
export function AnalyticsStatCard({ label, value, trend, subtext, icon: Icon, color = "text-primary", bgColor = "bg-primary/10" }) {
    const isUp = trend === 'up';
    return (
        <div className="bg-surface-dark p-4.5 rounded-xl border border-white/5 hover:border-white/10 transition-all group">
            <div className="flex justify-between items-start mb-3">
                <div className={`p-2 rounded-xl ${bgColor} ${color} group-hover:scale-110 transition-transform`}>
                    <Icon size={18} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${isUp ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        <span>{isUp ? '+' : ''}12%</span>
                    </div>
                )}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">{label}</p>
            <p className="text-xl md:text-2xl font-display font-bold text-white tracking-tight">{value}</p>
            {subtext && <p className="text-xs text-slate-400 mt-1.5 font-medium">{subtext}</p>}
        </div>
    );
}
