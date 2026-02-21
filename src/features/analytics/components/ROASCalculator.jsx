import { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';

export function ROASCalculator() {
    const [values, setValues] = useState({
        margin: 30,
        aov: 80,
        cpc: 1.5,
        conversionRate: 2
    });

    const [results, setResults] = useState({
        breakEvenROAS: 0,
        targetCPA: 0,
        profitPerSale: 0
    });

    useEffect(() => {
        const breakEvenROAS = values.margin > 0 ? (100 / values.margin) : 0;
        const targetCPA = (values.aov * values.margin) / 100;
        const profitPerSale = values.aov - targetCPA; // Simplified
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setResults({
            breakEvenROAS: breakEvenROAS.toFixed(2),
            targetCPA: targetCPA.toFixed(2),
            profitPerSale: profitPerSale.toFixed(2)
        });
    }, [values]);

    const handleChange = (e) => {
        setValues({ ...values, [e.target.name]: parseFloat(e.target.value) || 0 });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
            <div className="bg-surface-dark p-6 rounded-2xl border border-white/5">
                <h3 className="text-base md:text-lg font-bold text-white mb-6 flex items-center gap-3">
                    <Calculator size={20} className="text-secondary" /> Paramètres
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Marge Produit (%)</label>
                        <input type="number" name="margin" value={values.margin} onChange={handleChange} className="w-full bg-black/40 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl px-4 py-3 border border-white/10 focus:border-accent/40 outline-none transition-all placeholder:text-slate-700 text-white" />
                    </div>
                    <div>
                        <label className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Panier Moyen (€)</label>
                        <input type="number" name="aov" value={values.aov} onChange={handleChange} className="w-full bg-black/40 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl px-4 py-3 border border-white/10 focus:border-accent/40 outline-none transition-all placeholder:text-slate-700 text-white" />
                    </div>
                    <div>
                        <label className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">CPC (€)</label>
                        <input type="number" name="cpc" value={values.cpc} onChange={handleChange} className="w-full bg-black/40 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl px-4 py-3 border border-white/10 focus:border-accent/40 outline-none transition-all placeholder:text-slate-700 text-white" />
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-surface-dark to-surface-dark/50 p-6 rounded-2xl border border-white/5 flex flex-col justify-center">
                <h3 className="text-base md:text-lg font-bold text-white mb-6">Résultats</h3>
                <div className="space-y-6">
                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-slate-400 text-sm font-bold">ROAS Breakeven</span>
                        <span className="text-2xl md:text-3xl font-display font-bold text-red-400 tracking-tight">{results.breakEvenROAS}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-slate-400 text-sm font-bold">CPA Max (Breakeven)</span>
                        <span className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">{results.targetCPA} €</span>
                    </div>
                    <div className="p-4 bg-secondary/10 rounded-xl border border-secondary/20">
                        <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-[#c3dc7f] mb-2">Conseil :</p>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            Pour être rentable, vos publicités doivent générer au moins <strong className="text-white">{results.breakEvenROAS}€</strong> pour chaque 1€ dépensé.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
