import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Bot, FileText, LayoutGrid, Activity, Layers, Copy, RefreshCw, CheckCircle2, ExternalLink } from 'lucide-react';
import { generateLovablePrompt } from '../../../services/gemini';
import { getCahierBySlug, fetchClientActivityLogs, logClientActivity, addNotification, supabase } from '../../../services/supabase';
import { StatusBadge } from './ClientBadges';
import { TimelineItem, FileRow, SectionBlock, InfoRow } from './ClientHelpers';
import { Users, Mail, Clock, Zap, MessageCircle, Globe, Palette, Calendar, Target, TrendingUp, DollarSign, Link } from 'lucide-react';
import { OmnichannelChat } from './OmnichannelChat';

// Helper to display a value with a fallback
function DataField({ label, value, full = false }) {
    if (!value && value !== 0) return null;
    return (
        <div className={`bg-black/20 p-4 rounded-2xl border border-white/5 ${full ? 'col-span-2' : ''}`}>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-sm text-white font-bold leading-relaxed">{value}</p>
        </div>
    );
}

export function CahierResultsDrawer({ client, onClose, onEditClient, initialTab = 'infos' }) {
    const [cahier, setCahier] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(initialTab);
    const [generating, setGenerating] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    const loadData = async () => {
        if (!client) return;
        setLoading(true);
        try {
            const [cData, hData] = await Promise.all([
                getCahierBySlug(client.slug),
                fetchClientActivityLogs(client.id)
            ]);
            setCahier(cData);
            setHistory(hData || []);
        } catch (e) {
            console.error('[CahierDrawer] Load error:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (client) loadData();
    }, [client]);

    // ── Realtime subscription on cahier_des_charges ──────────────────────────
    useEffect(() => {
        if (!client?.slug) return;

        const channel = supabase
            .channel(`cahier-${client.slug}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'cahier_des_charges',
                    filter: `client_slug=eq.${client.slug}`,
                },
                (payload) => {
                    console.log('[CahierDrawer] Realtime update received:', payload);
                    if (payload.eventType === 'DELETE') {
                        setCahier(null);
                    } else {
                        setCahier(payload.new);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [client?.slug]);

    // ── Also subscribe to clients table to catch cahier_completed flag ────────
    useEffect(() => {
        if (!client?.id) return;

        const channel = supabase
            .channel(`client-cahier-status-${client.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'clients',
                    filter: `id=eq.${client.id}`,
                },
                (payload) => {
                    if (payload.new?.cahier_completed && !client.cahier_completed) {
                        // Refresh cahier data when client gets marked as completed
                        loadData();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [client?.id]);

    const handleGeneratePrompt = async () => {
        setGenerating(true);
        try {
            const prompt = await generateLovablePrompt(cahier);
            if (!prompt) throw new Error("Aucun prompt généré");
            await onEditClient(client.id, { lovable_prompt: prompt });
            client.lovable_prompt = prompt;
            await logClientActivity({
                client_id: client.id,
                action: 'Génération du prompt IA',
                metadata: { timestamp: new Date().toISOString() }
            });
            await addNotification({
                title: 'Prompt IA Généré',
                message: `Un nouveau prompt a été conçu pour ${client.name}.`,
                type: 'success'
            }).catch(err => console.error('Notification failed:', err));
            const newHistory = await fetchClientActivityLogs(client.id);
            setHistory(newHistory);
        } catch (e) {
            console.error(e);
        } finally {
            setGenerating(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(client.lovable_prompt || '');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    if (!client) return null;

    const tabs = [
        { id: 'infos', label: 'Dashboard', icon: LayoutGrid },
        { id: 'chat', label: 'Communications', icon: MessageCircle },
        { id: 'history', label: 'Historique', icon: Activity },
        { id: 'cahier', label: 'Cahier', icon: FileText },
        { id: 'prompt', label: 'Prompt IA', icon: Bot },
    ];

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-4xl bg-bg-dark h-full flex flex-col shadow-2xl border-l border-white/5 animate-slide-in-right">

                {/* Header */}
                <div className="p-4 md:p-8 border-b border-white/5 bg-surface-dark relative overflow-hidden flex-shrink-0">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-secondary to-accent opacity-50" />
                    <div className="flex items-center justify-between gap-4 mb-6 md:mb-8">
                        <div className="flex items-center gap-3 md:gap-5 min-w-0">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-bg-dark to-black rounded-xl md:rounded-2xl flex items-center justify-center font-display font-black text-xl md:text-2xl text-white border border-white/10 shadow-2xl flex-shrink-0">
                                {client.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-lg md:text-2xl font-display font-bold text-white mb-1 md:mb-2 truncate">{client.name}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[9px] md:text-xs font-black uppercase tracking-widest text-slate-500 truncate">{client.email || 'Pas d\'email'}</span>
                                    <span className="w-1 h-1 bg-slate-700 rounded-full flex-shrink-0" />
                                    <span className="text-[9px] md:text-xs font-black uppercase tracking-widest text-accent flex-shrink-0">{client.plan || 'Standard'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
                            <button onClick={loadData} title="Rafraîchir" className="p-2.5 md:p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors border border-white/5">
                                <RefreshCw size={14} className="md:w-4 md:h-4" />
                            </button>
                            <button onClick={onClose} className="p-2.5 md:p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors border border-white/5" aria-label="Fermer">
                                <X size={18} className="md:w-5 md:h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex flex-wrap gap-1 p-1 bg-black/40 rounded-2xl border border-white/5 w-fit">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${activeTab === tab.id ? 'bg-accent text-primary shadow-lg shadow-accent/20' : 'text-slate-500 hover:text-white'}`}
                            >
                                <tab.icon size={14} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-bg-dark">

                    {/* ── INFOS TAB ── */}
                    {activeTab === 'infos' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#1c3144]/40 p-5 rounded-3xl border border-white/5">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
                                    <StatusBadge status={client.status} />
                                </div>
                                <div className="bg-[#1c3144]/40 p-5 rounded-3xl border border-white/5">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Assigned To</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-accent" />
                                        <span className="text-sm font-bold text-white">{client.assigned_to || 'Said'}</span>
                                    </div>
                                </div>
                            </div>
                            <SectionBlock title="Coordonnées" icon={Users}>
                                <InfoRow label="Email" value={client.email} icon={Mail} />
                                <InfoRow label="Services" value={client.services?.join(', ')} icon={Zap} />
                                <InfoRow label="Dernier Contact" value={client.last_contact} icon={Clock} />
                            </SectionBlock>

                            {/* Cahier summary card */}
                            {client.cahier_completed && cahier && (
                                <div className="p-5 bg-primary/5 border border-primary/20 rounded-3xl">
                                    <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <CheckCircle2 size={12} /> Cahier complété
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {cahier.project_type && <DataField label="Type" value={cahier.project_type} />}
                                        {cahier.style && <DataField label="Style" value={cahier.style} />}
                                        {cahier.budget && <DataField label="Budget" value={cahier.budget} />}
                                        {cahier.deadline && <DataField label="Délai" value={cahier.deadline} />}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── HISTORY TAB ── */}
                    {activeTab === 'history' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="relative">
                                {history.length === 0 ? (
                                    <div className="text-center py-20 text-slate-500 italic">Aucune activité enregistrée.</div>
                                ) : (
                                    <div className="space-y-2">
                                        {history.map((log, i) => (
                                            <TimelineItem
                                                key={log.id || i}
                                                icon={Zap}
                                                title={log.action}
                                                date={log.time_text || new Date(log.created_at).toLocaleDateString()}
                                                description={log.detail}
                                                colorClass={log.user_color}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── CHAT TAB ── */}
                    {activeTab === 'chat' && (
                        <div className="h-full animate-fade-in">
                            <OmnichannelChat clientId={client.id} clientName={client.name} />
                        </div>
                    )}

                    {/* ── CAHIER TAB ── */}
                    {activeTab === 'cahier' && (
                        <div className="animate-fade-in">
                            {loading ? (
                                <div className="text-center py-20 text-slate-500">
                                    <RefreshCw size={32} className="mx-auto mb-4 animate-spin opacity-30" />
                                    <p className="text-sm font-medium">Chargement...</p>
                                </div>
                            ) : !cahier ? (
                                <div className="text-center py-20">
                                    <div className="mb-4 text-slate-700">
                                        <FileText size={48} className="mx-auto opacity-20" />
                                    </div>
                                    <p className="text-slate-500 font-medium italic">Cahier non soumis par le client.</p>
                                    <p className="text-slate-600 text-xs mt-2">Le lien client est disponible dans ses informations.</p>
                                </div>
                            ) : (
                                <div className="space-y-6 pb-20">

                                    {/* ── Section 1: Identité */}
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">🏢 Identité</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <DataField label="Entreprise" value={cahier.company_name} />
                                            <DataField label="Secteur" value={cahier.activity} />
                                            <DataField label="Cible" value={cahier.target_audience} full={!(cahier.competitors)} />
                                            {cahier.competitors && <DataField label="Concurrents" value={cahier.competitors} />}
                                        </div>
                                    </div>

                                    {/* ── Section 2: Projet */}
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">🎯 Projet</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <DataField label="Type" value={cahier.project_type} />
                                            <DataField label="Budget" value={cahier.budget} />
                                            <DataField label="Délai" value={cahier.deadline} />
                                            {cahier.project_goal && (
                                                <div className="col-span-2 bg-black/20 p-4 rounded-2xl border border-white/5">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Objectif</p>
                                                    <p className="text-sm text-slate-300 font-medium leading-relaxed italic">"{cahier.project_goal}"</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* ── Section 3: Design */}
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">🎨 Design & Style</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <DataField label="Style" value={cahier.style} />
                                            <DataField label="Couleurs" value={cahier.colors || 'Non spécifié'} />
                                            {cahier.inspiration_urls && <DataField label="Inspirations" value={cahier.inspiration_urls} full />}
                                        </div>
                                    </div>

                                    {/* ── Section 4: Fichiers */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">📁 Fichiers</p>
                                        <FileRow label="Logo Client" url={cahier.logo_url} type="image" />
                                        <FileRow label="Charte Graphique" url={cahier.charte_url} type="file" />
                                        {cahier.content_url && <FileRow label="Contenu" url={cahier.content_url} type="file" />}
                                    </div>

                                    {/* ── Section 5: Fonctionnalités */}
                                    {cahier.features?.length > 0 && (
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">⚡ Fonctionnalités Clés</p>
                                            <div className="flex flex-wrap gap-2">
                                                {cahier.features.map((s, i) => (
                                                    <span key={i} className="px-3 py-1.5 bg-accent/5 border border-accent/10 rounded-xl text-[10px] font-black uppercase text-accent tracking-wider">{s}</span>
                                                ))}
                                            </div>
                                            {cahier.additional_features && (
                                                <p className="text-xs text-slate-400 mt-3 italic">{cahier.additional_features}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* ── Section 5: Présence en ligne */}
                                    {(cahier.website_url || cahier.social_facebook || cahier.social_instagram || cahier.social_linkedin || cahier.social_tiktok || cahier.social_youtube || cahier.social_twitter || cahier.other_links) && (
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">🔗 Présence en ligne</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    { label: '🌐 Site web', value: cahier.website_url },
                                                    { label: '📘 Facebook', value: cahier.social_facebook },
                                                    { label: '📸 Instagram', value: cahier.social_instagram },
                                                    { label: '💼 LinkedIn', value: cahier.social_linkedin },
                                                    { label: '🎵 TikTok', value: cahier.social_tiktok },
                                                    { label: '▶️ YouTube', value: cahier.social_youtube },
                                                    { label: '✖️ X/Twitter', value: cahier.social_twitter },
                                                    { label: '🔗 Autres', value: cahier.other_links },
                                                ].filter(l => l.value).map(({ label, value }) => (
                                                    <div key={label} className="bg-black/20 p-3 rounded-2xl border border-white/5">
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                                                        <a href={value} target="_blank" rel="noreferrer"
                                                            className="text-accent text-xs font-bold truncate hover:underline flex items-center gap-1">
                                                            <ExternalLink size={10} /> {value.replace(/^https?:\/\//, '')}
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Section 6: Contenu */}
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">📝 Ressources</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className={`p-4 rounded-2xl border ${cahier.has_content ? 'bg-primary/5 border-primary/20' : 'bg-black/20 border-white/5'}`}>
                                                <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: cahier.has_content ? '#4ade80' : '#64748b' }}>Textes</p>
                                                <p className="text-sm font-bold text-white">{cahier.has_content ? '✅ Fournis' : '❌ Non fournis'}</p>
                                            </div>
                                            <div className={`p-4 rounded-2xl border ${cahier.has_images ? 'bg-primary/5 border-primary/20' : 'bg-black/20 border-white/5'}`}>
                                                <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: cahier.has_images ? '#4ade80' : '#64748b' }}>Images</p>
                                                <p className="text-sm font-bold text-white">{cahier.has_images ? '✅ Fournies' : '❌ Non fournies'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Note supplémentaire */}
                                    {cahier.additional_info && (
                                        <div className="bg-secondary/5 border border-secondary/20 p-5 rounded-2xl">
                                            <p className="text-[10px] font-black text-secondary/60 uppercase tracking-widest mb-2">💬 Note du client</p>
                                            <p className="text-sm text-slate-300 leading-relaxed italic">"{cahier.additional_info}"</p>
                                        </div>
                                    )}

                                    <div className="p-8 text-center">
                                        <p className="text-xs text-slate-600 font-medium italic">Dossier complété le {new Date(cahier.completed_at).toLocaleDateString('fr-FR')}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── PROMPT TAB ── */}
                    {activeTab === 'prompt' && (
                        <div className="animate-fade-in space-y-6">
                            {!client.cahier_completed ? (
                                <div className="text-center py-20 text-slate-500">
                                    <Bot size={48} className="mx-auto mb-6 text-slate-700 opacity-20" />
                                    <p className="font-medium">Nécessite le cahier des charges.</p>
                                    <p className="text-xs mt-2 text-slate-600">Le client doit d'abord soumettre son cahier des charges avant de générer le prompt.</p>
                                </div>
                            ) : (
                                <div className="bg-surface-dark rounded-2xl p-6 border border-white/5">
                                    <div className="flex justify-between items-center mb-6">
                                        <h4 className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest flex items-center gap-3">
                                            <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400"><Bot size={16} /></div>
                                            IA Generator Output
                                        </h4>
                                        <button
                                            onClick={handleGeneratePrompt}
                                            disabled={generating}
                                            className="px-5 py-2 text-xs text-primary font-bold bg-secondary hover:bg-[#b0cc65] rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {generating ? <><RefreshCw size={12} className="animate-spin" /> Génération...</> : 'Régénérer'}
                                        </button>
                                    </div>
                                    <div className="group relative">
                                        <div className="absolute inset-0 bg-accent/5 blur-xl group-hover:bg-accent/10 transition-colors pointer-events-none" />
                                        <div className="relative bg-black/60 p-6 rounded-2xl border border-white/5 text-xs text-slate-400 font-mono leading-loose h-[450px] overflow-y-auto custom-scrollbar whitespace-pre-wrap">
                                            {client.lovable_prompt || "Cliquez sur 'Régénérer' pour générer votre prompt IA."}
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCopy}
                                        className={`w-full mt-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 shadow-lg ${copySuccess ? 'bg-green-600 text-white shadow-green-500/20' : 'bg-primary hover:bg-green-700 text-white shadow-primary/20'}`}
                                    >
                                        {copySuccess ? <><CheckCircle2 size={18} /> COPIÉ !</> : <><Copy size={18} /> COPIER LE PROMPT</>}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
