// src/pages/AILogs.jsx
import { useState, useMemo } from 'react';
import {
    Play, Trash2, Plus, Bot, X, Search, Copy,
    Zap, Bookmark, Tag, LayoutGrid, Clock, ChevronRight, PenTool
} from 'lucide-react';
import { INITIAL_AI_LOGS, PROMPT_LIBRARY } from '../data/constants';

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
                            <select
                                value={form.category}
                                onChange={e => setForm({ ...form, category: e.target.value })}
                                className="w-full bg-bg-dark text-white text-sm rounded-xl px-4 py-2.5 border border-white/5 focus:border-primary outline-none cursor-pointer"
                            >
                                {['Personal', 'Work', 'Creative', 'Dev', 'Marketing'].map(c => <option key={c}>{c}</option>)}
                            </select>
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
                onRun={onUsePrompt}
            />

            <div className="flex items-center bg-surface-dark rounded-xl px-4 py-3 border border-white/5 focus-within:border-primary/50 transition-all">
                <Search size={18} className="text-slate-500 mr-3 flex-shrink-0" />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Chercher un prompt (ex: SEO, Strategy, Email...)"
                    className="bg-transparent text-sm text-white focus:outline-none w-full placeholder-slate-500"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up">
                {filtered.map(p => (
                    <div key={p.id} className="bg-surface-dark p-5 rounded-2xl border border-white/5 hover:border-primary/30 transition-all group flex flex-col h-full">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white/5 text-slate-400 uppercase tracking-wider">{p.category}</span>
                            <div className="flex items-center gap-1 text-slate-500 text-xs">
                                <Bookmark size={12} /> {p.likes}
                            </div>
                        </div>
                        <h4 className="font-bold text-white text-base mb-2 group-hover:text-primary transition-colors">{p.title}</h4>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {p.tags.map(t => (
                                <span key={t} className="text-[10px] text-slate-400 bg-black/20 px-1.5 py-0.5 rounded border border-white/5">#{t}</span>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-4 italic">
                            "{p.template.substring(0, 80)}..."
                        </p>
                        <button
                            onClick={() => setSelectedPrompt(p)}
                            className="mt-auto w-full py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
                        >
                            <Play size={14} /> Utiliser le modèle
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function HistoryLogs({ logs, onDelete, onReplay }) {
    if (logs.length === 0) return <div className="text-center text-slate-500 py-10">Aucun historique.</div>;

    return (
        <div className="bg-surface-dark rounded-2xl border border-white/5 overflow-hidden animate-fade-in-up">
            <table className="w-full text-sm">
                <thead className="bg-bg-dark/50 border-b border-white/5">
                    <tr className="text-left">
                        <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Prompt</th>
                        <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {logs.map(log => (
                        <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                            <td className="px-5 py-4 max-w-lg">
                                <p className="text-white font-medium line-clamp-2">{log.query}</p>
                                <span className="text-xs text-slate-500 mt-1 block">{log.category} • {log.user_name || log.user || 'Utilisateur'}</span>
                            </td>
                            <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                                {log.created_at ? new Date(log.created_at).toLocaleDateString() : (log.date || '---')}
                            </td>
                            <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => onReplay(log.query)} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Réutiliser">
                                        <Copy size={14} />
                                    </button>
                                    <button onClick={() => onDelete(log.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Supprimer">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function AILogs({ logs, setLogs, onReplay }) {
    const [activeTab, setActiveTab] = useState('library');
    const [allPrompts, setAllPrompts] = useState(PROMPT_LIBRARY);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleUsePrompt = (promptText) => {
        // Here we would typically add to logs and trigger the AI
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
        onReplay(promptText); // Trigger the parent replay function (e.g. sending to chat)
    };

    const handleAddTemplate = (newTemplate) => {
        setAllPrompts(prev => [newTemplate, ...prev]);
        setActiveTab('library');
    };

    return (
        <div className="space-y-8 pb-10">
            <AddTemplateModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddTemplate} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-display font-bold text-white">Bibliothèque IA</h2>
                    <p className="text-slate-400 mt-1">Prompt Engineering & Historique des commandes.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-surface-dark p-1 rounded-xl border border-white/5">
                        <button
                            onClick={() => setActiveTab('library')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'library' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            <LayoutGrid size={16} /> Bibliothèque
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            <Clock size={16} /> Historique
                        </button>
                    </div>

                    {activeTab === 'library' && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl border border-white/5 transition-all"
                        >
                            <Plus size={16} /> Créer
                        </button>
                    )}
                </div>
            </div>

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
    );
}
