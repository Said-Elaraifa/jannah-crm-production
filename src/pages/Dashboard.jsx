// src/pages/Dashboard.jsx
import { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { Download, Plus, TrendingUp, TrendingDown, Zap, Loader2, DollarSign, Users, Server, Activity, ShieldAlert } from 'lucide-react';
import { exportDashboardToPDF } from '../utils/pdfExport';
import { getKpisData, getRevenueData, getActivityLogs } from '../services/supabase';

Chart.register(...registerables);

import { DashboardStatCard } from '../features/dashboard/components/DashboardStatCard';
import { ActivityFeed } from '../features/admin/components/ActivityFeed';
import { CustomSelect } from '../components/ui/CustomSelect';

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
    const isCeo = currentUser?.roleId === 'ceo';
    const isSales = currentUser?.roleId === 'sales';
    const isTech = currentUser?.roleId === 'tech';
    const isExecutive = isAdmin || isCeo;

    return (
        <div className="w-full space-y-8 pb-10 animate-fade-in">
            {/* Header Area */}
            <div className="relative mb-8 z-10 w-full">
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-accent/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none -translate-y-1/2 animate-pulse-glow" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 w-full">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest text-accent mb-6 shadow-[0_0_15px_rgba(238,180,23,0.2)]">
                            <Activity size={12} className="animate-pulse" /> Vue d'ensemble
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-4 text-slate-900 dark:text-white flex flex-wrap items-center gap-4">
                            {isSales ? 'Sales' : isTech ? 'Tech' : 'CEO'} <span className="text-accent underline decoration-accent/30 underline-offset-8">Dashboard</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-base md:text-lg leading-relaxed font-medium mt-4">
                            Bienvenue {currentUser?.name}, voici l'état en temps réel de vos opérations et KPIs.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        {isAdmin && (
                            <button
                                onClick={handleExportPDF}
                                disabled={isExporting}
                                className="flex items-center gap-2 px-6 py-3.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                {isExporting ? 'Génération...' : 'Export PDF'}
                            </button>
                        )}
                        {(isAdmin || isSales) && (
                            <button
                                onClick={onNewClient}
                                className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-accent to-yellow-500 hover:from-yellow-400 hover:to-yellow-300 text-bg-dark text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(238,180,23,0.3)] active:scale-95 whitespace-nowrap"
                            >
                                <Plus size={16} strokeWidth={3} /> CLIENT
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map(kpi => <DashboardStatCard key={kpi.id} kpi={kpi} />)}
            </div>

            {/* Charts Row (Only for Admin/CEO) */}
            {isExecutive && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Revenue Chart */}
                    <div className="lg:col-span-2 bg-white dark:bg-surface-dark/40 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">Revenus vs Ads</h3>
                            <CustomSelect
                                value="Derniers 8 mois"
                                onChange={() => { }}
                                options={[
                                    { value: 'Derniers 8 mois', label: 'Derniers 8 mois' },
                                    { value: 'Cette année', label: 'Cette année' }
                                ]}
                                className="!w-40 text-xs"
                            />
                        </div>
                        <div className="relative h-56 z-10">
                            <canvas ref={chartRef} />
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="bg-white dark:bg-surface-dark/40 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm flex flex-col relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                        <ActivityFeed />
                    </div>
                </div>
            )}

            {/* Alternative View for Tech/Sales */}
            {(!isExecutive) && (
                <div className="bg-white dark:bg-surface-dark/40 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-8 md:p-12 shadow-sm text-center relative overflow-hidden inline-[mx-auto]">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-[2rem] border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto mb-6 shadow-inner relative z-10">
                        {isSales ? <DollarSign className="text-yellow-500 dark:text-yellow-400" size={32} /> : <Server className="text-blue-500 dark:text-blue-400" size={32} />}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-display font-black text-slate-900 dark:text-white tracking-tight mb-4 relative z-10">
                        {isSales ? 'Espace Sales Dédié' : 'Espace Technique Dédié'}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto text-sm leading-relaxed relative z-10">
                        {isSales ? 'Gérez vos leads et suivez vos commissions depuis cet espace optimisé.' : 'Monitorez les serveurs et gérez les déploiements depuis la console technique.'}
                    </p>
                </div>
            )}
        </div>
    );
}
