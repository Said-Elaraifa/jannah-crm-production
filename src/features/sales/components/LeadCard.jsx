import { GripVertical, PhoneCall, Mail, Edit2, Trash2, User, Sparkles, ArrowRight, Award } from 'lucide-react';
import { getDealRottingStatus } from '../constants';
import { ScoreBadge } from './SalesHelpers';

// eslint-disable-next-line no-unused-vars
export function LeadCard({ lead, stages, onMove, onDelete, onEdit, onAudit, onDragStart, onDragEnd }) {
    const currentStageIdx = stages.findIndex(s => s.id === lead.stage);
    const nextStage = stages[currentStageIdx + 1];
    const rotting = getDealRottingStatus(lead.last_contact || lead.created_at);

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, lead.id)}
            onDragEnd={onDragEnd}
            className="bg-surface-dark rounded-lg border border-white/5 hover:border-primary/30 transition-all duration-300 group p-3 shadow-md cursor-grab active:cursor-grabbing active:opacity-70 flex flex-col gap-2"
        >
            {/* Header with Grip & Actions */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-1.5 min-w-0">
                    <GripVertical size={12} className="text-slate-600 flex-shrink-0 group-hover:text-slate-400" />
                    <div className="min-w-0">
                        <h4 className="font-display font-bold text-white text-[13px] truncate leading-none mb-0.5">{lead.company}</h4>
                        <p className="text-[10px] text-slate-500 truncate opacity-80">{lead.contact}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); onAudit(lead); }}
                            className="p-1 bg-primary/10 text-secondary border border-primary/20 rounded-md hover:bg-primary/20 transition-all flex items-center gap-1"
                            title="Audit IA"
                        >
                            <Sparkles size={10} />
                            <span className="text-[9px] font-black uppercase">Audit</span>
                        </button>
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
