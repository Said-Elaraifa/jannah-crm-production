import { TrendingUp, TrendingDown } from 'lucide-react';

export function StatCard({ kpi }) {
    const isUp = kpi.trend === 'up';
    return (
        <div className="bg-surface-dark p-4 rounded-xl border border-white/5 shadow-lg hover:border-primary/30 transition-all duration-300 group animate-fade-in-up">
            <div className="flex justify-between items-start mb-2.5">
                <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-tight">{kpi.label}</h3>
                <div className={`p-1 rounded-lg ${kpi.bgColor} ${kpi.color}`}>
                    {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                </div>
            </div>
            <div className="mb-1.5">
                <span className="text-2xl font-display font-bold text-white tracking-tight">{kpi.value}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
                <span className={`${kpi.color} font-bold px-1.5 py-0.5 rounded ${kpi.bgColor}`}>{kpi.change}</span>
                <span className="text-slate-500">vs mois dernier</span>
            </div>
        </div>
    );
}
