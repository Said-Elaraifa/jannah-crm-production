import { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
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

Chart.register(...registerables);

const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'calculators', label: 'Simulateurs', icon: Calculator },
    { id: 'prediction', label: 'Intelligence ROI', icon: Sparkles },
    { id: 'tracking', label: 'Tracking & UTMs', icon: LinkIcon },
    { id: 'checklists', label: 'Process & QA', icon: CheckSquare },
];

export default function Analytics() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

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

    // Re-initialize chart when tab is dashboard
    useEffect(() => {
        if (activeTab === 'dashboard' && chartRef.current && campaigns.length > 0) {
            if (chartInstance.current) chartInstance.current.destroy();

            const ctx = chartRef.current.getContext('2d');
            chartInstance.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: campaigns.map(c => c.name.substring(0, 15) + '...'),
                    datasets: [
                        { label: 'Leads', data: campaigns.map(c => c.leads), backgroundColor: '#c3dc7f', borderRadius: 4 },
                        { label: 'Dépenses', data: campaigns.map(c => parseFloat(c.spend.replace(/[^0-9.]/g, ''))), backgroundColor: '#eeb417', borderRadius: 4 },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { labels: { color: '#94a3b8' } } },
                    scales: {
                        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' }, border: { display: false } },
                        x: { grid: { display: false }, ticks: { color: '#64748b' }, border: { display: false } },
                    },
                },
            });
        }
    }, [activeTab, campaigns]);

    return (
        <div className="space-y-6 pb-10 animate-fade-in">
            {/* Header Area */}
            <div className="relative mb-4">
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-accent/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none -translate-y-1/2 animate-pulse-glow" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest text-accent mb-6 shadow-[0_0_15px_rgba(238,180,23,0.2)]">
                            <BarChart2 size={12} className="animate-pulse" /> Data Center
                        </div>
                        <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight mb-2 text-white">
                            Analytics & <span className="text-accent underline decoration-accent/30 underline-offset-8">Ads</span>
                        </h1>
                        <p className="text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed font-medium mt-2">
                            Votre centre de commande personnel. Données, Outils et Process.
                        </p>
                    </div>
                    <div className="flex gap-2 p-1 bg-surface-dark/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg">
                        {TABS.map(tab => (
                            <TabButton key={tab.id} {...tab} active={activeTab === tab.id} onClick={setActiveTab} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Switcher */}
            {activeTab === 'dashboard' && (
                <div className="space-y-6 animate-fade-in-up">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        <div className="lg:col-span-2 bg-surface-dark/40 backdrop-blur-xl p-6 rounded-3xl border border-white/10 h-[380px] shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                            <h3 className="text-base md:text-lg font-bold text-white mb-6 relative z-10">Performance Hebdomadaire</h3>
                            <div className="h-[300px] relative z-10">
                                <canvas ref={chartRef} />
                            </div>
                        </div>
                        <div className="bg-surface-dark/40 backdrop-blur-xl p-5 rounded-3xl border border-white/10 flex flex-col gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative overflow-hidden">
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                            <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-2 relative z-10">Liens Rapides</h3>
                            <a href="https://business.facebook.com" target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors group relative z-10">
                                <span className="text-sm font-medium text-white">Meta Ads Manager</span>
                                <ExternalLink size={16} className="text-slate-500 group-hover:text-white" />
                            </a>
                            <a href="https://ads.google.com" target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors group relative z-10">
                                <span className="text-sm font-medium text-white">Google Ads</span>
                                <ExternalLink size={16} className="text-slate-500 group-hover:text-white" />
                            </a>
                            <a href="https://analytics.google.com" target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors group relative z-10">
                                <span className="text-sm font-medium text-white">Google Analytics 4</span>
                                <ExternalLink size={16} className="text-slate-500 group-hover:text-white" />
                            </a>
                            <div className="mt-auto p-5 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl border border-primary/20 relative z-10">
                                <p className="text-[10px] md:text-xs text-primary font-black uppercase tracking-widest mb-2">Pro Tip</p>
                                <p className="text-xs text-slate-300 leading-relaxed font-medium">Vérifiez vos exclusions d'audience tous les vendredis.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'calculators' && <ROASCalculator />}
            {activeTab === 'prediction' && <ROIPredictor />}

            {activeTab === 'tracking' && (
                <div className="space-y-6 animate-fade-in-up">
                    <UTMBuilder />
                    <NamingConventionBuilder />
                </div>
            )}

            {activeTab === 'checklists' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
                    <Checklists />
                    <div className="bg-surface-dark/40 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-white/20 transition-all">
                        <h3 className="text-xl md:text-2xl font-display font-black tracking-tight text-white mb-6 flex items-center gap-3">
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
                                <li key={i} className="flex items-center gap-4 text-sm md:text-base font-medium text-slate-300 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 cursor-default">
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
