import { Sparkles, Loader2, X } from 'lucide-react';

export function AIAnalysisModal({ isOpen, onClose, lead, analysis, loading }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" style={{ zIndex: 10000 }} onClick={onClose}>
            <div className="bg-surface-dark w-full max-w-2xl rounded-[2rem] border border-primary/20 shadow-[0_0_80px_-20px_rgba(195,220,127,0.15)] animate-zoom-in flex flex-col max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-white/5 bg-gradient-to-r from-primary/10 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg text-secondary">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-display font-bold text-white">Audit Stratégique IA</h3>
                            <p className="text-sm text-slate-400 mt-0.5">Analyse par Gemini 2.0 Flash pour <span className="text-secondary">{lead?.company}</span></p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all"><X size={20} /></button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                            <div className="relative">
                                <Loader2 size={48} className="text-primary animate-spin" />
                                <Sparkles size={20} className="text-secondary absolute -top-2 -right-2 animate-pulse" />
                            </div>
                            <p className="text-slate-300 font-medium animate-pulse">Extraction de la stratégie gagnante...</p>
                        </div>
                    ) : (
                        <div className="prose prose-invert max-w-none prose-p:text-slate-300 prose-headings:text-white prose-strong:text-secondary whitespace-pre-line leading-relaxed text-sm">
                            {analysis}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end gap-3">
                    <button onClick={onClose} className="px-8 py-3 bg-primary hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95">
                        Compris, au boulot !
                    </button>
                </div>
            </div>
        </div>
    );
}
