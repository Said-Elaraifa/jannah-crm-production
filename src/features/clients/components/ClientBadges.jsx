import { memo } from 'react';
import { Globe } from 'lucide-react';
import { STATUS_CONFIG, SERVICE_ICONS } from '../constants';

const StatusBadge = memo(({ status }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG['En Attente'];
    const Icon = config.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${config.bg} ${config.color} ${config.border} text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/20`}>
            <Icon size={12} className={status === 'En Développement' ? 'animate-spin' : ''} />
            {config.label}
        </span>
    );
});

StatusBadge.displayName = 'StatusBadge';

const ServiceBadge = memo(({ type }) => {
    const Icon = SERVICE_ICONS[type] || Globe;
    return (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] font-bold text-slate-400">
            <Icon size={10} className="text-accent/60" />
            {type}
        </span>
    );
});

ServiceBadge.displayName = 'ServiceBadge';

export { StatusBadge, ServiceBadge };
