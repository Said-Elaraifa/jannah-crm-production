// src/pages/AILogs.jsx
import { useState } from 'react';
import {
    Play, Trash2, Plus, Bot, X, Search, Copy,
    Zap, Bookmark, Tag, LayoutGrid, Clock, ChevronRight, PenTool
} from 'lucide-react';
import { INITIAL_AI_LOGS, PROMPT_LIBRARY } from '../data/constants';
import { CustomSelect } from '../components/ui/CustomSelect';

// --- Helper: Variable Extraction ---
const extractVariables = (text) => {
    const regex = /{{(.*?)}}/g;
    const matches = [...text.matchAll(regex)];
    return matches.map(m => m[1]);
};

// --- Components ---

function AddTemplateModal({ isOpen, onClose, onAdd }) {
    const [form, setForm] = useState({
        title: '',
        category: 'Personal',
        template: '',
        tags: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.template.trim()) return;

        const newTemplate = {
            id: Date.now(),
            title: form.title,
            category: form.category,
            // Split tags by comma, trim whitespace, filter empty
            tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
            template: form.template,
            variables: extractVariables(form.template),
            likes: 0
        };

        onAdd(newTemplate);
        setForm({ title: '', category: 'Personal', template: '', tags: '' });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm" style={{ zIndex: 9999 }} onClick={onClose}>
            <div className="bg-surface-dark w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-white/5">
                    <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                        <PenTool size={18} className="text-accent" /> Nouveau Template
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg"><X size={18} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Titre du Template *</label>
                        <input
                            required
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            className="w-full bg-bg-dark text-white text-sm rounded-xl px-4 py-2.5 border border-white/5 focus:border-primary outline-none transition-all placeholder-slate-600"
                            placeholder="Ex: Analyse de Contrat Juridique"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Catégorie</label>
                            <CustomSelect
                                value={form.category}
                                onChange={val => setForm({ ...form, category: val })}
                                options={['Personal', 'Work', 'Creative', 'Dev', 'Marketing'].map(c => ({ value: c, label: c }))}
                                className="text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Tags (séparés par virgules)</label>
                            <input
                                value={form.tags}
                                onChange={e => setForm({ ...form, tags: e.target.value })}
                                className="w-full bg-bg-dark text-white text-sm rounded-xl px-4 py-2.5 border border-white/5 focus:border-primary outline-none transition-all placeholder-slate-600"
                                placeholder="ex: juridique, analyse, pro"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Template & Variables *</label>
                        <div className="relative">
                            <textarea
                                required
                                value={form.template}
                                onChange={e => setForm({ ...form, template: e.target.value })}
                                rows={6}
                                className="w-full bg-bg-dark text-white text-sm rounded-xl px-4 py-3 border border-white/5 focus:border-primary outline-none transition-all resize-none placeholder-slate-600 font-mono"
                                placeholder="Entrez votre prompt ici. Utilisez {{variable}} pour les champs dynamiques.&#10;Ex: Analyse le contrat suivant pour le client {{client}}..."
                            />
                            <div className="absolute bottom-3 right-3 text-[10px] text-slate-500 bg-black/40 px-2 py-1 rounded-lg border border-white/5">
                                Astuce: Utilisez {"{{variable}}"} pour créer des champs input.
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium rounded-xl transition-all">Annuler</button>
                        <button type="submit" className="flex-1 py-2.5 bg-primary hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95">
                            Créer le Template
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function PromptRunnerModal({ prompt, isOpen, onClose, onRun }) {
    const [values, setValues] = useState({});
    const [previewMode, setPreviewMode] = useState(false);

    if (!isOpen || !prompt) return null;

    const variables = prompt.variables || extractVariables(prompt.template || "");
    const filledPrompt = prompt.template.replace(/{{(.*?)}}/g, (_, key) => values[key] || `[${key}]`);

    const handleRun = () => {
        onRun(filledPrompt);
        onClose();
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(filledPrompt);
        alert("Prompt copié !");
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm" style={{ zIndex: 9999 }} onClick={onClose}>
            <div className="bg-surface-dark w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-white/5">
                    <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                        <Zap size={18} className="text-yellow-400" /> {prompt.title}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg"><X size={18} /></button>
                </div>

                <div className="p-6 space-y-4">
                    {!previewMode ? (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-400">Remplissez les variables pour générer votre prompt parfait.</p>
                            {variables.length > 0 ? variables.map(v => (
                                <div key={v}>
                                    <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1.5">{v}</label>
                                    <input
                                        type="text"
                                        placeholder={`Entrez ${v}...`}
                                        value={values[v] || ''}
                                        onChange={e => setValues({ ...values, [v]: e.target.value })}
                                        className="w-full bg-bg-dark text-white text-sm rounded-xl px-4 py-3 border border-white/5 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                            )) : (
                                <div className="p-4 bg-white/5 rounded-xl text-center text-slate-500 text-sm">
                                    Aucune variable détectée. Vous pouvez lancer le prompt directement.
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-bg-dark p-4 rounded-xl border border-white/5">
                            <pre className="text-sm text-slate-300 whitespace-pre-wrap font-body leading-relaxed">{filledPrompt}</pre>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-white/5 flex gap-3">
                    <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium rounded-xl transition-all"
                    >
                        {previewMode ? "Modifier" : "Voir l'aperçu"}
                    </button>
                    <div className="flex-1 flex gap-2">
                        <button
                            onClick={copyToClipboard}
                            className="flex-1 px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <Copy size={16} /> Copier
                        </button>
                        <button
                            onClick={handleRun}
                            className="flex-1 px-4 py-2.5 bg-primary hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-primary/20"
                        >
                            Lancer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PromptLibrary({ prompts, onUsePrompt }) {
    const [search, setSearch] = useState('');
    const [selectedPrompt, setSelectedPrompt] = useState(null);

    const filtered = prompts.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <PromptRunnerModal
                prompt={selectedPrompt}
                isOpen={!!selectedPrompt}
                onClose={() => setSelectedPrompt(null)}
                onUsePrompt={onUsePrompt}
            />

            <div className="flex items-center bg-white dark:bg-surface-dark/40 backdrop-blur-xl rounded-xl px-4 py-3 border border-slate-200 dark:border-white/10 focus-within:border-primary/50 transition-all shadow-sm">
                <Search size={18} className="text-slate-400 mr-3 flex-shrink-0" />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Chercher un prompt (ex: SEO, Strategy, Email...)"
                    className="bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none w-full placeholder-slate-400 font-medium"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                {filtered.map(p => (
                    <div key={p.id} className="bg-white dark:bg-surface-dark/40 backdrop-blur-xl p-6 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all group flex flex-col h-full shadow-sm hover:-translate-y-1 duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-white/10">{p.category}</span>
                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-bold">
                                <Bookmark size={12} /> {p.likes}
                            </div>
                        </div>
                        <h4 className="font-display font-black text-slate-900 dark:text-white text-base mb-2 group-hover:text-primary transition-colors tracking-tight">{p.title}</h4>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {p.tags.map(t => (
                                <span key={t} className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-black/20 px-2 py-0.5 rounded border border-slate-200 dark:border-white/5">#{t}</span>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 italic font-medium leading-relaxed">
                            "{p.template.substring(0, 80)}..."
                        </p>
                        <button
                            onClick={() => setSelectedPrompt(p)}
                            className="mt-auto w-full py-3 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-primary/20"
                        >
                            <Play size={14} fill="currentColor" /> Utiliser le modèle
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function HistoryLogs({ logs, onDelete, onReplay }) {
    if (logs.length === 0) return <div className="text-center text-slate-500 py-10 font-bold uppercase tracking-widest text-xs">Aucun historique.</div>;

    return (
        <div className="bg-white dark:bg-surface-dark/40 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm animate-fade-in-up">
            <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/2">
                            <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Prompt / Détails</th>
                            <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Date</th>
                            <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {logs.map(log => (
                            <tr key={log.id} className="group hover:bg-slate-50 dark:hover:bg-white/2 transition-colors duration-150">
                                <td className="py-4 px-6">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">{log.query}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-1.5 py-0.5 rounded">{log.category}</span>
                                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">par {log.user_name || log.user || 'Utilisateur'}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-4 whitespace-nowrap">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                        {log.created_at ? new Date(log.created_at).toLocaleDateString() : (log.date || '---')}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => onReplay(log.query)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all" title="Réutiliser">
                                            <Copy size={14} />
                                        </button>
                                        <button onClick={() => onDelete(log.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all" title="Supprimer">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function AILogs({ logs, setLogs, onReplay }) {
    const [activeTab, setActiveTab] = useState('library');
    const [allPrompts, setAllPrompts] = useState(PROMPT_LIBRARY);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleUsePrompt = (promptText) => {
        const newLog = {
            id: 'temp-' + Date.now(),
            query: promptText,
            user_name: "Moi",
            created_at: new Date().toISOString(),
            category: "Généré",
            status: "Success",
            tokens: 0
        };
        setLogs(prev => [newLog, ...prev]);
        onReplay(promptText);
    };

    const handleAddTemplate = (newTemplate) => {
        setAllPrompts(prev => [newTemplate, ...prev]);
        setActiveTab('library');
    };

    return (
        <div className="space-y-8 pb-10 w-full overflow-hidden animate-fade-in">
            <AddTemplateModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddTemplate} />

            <div className="relative mb-8 z-10 w-full">
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none -translate-y-1/2 animate-pulse-glow" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 w-full">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest text-primary mb-6 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                            <Bot size={12} className="animate-pulse" /> AI Knowledge Base
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-4 text-slate-900 dark:text-white flex flex-wrap items-center gap-4">
                            Bibliothèque <span className="text-primary underline decoration-primary/30 underline-offset-8">Intelligente</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-base md:text-lg leading-relaxed font-medium mt-4">
                            Prompt Engineering & Historique des commandes. Optimisez vos interactions avec l'IA.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex bg-white/50 dark:bg-surface-dark/40 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 p-1 shadow-sm overflow-x-auto custom-scrollbar">
                            <button
                                onClick={() => setActiveTab('library')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'library' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                            >
                                <LayoutGrid size={16} /> Bibliothèque
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                            >
                                <Clock size={16} /> Historique
                            </button>
                        </div>

                        {activeTab === 'library' && (
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="flex items-center gap-2 px-6 py-3.5 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-900 dark:text-white text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl border border-slate-200 dark:border-white/10 transition-all shadow-sm active:scale-95 whitespace-nowrap"
                            >
                                <Plus size={16} strokeWidth={3} /> Nouveau Prompt
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="relative z-10">
                {activeTab === 'library' ? (
                    <PromptLibrary prompts={allPrompts} onUsePrompt={handleUsePrompt} />
                ) : (
                    <HistoryLogs
                        logs={logs}
                        onDelete={(id) => setLogs(prev => prev.filter(l => l.id !== id))}
                        onReplay={onReplay}
                    />
                )}
            </div>
        </div>
    );
}
