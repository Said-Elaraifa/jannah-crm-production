import { memo } from 'react';
import { Link as LinkIcon, Trash2 } from 'lucide-react';
import { STATUS_CONFIG } from '../constants';
import { StatusBadge } from './ClientBadges';

export const ClientCardList = memo(({ client, onDelete, onOpen, onCopyLink }) => {
    const config = STATUS_CONFIG[client.status] || STATUS_CONFIG['En Attente'];
    const services = client.services || ['Web'];

    return (
        <div
            onClick={() => onOpen(client)}
            className="group grid grid-cols-12 gap-6 items-center p-6 bg-[#152636]/40 border-b border-white/5 hover:bg-[#152636]/80 transition-all cursor-pointer last:border-0 hover:pl-10 relative overflow-hidden"
        >
            <div className="col-span-4 flex items-center gap-5">
                <div className={`w-12 h-12 rounded-2xl ${config.bg} flex items-center justify-center ${config.color} font-black text-lg border ${config.border} shadow-lg shadow-black/20 group-hover:scale-110 transition-transform`}>
                    {client.name.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden space-y-1">
                    <h4 className="font-display font-bold text-white text-base truncate group-hover:text-accent transition-colors tracking-tight">{client.name}</h4>
                    <div className="flex gap-2 mt-1">
                        {services.map(s => <span key={s} className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{s}</span>)}
                    </div>
                </div>
            </div>

            <div className="col-span-2">
                <StatusBadge status={client.status} />
            </div>

            <div className="col-span-3 pr-10">
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <div className="h-full bg-gradient-to-r from-accent to-secondary rounded-full" style={{ width: `${client.progress}%` }} />
                    </div>
                    <span className="text-[11px] font-black text-slate-400 w-8">{client.progress}%</span>
                </div>
            </div>

            <div className="col-span-3 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                <button
                    onClick={(e) => { e.stopPropagation(); onCopyLink(client); }}
                    className="p-3 bg-white/5 hover:bg-accent text-slate-400 hover:text-primary rounded-xl transition-all border border-white/5"
                >
                    <LinkIcon size={16} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(client.id); }}
                    className="p-3 bg-white/5 hover:bg-red-500 text-slate-400 hover:text-white rounded-xl transition-all border border-white/5"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
});

ClientCardList.displayName = 'ClientCardList';
