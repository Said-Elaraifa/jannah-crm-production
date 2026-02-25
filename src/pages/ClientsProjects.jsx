import { useState, useMemo, memo } from 'react';
import { Plus, LayoutGrid, List, Search, Users, Activity, Rocket, TrendingUp } from 'lucide-react';
import { EmptyState, StatCard } from '../components/ui';

import { ClientCardGrid } from '../features/clients/components/ClientCardGrid';
import { ClientCardList } from '../features/clients/components/ClientCardList';
// import { AddClientModal } from '../features/clients/components/AddClientModal'; // Removed local modal
import { CahierResultsDrawer } from '../features/clients/components/CahierResultsDrawer';
import { SectionHeader } from '../features/clients/components/ClientHelpers';

// eslint-disable-next-line no-unused-vars
const ClientsProjects = memo(({ clients, setClients, onAddClient, onEditClient, onDeleteClient, onViewCahier, currentUser, onNewClient }) => {
    // const [isModalOpen, setIsModalOpen] = useState(false); // Removed local state
    const [selectedClient, setSelectedClient] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('Tous');

    const filteredClients = useMemo(() => {
        let result = clients || [];
        if (activeTab === 'En Progrès') result = result.filter(c => ['En Développement', 'Nouveau', 'En Attente'].includes(c.status));
        if (activeTab === 'Live') result = result.filter(c => c.status === 'En Ligne');

        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            result = result.filter(c => c.name.toLowerCase().includes(lower));
        }
        return result;
    }, [clients, activeTab, searchQuery]);

    const handleCopyLink = (client) => {
        navigator.clipboard.writeText(`${window.location.origin} /cahier/${client.slug} `);
    };

    return (
        <div className="space-y-6 pb-10 animate-fade-in">
            {/* AddClientModal moved to App.jsx */}

            {selectedClient && (
                <CahierResultsDrawer client={selectedClient} onClose={() => setSelectedClient(null)} onEditClient={onEditClient} />
            )}

            {/* Header Area */}
            <div className="relative mb-8 z-10 w-full flex-shrink-0">
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-accent/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none -translate-y-1/2 animate-pulse-glow" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 w-full">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest text-accent mb-6 shadow-[0_0_15px_rgba(238,180,23,0.2)]">
                            <Users size={12} className="animate-pulse" /> CRM Center
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-4 text-slate-900 dark:text-white flex flex-wrap items-center gap-4">
                            Écosystème <span className="text-accent underline decoration-accent/30 underline-offset-8">Clients</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-base md:text-lg leading-relaxed font-medium mt-4">
                            Architecture centrale de vos relations agence. Gérez, suivez et optimisez chaque dossier avec une précision chirurgicale.
                        </p>
                    </div>
                    <div>
                        <button onClick={onNewClient} className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-accent to-yellow-500 hover:from-yellow-400 hover:to-yellow-300 text-bg-dark text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(238,180,23,0.3)] active:scale-95 whitespace-nowrap">
                            <Plus size={16} strokeWidth={3} /> INITIALISER UN PROJET
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard kpi={{ label: "Projets en Run", value: clients?.filter(c => c.status === 'En Développement').length || 0, trend: 'up', color: 'text-blue-500 dark:text-blue-400', bgColor: 'bg-blue-500/10' }} />
                <StatCard kpi={{ label: "Onboarding", value: clients?.filter(c => !c.cahier_completed).length || 0, trend: 'up', color: 'text-accent', bgColor: 'bg-accent/10' }} />
                <StatCard kpi={{ label: "Success Rate", value: "100%", trend: 'up', color: 'text-[#c3dc7f]', bgColor: 'bg-[#c3dc7f]/10' }} />
                <StatCard kpi={{ label: "Total Portefeuille", value: clients?.length || 0, trend: 'up', color: 'text-purple-500 dark:text-purple-400', bgColor: 'bg-purple-500/10' }} />
            </div>

            <div className="bg-white dark:bg-surface-dark/40 backdrop-blur-xl p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="flex bg-slate-100 dark:bg-black/40 rounded-2xl p-1 gap-1 border border-slate-200 dark:border-white/5 relative z-10 w-full md:w-auto overflow-x-auto custom-scrollbar">
                    {['Tous', 'En Progrès', 'Live'].map(t => (
                        <button
                            key={t} onClick={() => setActiveTab(t)}
                            className={`px-6 py-2.5 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === t ? 'bg-accent text-slate-900 shadow-lg shadow-accent/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto relative z-10">
                    <div className="relative flex-1 w-full md:w-80 group">
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-accent transition-colors" />
                        <input
                            type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            placeholder="RECHERCHER UN DOSSIER..."
                            className="w-full bg-slate-100 dark:bg-black/40 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl pl-12 pr-6 py-4 border border-slate-200 dark:border-white/10 focus:border-accent/40 outline-none transition-all placeholder:text-slate-500 text-slate-900 dark:text-white"
                        />
                    </div>
                    <div className="flex bg-slate-100 dark:bg-black/40 rounded-2xl p-1 border border-slate-200 dark:border-white/5">
                        {[
                            { id: 'grid', icon: LayoutGrid },
                            { id: 'list', icon: List }
                        ].map(m => (
                            <button
                                key={m.id} onClick={() => setViewMode(m.id)}
                                className={`p-3 rounded-xl transition-all ${viewMode === m.id ? 'bg-white/10 text-white' : 'text-slate-600 hover:text-slate-400'}`}
                            >
                                <m.icon size={18} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {filteredClients.length === 0 ? (
                <EmptyState onAction={onNewClient} title="Aucun projet actif" description="Démarrez votre croissance en ajoutant votre premier dossier client à l'écosystème Jannah." icon={Rocket} />
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredClients.map(client => (
                        <ClientCardGrid key={client.id} client={client} onDelete={onDeleteClient} onOpen={setSelectedClient} onCopyLink={handleCopyLink} />
                    ))}
                </div>
            ) : (
                <div className="bg-surface-dark/40 backdrop-blur-xl rounded-[2rem] border border-white/10 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative">
                    <div className="divide-y divide-white/10 relative z-10">
                        {filteredClients.map(client => (
                            <ClientCardList key={client.id} client={client} onDelete={onDeleteClient} onOpen={setSelectedClient} onCopyLink={handleCopyLink} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});

export default ClientsProjects;
