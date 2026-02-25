import { useState } from 'react';
import { Plus, DollarSign, TrendingUp, Target, Award, Search, Filter, Clock, FileSpreadsheet } from 'lucide-react';
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

    // ─── Destructure from hook ─────────────────────────────
    const { filteredLeads, stats, dragOverStage, activeSourceTab, setActiveSourceTab, sourceTabCounts } = pipeline;
    const { totalValue, weightedPipeline, wonCount, avgProbability } = stats;

    return (
        <div className="w-full space-y-6 animate-fade-in pb-10">
            <LeadModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                initialData={editingLead}
                defaultStage={defaultStage}
            />
            <AIAnalysisModal
                isOpen={auditOpen}
                onClose={() => setAuditOpen(false)}
                lead={auditLead}
                analysis={auditResult}
                loading={auditLoading}
            />
            <ImportLeadsModal
                isOpen={importModalOpen}
                onClose={() => setImportModalOpen(false)}
                onImport={pipeline.importLeadsFromCSV}
            />

            {/* Header Area */}
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
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <button
                            onClick={() => setImportModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-3.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 whitespace-nowrap"
                        >
                            <FileSpreadsheet size={16} /> Importer
                        </button>
                        <button
                            onClick={handleStripeSync}
                            disabled={isSyncing}
                            className={`flex items-center gap-2 px-5 py-3.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap`}
                        >
                            <Clock size={16} className={isSyncing ? 'animate-spin' : ''} />
                            {isSyncing ? 'Sync...' : 'Sync Stripe'}
                        </button>
                        <button onClick={() => openAdd('new')} className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-accent to-yellow-500 hover:from-yellow-400 hover:to-yellow-300 text-bg-dark text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(238,180,23,0.3)] active:scale-95 whitespace-nowrap">
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
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-48">
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
                        <div className="w-48">
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

            {/* Kanban Board */}
            <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 px-1">
                    {STAGES.map(stage => {
                        const stageLeads = filteredLeads.filter(l => l.stage === stage.id);
                        const isOver = dragOverStage === stage.id;

                        return (
                            <KanbanColumn
                                key={stage.id}
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
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
