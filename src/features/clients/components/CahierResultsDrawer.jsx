import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Bot, FileText, LayoutGrid, Activity, Layers, Copy } from 'lucide-react';
import { generateLovablePrompt } from '../../../services/gemini';
import { getCahierBySlug, fetchClientActivityLogs, logClientActivity, addNotification } from '../../../services/supabase';
import { StatusBadge } from './ClientBadges';
import { TimelineItem, FileRow, SectionBlock, InfoRow } from './ClientHelpers';
import { Users, Mail, Clock, Zap, MessageCircle } from 'lucide-react';
import { OmnichannelChat } from './OmnichannelChat';

export function CahierResultsDrawer({ client, onClose, onEditClient, initialTab = 'infos' }) {
    const [cahier, setCahier] = useState(null);
    const [history, setHistory] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(initialTab);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        if (client) {
            setLoading(true);
            Promise.all([
                getCahierBySlug(client.slug),
                fetchClientActivityLogs(client.id)
            ]).then(([cData, hData]) => {
                setCahier(cData);
                setHistory(hData || []);
            }).catch(console.error).finally(() => setLoading(false));
        }
    }, [client]);

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
                message: `Un nouveau prompt Lovable a été conçu pour ${client.name}.`,
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

    if (!client) return null;

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-4xl bg-bg-dark h-full flex flex-col shadow-2xl border-l border-white/5 animate-slide-in-right">
                <div className="p-8 border-b border-white/5 bg-surface-dark relative overflow-hidden flex-shrink-0">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-secondary to-accent opacity-50" />
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-gradient-to-br from-bg-dark to-black rounded-2xl flex items-center justify-center font-display font-black text-2xl text-white border border-white/10 shadow-2xl">
                                {client.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-display font-bold text-white mb-2">{client.name}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500">{client.email || 'Pas d\'email'}</span>
                                    <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                    <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-accent">{client.plan || 'Standard'}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors border border-white/5"><X size={20} /></button>
                    </div>
                    <div className="flex p-1 bg-black/40 rounded-2xl border border-white/5 w-fit">
                        {[
                            { id: 'infos', label: 'Dashboard', icon: LayoutGrid },
                            { id: 'chat', label: 'Communications', icon: MessageCircle },
                            { id: 'history', label: 'Historique', icon: Activity },
                            { id: 'cahier', label: 'Cahier', icon: FileText },
                            { id: 'prompt', label: 'Prompt IA', icon: Bot }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2.5 px-5 py-2.5 text-xs font-bold rounded-xl transition-all ${activeTab === tab.id ? 'bg-accent text-primary shadow-lg shadow-accent/20' : 'text-slate-500 hover:text-white'}`}
                            >
                                <tab.icon size={14} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-bg-dark">
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
                        </div>
                    )}
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
                    {activeTab === 'chat' && (
                        <div className="h-full animate-fade-in">
                            <OmnichannelChat clientId={client.id} clientName={client.name} />
                        </div>
                    )}
                    {activeTab === 'cahier' && (
                        <div className="animate-fade-in">
                            {!cahier ? (
                                <div className="text-center py-20">
                                    <div className="mb-4 text-slate-700">
                                        <FileText size={48} className="mx-auto opacity-20" />
                                    </div>
                                    <p className="text-slate-500 font-medium italic">En attente de complétion...</p>
                                </div>
                            ) : (
                                <div className="space-y-6 pb-20">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Projet</p>
                                            <p className="text-sm text-white font-bold">{cahier.project_name}</p>
                                        </div>
                                        <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Palette</p>
                                            <p className="text-sm text-white font-bold">{cahier.colors || 'Non spécifié'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <FileRow label="Logo Client" url={cahier.logo_url} type="image" />
                                        <FileRow label="Charte Graphique" url={cahier.charte_url} type="file" />
                                    </div>
                                    <SectionBlock title="Le Projet" icon={Layers}>
                                        <div className="bg-black/20 p-5 rounded-2xl border border-white/5 mb-6">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Type & Objectif</p>
                                            <p className="text-sm text-white font-bold mb-1">{cahier.project_type}</p>
                                            <p className="text-xs text-slate-400 leading-relaxed italic">"{cahier.project_goal}"</p>
                                        </div>

                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Fonctionnalités Clés</p>
                                        <div className="flex flex-wrap gap-2">
                                            {cahier.features?.map((s, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-accent/5 border border-accent/10 rounded-xl text-[10px] font-black uppercase text-accent tracking-wider">{s}</span>
                                            ))}
                                        </div>
                                    </SectionBlock>

                                    <div className="p-8 text-center">
                                        <p className="text-xs text-slate-600 font-medium italic">Dossier complété le {new Date(cahier.completed_at).toLocaleDateString('fr-FR')}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'prompt' && (
                        <div className="animate-fade-in space-y-6">
                            {!client.cahier_completed ? (
                                <div className="text-center py-20 text-slate-500">
                                    <Bot size={48} className="mx-auto mb-6 text-slate-700 opacity-20" />
                                    <p className="font-medium">Nécessite le cahier des charges.</p>
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
                                            className="px-5 py-2 text-xs text-primary font-bold bg-secondary hover:bg-[#b0cc65] rounded-xl transition-colors disabled:opacity-50"
                                        >
                                            {generating ? 'Processing...' : 'Régénérer'}
                                        </button>
                                    </div>
                                    <div className="group relative">
                                        <div className="absolute inset-0 bg-accent/5 blur-xl group-hover:bg-accent/10 transition-colors pointer-events-none" />
                                        <div className="relative bg-black/60 p-6 rounded-2xl border border-white/5 text-xs text-slate-400 font-mono leading-loose h-[450px] overflow-y-auto custom-scrollbar">
                                            {client.lovable_prompt || "Le moteur IA attend vos instructions."}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(client.lovable_prompt); }}
                                        className="w-full mt-6 py-4 bg-primary hover:bg-green-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
                                    >
                                        <Copy size={18} /> COPIER LE PROMPT
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
