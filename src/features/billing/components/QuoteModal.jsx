import { useState } from 'react';
import { Plus, X, Receipt, Trash2, Send } from 'lucide-react';
import { createQuote } from '../../../services/billing';
import { CustomSelect } from '../../../components/ui/CustomSelect';

export function QuoteModal({ isOpen, onClose, clients, onSave }) {
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        client_id: '',
        title: 'Devis Création Site Web',
        tax_rate: 20.0
    });

    const [items, setItems] = useState([
        { description: 'Design UI/UX', quantity: 1, unit_price: 1500 }
    ]);

    if (!isOpen) return null;

    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const total = subtotal * (1 + form.tax_rate / 100);

    const addItem = () => setItems([...items, { description: '', quantity: 1, unit_price: 0 }]);
    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };
    const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.client_id || items.length === 0) {
            alert("Veuillez sélectionner un client et ajouter au moins un service.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                client_id: form.client_id,
                title: form.title,
                items: items,
                subtotal,
                tax_rate: form.tax_rate,
                total,
                status: 'Draft'
            };
            const newQuote = await createQuote(payload);
            const clientName = clients.find(c => c.id === form.client_id)?.name || 'Client';
            // Attach client name for UI optimization without refreshing everything immediately
            newQuote.clients = { name: clientName };
            onSave(newQuote);
            onClose();
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la création du devis : " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const inputCls = "bg-black/40 text-[10px] md:text-xs font-black uppercase tracking-widest text-white rounded-xl px-4 py-3 border border-white/10 focus:border-accent/40 outline-none transition-all placeholder-slate-700 w-full";

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm z-[9999]" onClick={onClose}>
            <div className="bg-surface-dark w-full max-w-2xl rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-8 border-b border-white/5 bg-white/[0.02]">
                    <h3 className="text-xl md:text-2xl font-display font-bold text-white flex items-center gap-3">
                        <Receipt size={24} className="text-accent" />
                        Nouveau Devis
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-xl"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Client *</label>
                            <CustomSelect
                                value={form.client_id}
                                onChange={(val) => setForm({ ...form, client_id: val })}
                                options={clients.map(c => ({ value: c.id, label: c.name }))}
                                placeholder="-- Sélectionner un client --"
                                className="text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Titre du devis *</label>
                            <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder="Ex: Prestation Web" />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <div className="flex justify-between items-end mb-4">
                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Lignes de facturation</label>
                            <button type="button" onClick={addItem} className="text-[10px] flex items-center gap-1 font-bold bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg border border-white/10 transition-colors">
                                <Plus size={12} /> Ajouter une ligne
                            </button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={index} className="flex gap-2 items-start bg-black/20 p-2 rounded-xl border border-white/5 relative group">
                                    <div className="flex-1">
                                        <input required value={item.description} onChange={e => updateItem(index, 'description', e.target.value)} placeholder="Description de la prestation" className="w-full bg-transparent text-xs text-white p-2 outline-none font-bold" />
                                    </div>
                                    <div className="w-20">
                                        <input type="number" min="1" required value={item.quantity} onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 1)} className="w-full bg-black/40 text-xs text-center text-white py-2 rounded-lg border border-white/5 outline-none font-mono" placeholder="Qté" />
                                    </div>
                                    <div className="w-28">
                                        <input type="number" min="0" required value={item.unit_price} onChange={e => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)} className="w-full bg-black/40 text-xs text-center text-white py-2 rounded-lg border border-white/5 outline-none font-mono text-accent" placeholder="Prix Unitaire" />
                                    </div>
                                    <button type="button" onClick={() => removeItem(index)} className="p-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-white/5">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between text-xs text-slate-400 font-bold uppercase tracking-widest">
                                <span>Sous-total HTML</span>
                                <span className="font-mono text-white">{subtotal.toLocaleString()} €</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase tracking-widest">
                                <span>TVA (%)</span>
                                <input type="number" value={form.tax_rate} onChange={e => setForm({ ...form, tax_rate: parseFloat(e.target.value) || 0 })} className="w-16 bg-black/40 text-right text-white py-1 px-2 rounded-lg border border-white/5 outline-none font-mono" />
                            </div>
                            <div className="flex justify-between font-black text-white text-xl pt-3 border-t border-white/10">
                                <span>TOTAL TTC</span>
                                <span className="font-mono text-accent">{total.toLocaleString()} €</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 flex gap-4">
                        <button type="button" onClick={onClose} disabled={saving} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors border border-white/5">
                            Annuler
                        </button>
                        <button type="submit" disabled={saving} className="flex-1 py-4 bg-primary hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-[0_0_30px_rgba(5,109,71,0.3)] disabled:opacity-50 flex justify-center items-center gap-2">
                            {saving ? 'Création en cours...' : <><Send size={18} /> Générer le Devis</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
