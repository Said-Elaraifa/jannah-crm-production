// src/pages/SOPs.jsx
import { useState } from 'react';
import { Plus, Trash2, BookOpen, X, Eye, ChevronRight, ListChecks, Video, FileText, BookMarked, Edit2, Search, Filter, FolderOpen, ExternalLink } from 'lucide-react';

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
                    <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                        {isEdit ? <Edit2 size={18} className="text-accent" /> : <BookOpen size={18} className="text-secondary" />}
                        {isEdit ? 'Modifier le SOP' : 'Nouveau SOP'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-all"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Titre *</label>
                        <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                            className="w-full bg-bg-dark text-white text-sm rounded-xl px-4 py-2.5 border border-white/5 focus:border-primary outline-none transition-all placeholder-slate-600"
                            placeholder="Ex: Processus d'onboarding client" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { key: 'category', label: 'Catégorie', options: ['Sales', 'Tech', 'Marketing', 'RH'] },
                            { key: 'type', label: 'Type', options: ['Document', 'Checklist', 'Guide', 'Vidéo'] },
                            { key: 'author', label: 'Auteur', options: ['Ismael', 'Said', 'Ghassen'] },
                        ].map(field => (
                            <div key={field.key}>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{field.label}</label>
                                <select value={form[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                                    className="w-full bg-bg-dark text-white text-sm rounded-xl px-3 py-2.5 border border-white/5 focus:border-primary outline-none cursor-pointer">
                                    {field.options.map(o => <option key={o}>{o}</option>)}
                                </select>
                            </div>
                        ))}
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Contenu (Markdown supporté)</label>
                        <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={10}
                            className="w-full bg-bg-dark text-white text-sm rounded-xl px-4 py-3 border border-white/5 focus:border-primary outline-none transition-all resize-none placeholder-slate-600 font-mono text-xs leading-relaxed"
                            placeholder="# Titre Section 1\n\n- Point important 1\n- Point important 2" />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium rounded-xl transition-all">Annuler</button>
                        <button type="submit" className="flex-1 py-2.5 bg-primary hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95">
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
        <div className="space-y-6 animate-fade-in-up pb-10">
            <SOPDetailModal sop={selectedSOP} onClose={() => setSelectedSOP(null)} onEdit={openEdit} />
            <SOPModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} initialData={editingSOP} />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-3">
                        Knowledge Base <span className="px-2 py-0.5 rounded-lg bg-primary/20 text-primary text-xs font-bold border border-primary/20">BETA</span>
                    </h2>
                    <p className="text-slate-400 mt-1 text-sm">Centre de documentation et procédures internes.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative group">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" />
                        <input
                            type="text"
                            placeholder="Rechercher un guide, un process..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="bg-surface-dark w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl border border-white/5 focus:border-primary/50 text-sm text-white focus:outline-none transition-all"
                        />
                    </div>
                    <button onClick={openAdd}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-all active:scale-95 shadow-lg shadow-primary/20 whitespace-nowrap">
                        <Plus size={16} /> Nouveau Doc
                    </button>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${activeCategory === cat
                            ? 'bg-white text-[#12202c] shadow-lg shadow-white/10'
                            : 'bg-surface-dark text-slate-400 hover:text-white hover:bg-white/5 border border-white/5'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {filteredSOPs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                    <div className="w-16 h-16 bg-surface-dark rounded-2xl flex items-center justify-center mb-4 border border-white/5">
                        <FolderOpen size={28} className="text-slate-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Aucun document trouvé</h3>
                    <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">Essayez de changer les filtres ou créez un nouveau document pour enrichir la base.</p>
                    <button onClick={() => { setSearchQuery(''); setActiveCategory('All'); }} className="text-primary text-sm font-semibold hover:underline">
                        Tout effacer
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredSOPs.map(sop => {
                        const Icon = TYPE_ICONS[sop.type] || FileText;
                        return (
                            <div
                                key={sop.id}
                                onClick={() => setSelectedSOP(sop)}
                                className="bg-surface-dark rounded-2xl p-5 border border-white/5 hover:border-primary/30 transition-all group cursor-pointer hover:shadow-xl hover:shadow-black/20 flex flex-col h-full"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl ${TYPE_COLORS[sop.type] || 'text-slate-400 bg-slate-500/10'} group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon size={20} />
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => { e.stopPropagation(); openEdit(sop); }}
                                            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg">
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={(e) => deleteSOP(sop.id, e)}
                                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border border-slate-700/50 px-1.5 py-0.5 rounded">{sop.category}</span>
                                    </div>
                                    <h4 className="font-bold text-white text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                        {sop.title}
                                    </h4>
                                </div>

                                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[9px] text-white font-bold">
                                            {sop.author.charAt(0)}
                                        </div>
                                        <span>{sop.author}</span>
                                    </div>
                                    <span>{sop.lastUpdated}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
