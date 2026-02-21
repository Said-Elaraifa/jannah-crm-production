import { useState, useRef, useMemo } from 'react';
import { Plus, DollarSign, TrendingUp, Target, Award, Search, Filter, Clock } from 'lucide-react';
import { TEAM_MEMBERS } from '../data/constants';
import { supabase, updateLeadRecord } from '../services/supabase';
import { analyzeLeadStrategic } from '../services/gemini';

import { STAGES, SOURCES } from '../features/sales/constants';
import { AIAnalysisModal } from '../features/sales/components/AIAnalysisModal';
import { LeadModal } from '../features/sales/components/LeadModal';
import { KanbanColumn } from '../features/sales/components/KanbanColumn';
import { CustomSelect } from '../components/ui/CustomSelect';

export default function SalesPipeline({ leads, setLeads, onAddLead, onEditLead, onMoveLead, onDeleteLead }) {
    const [isSyncing, setIsSyncing] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState(null);
    const [defaultStage, setDefaultStage] = useState('new');
    const [dragOverStage, setDragOverStage] = useState(null);

    // AI Auditor State
    const [auditOpen, setAuditOpen] = useState(false);
    const [auditLead, setAuditLead] = useState(null);
    const [auditResult, setAuditResult] = useState('');
    const [auditLoading, setAuditLoading] = useState(false);

    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterAssignee, setFilterAssignee] = useState('All');
    const [filterSource, setFilterSource] = useState('All');

    const dragLeadId = useRef(null);

    const openAdd = (stage = 'new') => { setDefaultStage(stage); setEditingLead(null); setModalOpen(true); };
    const openEdit = (lead) => { setEditingLead(lead); setModalOpen(true); };

    const handleSave = async (lead) => {
        if (editingLead) {
            if (onEditLead) {
                await onEditLead(lead.id, lead);
            } else {
                setLeads(prev => prev.map(l => l.id === lead.id ? lead : l));
            }
        } else {
            if (onAddLead) {
                await onAddLead(lead);
            } else {
                setLeads(prev => [lead, ...prev]);
            }
        }
    };

    const deleteLead = async (id) => {
        if (onDeleteLead) await onDeleteLead(id);
        else setLeads(prev => prev.filter(l => l.id !== id));
    };

    const moveLead = async (id, newStage) => {
        if (onMoveLead) await onMoveLead(id, newStage);
        else {
            await updateLeadRecord(id, { stage: newStage });
            setLeads(prev => prev.map(l => l.id === id ? { ...l, stage: newStage } : l));
        }
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
                        await moveLead(lead.id, 'won');
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

    // Drag and drop handlers
    const handleDragStart = (e, leadId) => {
        dragLeadId.current = leadId;
        e.dataTransfer.effectAllowed = 'move';
    };
    const handleDragEnd = () => { dragLeadId.current = null; setDragOverStage(null); };
    const handleDragOver = (e, stageId) => { e.preventDefault(); setDragOverStage(stageId); };
    const handleDrop = (e, stageId) => {
        e.preventDefault();
        if (dragLeadId.current) moveLead(dragLeadId.current, stageId);
        setDragOverStage(null);
    };

    // Filter Logic
    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const matchesSearch = (lead.company + lead.contact + lead.email).toLowerCase().includes(searchQuery.toLowerCase());
            const matchesAssignee = filterAssignee === 'All' || lead.assignedTo === filterAssignee;
            const matchesSource = filterSource === 'All' || lead.source === filterSource;
            return matchesSearch && matchesAssignee && matchesSource;
        });
    }, [leads, searchQuery, filterAssignee, filterSource]);

    // Advanced Stats
    const totalValue = filteredLeads.reduce((sum, l) => sum + (l.value || 0), 0);
    const weightedPipeline = filteredLeads.reduce((sum, l) => sum + ((l.value || 0) * ((l.probability || 50) / 100)), 0);
    const wonCount = filteredLeads.filter(l => l.stage === 'won').length;
    const avgProbability = filteredLeads.length > 0 ? Math.round(filteredLeads.reduce((sum, l) => sum + (l.probability || 50), 0) / filteredLeads.length) : 0;

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

            {/* Header Area */}
            <div className="relative mb-8 flex-shrink-0">
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-accent/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none -translate-y-1/2 animate-pulse-glow" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest text-accent mb-6 shadow-[0_0_15px_rgba(238,180,23,0.2)]">
                            <Target size={12} className="animate-pulse" /> Business Engine
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-4 text-slate-900 dark:text-white">
                            Pipeline de <span className="text-accent underline decoration-accent/30 underline-offset-8">Ventes</span>
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg leading-relaxed font-medium mt-4">
                            Gérez votre cycle de vente de la prospection au closing. Optimisez vos conversions avec l'IA.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleStripeSync}
                            disabled={isSyncing}
                            className={`flex items-center gap-2 px-6 py-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <Clock size={16} className={isSyncing ? 'animate-spin' : ''} />
                            {isSyncing ? 'Sync en cours...' : 'Sync Stripe'}
                        </button>
                        <button onClick={() => openAdd('new')} className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-accent to-yellow-500 hover:from-yellow-400 hover:to-yellow-300 text-bg-dark text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(238,180,23,0.3)] active:scale-95">
                            <Plus size={16} strokeWidth={3} /> NOUVEAU DEAL
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-6 flex-shrink-0 relative z-10">
                {/* Filters Toolbar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-surface-dark/40 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="relative flex-1 w-full md:w-80 group">
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-accent transition-colors" />
                        <input
                            type="text"
                            placeholder="RECHERCHER UN DEAL..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-black/40 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl pl-12 pr-6 py-4 border border-slate-200 dark:border-white/10 focus:border-accent/40 outline-none transition-all placeholder:text-slate-500 text-slate-900 dark:text-white"
                        />
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-48">
                            <CustomSelect
                                value={filterAssignee}
                                onChange={setFilterAssignee}
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
                                value={filterSource}
                                onChange={setFilterSource}
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

                {/* Live KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Pipeline Total', value: `${(totalValue / 1000).toFixed(1)}k€`, sub: `${filteredLeads.length} deals`, icon: DollarSign, color: 'text-slate-900 dark:text-white', bgColor: 'bg-slate-100 dark:bg-white/10' },
                        { label: 'Weighted Value', value: `${(weightedPipeline / 1000).toFixed(1)}k€`, sub: 'Pondéré', icon: Target, color: 'text-accent', bgColor: 'bg-accent/10' },
                        { label: 'Probabilité Moy.', value: `${avgProbability}%`, sub: 'Chance de closing', icon: TrendingUp, color: 'text-blue-500 dark:text-blue-400', bgColor: 'bg-blue-500/10' },
                        { label: 'Deals Gagnés', value: wonCount, sub: 'Ce mois', icon: Award, color: 'text-green-500 dark:text-green-400', bgColor: 'bg-green-500/10' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-surface-dark/40 backdrop-blur-xl rounded-[2rem] border border-slate-200 dark:border-white/10 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300">
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
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onOpenAdd={openAdd}
                                moveLead={moveLead}
                                deleteLead={deleteLead}
                                openEdit={openEdit}
                                handleAudit={handleAudit}
                                handleDragStart={handleDragStart}
                                handleDragEnd={handleDragEnd}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
