import React, { useState, useEffect } from 'react';
import {
    Search, Plus, Eye, Edit2,
    MessageSquare, TrendingUp, Users, AlertCircle,
    CheckCircle2, Clock, Trash2, Link as LinkIcon,
    MessageCircle, Mail, Phone, ArrowRight
} from 'lucide-react';
import { fetchClientPortfolio } from '../services/portfolio';
import { removeClientRecord } from '../services/supabase';
import { Modal } from '../components/ui/Modal';
import { CahierResultsDrawer } from '../features/clients/components/CahierResultsDrawer';

function HealthBadge({ status }) {
    const config = {
        RISQUE: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20', label: 'Risque', icon: AlertCircle },
        ATTENTION: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/20', label: 'Attention', icon: Clock },
        STABLE: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20', label: 'Stable', icon: CheckCircle2 },
    };

    // Fallback for cases where status might not match exactly or is null
    const style = config[status] || config.STABLE;
    const Icon = style.icon;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${style.bg} ${style.text} ${style.border}`}>
            <Icon size={10} />
            {style.label}
        </span>
    );
}

function TableSkeleton() {
    return (
        <>
            {[...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse border-b border-slate-100 dark:border-white/5">
                    <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-white/5" />
                            <div className="space-y-2">
                                <div className="h-3 w-24 bg-slate-200 dark:bg-white/5 rounded" />
                                <div className="h-2 w-16 bg-slate-100 dark:bg-white/5 rounded" />
                            </div>
                        </div>
                    </td>
                    <td className="py-4 px-4"><div className="h-4 w-20 bg-slate-200 dark:bg-white/5 rounded-full" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-16 bg-slate-200 dark:bg-white/5 rounded ml-auto" /></td>
                    <td className="py-4 px-4 text-center"><div className="h-6 w-6 bg-slate-200 dark:bg-white/5 rounded mx-auto" /></td>
                    <td className="py-4 px-4"><div className="h-3 w-24 bg-slate-200 dark:bg-white/5 rounded" /></td>
                    <td className="py-4 px-6"><div className="h-8 w-24 bg-slate-200 dark:bg-white/5 rounded ml-auto" /></td>
                </tr>
            ))}
        </>
    );
}

/**
 * Simple helper to format dates relative to now.
 */
function formatRelativeDate(dateString) {
    if (!dateString) return 'Jamais';

    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "À l'instant";
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return hours === 1 ? 'Il y a 1h' : `Il y a ${hours}h`;
    }

    const diffInDays = Math.floor(diffInSeconds / 86400);
    if (diffInDays === 1) return 'Hier';
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`;

    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

/**
 * Helper to format currency.
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
    }).format(amount || 0);
}

export default function ClientPortfolio({ onEditClient, onNewClient }) {
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Delete State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Edit/View State
    const [selectedDrawerClient, setSelectedDrawerClient] = useState(null);
    const [drawerTab, setDrawerTab] = useState('infos');

    // Contact State
    const [contactModalClient, setContactModalClient] = useState(null);

    useEffect(() => {
        loadPortfolio();
    }, []);

    const loadPortfolio = async () => {
        setIsLoading(true);
        try {
            const data = await fetchClientPortfolio();
            setClients(data);
        } catch (error) {
            console.error('Error loading portfolio:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = (client) => {
        setClientToDelete(client);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!clientToDelete) return;
        setIsDeleting(true);
        try {
            await removeClientRecord(clientToDelete.id);
            // Optimistic UI update
            setClients(clients.filter(c => c.id !== clientToDelete.id));
            setIsDeleteModalOpen(false);
            setClientToDelete(null);
        } catch (error) {
            console.error('Error deleting client:', error);
            alert("Erreur lors de la suppression. Veuillez réessayer.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEditClientWrapper = async (id, updates) => {
        if (onEditClient) {
            await onEditClient(id, updates);
        }
        // Refresh local portfolio data so MRR/Projects reflect changes if any
        await loadPortfolio();
    };

    const filteredClients = clients.filter(client =>
        client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in pb-10 w-full overflow-hidden">
            {selectedDrawerClient && (
                <CahierResultsDrawer
                    client={selectedDrawerClient}
                    onClose={() => {
                        setSelectedDrawerClient(null);
                        setDrawerTab('infos');
                    }}
                    onEditClient={handleEditClientWrapper}
                    initialTab={drawerTab}
                />
            )}

            {/* Header Area */}
            <div className="relative mb-8">
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none -translate-y-1/2 animate-pulse-glow" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 w-full">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest text-primary mb-6 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                            <TrendingUp size={12} className="animate-pulse" /> Performance Portfolio
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-4 text-slate-900 dark:text-white">
                            Portefeuille <span className="text-primary underline decoration-primary/30 underline-offset-8">Clients</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-base md:text-lg leading-relaxed font-medium mt-4">
                            Vue consolidée de votre écosystème. Suivez la santé, les revenus et les interactions en temps réel.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onNewClient}
                            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:bg-green-600 text-white text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95 whitespace-nowrap"
                        >
                            <Plus size={16} strokeWidth={3} /> Nouveau Client
                        </button>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900/40 backdrop-blur-xl p-3 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm w-full">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Rechercher un client, une entreprise..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                </div>

                <div className="flex items-center justify-end w-full md:w-auto gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest px-4 whitespace-nowrap">
                    <Users size={14} /> {clients.length} Clients Actifs
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/5 shadow-xl w-full overflow-hidden">
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/2">
                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Client / Entreprise</th>
                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Santé</th>
                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">MRR</th>
                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Projets</th>
                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Dernier Contact</th>
                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5 w-full">
                            {isLoading ? (
                                <TableSkeleton />
                            ) : filteredClients.length > 0 ? (
                                filteredClients.map((client) => (
                                    <tr key={client.id} className="group hover:bg-slate-50 dark:hover:bg-white/2 transition-colors duration-150">
                                        <td className="py-2.5 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs border border-primary/20 flex-shrink-0">
                                                    {client.avatar_text || '?'}
                                                </div>
                                                <div className="min-w-0 max-w-[200px] lg:max-w-xs">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate" title={client.name}>{client.name}</p>
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate" title={client.company || client.email}>{client.company || client.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-4 whitespace-nowrap">
                                            <HealthBadge status={client.health_status} />
                                        </td>
                                        <td className="py-2.5 px-4 text-right whitespace-nowrap">
                                            <span className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(client.mrr)}</span>
                                        </td>
                                        <td className="py-2.5 px-4 text-center">
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 dark:bg-white/5 text-[10px] font-black text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                                                {client.active_projects}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-4">
                                            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                <Clock size={12} className="opacity-50" />
                                                {formatRelativeDate(client.last_contact_date)}
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-6">
                                            <div className="flex items-center justify-end gap-1 opacity-10 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    className="p-1.5 hover:bg-primary/10 hover:text-primary text-slate-400 rounded-lg transition-colors"
                                                    title="Afficher le Tableau de Bord & Cahier"
                                                    onClick={() => setSelectedDrawerClient(client)}
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                <button
                                                    className="p-1.5 hover:bg-secondary/10 hover:text-secondary text-slate-400 rounded-lg transition-colors"
                                                    title="Copier le Lien Public"
                                                    onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/cahier/${client.slug}`); }}
                                                >
                                                    <LinkIcon size={14} />
                                                </button>
                                                <button
                                                    className="p-1.5 hover:bg-accent/10 hover:text-accent text-slate-400 rounded-lg transition-colors"
                                                    title="Options de Contact"
                                                    onClick={() => setContactModalClient(client)}
                                                >
                                                    <MessageSquare size={14} />
                                                </button>
                                                <button
                                                    className="p-1.5 hover:bg-red-500/10 hover:text-red-500 text-slate-400 rounded-lg transition-colors ml-1"
                                                    title="Supprimer"
                                                    onClick={() => handleDeleteClick(client)}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400">
                                                <Users size={24} />
                                            </div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">Aucun client trouvé</p>
                                            <p className="text-xs text-slate-500">Essayez une autre recherche ou ajoutez un nouveau client.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Suppression */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Supprimer le Client">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 flex-shrink-0">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                                Êtes-vous sûr de vouloir supprimer ce client ?
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                La suppression de <span className="font-bold text-slate-900 dark:text-white">{clientToDelete?.name}</span> entraînera
                                la perte définitive de toutes ses données associées (Factures, Projets, Messages). Cette action est irréversible.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-white/5">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="px-4 py-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                            disabled={isDeleting}
                        >
                            Annuler
                        </button>
                        <button
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDeleting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Suppression...
                                </>
                            ) : (
                                <>
                                    <Trash2 size={16} />
                                    Confirmer la suppression
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Modal de Contact */}
            <Modal isOpen={!!contactModalClient} onClose={() => setContactModalClient(null)} title="Contacter le client">
                {contactModalClient && (
                    <div className="p-6 space-y-3">
                        <button
                            onClick={() => {
                                setDrawerTab('chat');
                                setSelectedDrawerClient(contactModalClient);
                                setContactModalClient(null);
                            }}
                            className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                    <MessageCircle size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">Chat Interne Omnichannel</p>
                                    <p className="text-xs text-slate-500">Ouvrir l'onglet Communications Jannah</p>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowRight size={14} className="text-primary" />
                            </div>
                        </button>
                        <button
                            onClick={() => {
                                window.location.href = `mailto:${contactModalClient.email || ''}`;
                                setContactModalClient(null);
                            }}
                            className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                    <Mail size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">Email</p>
                                    <p className="text-xs text-slate-500">
                                        {contactModalClient.email ? `Ouvrir messagerie (${contactModalClient.email})` : "Aucun email renseigné"}
                                    </p>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowRight size={14} className="text-blue-500" />
                            </div>
                        </button>
                        {contactModalClient.phone && (
                            <button
                                onClick={() => {
                                    window.open(`https://wa.me/${contactModalClient.phone.replace(/[^0-9]/g, '')}`, '_blank');
                                    setContactModalClient(null);
                                }}
                                className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-white/5 hover:border-green-500/30 hover:bg-green-500/5 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
                                        <MessageSquare size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">WhatsApp Web</p>
                                        <p className="text-xs text-slate-500">Ouvrir une discussion WhatsApp directe</p>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight size={14} className="text-green-500" />
                                </div>
                            </button>
                        )}
                        {contactModalClient.phone && (
                            <button
                                onClick={() => {
                                    window.location.href = `tel:${contactModalClient.phone}`;
                                    setContactModalClient(null);
                                }}
                                className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-white/5 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                                        <Phone size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Appel téléphonique</p>
                                        <p className="text-xs text-slate-500">Lancer un appel ({contactModalClient.phone})</p>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight size={14} className="text-purple-500" />
                                </div>
                            </button>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
