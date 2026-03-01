import { Plus } from 'lucide-react';
import { LeadCard } from './LeadCard';

export function KanbanColumn({ stage, stageLeads, stages, isOver, onDragOver, onDrop, onOpenAdd, moveLead, deleteLead, openEdit, handleAudit, handleDragStart, handleDragEnd, selectedLeads = [], onToggleSelect }) {
    const stageTotal = stageLeads.reduce((sum, l) => sum + (l.value || 0), 0);

    return (
        <div
            className="w-full flex flex-col"
            onDragOver={(e) => onDragOver(e, stage.id)}
            onDrop={(e) => onDrop(e, stage.id)}
        >
            {/* Column Header */}
            <div className={`flex items-start justify-between p-3 rounded-t-xl bg-surface-dark border border-white/5 mb-0 z-10 border-b-2 ${stage.color}`}>
                <div>
                    <div className="flex items-center gap-1.5 mb-1">
                        <span className={`text-sm font-display font-bold tracking-tight ${stage.textColor}`}>{stage.label}</span>
                        <span className="bg-black/40 text-slate-400 text-[9px] font-bold px-1.5 py-0.5 rounded-md border border-white/5">{stageLeads.length}</span>
                    </div>
                    <div className="text-[9px] font-black uppercase tracking-tight text-slate-500">
                        <span className="text-white">{(stageTotal / 1000).toFixed(1)}k€</span> potentiel
                    </div>
                </div>
                <button onClick={() => onOpenAdd(stage.id)} className="p-1.5 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all"><Plus size={16} /></button>
            </div>

            {/* Scrollable Column Body */}
            <div className={`bg-black/20 p-2 space-y-2 rounded-b-xl border-x border-b border-white/5 transition-colors ${isOver ? 'bg-primary/5 ring-1 ring-primary/30' : ''}`}>
                {stageLeads.map(lead => (
                    <LeadCard
                        key={lead.id}
                        lead={lead}
                        stages={stages}
                        onMove={moveLead}
                        onDelete={deleteLead}
                        onEdit={openEdit}
                        onAudit={handleAudit}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        isSelected={selectedLeads.includes(lead.id)}
                        onToggleSelect={() => onToggleSelect(lead.id)}
                    />
                ))}
                {stageLeads.length === 0 && (
                    <div className="h-24 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl text-slate-600 bg-black/10">
                        <p className="text-[10px] font-black uppercase tracking-widest">Vide</p>
                    </div>
                )}
            </div>
        </div>
    );
}
