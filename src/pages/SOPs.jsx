// src/pages/SOPs.jsx
import { useState } from 'react';
import { Plus, Trash2, BookOpen, X, Eye, ChevronRight, ListChecks, Video, FileText, BookMarked, Edit2, Search, Filter, FolderOpen, ExternalLink } from 'lucide-react';
import { CustomSelect } from '../components/ui/CustomSelect';

const TYPE_ICONS = { Checklist: ListChecks, Vidéo: Video, Document: FileText, Guide: BookMarked };
const TYPE_COLORS = {
    Checklist: 'text-emerald-400 bg-emerald-500/10',
    Vidéo: 'text-blue-400 bg-blue-500/10',
    Document: 'text-slate-300 bg-slate-500/10',
    Guide: 'text-purple-400 bg-purple-500/10',
};
const CATEGORIES = ['All', 'Sales', 'Tech', 'Marketing', 'RH'];

function SOPModal({ isOpen, onClose, onSave, initialData = null }) {
    const isEdit = !!initialData;
    const [form, setForm] = useState(initialData || { title: '', category: 'Sales', type: 'Document', author: 'Ismael', content: '' });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        onSave({ id: initialData?.id || Date.now(), ...form, lastUpdated: 'Maintenant' });
        if (!isEdit) setForm({ title: '', category: 'Sales', type: 'Document', author: 'Ismael', content: '' });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" style={{ zIndex: 9999 }} onClick={onClose}>
            <div className="bg-surface-dark w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-white/5">
                    <h3 className="text-xl md:text-2xl font-display font-bold text-white flex items-center gap-3">
                        {isEdit ? <Edit2 size={20} className="text-accent" /> : <BookOpen size={20} className="text-secondary" />}
                        {isEdit ? 'Modifier le SOP' : 'Nouveau SOP'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-all"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Titre *</label>
                        <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                            className="w-full bg-black/40 text-sm font-bold rounded-xl px-4 py-3 border border-white/10 focus:border-primary/40 outline-none transition-all placeholder:text-slate-700 text-white"
                            placeholder="Ex: Processus d'onboarding client" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { key: 'category', label: 'Catégorie', options: ['Sales', 'Tech', 'Marketing', 'RH'] },
                            { key: 'type', label: 'Type', options: ['Document', 'Checklist', 'Guide', 'Vidéo'] },
                            { key: 'author', label: 'Auteur', options: ['Ismael', 'Jessy', 'Said', 'Ghassen'] },
                        ].map(field => (
                            <div key={field.key}>
                                <label className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">{field.label}</label>
                                <CustomSelect
                                    value={form[field.key]}
                                    onChange={(val) => setForm({ ...form, [field.key]: val })}
                                    options={field.options.map(o => ({ value: o, label: o }))}
                                    className="!bg-black/40 text-white !border-white/10"
                                />
                            </div>
                        ))}
                    </div>
                    <div>
                        <label className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Contenu (Markdown supporté)</label>
                        <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={10}
                            className="w-full bg-black/40 text-sm rounded-xl px-4 py-3 border border-white/10 focus:border-primary/40 outline-none transition-all resize-none placeholder:text-slate-700 text-white font-mono leading-relaxed"
                            placeholder="# Titre Section 1\n\n- Point important 1\n- Point important 2" />
                    </div>
                    <div className="flex gap-4 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all">Annuler</button>
                        <button type="submit" className="flex-1 py-3 bg-primary hover:bg-green-700 text-white text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95">
                            {isEdit ? 'Enregistrer' : 'Créer le SOP'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function SOPDetailModal({ sop, onClose, onEdit }) {
    if (!sop) return null;
    const Icon = TYPE_ICONS[sop.type] || FileText;

    // Simple parser to make the content look nicer without heavy libraries
    const renderContent = (content) => {
        if (!content) return <p className="text-slate-500 italic">Aucun contenu.</p>;

        return content.split('\n').map((line, i) => {
            if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold text-white mt-6 mb-3 border-b border-white/10 pb-1">{line.replace('### ', '')}</h3>;
            if (line.startsWith('**') && line.endsWith('**')) return <strong key={i} className="block text-white font-bold mt-4 mb-2">{line.replace(/\*\*/g, '')}</strong>;
            if (line.startsWith('- [ ]')) return (
                <div key={i} className="flex items-start gap-3 my-2 pl-2">
                    <div className="w-4 h-4 rounded border border-slate-500 mt-1 flex-shrink-0"></div>
                    <span className="text-slate-300">{line.replace('- [ ] ', '')}</span>
                </div>
            );
            if (line.startsWith('- ')) return (
                <div key={i} className="flex items-start gap-3 my-1.5 pl-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-2 flex-shrink-0"></div>
                    <span className="text-slate-300">{line.replace('- ', '')}</span>
                </div>
            );
            if (line.trim() === '') return <div key={i} className="h-2"></div>;
            return <p key={i} className="text-slate-300 mb-1 leading-relaxed">{line}</p>;
        });
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" style={{ zIndex: 9999 }} onClick={onClose}>
            <div className="bg-surface-dark w-full max-w-3xl rounded-2xl border border-white/10 shadow-2xl h-[90vh] flex flex-col animate-scale-in" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#152636]">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${TYPE_COLORS[sop.type] || 'text-slate-400 bg-slate-500/10'}`}>
                            <Icon size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border border-slate-700 px-1.5 rounded">{sop.category}</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border border-slate-700 px-1.5 rounded">{sop.type}</span>
                            </div>
                            <h3 className="text-xl font-display font-bold text-white leading-tight">{sop.title}</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => { onClose(); onEdit(sop); }}
                            className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all text-sm font-medium">
                            <Edit2 size={16} /> Modifier
                        </button>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#0f172a]">
                    <div className="max-w-2xl mx-auto">
                        <div className="prose prose-invert prose-sm max-w-none">
                            {renderContent(sop.content)}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 bg-[#152636] flex justify-between items-center text-xs text-slate-500">
                    <p>Dernière mise à jour : {sop.lastUpdated} par <span className="text-slate-300 font-medium">{sop.author}</span></p>
                    <div className="flex gap-4">
                        <button className="hover:text-white transition-colors flex items-center gap-1"><ExternalLink size={12} /> Ouvrir dans un nouvel onglet</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SOPs({ sops, setSops }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSOP, setEditingSOP] = useState(null);
    const [selectedSOP, setSelectedSOP] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const openAdd = () => { setEditingSOP(null); setModalOpen(true); };
    const openEdit = (sop) => { setEditingSOP(sop); setModalOpen(true); };

    const handleSave = (sop) => {
        if (editingSOP) {
            setSops(prev => prev.map(s => s.id === sop.id ? sop : s));
        } else {
            setSops(prev => [sop, ...prev]);
        }
    };

    const deleteSOP = (id, e) => {
        e.stopPropagation();
        if (confirm('Supprimer ce SOP ?')) {
            setSops(prev => prev.filter(s => s.id !== id));
        }
    };

    const filteredSOPs = sops.filter(sop => {
        const matchesSearch = sop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sop.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'All' || sop.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <SOPDetailModal sop={selectedSOP} onClose={() => setSelectedSOP(null)} onEdit={openEdit} />
            <SOPModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} initialData={editingSOP} />

            {/* Header Area */}
            <div className="relative mb-8 z-10 w-full flex-shrink-0">
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-accent/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none -translate-y-1/2 animate-pulse-glow" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 w-full">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest text-accent mb-6 shadow-[0_0_15px_rgba(238,180,23,0.2)]">
                            <BookOpen size={12} className="animate-pulse" /> Centre de Connaissances
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-4 text-slate-900 dark:text-white flex flex-wrap items-center gap-4">
                            Knowledge <span className="text-accent underline decoration-accent/30 underline-offset-8">Base</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-base md:text-lg leading-relaxed font-medium mt-4">
                            Centre de documentation et procédures internes. Retrouvez tous vos SOPs ici. Optimisez vos processus.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative group">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors" />
                            <input
                                type="text"
                                placeholder="RECHERCHER..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full sm:w-64 bg-white dark:bg-white/5 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl pl-12 pr-4 py-4 border border-slate-200 dark:border-white/10 focus:border-accent/40 outline-none transition-all placeholder:text-slate-400 text-slate-900 dark:text-white shadow-sm"
                            />
                        </div>
                        <button onClick={openAdd}
                            className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-accent to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-accent/20 active:scale-95 whitespace-nowrap">
                            <Plus size={16} strokeWidth={3} /> NOUVEAU DOC
                        </button>
                    </div>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar relative z-10">
                <div className="flex bg-white/50 dark:bg-surface-dark/40 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 p-1 shadow-sm">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat
                                ? 'bg-white dark:bg-accent text-slate-900 dark:text-bg-dark shadow-lg shadow-accent/20'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {filteredSOPs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[2.5rem] bg-slate-50/50 dark:bg-white/2 relative z-10">
                    <div className="w-20 h-20 bg-white dark:bg-surface-dark rounded-3xl flex items-center justify-center mb-6 border border-slate-200 dark:border-white/10 shadow-xl">
                        <FolderOpen size={32} className="text-slate-300 dark:text-slate-600" />
                    </div>
                    <h3 className="text-xl font-display font-black text-slate-900 dark:text-white mb-3 tracking-tight">Aucun document trouvé</h3>
                    <p className="text-base text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto font-medium leading-relaxed">Essayez de changer les filtres ou créez un nouveau document pour enrichir la base de connaissances.</p>
                    <button onClick={() => { setSearchQuery(''); setActiveCategory('All'); }} className="text-accent text-sm font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
                        Tout effacer
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                    {filteredSOPs.map(sop => {
                        const Icon = TYPE_ICONS[sop.type] || FileText;
                        return (
                            <div
                                key={sop.id}
                                onClick={() => setSelectedSOP(sop)}
                                className="bg-white dark:bg-surface-dark/40 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all group cursor-pointer shadow-sm hover:-translate-y-1 flex flex-col h-full relative overflow-hidden duration-300"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className={`p-3 rounded-xl ${TYPE_COLORS[sop.type] || 'text-slate-400 bg-slate-500/10'} group-hover:scale-110 transition-transform duration-300 border border-current/10 shadow-sm`}>
                                        <Icon size={20} />
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => { e.stopPropagation(); openEdit(sop); }}
                                            className="p-2 text-slate-400 hover:text-accent hover:bg-accent/10 rounded-xl transition-all border border-transparent hover:border-accent/10 shadow-sm">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={(e) => deleteSOP(sop.id, e)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/10 shadow-sm">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-6 relative z-10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-white/5">{sop.category}</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-white/5">{sop.type}</span>
                                    </div>
                                    <h4 className="font-display font-black text-slate-900 dark:text-white text-lg leading-tight group-hover:text-accent transition-colors line-clamp-2 tracking-tight">
                                        {sop.title}
                                    </h4>
                                </div>

                                <div className="mt-auto pt-5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 relative z-10">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-xl bg-accent/20 flex items-center justify-center text-[10px] text-accent font-black border border-accent/20 shadow-sm">
                                            {sop.author.charAt(0)}
                                        </div>
                                        <span className="font-bold text-slate-600 dark:text-slate-400">{sop.author}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 font-bold">
                                        <Clock size={12} />
                                        <span>{sop.lastUpdated}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
