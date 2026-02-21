import { useState } from 'react';
import { Target, Copy } from 'lucide-react';
import { CustomSelect } from '../../../components/ui/CustomSelect';

export function NamingConventionBuilder() {
    const [elements, setElements] = useState({
        date: new Date().toISOString().slice(0, 10),
        geo: 'FR',
        offer: '',
        objective: 'CONV',
        type: 'COLD'
    });

    const generatedName = `${elements.date}_${elements.geo}_${elements.offer.replace(/\s+/g, '').toUpperCase() || 'OFFER'}_${elements.objective}_${elements.type}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedName);
        alert("Nom copiée !");
    };

    return (
        <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 animate-fade-in-up">
            <h3 className="text-base md:text-lg font-bold text-white mb-6 flex items-center gap-3">
                <Target size={20} className="text-purple-400" /> Naming Convention Generator
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div>
                    <label className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Date</label>
                    <input
                        type="date"
                        value={elements.date}
                        onChange={(e) => setElements({ ...elements, date: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 focus:border-purple-400/40 outline-none transition-all rounded-xl p-3 text-[10px] md:text-xs font-black text-white"
                    />
                </div>
                <div>
                    <label className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Geo</label>
                    <input
                        type="text"
                        value={elements.geo}
                        onChange={(e) => setElements({ ...elements, geo: e.target.value.toUpperCase() })}
                        className="w-full bg-black/40 border border-white/10 focus:border-purple-400/40 outline-none transition-all rounded-xl p-3 text-sm font-bold text-white placeholder:text-slate-700"
                        placeholder="FR, UK..."
                    />
                </div>
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Offre / Produit</label>
                    <input
                        type="text"
                        value={elements.offer}
                        onChange={(e) => setElements({ ...elements, offer: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 focus:border-purple-400/40 outline-none transition-all rounded-xl p-3 text-sm font-bold text-white placeholder:text-slate-700"
                        placeholder="Ebook, Promo..."
                    />
                </div>
                <div>
                    <label className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Objectif</label>
                    <CustomSelect
                        value={elements.objective}
                        onChange={val => setElements({ ...elements, objective: val })}
                        options={[
                            { value: 'CONV', label: 'CONV' },
                            { value: 'LEAD', label: 'LEAD' },
                            { value: 'TRAFFIC', label: 'TRAFFIC' },
                            { value: 'AWARENESS', label: 'AWARENESS' }
                        ]}
                        className="text-white"
                    />
                </div>
                <div>
                    <label className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Type</label>
                    <CustomSelect
                        value={elements.type}
                        onChange={val => setElements({ ...elements, type: val })}
                        options={[
                            { value: 'COLD', label: 'COLD' },
                            { value: 'RETARGETING', label: 'RETARGETING' },
                            { value: 'LOOKALIKE', label: 'LOOKALIKE' },
                            { value: 'LOYALTY', label: 'LOYALTY' }
                        ]}
                        className="text-white"
                    />
                </div>
            </div>

            <div className="p-4 bg-black/40 rounded-xl border border-white/10 flex items-center gap-4">
                <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Nom de Campagne :</p>
                    <p className="text-sm text-purple-400 font-mono font-bold truncate">{generatedName}</p>
                </div>
                <button
                    onClick={copyToClipboard}
                    className="p-3 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500/20 transition-colors"
                >
                    <Copy size={20} />
                </button>
            </div>
        </div>
    );
}
