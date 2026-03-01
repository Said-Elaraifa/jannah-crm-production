import { GripVertical, PhoneCall, Mail, Edit2, Trash2, User, Sparkles, ArrowRight, Award, CheckSquare, Square } from 'lucide-react';
import { getDealRottingStatus } from '../constants';
import { ScoreBadge } from './SalesHelpers';

// eslint-disable-next-line no-unused-vars
export function LeadCard({ lead, stages, onMove, onDelete, onEdit, onAudit, onDragStart, onDragEnd, isSelected, onToggleSelect }) {
    const currentStageIdx = stages.findIndex(s => s.id === lead.stage);
    const nextStage = stages[currentStageIdx + 1];
    const rotting = getDealRottingStatus(lead.last_contact || lead.created_at);

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, lead.id)}
            onDragEnd={onDragEnd}
            className={`bg-surface-dark rounded-lg border hover:border-primary/50 transition-all duration-300 group p-3 shadow-md cursor-grab active:cursor-grabbing active:opacity-70 flex flex-col gap-2 relative overflow-hidden ${isSelected ? 'border-accent ring-1 ring-accent bg-accent/5' : 'border-white/5'}`}
        >
            {/* Header with Grip, Checkbox & Info */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 min-w-0">
                    <button onClick={(e) => { e.stopPropagation(); onToggleSelect(); }} className="mt-0.5 flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity">
                        {isSelected ? <CheckSquare size={14} className="text-accent" /> : <Square size={14} className="text-slate-500" />}
                    </button>
                    <GripVertical size={12} className="text-slate-600 flex-shrink-0 group-hover:text-slate-400" />
                    <div className="min-w-0">
                        <h4 className="font-display font-bold text-white text-[13px] truncate leading-none mb-0.5">{lead.company}</h4>
                        <p className="text-[10px] text-slate-500 truncate opacity-80">{lead.contact}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div className="flex items-center gap-1">
                        <ScoreBadge score={lead.score} />
                    </div>
                </div>
            </div>

            {/* Rotting Indicator & Next Step */}
            <div className="flex items-center justify-between text-[10px] bg-black/20 p-1.5 rounded-lg border border-white/5">
                <div className={`flex items-center gap-1 font-black uppercase tracking-tighter ${rotting.color}`}>
                    <rotting.icon size={10} />
                    <span>{rotting.label}</span>
                </div>
                {lead.next_step && (
                    <div className="text-slate-500 font-bold truncate max-w-[80px]">
                        {lead.next_step}
                    </div>
                )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
                <span className="text-[9px] font-black px-2 py-0.5 bg-white/5 text-slate-400 rounded-md border border-white/10 uppercase">{lead.source}</span>
                {lead.assigned_to && (
                    <span className="text-[9px] font-black px-2 py-0.5 bg-white/5 text-slate-500 rounded-md border border-white/5 uppercase">{lead.assigned_to}</span>
                )}
            </div>

            {/* AI Next Action Button */}
            <button
                onClick={(e) => { e.stopPropagation(); onAudit(lead); }}
                className="w-full mt-1 flex items-center justify-center gap-2 py-1.5 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 hover:border-purple-500/40 rounded-md transition-all text-purple-400 hover:text-purple-300"
            >
                <Sparkles size={12} className="animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest">Prochaine Action IA</span>
            </button>

            {/* Probability Bar */}
            <div className="h-1 w-full bg-black/40 rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full" style={{ width: `${lead.probability || 50}%` }} />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-white font-bold text-[15px] tracking-tight">
                    {(lead.value || 0).toLocaleString()} <span className="text-accent text-[10px]">€</span>
                </span>
                <div className="flex gap-1.5">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Supprimer ce deal ?')) onDelete(lead.id);
                        }}
                        className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                        title="Supprimer"
                    >
                        <Trash2 size={12} />
                    </button>
                    <button onClick={() => onEdit(lead)} className="p-1.5 text-slate-500 hover:text-white transition-colors"><Edit2 size={12} /></button>
                    {nextStage && (
                        <button
                            onClick={() => onMove(lead.id, nextStage.id)}
                            className="flex items-center justify-center w-6 h-6 bg-white/5 hover:bg-primary text-slate-400 hover:text-white rounded-md transition-all border border-white/5"
                        >
                            <ArrowRight size={12} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
