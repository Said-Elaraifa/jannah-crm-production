import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, X, Plus, Search, UserPlus } from 'lucide-react';
import { INTEGRATION_CATALOG } from '../constants';
import { CustomSelect } from '../../../components/ui/CustomSelect';

export function Toggle({ enabled, onChange }) {
    return (
        <button
            onClick={() => onChange(!enabled)}
            className={`w-10 h-5 rounded-full relative transition-all duration-200 ${enabled ? 'bg-primary' : 'bg-white/10'}`}
        >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${enabled ? 'right-0.5' : 'left-0.5'}`} />
        </button>
    );
}

export function ConfigModal({ isOpen, onClose, integration, onSave }) {
    const [form, setForm] = useState({});

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (integration) setForm(integration.config || {});
    }, [integration]);

    if (!isOpen || !integration) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(integration.slug, form);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" style={{ zIndex: 9999 }} onClick={onClose}>
            <div className="bg-surface-dark w-full max-w-md rounded-2xl border border-white/10 shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-white/5">
                    <h3 className="text-xl md:text-2xl font-display font-bold text-white flex items-center gap-3">
                        <SettingsIcon size={20} className="text-primary" /> Configuration : {integration.name}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {integration.fields.map(field => (
                        <div key={field.key}>
                            <label className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">{field.label}</label>
                            <input
                                type={field.type}
                                value={form[field.key] || ''}
                                onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                                className="w-full bg-black/40 text-sm font-bold rounded-xl px-4 py-3 border border-white/10 focus:border-primary/40 outline-none transition-all placeholder:text-slate-700 text-white"
                                placeholder={field.placeholder}
                            />
                        </div>
                    ))}
                    <div className="flex gap-4 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all">Annuler</button>
                        <button type="submit" className="flex-1 py-3 bg-primary hover:bg-green-700 text-white text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95">Sauvegarder</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function AddIntegrationModal({ isOpen, onClose, onAdd, existingSlugs }) {
    const [search, setSearch] = useState('');

    if (!isOpen) return null;

    const filtered = INTEGRATION_CATALOG.filter(item =>
        !existingSlugs.includes(item.slug) &&
        (item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.category.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" style={{ zIndex: 9999 }} onClick={onClose}>
            <div className="bg-surface-dark w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl animate-fade-in-up overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/2">
                    <div>
                        <h3 className="text-xl md:text-2xl font-display font-bold text-white flex items-center gap-3">
                            <Plus size={20} className="text-secondary" /> Ajouter une intégration
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">Explorez notre catalogue d'outils professionnels.</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg"><X size={18} /></button>
                </div>

                <div className="p-6">
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            autoFocus
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Rechercher un outil (Claude, Meta, Slack...)"
                            className="w-full bg-black/40 text-sm font-medium rounded-xl pl-12 pr-4 py-3 border border-white/10 focus:border-primary/40 outline-none transition-all placeholder:text-slate-600 text-white"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {filtered.length > 0 ? filtered.map(item => (
                            <button
                                key={item.slug}
                                onClick={() => {
                                    onAdd(item);
                                    onClose();
                                }}
                                className="flex items-center gap-4 p-4 bg-white/2 hover:bg-white/5 border border-white/5 rounded-2xl text-left transition-all hover:border-primary group active:scale-[0.98]"
                            >
                                <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center ${item.color} flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                    <item.icon size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{item.name}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-0.5">{item.category}</p>
                                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{item.description || 'Intégration native disponible.'}</p>
                                </div>
                                <Plus size={16} className="text-slate-600 group-hover:text-primary" />
                            </button>
                        )) : (
                            <div className="col-span-full py-10 text-center text-slate-500">
                                <Search size={40} className="mx-auto mb-3 opacity-20" />
                                <p>Aucun outil trouvé pour cette recherche.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 bg-white/2 border-t border-white/5 flex justify-end">
                    <button onClick={onClose} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all">
                        Fermer le catalogue
                    </button>
                </div>
            </div>
        </div>
    );
}

export function InviteModal({ isOpen, onClose, onInvite }) {
    const [form, setForm] = useState({ name: '', email: '', role: 'Sales', access: 'Sales' });
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name || !form.email) return;
        onInvite(form);
        setForm({ name: '', email: '', role: 'Sales', access: 'Sales' });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" style={{ zIndex: 9999 }} onClick={onClose}>
            <div className="bg-surface-dark w-full max-w-md rounded-2xl border border-white/10 shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-white/5">
                    <h3 className="text-xl md:text-2xl font-display font-bold text-white flex items-center gap-3">
                        <UserPlus size={20} className="text-secondary" /> Inviter un membre
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Nom complet *</label>
                        <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                            className="w-full bg-black/40 text-sm font-bold rounded-xl px-4 py-3 border border-white/10 focus:border-primary/40 outline-none transition-all placeholder:text-slate-700 text-white"
                            placeholder="Prénom Nom" />
                    </div>
                    <div>
                        <label className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Email *</label>
                        <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                            className="w-full bg-black/40 text-sm font-bold rounded-xl px-4 py-3 border border-white/10 focus:border-primary/40 outline-none transition-all placeholder:text-slate-700 text-white"
                            placeholder="membre@jannah.co" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Rôle</label>
                            <CustomSelect
                                value={form.role}
                                onChange={(val) => setForm({ ...form, role: val })}
                                options={['CEO', 'COO', 'COO / Directeur Adjoint', 'Sales', 'Sales Pur', 'Dev', 'Lead Dev', 'Marketing'].map(r => ({ value: r, label: r }))}
                                className="!bg-black/40 text-white !border-white/10"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Accès</label>
                            <CustomSelect
                                value={form.access}
                                onChange={(val) => setForm({ ...form, access: val })}
                                options={['Admin', 'Tech', 'Sales', 'Viewer'].map(a => ({ value: a, label: a }))}
                                className="!bg-black/40 text-white !border-white/10"
                            />
                        </div>
                    </div>
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
                        <p className="text-xs text-slate-400">📧 Un email d'invitation sera envoyé à cette adresse.</p>
                    </div>
                    <div className="flex gap-4 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all">Annuler</button>
                        <button type="submit" className="flex-1 py-3 bg-primary hover:bg-green-700 text-white text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95">Envoyer l'invitation</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
