import { useState, useEffect } from 'react';
import { Plus, X, Edit2 } from 'lucide-react';
import { TEAM_MEMBERS } from '../../../data/constants';
import { STAGES, SOURCES } from '../constants';
import { Field } from './SalesHelpers';
import { CustomSelect } from '../../../components/ui/CustomSelect';

export function LeadModal({ isOpen, onClose, onSave, initialData = null, defaultStage = 'new' }) {
    const isEdit = !!initialData;
    const [saving, setSaving] = useState(false);

    const getInitialForm = () => initialData || {
        company: '', contact: '', email: '', phone: '',
        value: '', stage: defaultStage, score: 50, source: 'Inbound',
        notes: '', assigned_to: TEAM_MEMBERS[0]?.name || 'Ghassen',
        probability: 50, next_step: '', last_contact: new Date().toISOString().split('T')[0]
    };

    const [form, setForm] = useState(getInitialForm());

    useEffect(() => {
        if (isOpen) {
            setForm(getInitialForm());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, initialData, defaultStage]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.company || !form.contact) return;

        const payload = {
            ...form,
            value: parseInt(form.value) || 0,
            score: parseInt(form.score) || 50,
            probability: parseInt(form.probability) || 50,
        };

        const originalId = form.id;

        // Always remove read-only auto-generated fields to prevent Supabase update rejection
        delete payload.id;
        delete payload.created_at;
        delete payload.updated_at;

        setSaving(true);
        try {
            await onSave(originalId ? { id: originalId, ...payload } : payload);
            onClose();
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la sauvegarde du deal : " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const inputCls = "w-full bg-black/40 text-[10px] md:text-xs font-black uppercase tracking-widest text-white rounded-xl px-4 py-3 border border-white/10 focus:border-accent/40 outline-none transition-all placeholder-slate-700";

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" style={{ zIndex: 9999 }} onClick={onClose}>
            <div className="bg-surface-dark w-full max-w-xl rounded-[2rem] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] animate-zoom-in overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-8 border-b border-white/5">
                    <h3 className="text-xl md:text-2xl font-display font-bold text-white flex items-center gap-3">
                        {isEdit ? <Edit2 size={20} className="text-accent" /> : <Plus size={20} className="text-secondary" />}
                        {isEdit ? 'Modifier le Deal' : 'Nouveau Deal'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh] custom-scrollbar">
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Entreprise *">
                            <input required value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className={inputCls} placeholder="Nom de l'entreprise" />
                        </Field>
                        <Field label="Contact *">
                            <input required value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} className={inputCls} placeholder="Prénom Nom" />
                        </Field>
                    </div>

                    <div className="grid grid-cols-3 gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                        <Field label="Valeur (€)">
                            <input type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} className={`${inputCls} font-bold text-accent`} placeholder="2500" />
                        </Field>
                        <Field label="Probabilité (%)">
                            <input type="number" min="0" max="100" value={form.probability} onChange={e => setForm({ ...form, probability: e.target.value })} className={inputCls} />
                        </Field>
                        <Field label="Score (0-100)">
                            <input type="number" min="0" max="100" value={form.score} onChange={e => setForm({ ...form, score: e.target.value })} className={inputCls} />
                        </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Prochaine Étape">
                            <input value={form.next_step} onChange={e => setForm({ ...form, next_step: e.target.value })} className={inputCls} placeholder="Ex: Relance J+3" />
                        </Field>
                        <Field label="Dernier Contact">
                            <input type="date" value={form.last_contact} onChange={e => setForm({ ...form, last_contact: e.target.value })} className={inputCls} />
                        </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Email">
                            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputCls} placeholder="email@exemple.fr" />
                        </Field>
                        <Field label="Téléphone">
                            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inputCls} placeholder="+33 6..." />
                        </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Étape">
                            <CustomSelect
                                value={form.stage}
                                onChange={(val) => setForm({ ...form, stage: val })}
                                options={STAGES.map(s => ({ value: s.id, label: s.label }))}
                                className="text-white"
                            />
                        </Field>
                        <Field label="Source">
                            <CustomSelect
                                value={form.source}
                                onChange={(val) => setForm({ ...form, source: val })}
                                options={SOURCES.map(s => ({ value: s, label: s }))}
                                className="text-white"
                            />
                        </Field>
                    </div>

                    <Field label="Assigné à">
                        <CustomSelect
                            value={form.assigned_to}
                            onChange={(val) => setForm({ ...form, assigned_to: val })}
                            options={TEAM_MEMBERS.map(m => ({ value: m.name, label: `${m.name} (${m.role})` }))}
                            className="!border-white/10 !bg-black/40 text-white"
                        />
                    </Field>

                    <Field label="Notes">
                        <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3}
                            className={inputCls + " resize-none"} placeholder="Informations complémentaires..." />
                    </Field>

                    <div className="pt-6 border-t border-white/5 flex gap-3">
                        <button type="button" onClick={onClose} disabled={saving} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors disabled:opacity-50">Annuler</button>
                        <button type="submit" disabled={saving} className="flex-1 py-3 bg-primary hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50">
                            {saving ? 'Enregistrement...' : (isEdit ? 'Mettre à jour' : 'Créer le Deal')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
