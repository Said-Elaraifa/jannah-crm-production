import { memo } from 'react';
import { Sparkles, Layout, Check, Copy } from 'lucide-react';

// eslint-disable-next-line no-unused-vars
export const ToolCard = memo(({ title, description, icon: Icon, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full text-left p-6 rounded-3xl border transition-all duration-500 group relative overflow-hidden shadow-sm ${active
            ? 'bg-accent/10 border-accent/40 shadow-lg shadow-accent/10'
            : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 shadow-sm'
            }`}
    >
        <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl transition-all duration-500 border border-current/10 ${active ? 'bg-accent text-slate-900 scale-110 shadow-lg shadow-accent/20' : 'bg-slate-100 dark:bg-black/40 text-slate-500 group-hover:text-accent shadow-sm'
                }`}>
                <Icon size={20} />
            </div>
            <div>
                <h4 className={`font-display font-black text-base md:text-lg tracking-tight transition-colors ${active ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-slate-200'}`}>{title}</h4>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-500 mt-2 font-medium leading-relaxed">{description}</p>
            </div>
        </div>
        {active && (
            <div className="absolute top-4 right-4 animate-pulse">
                <Sparkles size={14} className="text-accent" />
            </div>
        )}
    </button>
));
ToolCard.displayName = 'ToolCard';

export const ResultBlock = memo(({ title, content, onCopy, copied }) => (
    <div className="bg-slate-50 dark:bg-black/40 rounded-2xl border border-slate-200 dark:border-white/5 p-6 space-y-4 animate-fade-in group shadow-inner">
        <div className="flex justify-between items-center">
            <h5 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-accent/80 flex items-center gap-3">
                <Layout size={14} /> {title}
            </h5>
            <button
                onClick={() => onCopy(content)}
                className="p-2.5 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 shadow-sm"
            >
                {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
            </button>
        </div>
        <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-mono bg-white dark:bg-transparent p-4 rounded-xl border border-slate-100 dark:border-transparent shadow-sm dark:shadow-none">
            {content}
        </div>
    </div>
));
ResultBlock.displayName = 'ResultBlock';
