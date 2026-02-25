import { TrendingUp, TrendingDown } from 'lucide-react';

export function StatCard({ kpi }) {
    const isUp = kpi.trend === 'up';
    return (
        <div className="bg-white dark:bg-surface-dark/40 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm hover:border-slate-300 dark:hover:border-white/20 hover:-translate-y-1 transition-all duration-300 group animate-fade-in-up">
            <div className="flex justify-between items-start mb-2.5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 leading-tight">{kpi.label}</h3>
                <div className={`p-1 rounded-lg ${kpi.bgColor} ${kpi.color}`}>
                    {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                </div>
            </div>
            <div className="mb-1.5">
                <span className="text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight">{kpi.value}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
                {kpi.change && <span className={`${kpi.color} font-bold px-1.5 py-0.5 rounded ${kpi.bgColor}`}>{kpi.change}</span>}
                <span className="text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">vs mois dernier</span>
            </div>
        </div>
    );
}
