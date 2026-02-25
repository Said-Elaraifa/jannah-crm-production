import { TrendingUp, TrendingDown } from 'lucide-react';

export function DashboardStatCard({ kpi }) {
    const isUp = kpi.trend === 'up';
    return (
        <div className="bg-white dark:bg-surface-dark/40 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm hover:border-slate-300 dark:hover:border-white/20 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden animate-fade-in-up">
            <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500 ${kpi.color}`}>
                {kpi.icon && <kpi.icon size={100} />}
            </div>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${kpi.bg_color} border-white/10 ${kpi.color} shadow-lg shadow-black/5`}>
                        {kpi.icon ? <kpi.icon size={28} strokeWidth={2.5} /> : (isUp ? <TrendingUp size={28} strokeWidth={2.5} /> : <TrendingDown size={28} strokeWidth={2.5} />)}
                    </div>
                    <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${isUp ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        {isUp ? <TrendingUp size={12} strokeWidth={3} /> : <TrendingDown size={12} strokeWidth={3} />}
                        <span>{kpi.change}</span>
                    </div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 ml-1">{kpi.label}</p>
                <p className="text-3xl md:text-4xl font-display font-black text-slate-900 dark:text-white tracking-tight">{kpi.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-medium opacity-80">vs mois dernier</p>
            </div>
        </div>
    );
}
