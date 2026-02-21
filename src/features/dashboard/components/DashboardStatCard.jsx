import { TrendingUp, TrendingDown } from 'lucide-react';

export function DashboardStatCard({ kpi }) {
    const isUp = kpi.trend === 'up';
    return (
        <div className="bg-surface-dark/40 backdrop-blur-xl rounded-xl border border-slate-200 dark:border-white/10 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-slate-300 dark:hover:border-white/20 hover:-translate-y-1 transition-all duration-300 animate-fade-in-up">
            <div className="flex justify-between items-start mb-2.5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{kpi.label}</h3>
                <div className={`p-1 rounded-lg ${kpi.bg_color} ${kpi.color}`}>
                    {kpi.icon ? <kpi.icon size={14} /> : (isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />)}
                </div>
            </div>
            <div className="mb-1.5">
                <span className="text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight">{kpi.value}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
                <span className={`${kpi.color} font-bold px-2 py-0.5 rounded-full ${kpi.bg_color}`}>{kpi.change}</span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">vs mois dernier</span>
            </div>
        </div>
    );
}
