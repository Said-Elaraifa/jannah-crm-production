// src/pages/Dashboard.jsx
import { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { Download, Plus, TrendingUp, TrendingDown, Zap, Loader2, DollarSign, Users, Server, Activity, ShieldAlert } from 'lucide-react';
import { exportDashboardToPDF } from '../utils/pdfExport';
import { getKpisData, getRevenueData, getActivityLogs } from '../services/supabase';

Chart.register(...registerables);

function StatCard({ kpi }) {
    const isUp = kpi.trend === 'up';
    return (
        <div className="bg-surface-dark p-5 rounded-2xl border border-white/5 hover:border-primary/30 transition-all duration-300 animate-fade-in-up">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{kpi.label}</h3>
                <div className={`p-1.5 rounded-lg ${kpi.bg_color} ${kpi.color}`}>
                    {kpi.icon ? <kpi.icon size={15} /> : (isUp ? <TrendingUp size={15} /> : <TrendingDown size={15} />)}
                </div>
            </div>
            <div className="mb-2">
                <span className="text-2xl font-display font-bold text-white tracking-tight">{kpi.value}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
                <span className={`${kpi.color} font-bold px-1.5 py-0.5 rounded ${kpi.bg_color}`}>{kpi.change}</span>
                <span className="text-slate-500">vs mois dernier</span>
            </div>
        </div>
    );
}

export default function Dashboard({ onNewClient, currentUser }) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const [isExporting, setIsExporting] = useState(false);

    // Data States
    const [kpis, setKpis] = useState([]);
    const [chartData, setChartData] = useState(null);
    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            await exportDashboardToPDF();
        } catch (error) {
            console.error('PDF Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch base data
                const [kpisData, revenueData, logsData] = await Promise.all([
                    getKpisData(),
                    getRevenueData(),
                    getActivityLogs()
                ]);

                // CUSTOMIZE DATA BASED ON ROLE
                if (currentUser?.roleId === 'sales') {
                    // Sales View Data Override
                    setKpis([
                        { id: 1, label: "Mon Pipeline", value: "12,500€", change: "+8%", trend: "up", color: "text-green-400", bg_color: "bg-green-500/10", icon: DollarSign },
                        { id: 2, label: "Deals Gagnés", value: "4", change: "+1", trend: "up", color: "text-accent", bg_color: "bg-accent/10", icon: Users },
                        { id: 3, label: "Commissions (Est.)", value: "1,250€", change: "+150€", trend: "up", color: "text-yellow-400", bg_color: "bg-yellow-500/10", icon: DollarSign },
                        { id: 4, label: "Taux de Closing", value: "28%", change: "+2%", trend: "up", color: "text-blue-400", bg_color: "bg-blue-500/10", icon: Activity },
                    ]);
                } else if (currentUser?.roleId === 'tech') {
                    // Tech View Data Override
                    setKpis([
                        { id: 1, label: "System Uptime", value: "99.99%", change: "stable", trend: "up", color: "text-green-400", bg_color: "bg-green-500/10", icon: Server },
                        { id: 2, label: "Open Tickets", value: "5", change: "-2", trend: "down", color: "text-blue-400", bg_color: "bg-blue-500/10", icon: Activity },
                        { id: 3, label: "Avg Response Time", value: "12m", change: "-5m", trend: "down", color: "text-green-400", bg_color: "bg-green-500/10", icon: Zap },
                        { id: 4, label: "Critical Alerts", value: "0", change: "stable", trend: "up", color: "text-slate-400", bg_color: "bg-slate-500/10", icon: ShieldAlert },
                    ]);
                } else {
                    // Admin/CEO Default View
                    setKpis(kpisData || []);
                }

                setActivities(logsData || []);

                // Transform Revenue Data for Chart (Only for Admin/CEO)
                if (revenueData && revenueData.length > 0) {
                    setChartData({
                        labels: revenueData.map(d => d.month),
                        revenue: revenueData.map(d => d.revenue),
                        ads: revenueData.map(d => d.ads)
                    });
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [currentUser]); // Re-fetch when user changes

    // Chart Logic (Only render if chartData exists and Role is Admin/CEO)
    useEffect(() => {
        if (!chartRef.current || !chartData || (currentUser?.roleId !== 'admin' && currentUser?.roleId !== 'ceo')) return;

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        const gradientRevenue = ctx.createLinearGradient(0, 0, 0, 300);
        gradientRevenue.addColorStop(0, 'rgba(195, 220, 127, 0.35)');
        gradientRevenue.addColorStop(1, 'rgba(195, 220, 127, 0.0)');

        const gradientAds = ctx.createLinearGradient(0, 0, 0, 300);
        gradientAds.addColorStop(0, 'rgba(238, 180, 23, 0.3)');
        gradientAds.addColorStop(1, 'rgba(238, 180, 23, 0.0)');

        chartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [
                    {
                        label: 'Revenus',
                        data: chartData.revenue,
                        borderColor: '#c3dc7f',
                        backgroundColor: gradientRevenue,
                        borderWidth: 2.5,
                        pointBackgroundColor: '#c3dc7f',
                        pointBorderColor: '#1c3144',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        tension: 0.4,
                        fill: true,
                    },
                    {
                        label: 'Dépenses Ads',
                        data: chartData.ads,
                        borderColor: '#eeb417',
                        backgroundColor: gradientAds,
                        borderWidth: 2.5,
                        pointBackgroundColor: '#eeb417',
                        pointBorderColor: '#1c3144',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        tension: 0.4,
                        fill: true,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        align: 'end',
                        labels: {
                            color: '#94a3b8',
                            font: { family: "'Montserrat', sans-serif", size: 11 },
                            usePointStyle: true,
                            boxWidth: 8,
                            padding: 16,
                        },
                    },
                    tooltip: {
                        backgroundColor: 'rgba(28, 49, 68, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#cbd5e1',
                        borderColor: 'rgba(255,255,255,0.08)',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: (ctx) => ` ${ctx.dataset.label}: ${(ctx.raw / 1000).toFixed(0)}k€`,
                        },
                    },
                },
                scales: {
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.04)', drawBorder: false },
                        ticks: {
                            color: '#475569',
                            font: { size: 10 },
                            callback: (v) => `${v / 1000}k€`,
                        },
                        border: { display: false },
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#475569', font: { size: 10 } },
                        border: { display: false },
                    },
                },
            },
        });

        return () => { chartInstance.current?.destroy(); };
    }, [chartData, currentUser]);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    const isAdmin = currentUser?.roleId === 'admin';
    const isSales = currentUser?.roleId === 'sales';
    const isTech = currentUser?.roleId === 'tech';

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2">
                        {isSales ? 'Sales Dashboard' : isTech ? 'Tech Dashboard' : 'CEO Performance'}
                        {isSales && <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 text-xs rounded border border-yellow-500/20">SALES</span>}
                        {isTech && <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs rounded border border-blue-500/20">TECH</span>}
                    </h2>
                    <p className="text-slate-400 mt-1 text-sm">Bienvenue {currentUser?.name}, voici vos résultats.</p>
                </div>
                <div className="flex items-center gap-3">
                    {isAdmin && (
                        <button
                            onClick={handleExportPDF}
                            disabled={isExporting}
                            className="flex items-center gap-2 px-4 py-2.5 bg-surface-dark border border-white/5 hover:border-white/20 text-slate-300 hover:text-white text-sm font-medium rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isExporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                            {isExporting ? 'Génération...' : 'Exporter PDF'}
                        </button>
                    )}
                    {(isAdmin || isSales) && (
                        <button
                            onClick={onNewClient}
                            className="flex items-center gap-2 px-4 py-2.5 bg-secondary hover:bg-[#b0cc65] text-primary text-sm font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-secondary/20"
                        >
                            <Plus size={15} />
                            Client
                        </button>
                    )}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map(kpi => <StatCard key={kpi.id} kpi={kpi} />)}
            </div>

            {/* Charts Row (Only for Admin) */}
            {isAdmin && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Revenue Chart */}
                    <div className="lg:col-span-2 bg-surface-dark p-6 rounded-2xl border border-white/5">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-base font-display font-bold text-white">Revenus vs Ads</h3>
                            <select className="bg-bg-dark border-none text-xs rounded-lg px-3 py-1.5 text-slate-400 focus:ring-0 cursor-pointer outline-none">
                                <option>Derniers 8 mois</option>
                                <option>Cette année</option>
                            </select>
                        </div>
                        <div className="relative h-56">
                            <canvas ref={chartRef} />
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 flex flex-col">
                        <div className="flex justify-between items-center mb-5">
                            <div className="flex items-center gap-2">
                                <Zap size={16} className="text-accent" />
                                <h3 className="text-base font-display font-bold text-white">Activité</h3>
                            </div>
                            <button className="text-xs text-primary hover:text-secondary transition-colors">Voir tout</button>
                        </div>
                        <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar">
                            {activities.map(act => (
                                <div key={act.id} className="flex gap-3 group">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${act.user_color}`}>
                                        {act.user_initials}
                                    </div>
                                    <div className="flex-1 pb-4 border-b border-white/5 group-last:border-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-sm font-semibold text-white leading-tight">{act.action}</h4>
                                            <span className="text-[10px] text-slate-500 ml-2 flex-shrink-0">{act.time_text}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">{act.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Alternative View for Tech/Sales (Placeholder for now, can be expanded) */}
            {(!isAdmin) && (
                <div className="bg-surface-dark p-8 rounded-2xl border border-white/5 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        {isSales ? <DollarSign className="text-yellow-400" size={32} /> : <Server className="text-blue-400" size={32} />}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                        {isSales ? 'Espace Sales Dédié' : 'Espace Technique Dédié'}
                    </h3>
                    <p className="text-slate-400 max-w-md mx-auto">
                        {isSales ? 'Gérez vos leads et suivez vos commissions depuis cet espace optimisé.' : 'Monitorez les serveurs et gérez les déploiements depuis la console technique.'}
                    </p>
                </div>
            )}
        </div>
    );
}
