import { memo } from 'react';
import { Image, FileText, ShieldCheck, ExternalLink } from 'lucide-react';

// eslint-disable-next-line no-unused-vars
export const InfoRow = memo(({ label, value, icon: Icon }) => (
    <div className="flex items-center justify-between p-4 bg-surface-dark rounded-xl border border-white/5">
        <div className="flex items-center gap-3 text-slate-400">
            <Icon size={14} />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-sm font-bold text-white">{value || 'N/A'}</span>
    </div>
));
InfoRow.displayName = 'InfoRow';

// eslint-disable-next-line no-unused-vars
export const SectionBlock = memo(({ title, icon: Icon, children }) => (
    <div className="space-y-4">
        <h4 className="flex items-center gap-3 text-[10px] md:text-xs font-black uppercase tracking-widest text-accent/60 mb-6">
            <Icon size={12} />
            {title}
        </h4>
        <div className="grid grid-cols-1 gap-3">
            {children}
        </div>
    </div>
));
SectionBlock.displayName = 'SectionBlock';

export const FileRow = memo(({ label, url, type }) => (
    <div className="flex items-center justify-between p-4 bg-surface-dark rounded-xl border border-white/5 group hover:border-white/10 transition-colors cursor-pointer">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-black/20 rounded-xl text-slate-500 group-hover:text-accent transition-colors">
                {type === 'image' ? <Image size={16} /> : <FileText size={16} />}
            </div>
            <div>
                <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-0.5">{label}</p>
                <p className="text-sm font-bold text-white truncate max-w-[150px]">{url ? 'Document lié' : 'Non fourni'}</p>
            </div>
        </div>
        {url && (
            <a href={url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
                <ExternalLink size={14} />
            </a>
        )}
    </div>
));
FileRow.displayName = 'FileRow';

// eslint-disable-next-line no-unused-vars
export const TimelineItem = memo(({ icon: Icon, title, date, description, colorClass = "text-slate-400" }) => (
    <div className="relative pl-8 pb-10 last:pb-0 group">
        <div className="absolute left-0 top-0 h-full w-[2px] bg-white/5 group-last:h-2" />
        <div className={`absolute left-[-9px] top-0 w-5 h-5 rounded-full bg-bg-dark border-2 border-white/10 flex items-center justify-center z-10 ${colorClass}`}>
            <Icon size={10} />
        </div>
        <div className="space-y-1">
            <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500">{date}</p>
            <h5 className="text-base font-bold text-white group-hover:text-accent transition-colors">{title}</h5>
            {description && <p className="text-sm text-slate-400 leading-relaxed italic">{description}</p>}
        </div>
    </div>
));
TimelineItem.displayName = 'TimelineItem';

export function SectionHeader({ title, description, action }) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest text-accent mb-3">
                    <ShieldCheck size={14} />
                    <span>Jannah Agency OS</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight mb-4">
                    {title}
                </h2>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                    {description}
                </p>
            </div>
            <div className="flex items-center gap-3">
                {action}
            </div>
        </div>
    );
}
