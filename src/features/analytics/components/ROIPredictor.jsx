import { useState } from 'react';
import { Zap, Loader2, Sparkles, MessageSquareText } from 'lucide-react';
import { predictAdsRoi } from '../../../services/gemini';

export function ROIPredictor() {
    const [sim, setSim] = useState({
        budget: 5000,
        cpa: 25,
        aov: 1500,
        closingRate: 20
    });
    const [prediction, setPrediction] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePredict = async () => {
        setLoading(true);
        try {
            const res = await predictAdsRoi(sim);
            setPrediction(res);
        } catch (err) {
            setPrediction(`Erreur d'analyse : ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const estRevenue = (sim.budget / sim.cpa) * sim.aov * (sim.closingRate / 100);
    const estLeads = Math.round(sim.budget / sim.cpa);
    const estROAS = (estRevenue / sim.budget).toFixed(2);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
            <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 space-y-6">
                <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-3">
                    <Zap size={20} className="text-secondary" /> Simulation
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Budget Mensuel (€)</label>
                        <input type="number" value={sim.budget} onChange={e => setSim({ ...sim, budget: parseFloat(e.target.value) || 0 })} className="w-full bg-black/40 text-sm font-bold rounded-xl px-4 py-3 border border-white/10 focus:border-secondary/40 outline-none transition-all text-white placeholder:text-slate-700" />
                    </div>
                    <div>
                        <label className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">CPL Cible (Coût Lead)</label>
                        <input type="number" value={sim.cpa} onChange={e => setSim({ ...sim, cpa: parseFloat(e.target.value) || 0 })} className="w-full bg-black/40 text-sm font-bold rounded-xl px-4 py-3 border border-white/10 focus:border-secondary/40 outline-none transition-all text-white placeholder:text-slate-700" />
                    </div>
                    <div>
                        <label className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Panier Moyen (€)</label>
                        <input type="number" value={sim.aov} onChange={e => setSim({ ...sim, aov: parseFloat(e.target.value) || 0 })} className="w-full bg-black/40 text-sm font-bold rounded-xl px-4 py-3 border border-white/10 focus:border-secondary/40 outline-none transition-all text-white placeholder:text-slate-700" />
                    </div>
                    <div>
                        <label className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Closing Rate (%)</label>
                        <input type="number" value={sim.closingRate} onChange={e => setSim({ ...sim, closingRate: parseFloat(e.target.value) || 0 })} className="w-full bg-black/40 text-sm font-bold rounded-xl px-4 py-3 border border-white/10 focus:border-secondary/40 outline-none transition-all text-white placeholder:text-slate-700" />
                    </div>
                </div>
                <button
                    onClick={handlePredict}
                    disabled={loading}
                    className="w-full py-4 bg-primary hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    {loading ? 'Analyse par Gemini...' : 'Lancer la Prédiction IA'}
                </button>
            </div>

            <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-3 gap-6">
                    <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 text-center">
                        <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Leads Estimés</p>
                        <p className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">{estLeads}</p>
                    </div>
                    <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 text-center">
                        <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Revenue Potentiel</p>
                        <p className="text-2xl md:text-3xl font-display font-bold text-secondary tracking-tight">{estRevenue.toLocaleString()}€</p>
                    </div>
                    <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 text-center">
                        <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-2">ROAS Estimé</p>
                        <p className="text-2xl md:text-3xl font-display font-bold text-accent tracking-tight">{estROAS}x</p>
                    </div>
                </div>

                <div className="bg-black/30 p-8 rounded-2xl border border-primary/20 h-full min-h-[300px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Sparkles size={100} className="text-primary -rotate-12" />
                    </div>
                    <h4 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-3">
                        Analyse de l'Expert IA
                    </h4>
                    {prediction ? (
                        <div className="prose prose-invert max-w-none text-sm text-slate-300 leading-relaxed whitespace-pre-line animate-fade-in">
                            {prediction}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center py-10">
                            <MessageSquareText size={40} className="text-slate-700 mb-3" />
                            <p className="text-slate-500 italic">Configurez vos paramètres et lancez l'IA pour obtenir une analyse stratégique de cette simulation.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
