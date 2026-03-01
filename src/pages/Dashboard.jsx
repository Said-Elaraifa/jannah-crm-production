import { useState, useEffect } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { Download, Plus, ChevronRight, MoreHorizontal, CheckCircle2, Circle, DollarSign, Server, Activity, ShieldAlert, Users, Calendar, Zap, Loader2 } from 'lucide-react';
import { exportDashboardToPDF } from '../utils/pdfExport';

ChartJS.register(...registerables);
import { CustomSelect } from '../components/ui/CustomSelect';

// ─── DUMMY DATA FOR CEO DASHBOARD ──────────────────────────────────────────────
const recentLeads = [];

const myTasks = [];

// ─── MINI SPARKLINE COMPONENT ─────────────────────────────────────────────────
const SparklineCard = ({ title, value, trend, isPositive, chartColor, data }) => {
    const chartData = {
        labels: ['1', '2', '3', '4', '5', '6', '7', '8'],
        datasets: [{
            data,
            borderColor: chartColor,
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 0,
            fill: true,
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 80);
                gradient.addColorStop(0, `${chartColor}40`);
                gradient.addColorStop(1, `${chartColor}00`);
                return gradient;
            }
        }]
    };
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false, min: Math.min(...data) * 0.8 } }
    };

    return (
        <div className="bg-white dark:bg-surface-dark/40 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-sm flex flex-col justify-between hover:border-white/20 transition-all group">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-[13px] font-bold text-slate-500 dark:text-slate-400 mb-1">{title}</h3>
                    <p className="text-3xl font-display font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
                </div>
                <div className={`flex items-center gap-1 text-[11px] font-black px-2 py-1 rounded-full ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {isPositive ? '↑' : '↓'} {trend}
                </div>
            </div>
            <div className="h-16 w-full relative">
                <Line data={chartData} options={options} />
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between cursor-pointer group-hover:text-accent transition-colors">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-inherit">See more details</span>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-inherit" />
            </div>
        </div>
    );
};


export default function Dashboard({ onNewClient, currentUser }) {
    const [isExporting, setIsExporting] = useState(false);

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

    const isAdmin = currentUser?.roleId === 'admin' || currentUser?.role?.includes('COO') || currentUser?.role?.includes('Admin');
    const isCeo = currentUser?.roleId === 'ceo' || currentUser?.role?.includes('CEO');
    const isSales = currentUser?.roleId === 'sales' || currentUser?.role?.includes('Sales');
    const isTech = currentUser?.roleId === 'tech' || currentUser?.role?.includes('Dev');
    const isExecutive = isAdmin || isCeo;

    // ─── CHARTS CONFIGS FOR CEO ────────────────────────────────────────────────
    const oppSummaryData = {
        labels: ['11 Dec', '12 Dec', '13 Dec', '14 Dec', '15 Dec', '16 Dec', '17 Dec', '18 Dec', '19 Dec'],
        datasets: [
            {
                label: 'Closed Won',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0],
                borderColor: '#3B82F6', // Blue
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2.5,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3B82F6',
                pointRadius: 0,
                pointHoverRadius: 6,
            },
            {
                label: 'Closed Lose',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0],
                borderColor: '#A855F7', // Purple
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                borderWidth: 2.5,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#A855F7',
                pointRadius: 0,
                pointHoverRadius: 6,
            }
        ]
    };

    const oppSummaryOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#fff',
                bodyColor: '#cbd5e1',
                padding: 12,
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
            }
        },
        scales: {
            x: {
                grid: { display: false, drawBorder: false },
                ticks: { color: '#64748b', font: { size: 11 } }
            },
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)', borderDash: [5, 5], drawBorder: false },
                ticks: {
                    color: '#64748b',
                    font: { size: 11 },
                    callback: (val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val
                },
                min: 0,
                max: 4000
            }
        }
    };

    const statusDoughnutData = {
        labels: ['Aucune donnée'],
        datasets: [{
            data: [1],
            backgroundColor: ['#334155'],
            borderWidth: 0,
            circumference: 180,
            rotation: 270,
            cutout: '75%',
            borderRadius: 5
        }]
    };
    const statusDoughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: true } }
    };

    const salesBarData = {
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        datasets: [{
            label: 'Sales',
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                gradient.addColorStop(0, '#A855F7');
                gradient.addColorStop(1, '#A855F740');
                return gradient;
            },
            borderRadius: 6,
            barThickness: 24,
        }]
    };

    const salesBarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false, drawBorder: false }, ticks: { color: '#64748b' } },
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)', borderDash: [5, 5], drawBorder: false },
                ticks: { color: '#64748b', callback: (val) => `$${val}` },
                min: 0,
                max: 150
            }
        }
    };

    return (
        <div className="w-full space-y-6 pb-10 animate-fade-in">
            {/* ─── HEADER AREA ─────────────────────────────────────────────────── */}
            <div className="relative mb-8 z-10 w-full">
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-accent/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none -translate-y-1/2 animate-pulse-glow" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 w-full">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest text-accent mb-6 shadow-[0_0_15px_rgba(238,180,23,0.2)]">
                            <Activity size={12} className="animate-pulse" /> Vue d'ensemble
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-4 text-slate-900 dark:text-white flex flex-wrap items-center gap-4">
                            CEO <span className="text-accent underline decoration-accent/30 underline-offset-8">Dashboard</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-base md:text-lg leading-relaxed font-medium mt-4">
                            Bienvenue {currentUser?.name || 'Saïd'}, voici l'état en temps réel de vos opérations et KPIs.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300">
                            <Calendar size={14} /> Dernière mise à jour: <span className="text-blue-400">
                                {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                        {isAdmin && (
                            <button
                                onClick={handleExportPDF}
                                disabled={isExporting}
                                className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                Import or Export
                            </button>
                        )}
                        {(isAdmin || isSales) && (
                            <button
                                onClick={onNewClient}
                                className="flex items-center justify-center w-10 h-10 bg-green-500 hover:bg-green-400 text-white rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] active:scale-95"
                            >
                                <Plus size={20} className="stroke-[3px]" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── EXECUTIVE DASHBOARD GRID ───────────────────────────────────── */}
            {isExecutive ? (
                <div className="flex flex-col gap-6">
                    {/* TOP CARDS ROW */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <SparklineCard title="Total Leads" value="0" trend="0%" isPositive={true} chartColor="#64748b" data={[0, 0, 0, 0, 0, 0, 0, 0]} />
                        <SparklineCard title="Total Opportunity" value="0" trend="0%" isPositive={true} chartColor="#64748b" data={[0, 0, 0, 0, 0, 0, 0, 0]} />
                        <SparklineCard title="Total Sales" value="0€" trend="0%" isPositive={true} chartColor="#64748b" data={[0, 0, 0, 0, 0, 0, 0, 0]} />
                    </div>

                    {/* MIDDLE ROW */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* OPPRTUNITY SUMMARY CHART */}
                        <div className="lg:col-span-2 bg-white dark:bg-surface-dark/40 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm flex flex-col">
                            <div className="flex items-start justify-between mb-8">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Opportunity Summary</h3>
                                    <p className="text-[11px] font-bold text-slate-500">Last 9 days</p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                        <span className="text-[11px] font-bold text-slate-400">Closed Won</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
                                        <span className="text-[11px] font-bold text-slate-400">Closed Lose</span>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-xl text-[11px] font-bold text-blue-400">
                                        <Calendar size={12} /> Date Range: 11 Dec 2024 - 19 Dec 2024
                                    </div>
                                </div>
                            </div>
                            <div className="h-[280px] w-full mt-auto">
                                <Line data={oppSummaryData} options={oppSummaryOptions} />
                            </div>
                        </div>

                        {/* RECENT LEADS LIST */}
                        <div className="bg-white dark:bg-surface-dark/40 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Lead</h3>
                                <button className="text-slate-400 hover:text-white"><MoreHorizontal size={20} /></button>
                            </div>
                            <div className="flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar">
                                {recentLeads.length > 0 ? recentLeads.map((lead, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer group">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${lead.color} flex-shrink-0`}>
                                                {lead.initial}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-bold text-white truncate">{lead.name}</h4>
                                                <p className="text-[10px] text-slate-400 truncate">
                                                    <span className="text-blue-400">{lead.email}</span> • {lead.company}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors flex-shrink-0" />
                                    </div>
                                )) : (
                                    <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-3">
                                            <Users size={20} className="text-slate-500" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-400">Aucun lead pour le moment</p>
                                        <p className="text-[11px] text-slate-500 mt-1">Les nouveaux leads apparaîtront ici.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* BOTTOM ROW */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* LEAD BY STATUS DOUGHNUT */}
                        <div className="bg-white dark:bg-surface-dark/40 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm flex flex-col items-center relative">
                            <div className="w-full flex items-start justify-between mb-4 absolute top-6 left-6 pr-12">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">Lead by Status</h3>
                                <button className="text-slate-400 hover:text-white"><MoreHorizontal size={20} /></button>
                            </div>
                            <div className="w-full flex items-center justify-start mb-8 z-10 pl-6 pt-10">
                                <span className="text-3xl font-display font-black text-white">0</span>
                                <span className="ml-2 text-[11px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">0%</span>
                            </div>

                            <div className="relative w-full h-[180px] flex items-end justify-center">
                                <Doughnut data={statusDoughnutData} options={statusDoughnutOptions} />
                                <div className="absolute bottom-6 flex flex-col items-center">
                                    <span className="text-4xl font-black text-slate-600">0%</span>
                                    <span className="text-xs font-bold text-slate-500">Aucune donnée</span>
                                </div>
                            </div>

                            <div className="w-full flex justify-center gap-4 mt-8 pb-2">
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#A855F7]" /><span className="text-[10px] font-bold text-slate-400">Closed Won</span></div>
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#3B82F6]" /><span className="text-[10px] font-bold text-slate-400">Closed Lose</span></div>
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-200" /><span className="text-[10px] font-bold text-slate-400">Contacted</span></div>
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-100" /><span className="text-[10px] font-bold text-slate-400">New</span></div>
                            </div>
                        </div>

                        {/* SALES SUMMARY BAR */}
                        <div className="bg-white dark:bg-surface-dark/40 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm flex flex-col">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Sales Summary</h3>
                                    <p className="text-[11px] font-bold text-slate-500">Last 6 days</p>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-xl text-[11px] font-bold text-blue-400">
                                    <Calendar size={12} /> 11/12/2024 - 16/12/2024
                                </div>
                            </div>
                            <div className="h-[200px] w-full mt-auto">
                                <Bar data={salesBarData} options={salesBarOptions} />
                            </div>
                        </div>

                        {/* MY TASK CHECKLIST */}
                        <div className="bg-white dark:bg-surface-dark/40 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">My Task</h3>
                                <button className="text-slate-400 hover:text-white"><MoreHorizontal size={20} /></button>
                            </div>
                            <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2 h-[220px]">
                                {myTasks.length > 0 ? myTasks.map((task, idx) => (
                                    <div key={idx} className={`p-4 rounded-xl border flex items-start justify-between transition-all ${task.completed ? 'bg-white/5 border-white/5 opacity-60' : 'bg-surface-dark border-white/10 hover:border-white/20'}`}>
                                        <div className="flex items-start gap-3">
                                            {task.completed ?
                                                <CheckCircle2 size={18} className="text-green-400 mt-0.5" /> :
                                                <Circle size={18} className="text-slate-500 mt-0.5" />
                                            }
                                            <div>
                                                <h4 className={`text-sm tracking-tight font-bold ${task.completed ? 'text-slate-400 line-through' : 'text-white'}`}>{task.title}</h4>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="flex items-center gap-1 text-[10px] text-slate-500 font-bold"><Calendar size={10} /> {task.date}</span>
                                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${task.tagColor}`}>{task.tag}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex -space-x-2">
                                            {task.avatars.length > 0 ? task.avatars.map((_, i) => (
                                                <div key={i} className="w-6 h-6 rounded-full bg-slate-500/50 border-2 border-surface-dark"></div>
                                            )) : (
                                                <div className="w-6 h-6 rounded-full bg-slate-500/10 border-2 border-transparent"></div>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-3">
                                            <CheckCircle2 size={20} className="text-slate-500" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-400">Aucune tâche</p>
                                        <p className="text-[11px] text-slate-500 mt-1">Vous êtes à jour, profitez-en !</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* ─── ALTERNATIVE VIEW FOR SALES/TECH ────────────────────────────── */
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

