import { TrendingUp, TrendingDown } from 'lucide-react';

// eslint-disable-next-line no-unused-vars
export function TabButton({ id, label, icon: Icon, active, onClick }) {
    return (
        <button
            onClick={() => onClick(id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${active
                ? 'bg-slate-900 dark:bg-white text-white dark:text-bg-dark shadow-lg shadow-black/10 dark:shadow-white/10'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
        <div className="bg-white dark:bg-surface-dark/40 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm hover:border-slate-300 dark:hover:border-white/20 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
            <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500 ${color}`}>
                <Icon size={120} />
            </div>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bgColor} border-white/10 ${color} shadow-lg shadow-black/5`}>
                        <Icon size={28} strokeWidth={2.5} />
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${isUp ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                            {isUp ? <TrendingUp size={12} strokeWidth={3} /> : <TrendingDown size={12} strokeWidth={3} />}
                            <span>12.5%</span>
                        </div>
                    )}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 ml-1">{label}</p>
                <p className="text-3xl md:text-4xl font-display font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
                {subtext && <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-medium opacity-80">{subtext}</p>}
            </div>
        </div>
    );
}
