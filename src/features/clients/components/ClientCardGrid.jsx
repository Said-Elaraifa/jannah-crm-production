import { memo } from 'react';
import { Calendar, Link as LinkIcon, Trash2, ShieldCheck } from 'lucide-react';
import { STATUS_CONFIG } from '../constants';
import { StatusBadge, ServiceBadge } from './ClientBadges';

export const ClientCardGrid = memo(({ client, onDelete, onOpen, onCopyLink }) => {
    const config = STATUS_CONFIG[client.status] || STATUS_CONFIG['En Attente'];
    const services = client.services || ['Web'];
    const progress = client.progress || 0;

    return (
        <div
            onClick={() => onOpen(client)}
            className="group relative bg-surface-dark/80 backdrop-blur-xl rounded-[1.5rem] border border-white/5 hover:border-accent/30 transition-all duration-700 flex flex-col h-full cursor-pointer hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] animate-fade-in-up"
        >
            {/* Action Bar Overlay */}
            <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 z-10">
                <button
                    onClick={(e) => { e.stopPropagation(); onCopyLink(client); }}
                    className="p-3 bg-bg-dark hover:bg-accent text-slate-400 hover:text-primary rounded-2xl transition-all border border-white/5 active:scale-95 shadow-xl"
                >
                    <LinkIcon size={16} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(client.id); }}
                    className="p-3 bg-bg-dark hover:bg-red-500 text-slate-400 hover:text-white rounded-2xl transition-all border border-white/5 active:scale-95 shadow-xl"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="p-5 pb-3 relative flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center ${config.color} ${config.bg} font-display font-black text-xl border ${config.border} shadow-xl relative group-hover:scale-105 transition-transform duration-500`}>
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem]" />
                            {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <h4 className="font-display font-bold text-base text-white group-hover:text-accent transition-colors truncate tracking-tight">{client.name}</h4>
                            <div className="flex gap-2 mt-2">
                                {services.slice(0, 3).map(s => <ServiceBadge key={s} type={s} />)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <StatusBadge status={client.status} />
                    {client.cahier_completed && (
                        <div className="flex items-center gap-2 text-[#c3dc7f]/60">
                            <ShieldCheck size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Audit OK</span>
                        </div>
                    )}
                </div>

                {/* Progress Visualizer */}
                <div className="space-y-4 mt-auto">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Progression</span>
                        <span className={`text-sm font-black tracking-tight ${progress === 100 ? 'text-[#c3dc7f]' : 'text-white'}`}>{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 p-0.5">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(0,0,0,0.5)] ${progress === 100 ? 'bg-[#c3dc7f]' : 'bg-gradient-to-r from-accent to-secondary'}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Micro Metadata Footer */}
            <div className="px-5 py-3 flex items-center justify-between border-t border-white/5 bg-black/10 rounded-b-[1.5rem]">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                    <Calendar size={12} className="text-accent/60" />
                    <span className="uppercase tracking-widest">{client.last_contact || '2j ago'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{client.assigned_to || 'Admin'}</span>
                </div>
            </div>
        </div>
    );
});

ClientCardGrid.displayName = 'ClientCardGrid';
