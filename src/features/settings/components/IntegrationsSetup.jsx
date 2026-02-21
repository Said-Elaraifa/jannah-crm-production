import { Plus, LayoutGrid } from 'lucide-react';
import { INTEGRATION_CATALOG } from '../constants';

export function IntegrationsSetup({ integrations, handleConnect, connecting, setCatalogOpen }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map(saved => {
                const catalogItem = INTEGRATION_CATALOG.find(i => i.slug === saved.slug);
                const Icon = catalogItem?.icon || LayoutGrid;
                const isConnected = saved.is_connected;
                return (
                    <div
                        key={saved.id}
                        onClick={() => handleConnect(saved.slug)}
                        className={`bg-surface-dark rounded-2xl p-5 border border-white/5 hover:border-primary/30 transition-all flex flex-col justify-between group cursor-pointer h-40 relative overflow-hidden ${connecting === saved.slug ? 'opacity-70' : ''}`}
                    >
                        {connecting === saved.slug && (
                            <div className="absolute inset-0 bg-primary/10 flex items-center justify-center backdrop-blur-[2px]">
                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                        <div className="flex justify-between items-start">
                            <div className={`w-12 h-12 ${catalogItem?.bg || 'bg-white/5'} rounded-xl flex items-center justify-center ${catalogItem?.color || 'text-slate-400'}`}>
                                <Icon size={24} />
                            </div>
                            <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border ${isConnected ? 'bg-bg-dark border-white/5' : 'bg-red-500/10 border-red-500/20'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isConnected ? 'text-slate-400' : 'text-red-400'}`}>
                                    {isConnected ? 'Connecté' : 'Non configuré'}
                                </span>
                            </div>
                        </div>
                        <div>
                            <p className="text-base font-bold text-white mb-2">{saved.name || 'Intégration'}</p>
                            <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500">{isConnected ? 'Dernière synchro: 2 min' : 'Cliquez pour configurer'}</p>
                        </div>
                    </div>
                );
            })}
            <div
                onClick={() => setCatalogOpen(true)}
                className="bg-surface-dark/50 rounded-2xl p-5 border border-white/5 border-dashed flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-dark transition-colors group"
            >
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-2 group-hover:bg-primary/20 group-hover:text-primary transition-all text-slate-400">
                    <Plus size={24} />
                </div>
                <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 mt-2">Ajouter une intégration</p>
            </div>
        </div>
    );
}
