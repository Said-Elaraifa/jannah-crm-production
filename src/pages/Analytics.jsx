import { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    Calculator, Link as LinkIcon, CheckSquare, BarChart2,
    ExternalLink, PieChart, Target, MousePointer, DollarSign, Sparkles
} from 'lucide-react';
import { getAdsKpis, getAdsCampaigns } from '../services/supabase';

// Modular Components
import { TabButton, AnalyticsStatCard } from '../features/analytics/components/AnalyticsHelpers';
import { ROASCalculator } from '../features/analytics/components/ROASCalculator';
import { ROIPredictor } from '../features/analytics/components/ROIPredictor';
import { UTMBuilder } from '../features/analytics/components/UTMBuilder';
import { NamingConventionBuilder } from '../features/analytics/components/NamingConventionBuilder';
import { Checklists } from '../features/analytics/components/Checklists';

const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'calculators', label: 'Simulateurs', icon: Calculator },
    { id: 'prediction', label: 'Intelligence ROI', icon: Sparkles },
    { id: 'tracking', label: 'Tracking & UTMs', icon: LinkIcon },
    { id: 'checklists', label: 'Process & QA', icon: CheckSquare },
];

export default function Analytics() {
    const [activeTab, setActiveTab] = useState('dashboard');

    // Data States
    const [adsKpis, setAdsKpis] = useState([]);
    const [campaigns, setCampaigns] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            const [kpis, camps] = await Promise.all([
                getAdsKpis(),
                getAdsCampaigns()
            ]);
            setAdsKpis(kpis);
            setCampaigns(camps);
        };
        loadData();
    }, []);

    const chartData = campaigns.map(c => ({
        name: c.name.substring(0, 10),
        leads: c.leads,
        spend: parseFloat(c.spend.replace(/[^0-9.]/g, ''))
    }));

    return (
        <div className="w-full space-y-8 pb-10 animate-fade-in">
            {/* Header Area */}
            <div className="relative mb-4 z-10 w-full">
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-accent/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none -translate-y-1/2 animate-pulse-glow" />
                <div className="flex flex-col gap-6 relative z-10 w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest text-accent mb-4 shadow-[0_0_15px_rgba(238,180,23,0.2)]">
                                <BarChart2 size={12} className="animate-pulse" /> Data Center
                            </div>
                            <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight mb-2 text-slate-900 dark:text-white flex flex-wrap items-center gap-4">
                                Analytics &amp; <span className="text-accent underline decoration-accent/30 underline-offset-8">Ads</span>
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-sm md:text-lg leading-relaxed font-medium">
                                Votre centre de commande personnel. Gérez vos budgets et optimisez vos performances publicitaires.
                            </p>
                        </div>
                    </div>
                    {/* Tabs — full-width on mobile with horizontal scroll */}
                    <div className="w-full overflow-x-auto pb-1 -mx-1 px-1">
                        <div className="flex bg-white/50 dark:bg-surface-dark/40 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 p-1 shadow-sm w-max md:w-full min-w-full">
                            {TABS.map(tab => (
                                <TabButton key={tab.id} {...tab} active={activeTab === tab.id} onClick={setActiveTab} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>


            {/* Content Switcher */}
            {activeTab === 'dashboard' && (
                <div className="space-y-8 animate-fade-in-up">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {adsKpis.map((kpi, index) => (
                            <AnalyticsStatCard
                                key={index}
                                label={kpi.label}
                                value={kpi.value}
                                trend={kpi.trend}
                                icon={index === 0 ? DollarSign : index === 1 ? Target : index === 2 ? PieChart : MousePointer}
                                color={kpi.color}
                                bgColor={kpi.bg_color}
                            />
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white dark:bg-surface-dark/40 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-accent/20 transition-all duration-700" />
                            <div className="flex items-center justify-between mb-10 relative z-10">
                                <div>
                                    <h3 className="text-xl font-display font-black text-slate-900 dark:text-white tracking-tight">Performance Campagnes</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Lead Generation vs Dépenses</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                                        <span className="text-[10px] font-black uppercase text-slate-400">Leads</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-accent shadow-[0_0_10px_rgba(238,180,23,0.4)]" />
                                        <span className="text-[10px] font-black uppercase text-slate-400">Spend</span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-[320px] w-full relative z-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#eeb417" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#eeb417" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="rgba(148, 163, 184, 0.08)" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                                            dy={15}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                                        />
                                        <Tooltip
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
                                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">{label}</p>
                                                            <div className="space-y-2">
                                                                {payload.map((entry, index) => (
                                                                    <div key={index} className="flex items-center justify-between gap-8">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                                                            <span className="text-xs font-black uppercase text-white/60 tracking-wider font-display">{entry.name}</span>
                                                                        </div>
                                                                        <span className="text-sm font-black text-white">{entry.value}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="leads"
                                            name="Retours"
                                            stroke="#34d399"
                                            strokeWidth={4}
                                            fillOpacity={1}
                                            fill="url(#colorLeads)"
                                            animationDuration={2000}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="spend"
                                            name="Investissement"
                                            stroke="#eeb417"
                                            strokeWidth={4}
                                            fillOpacity={1}
                                            fill="url(#colorSpend)"
                                            animationDuration={2500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-surface-dark/40 backdrop-blur-xl p-8 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col gap-4 relative overflow-hidden">
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 relative z-10">Liens Rapides</h3>
                            <a href="https://business.facebook.com" target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors group relative z-10 border border-slate-200 dark:border-white/10">
                                <span className="text-sm font-bold text-slate-900 dark:text-white">Meta Ads Manager</span>
                                <ExternalLink size={16} className="text-slate-400 group-hover:text-primary dark:group-hover:text-white" />
                            </a>
                            <a href="https://ads.google.com" target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors group relative z-10 border border-slate-200 dark:border-white/10">
                                <span className="text-sm font-bold text-slate-900 dark:text-white">Google Ads</span>
                                <ExternalLink size={16} className="text-slate-400 group-hover:text-primary dark:group-hover:text-white" />
                            </a>
                            <a href="https://analytics.google.com" target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors group relative z-10 border border-slate-200 dark:border-white/10">
                                <span className="text-sm font-bold text-slate-900 dark:text-white">GA 4</span>
                                <ExternalLink size={16} className="text-slate-400 group-hover:text-primary dark:group-hover:text-white" />
                            </a>
                            <div className="mt-auto p-5 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl border border-primary/20 relative z-10">
                                <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-2">Pro Tip</p>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-bold">Vérifiez vos exclusions d'audience tous les vendredis.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'calculators' && <ROASCalculator />}
            {activeTab === 'prediction' && <ROIPredictor />}

            {activeTab === 'tracking' && (
                <div className="space-y-8 animate-fade-in-up">
                    <UTMBuilder />
                    <NamingConventionBuilder />
                </div>
            )}

            {activeTab === 'checklists' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up">
                    <Checklists />
                    <div className="bg-white dark:bg-surface-dark/40 backdrop-blur-xl p-10 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm hover:border-slate-300 dark:hover:border-white/20 transition-all">
                        <h3 className="text-2xl font-display font-black tracking-tight text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                            <Sparkles size={24} className="text-yellow-400" /> Routine Quotidienne
                        </h3>
                        <ul className="space-y-4">
                            {[
                                "Vérifier les dépenses d'hier vs budget.",
                                "Analyser les coûts par résultat (CPA/CPL).",
                                "Vérifier les commentaires sous les ads.",
                                "Couper les adsets perdants (ROAS < 1.5).",
                                "Scaler les vainqueurs (+20% budget)."
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-4 text-sm md:text-base font-bold text-slate-700 dark:text-slate-300 p-5 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors border border-slate-200 dark:border-white/10 cursor-default">
                                    <div className="flex-shrink-0 w-3 h-3 rounded-full bg-yellow-400/20 border-2 border-yellow-400" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
