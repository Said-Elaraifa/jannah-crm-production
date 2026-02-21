import { memo } from 'react';
import { Sparkles, Layout, Check, Copy } from 'lucide-react';

// eslint-disable-next-line no-unused-vars
export const ToolCard = memo(({ title, description, icon: Icon, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full text-left p-6 rounded-3xl border transition-all duration-500 group relative overflow-hidden ${active
            ? 'bg-accent/10 border-accent/30 shadow-lg shadow-accent/5'
            : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
            }`}
    >
        <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl transition-all duration-500 ${active ? 'bg-accent text-primary scale-110' : 'bg-black/40 text-slate-500 group-hover:text-accent'
                }`}>
                <Icon size={20} />
            </div>
            <div>
                <h4 className={`font-display font-bold text-base md:text-lg tracking-tight transition-colors ${active ? 'text-white' : 'text-slate-200'}`}>{title}</h4>
                <p className="text-xs md:text-sm text-slate-500 mt-1.5 leading-relaxed">{description}</p>
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
    <div className="bg-black/40 rounded-2xl border border-white/5 p-6 space-y-4 animate-fade-in group">
        <div className="flex justify-between items-center">
            <h5 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-accent/60 flex items-center gap-3">
                <Layout size={14} /> {title}
            </h5>
            <button
                onClick={() => onCopy(content)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white"
            >
                {copied ? <Check size={14} className="text-[#c3dc7f]" /> : <Copy size={14} />}
            </button>
        </div>
        <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-mono">
            {content}
        </div>
    </div>
));
ResultBlock.displayName = 'ResultBlock';
