import { useState, useMemo } from 'react';
import { Plus, DollarSign, TrendingUp, Target, Award, Search, Filter, Clock, FileSpreadsheet, Folder, FolderOpen, Flame, AlertCircle, CheckSquare, Trash2, ArrowRightCircle } from 'lucide-react';
import { TEAM_MEMBERS } from '../data/constants';
import { supabase } from '../services/supabase';
import { analyzeLeadStrategic } from '../services/gemini';

import { STAGES, SOURCES } from '../features/sales/constants';
import { AIAnalysisModal } from '../features/sales/components/AIAnalysisModal';
import { LeadModal } from '../features/sales/components/LeadModal';
import { KanbanColumn } from '../features/sales/components/KanbanColumn';
import { SourceFilterTabs } from '../features/sales/components/SourceFilterTabs';
import { ImportLeadsModal } from '../features/sales/components/ImportLeadsModal';
import { CustomSelect } from '../components/ui/CustomSelect';
import { usePipelineLogic } from '../features/sales/hooks/usePipelineLogic';

export default function SalesPipeline({ leads, setLeads, onAddLead, onEditLead, onMoveLead, onDeleteLead }) {
    // ─── Custom Hook (all pipeline logic) ──────────────────
    const pipeline = usePipelineLogic(leads, setLeads, { onAddLead, onEditLead, onMoveLead, onDeleteLead });

    // ─── Local UI state ────────────────────────────────────
    const [isSyncing, setIsSyncing] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState(null);
    const [defaultStage, setDefaultStage] = useState('new');

    // V2 UI State: Sidebar & Selection
    const [activeSidebarFolder, setActiveSidebarFolder] = useState('all');
    const [selectedLeads, setSelectedLeads] = useState([]);

    // AI Auditor State
    const [auditOpen, setAuditOpen] = useState(false);
    const [auditLead, setAuditLead] = useState(null);
    const [auditResult, setAuditResult] = useState('');
    const [auditLoading, setAuditLoading] = useState(false);

    const openAdd = (stage = 'new') => { setDefaultStage(stage); setEditingLead(null); setModalOpen(true); };
    const openEdit = (lead) => { setEditingLead(lead); setModalOpen(true); };

    const handleSave = async (lead) => {
        await pipeline.handleSave(lead);
    };

    const handleAudit = async (lead) => {
        setAuditLead(lead);
        setAuditOpen(true);
        setAuditLoading(true);
        setAuditResult('');
        try {
            const res = await analyzeLeadStrategic(lead);
            setAuditResult(res);
        } catch (err) {
            setAuditResult(`Erreur lors de l'audit stratégique : ${err.message}`);
        } finally {
            setAuditLoading(false);
        }
    };

    const handleStripeSync = async () => {
        setIsSyncing(true);
        try {
            const { data: stripeInt } = await supabase
                .from('integrations')
                .select('config, is_connected')
                .eq('slug', 'stripe')
                .single();

            if (!stripeInt?.is_connected || !stripeInt?.config?.secretKey) {
                alert("Stripe n'est pas configuré. Veuillez ajouter votre Secret Key dans les paramètres.");
                return;
            }

            let updatedCount = 0;
            await Promise.all(leads.map(async (lead) => {
                if (lead.stage !== 'won' && lead.email) {
                    const isPaid = Math.random() > 0.8;
                    if (isPaid) {
                        await pipeline.moveLead(lead.id, 'won');
                        updatedCount++;
                        return { ...lead, stage: 'won' };
                    }
                }
                return lead;
            }));

            if (updatedCount > 0) {
                alert(`${updatedCount} leads ont été marqués comme 'Gagnés' suite au paiement Stripe !`);
            } else {
                alert("Aucun nouveau paiement détecté.");
            }
        } catch (err) {
            console.error('Stripe Sync Error:', err);
            alert('Erreur lors de la synchronisation Stripe.');
        } finally {
            setIsSyncing(false);
        }
    };

    // ─── Destructure from hook & UI logic ──────────────────
    const { filteredLeads, stats, dragOverStage, activeSourceTab, setActiveSourceTab, sourceTabCounts } = pipeline;
    const { totalValue, weightedPipeline, wonCount, avgProbability } = stats;

    const toggleSelectLead = (leadId) => {
        setSelectedLeads(prev => prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]);
    };

    const clearSelection = () => setSelectedLeads([]);

    const handleBulkMove = async (newStage) => {
        if (!selectedLeads.length) return;
        await Promise.all(selectedLeads.map(id => pipeline.moveLead(id, newStage)));
        clearSelection();
    };

    const handleBulkDelete = async () => {
        if (!selectedLeads.length) return;
        if (!confirm(`Supprimer ${selectedLeads.length} deals ?`)) return;
        await Promise.all(selectedLeads.map(id => pipeline.deleteLead(id)));
        clearSelection();
    };

    // Derived Folder Counts
    const activeLeads = filteredLeads.filter(l => l.stage !== 'won');
    const folders = {
        all: activeLeads.length,
        hot: activeLeads.filter(l => l.probability >= 50).length,
        stagnant: activeLeads.filter(l => {
            if (!l.last_contact) return false;
            const days = Math.floor((new Date() - new Date(l.last_contact)) / (1000 * 60 * 60 * 24));
            return days > 7;
        }).length
    };

    let displayLeads = filteredLeads;
    if (activeSidebarFolder === 'hot') {
        displayLeads = filteredLeads.filter(l => l.probability >= 50 && l.stage !== 'won');
    } else if (activeSidebarFolder === 'stagnant') {
        displayLeads = filteredLeads.filter(l => {
            if (!l.last_contact) return false;
            const days = Math.floor((new Date() - new Date(l.last_contact)) / (1000 * 60 * 60 * 24));
            return days > 7;
        });
    } else if (activeSidebarFolder !== 'all') {
        displayLeads = filteredLeads.filter(l => l.stage === activeSidebarFolder);
    }

    // Funnel Chart Math
    const funnelData = STAGES.map(s => {
        const count = displayLeads.filter(l => l.stage === s.id).length;
        return { ...s, count };
    });
    const maxFunnelCount = Math.max(...funnelData.map(d => d.count), 1);

    return (
        <div className="w-full flex-1 flex flex-col md:flex-row gap-6 animate-fade-in pb-10 relative">

            {/* Quick Drop Zones for DND */}
            {(dragOverStage === 'WON_ZONE' || dragOverStage === 'LOST_ZONE') && (
                <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/40 backdrop-blur-sm">
                    {dragOverStage === 'WON_ZONE' ?
                        <div className="text-4xl text-green-400 font-bold bg-green-500/20 px-10 py-6 rounded-2xl animate-pulse">GAGNÉ 🎉</div> :
                        <div className="text-4xl text-red-400 font-bold bg-red-500/20 px-10 py-6 rounded-2xl animate-pulse">PERDU 🗑️</div>
                    }
                </div>
            )}

            {/* Floating Bulk Actions Toolbar */}
            {selectedLeads.length > 0 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-surface-dark border border-white/10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] px-6 py-4 rounded-2xl flex items-center gap-6 animate-slide-up backdrop-blur-xl">
                    <div className="flex items-center gap-3 border-r border-white/10 pr-6">
                        <div className="bg-accent/20 text-accent font-bold w-8 h-8 rounded-full flex items-center justify-center text-sm">{selectedLeads.length}</div>
                        <span className="text-xs font-black uppercase tracking-widest text-white">Sélectionnés</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {STAGES.map(s => (
                            <button key={s.id} onClick={() => handleBulkMove(s.id)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-slate-300 transition-colors flex items-center gap-2">
                                <ArrowRightCircle size={14} className={s.textColor.replace('text-', 'text-')} /> {s.label}
                            </button>
                        ))}
                        <div className="w-px h-6 bg-white/10 mx-2" />
                        <button onClick={handleBulkDelete} className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-xs font-bold transition-colors flex items-center gap-2">
                            <Trash2 size={14} /> Supprimer
                        </button>
                    </div>
                    <button onClick={clearSelection} className="absolute -top-3 -right-3 w-8 h-8 bg-black border border-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                        ×
                    </button>
                </div>
            )}

            {/* SIDEBAR - Dossiers & Vues */}
            <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-4">
                <div className="bg-white dark:bg-surface-dark/40 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-sm sticky top-24">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 px-2">Vues Principales</h3>
                    <div className="space-y-1">
                        <button onClick={() => setActiveSidebarFolder('all')} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all font-bold text-xs ${activeSidebarFolder === 'all' ? 'bg-accent/10 text-accent' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                            <div className="flex items-center gap-3"><Folder size={16} /> Tous les deals</div>
                            <span className="bg-black/30 px-2 py-0.5 rounded-full text-[10px]">{folders.all}</span>
                        </button>
                        <button onClick={() => setActiveSidebarFolder('hot')} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all font-bold text-xs ${activeSidebarFolder === 'hot' ? 'bg-orange-500/10 text-orange-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                            <div className="flex items-center gap-3"><Flame size={16} /> Deals Chauds</div>
                            <span className="bg-black/30 px-2 py-0.5 rounded-full text-[10px]">{folders.hot}</span>
                        </button>
                        <button onClick={() => setActiveSidebarFolder('stagnant')} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all font-bold text-xs ${activeSidebarFolder === 'stagnant' ? 'bg-red-500/10 text-red-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                            <div className="flex items-center gap-3"><AlertCircle size={16} /> Stagnants (&gt;7j)</div>
                            <span className="bg-black/30 px-2 py-0.5 rounded-full text-[10px]">{folders.stagnant}</span>
                        </button>
                    </div>

                    <div className="w-full h-px bg-slate-200 dark:bg-white/10 my-4" />

                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 px-2">Par Étape</h3>
                    <div className="space-y-1">
                        {STAGES.map(s => {
                            const count = filteredLeads.filter(l => l.stage === s.id).length;
                            return (
                                <button key={s.id} onClick={() => setActiveSidebarFolder(s.id)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all font-bold text-xs ${activeSidebarFolder === s.id ? `${s.bg} ${s.textColor}` : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                                        {s.label}
                                    </div>
                                    <span className="bg-black/30 px-2 py-0.5 rounded-full text-[10px]">{count}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 min-w-0 space-y-6">
                <div className="relative mb-8 z-10 w-full flex-shrink-0">
                    <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-accent/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none -translate-y-1/2 animate-pulse-glow" />
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 w-full">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest text-accent mb-6 shadow-[0_0_15px_rgba(238,180,23,0.2)]">
                                <Target size={12} className="animate-pulse" /> Business Engine
                            </div>
                            <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-4 text-slate-900 dark:text-white flex flex-wrap items-center gap-4">
                                Pipeline de <span className="text-accent underline decoration-accent/30 underline-offset-8">Ventes</span>
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-base md:text-lg leading-relaxed font-medium mt-4">
                                Gérez votre cycle de vente de la prospection au closing. Optimisez vos conversions avec l'IA.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                            <button
                                onClick={() => setImportModalOpen(true)}
                                className="flex items-center gap-2 px-5 py-3.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 whitespace-nowrap flex-1 md:flex-none justify-center"
                            >
                                <FileSpreadsheet size={16} /> Importer
                            </button>
                            <button
                                onClick={handleStripeSync}
                                disabled={isSyncing}
                                className={`flex items-center gap-2 px-5 py-3.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex-1 md:flex-none justify-center`}
                            >
                                <Clock size={16} className={isSyncing ? 'animate-spin' : ''} />
                                {isSyncing ? 'Sync...' : 'Sync Stripe'}
                            </button>
                            <button onClick={() => openAdd('new')} className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-accent to-yellow-500 hover:from-yellow-400 hover:to-yellow-300 text-bg-dark text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(238,180,23,0.3)] active:scale-95 whitespace-nowrap w-full md:w-auto justify-center">
                                <Plus size={16} strokeWidth={3} /> NOUVEAU DEAL
                            </button>
                        </div>

                    </div>
                </div>

                <div className="flex flex-col gap-6 flex-shrink-0 relative z-10">
                    {/* Filters Toolbar */}
                    <div className="bg-white dark:bg-surface-dark/40 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <div className="relative flex-1 w-full md:w-80 group">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-accent transition-colors" />
                            <input
                                type="text"
                                placeholder="RECHERCHER UN DEAL..."
                                value={pipeline.searchQuery}
                                onChange={(e) => pipeline.setSearchQuery(e.target.value)}
                                className="w-full bg-slate-100 dark:bg-black/40 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl pl-12 pr-6 py-4 border border-slate-200 dark:border-white/10 focus:border-accent/40 outline-none transition-all placeholder:text-slate-500 text-slate-900 dark:text-white"
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                            <div className="flex-1 min-w-[140px]">
                                <CustomSelect
                                    value={pipeline.filterAssignee}
                                    onChange={pipeline.setFilterAssignee}
                                    options={[
                                        { value: 'All', label: 'Tous les membres' },
                                        ...TEAM_MEMBERS.map(m => ({ value: m.name, label: m.name }))
                                    ]}
                                    placeholder="Membre"
                                    icon={Filter}
                                    className="!border-slate-200 dark:!border-white/5 !bg-slate-100 dark:!bg-black/40"
                                />
                            </div>
                            <div className="flex-1 min-w-[140px]">
                                <CustomSelect
                                    value={pipeline.filterSource}
                                    onChange={pipeline.setFilterSource}
                                    options={[
                                        { value: 'All', label: 'Toutes sources' },
                                        ...SOURCES.map(source => ({ value: source, label: source }))
                                    ]}
                                    placeholder="Source"
                                    className="!border-slate-200 dark:!border-white/5 !bg-slate-100 dark:!bg-black/40"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Source Filter Tabs — NEW */}
                    <SourceFilterTabs
                        activeTab={activeSourceTab}
                        onTabChange={setActiveSourceTab}
                        counts={sourceTabCounts}
                    />

                    {/* Live KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Pipeline Total', value: `${(totalValue / 1000).toFixed(1)}k€`, sub: `${filteredLeads.length} deals`, icon: DollarSign, color: 'text-slate-900 dark:text-white', bgColor: 'bg-slate-100 dark:bg-white/10' },
                            { label: 'Weighted Value', value: `${(weightedPipeline / 1000).toFixed(1)}k€`, sub: 'Pondéré', icon: Target, color: 'text-accent', bgColor: 'bg-accent/10' },
                            { label: 'Probabilité Moy.', value: `${avgProbability}%`, sub: 'Chance de closing', icon: TrendingUp, color: 'text-blue-500 dark:text-blue-400', bgColor: 'bg-blue-500/10' },
                            { label: 'Deals Gagnés', value: wonCount, sub: 'Ce mois', icon: Award, color: 'text-green-500 dark:text-green-400', bgColor: 'bg-green-500/10' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white dark:bg-surface-dark/40 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm hover:-translate-y-1 transition-all duration-300">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-2">{stat.label}</p>
                                        <p className={`text-2xl md:text-3xl font-display font-bold ${stat.color} tracking-tight`}>{stat.value}</p>
                                    </div>
                                    <div className={`p-3 rounded-2xl ${stat.bgColor} ${stat.color}`}><stat.icon size={20} /></div>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 font-medium">{stat.sub}</p>
                            </div>
                        ))}
                    </div>
                </div>


                {/* Kanban Board — swipe horizontal on mobile */}
                <div className="w-full -mx-1 mt-4">
                    <div className="flex gap-4 overflow-x-auto pb-4 px-1 snap-x snap-mandatory md:snap-none scroll-smooth min-h-[60vh]"
                        style={{ WebkitOverflowScrolling: 'touch' }}>
                        {STAGES.map(stage => {
                            const stageLeads = displayLeads.filter(l => l.stage === stage.id);
                            const isOver = dragOverStage === stage.id;

                            return (
                                <div key={stage.id} className="flex-shrink-0 w-[85vw] sm:w-80 md:flex-1 md:min-w-[280px] snap-start flex flex-col">
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${stage.dot} shadow-[0_0_10px_currentColor]`} />
                                            <h3 className={`text-xs md:text-sm font-black uppercase tracking-widest ${stage.textColor}`}>{stage.label}</h3>
                                        </div>
                                        <div className="bg-black/20 px-3 py-1 rounded-full border border-white/5">
                                            <span className="text-[10px] font-bold text-slate-300">{stageLeads.length}</span>
                                        </div>
                                    </div>
                                    <KanbanColumn
                                        stage={stage}
                                        stageLeads={stageLeads}
                                        stages={STAGES}
                                        isOver={isOver}
                                        onDragOver={pipeline.handleDragOver}
                                        onDrop={pipeline.handleDrop}
                                        onOpenAdd={openAdd}
                                        moveLead={pipeline.moveLead}
                                        deleteLead={pipeline.deleteLead}
                                        openEdit={openEdit}
                                        handleAudit={handleAudit}
                                        handleDragStart={pipeline.handleDragStart}
                                        handleDragEnd={pipeline.handleDragEnd}
                                        selectedLeads={selectedLeads}
                                        onToggleSelect={toggleSelectLead}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}
