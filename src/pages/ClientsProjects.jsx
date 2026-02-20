// src/pages/ClientsProjects.jsx
import { useState, useEffect, useMemo } from 'react';
import {
    Plus, ExternalLink, Copy, Check, Zap, Bot, X, Users, Globe, Clock,
    CheckCircle, AlertCircle, Loader, Link, Eye, Trash2, FileText,
    Image, Download, ChevronRight, Layers, Star, Phone, Mail,
    LayoutGrid, List, Search, Filter, MoreHorizontal, ArrowUpRight,
    HelpCircle, LayoutTemplate, Briefcase, Activity, Rocket
} from 'lucide-react';
import { generateLovablePrompt } from '../services/gemini';
import { getCahierBySlug, fetchClientActivityLogs, logClientActivity, addNotification } from '../services/supabase';
import { TEAM_MEMBERS } from '../data/constants';

// ─── DESIGN SYSTEM ───────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    'En Développement': { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Loader, glow: 'shadow-blue-500/20' },
    'En Ligne': { color: 'text-[#c3dc7f]', bg: 'bg-[#c3dc7f]/10', border: 'border-[#c3dc7f]/20', icon: Globe, glow: 'shadow-[#c3dc7f]/20' },
    'Nouveau': { color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20', icon: Star, glow: 'shadow-accent/20' },
    'En Attente': { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: Clock, glow: 'shadow-slate-500/10' },
    'Suspendu': { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: AlertCircle, glow: 'shadow-red-500/20' },
};

const SERVICE_ICONS = {
    'Web': Globe,
    'Ads': Zap,
    'SEO': Search,
    'Logo': Image,
};

const VIEW_OPTIONS = [
    { id: 'grid', icon: LayoutGrid, label: 'Grille' },
    { id: 'list', icon: List, label: 'Liste' },
];

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function StatsCard({ label, value, icon: Icon, trend, colorClass }) {
    return (
        <div className="relative group bg-[#152636] rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,0,0,0.3)] overflow-hidden">
            <div className={`absolute -right-6 -top-6 w-32 h-32 ${colorClass.replace('text-', 'bg-')} opacity-[0.03] rounded-full blur-3xl transition-transform duration-700 group-hover:scale-150`} />
            <div className="flex justify-between items-start mb-5">
                <div className={`p-3 rounded-2xl ${colorClass.replace('text-', 'bg-').replace('400', '500/10')} border border-white/5 flex items-center justify-center shadow-inner`}>
                    <Icon size={22} className={colorClass} />
                </div>
                {trend && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white/5 text-slate-400 border border-white/5 backdrop-blur-md">
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-4xl font-display font-bold text-white mb-1.5 tracking-tight group-hover:scale-105 origin-left transition-transform duration-300">{value}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em]">{label}</p>
            </div>
        </div>
    );
}

// ─── UI COMPONENTS ───────────────────────────────────────────────────────────

function StatusBadge({ status, className = "" }) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG['En Attente'];
    const Icon = config.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${config.bg} ${config.color} ${config.border} text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(0,0,0,0.2)] ${className}`}>
            <Icon size={12} className="opacity-80" />
            {status}
        </span>
    );
}

function ServiceBadge({ type }) {
    const Icon = SERVICE_ICONS[type] || Globe;
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] font-bold text-slate-400 group-hover:text-slate-300 transition-colors">
            <Icon size={10} className="text-accent/60" />
            {type}
        </span>
    );
}

function SectionHeader({ title, description, action }) {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-2">
                <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-accent mb-4">
                    <span>Menu</span>
                    <span className="text-slate-700">/</span>
                    <span className="text-slate-400">Clients & Projets</span>
                </nav>
                <h2 className="text-4xl font-display font-bold text-white tracking-tight leading-tight">
                    {title}
                </h2>
                <div className="h-1 w-20 bg-gradient-to-r from-accent to-transparent rounded-full mt-2" />
                <p className="text-slate-400 mt-4 text-base max-w-xl leading-relaxed font-medium">
                    {description}
                </p>
            </div>
            <div className="flex items-center gap-3">
                {action}
            </div>
        </div>
    );
}

function EmptyState({ onAction }) {
    return (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-[#152636]/30 rounded-[2.5rem] border border-white/5 border-dashed relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-[#1c3144] to-black rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl border border-white/10 group-hover:rotate-12 transition-transform duration-700">
                <Briefcase size={40} className="text-slate-600 group-hover:text-accent transition-colors duration-500" />
            </div>
            <h3 className="text-2xl font-display font-bold text-white mb-4 relative">Exploration en cours...</h3>
            <p className="text-base text-slate-500 mb-10 max-w-md mx-auto leading-relaxed relative font-medium">
                Votre galaxie de clients est encore vide. Lancéz votre premier projet pour commencer l'aventure.
            </p>
            <button
                onClick={onAction}
                className="group relative px-8 py-4 bg-accent hover:bg-secondary text-primary text-sm font-black rounded-2xl transition-all shadow-[0_10px_30px_rgba(238,180,23,0.2)] hover:shadow-[0_15px_40px_rgba(238,180,23,0.3)] active:scale-95 overflow-hidden"
            >
                <span className="relative flex items-center gap-3">
                    <Plus size={20} strokeWidth={3} /> CRÉER UN DOSSIER
                </span>
            </button>
        </div>
    );
}

// ─── CLIENT CARD (GRID) ──────────────────────────────────────────────────────

function ClientCard({ client, onDelete, onOpen, onCopyLink }) {
    const config = STATUS_CONFIG[client.status] || STATUS_CONFIG['En Attente'];
    const services = client.services || ['Web'];
    const progress = client.progress || 0;

    return (
        <div
            onClick={() => onOpen(client)}
            className="group relative bg-[#152636] rounded-[2rem] border border-white/5 hover:border-white/10 transition-all duration-700 flex flex-col h-full cursor-pointer hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-in-up"
        >
            {/* Hover Glow Effect */}
            <div className={`absolute -right-16 -top-16 w-48 h-48 ${config.color.replace('text-', 'bg-')} opacity-0 group-hover:opacity-[0.07] rounded-full blur-3xl transition-opacity duration-700`} />

            <div className="p-7 relative flex-1 flex flex-col">
                {/* Header: Avatar + Title */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-5">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center ${config.color} font-display font-black text-2xl border border-white/10 shadow-xl shadow-black/30 group-hover:scale-110 transition-transform duration-700 relative overflow-hidden`}>
                            <div className={`absolute inset-0 ${config.bg} opacity-20`} />
                            <span className="relative z-10">{client.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="overflow-hidden">
                            <h4 className="font-display font-bold text-xl text-white group-hover:text-accent transition-colors duration-300 truncate tracking-tight">{client.name}</h4>
                            <div className="flex gap-2 mt-2 flex-wrap">
                                {services.slice(0, 2).map(s => <ServiceBadge key={s} type={s} />)}
                                {services.length > 2 && <span className="text-[9px] font-bold text-slate-600 flex items-center">+{services.length - 2}</span>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 mb-8">
                    <StatusBadge status={client.status} />
                    {client.cahier_completed && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-[#c3dc7f]/10 text-[#c3dc7f] border-[#c3dc7f]/20 text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md">
                            <Check size={12} className="opacity-80" />
                        </div>
                    )}
                </div>

                {/* Progress Section */}
                <div className="space-y-3 mt-auto mb-4">
                    <div className="flex justify-between items-end text-[11px] font-bold uppercase tracking-widest text-slate-500">
                        <span className="group-hover:text-slate-400 transition-colors">Progression</span>
                        <span className={`text-sm tracking-normal ${progress === 100 ? 'text-[#c3dc7f]' : 'text-white'}`}>{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 p-[2px]">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.5)] ${progress === 100 ? 'bg-[#c3dc7f]' : 'bg-gradient-to-r from-accent to-secondary'}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Footer / Quick Actions */}
            <div className="px-7 py-5 bg-black/20 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    <Clock size={12} className="text-accent/60" />
                    <span className="group-hover:text-slate-400 transition-colors">{client.last_contact || '2j ago'}</span>
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        onClick={(e) => { e.stopPropagation(); onCopyLink(client); }}
                        className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all border border-white/5 active:scale-90"
                        title="Dossier"
                    >
                        <Link size={14} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(client.id); }}
                        className="p-2.5 bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-xl transition-all border border-white/5 active:scale-90"
                        title="Archive"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── LIST VIEW ───────────────────────────────────────────────────────────────

function ClientListItem({ client, onDelete, onOpen, onCopyLink }) {
    const config = STATUS_CONFIG[client.status] || STATUS_CONFIG['En Attente'];
    const services = client.services || ['Web'];

    return (
        <div
            onClick={() => onOpen(client)}
            className="group grid grid-cols-12 gap-6 items-center p-5 bg-[#152636]/40 border-b border-white/5 hover:bg-[#152636]/80 transition-all cursor-pointer last:border-0 hover:pl-8 active:scale-x-[0.99] origin-left"
        >
            <div className="col-span-4 flex items-center gap-5">
                <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center ${config.color} font-black text-base border ${config.border} shadow-lg shadow-black/20 group-hover:scale-110 transition-transform`}>
                    {client.name.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                    <h4 className="font-bold text-white text-base truncate group-hover:text-accent transition-colors">{client.name}</h4>
                    <div className="flex gap-1.5 mt-1">
                        {services.map(s => <span key={s} className="text-[8px] font-black uppercase text-slate-500 tracking-tighter">{s}</span>)}
                    </div>
                </div>
            </div>

            <div className="col-span-2">
                <StatusBadge status={client.status} />
            </div>

            <div className="col-span-3 pr-10">
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden p-[1px] border border-white/5">
                        <div className="h-full bg-gradient-to-r from-accent to-secondary rounded-full shadow-[0_0_8px_-2px_rgba(238,180,23,0.5)]" style={{ width: `${client.progress}%` }} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 w-8">{client.progress}%</span>
                </div>
            </div>

            <div className="col-span-3 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                <button
                    onClick={(e) => { e.stopPropagation(); onCopyLink(client); }}
                    className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all border border-white/5 active:scale-90"
                >
                    <Link size={16} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(client.id); }}
                    className="p-3 bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-xl transition-all border border-white/5 active:scale-90"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}

// ─── HELPER COMPONENTS FOR DRAWER ─────────────────────────────────────────────

function FileRow({ label, url, type = 'file' }) {
    if (!url) return null;
    return (
        <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5 mb-2">
            <div className="flex items-center gap-3 overflow-hidden">
                {type === 'image' ? <Image size={16} className="text-purple-400" /> : <FileText size={16} className="text-blue-400" />}
                <span className="text-xs text-slate-300 truncate">{label}</span>
            </div>
            <a href={url} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                <Download size={14} />
            </a>
        </div>
    );
}

function CahierSection({ title, icon: Icon, children }) {
    return (
        <div className="bg-surface-dark rounded-xl p-5 border border-white/5 animate-fade-in-up">
            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                    <Icon size={16} />
                </div>
                {title}
            </h4>
            <div className="space-y-3">
                {children}
            </div>
        </div>
    );
}

// ─── ADD CLIENT MODAL ────────────────────────────────────────────────────────

function AddClientModal({ isOpen, onClose, onAdd, currentUser }) {
    const [step, setStep] = useState('form');
    const [newClient, setNewClient] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [selectedServices, setSelectedServices] = useState(['Web']);
    const [assignedTo, setAssignedTo] = useState(TEAM_MEMBERS[0]?.name || 'Said');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const toggleService = (s) => {
        setSelectedServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    };

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substr(2, 6)}`;
        const clientData = {
            name: name.trim(),
            status: 'Nouveau',
            progress: 0,
            url: '',
            email,
            assigned_to: assignedTo,
            services: selectedServices,
            cahier_completed: false,
            lovable_prompt: null,
            slug,
            last_contact: 'À l\'instant'
        };
        try {
            const result = await onAdd(clientData);
            setNewClient(result);
            setStep('success');

            // Log activity using the real ID from server
            if (result?.id) {
                await logClientActivity({
                    client_id: result.id,
                    action: 'Création du dossier',
                    metadata: { services: selectedServices },
                    detail: `Nouveau dossier "${result.name}" créé`,
                    time_text: 'À l\'instant',
                    user_initials: currentUser?.initial || 'IS',
                    user_color: currentUser?.color || 'bg-accent'
                }).catch(e => console.warn("Activity log failed", e));
            }
        } catch (error) {
            console.error('Failed to create client:', error);
            // Optionally show error toast or message here
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = () => {
        if (!newClient) return;
        navigator.clipboard.writeText(`${window.location.origin}/cahier/${newClient.slug}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClose = () => {
        setStep('form');
        setName(''); setEmail(''); setSelectedServices(['Web']);
        setNewClient(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-[#070c12]/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in" style={{ zIndex: 9999 }} onClick={handleClose}>
            <div className="bg-[#152636] w-full max-w-xl rounded-[2.5rem] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] animate-fade-in-up overflow-hidden ring-1 ring-white/5" onClick={e => e.stopPropagation()}>
                {step === 'form' ? (
                    <>
                        <div className="p-10 border-b border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent relative">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-accent/5 blur-3xl rounded-full -mr-20 -mt-20" />
                            <h3 className="text-2xl font-display font-black text-white flex items-center gap-4">
                                <div className="p-3 bg-accent/10 rounded-2xl text-accent border border-accent/20 shadow-inner"><Users size={24} /></div>
                                Initialiser un Projet
                            </h3>
                            <p className="text-slate-400 text-sm mt-3 font-medium">Configurez les bases du nouveau dossier client.</p>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Entreprise</label>
                                        <input required value={name} onChange={e => setName(e.target.value)}
                                            className="w-full bg-black/30 text-white text-sm font-bold rounded-2xl px-5 py-4 border border-white/5 focus:border-accent focus:bg-black/50 outline-none transition-all placeholder-slate-700"
                                            placeholder="Ex: Jannah Agency" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email Contact</label>
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                            className="w-full bg-black/30 text-white text-sm font-bold rounded-2xl px-5 py-4 border border-white/5 focus:border-accent focus:bg-black/50 outline-none transition-all placeholder-slate-700"
                                            placeholder="CEO@client.com" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Services Inclus</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {Object.keys(SERVICE_ICONS).map(s => {
                                            const Icon = SERVICE_ICONS[s];
                                            const isActive = selectedServices.includes(s);
                                            return (
                                                <button
                                                    key={s} type="button" onClick={() => toggleService(s)}
                                                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all gap-2 ${isActive ? 'bg-accent/10 border-accent/40 text-accent' : 'bg-black/20 border-white/5 text-slate-500 hover:border-white/20'}`}
                                                >
                                                    <Icon size={20} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{s}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Account Manager</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {TEAM_MEMBERS.map(m => (
                                            <button
                                                key={m.id} type="button" onClick={() => setAssignedTo(m.name)}
                                                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${assignedTo === m.name ? 'bg-primary/10 border-primary/40 text-primary' : 'bg-black/20 border-white/5 text-slate-500 hover:border-white/20'}`}
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-bold">
                                                    {m.name.charAt(0)}
                                                </div>
                                                <span className="text-xs font-bold">{m.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={handleClose} className="flex-1 py-4.5 bg-white/5 hover:bg-white/10 text-slate-400 text-sm font-bold rounded-2xl transition-all">Annuler</button>
                                <button type="submit" disabled={loading} className="flex-[2] py-4.5 bg-accent hover:bg-secondary text-primary text-sm font-black rounded-2xl transition-all shadow-[0_15px_30px_rgba(238,180,23,0.2)] active:scale-95 disabled:opacity-60 flex justify-center items-center gap-3">
                                    {loading ? <Loader size={20} className="animate-spin" /> : <><Rocket size={20} /> DÉPLOYER LE PROJET</>}
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="p-12 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-accent/20 to-transparent pointer-events-none opacity-50" />
                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-gradient-to-tr from-accent to-secondary rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-[0_20px_50px_rgba(238,180,23,0.4)] animate-scale-in">
                                <Check size={48} className="text-primary drop-shadow-md" strokeWidth={3} />
                            </div>
                            <h3 className="text-3xl font-display font-black text-white mb-3 tracking-tight">Espace Créé ! 🚀</h3>
                            <p className="text-slate-400 text-base mb-10 leading-relaxed max-w-xs mx-auto font-medium">
                                Le dossier <strong>{newClient?.name}</strong> est prêt. Partagez le lien d'onboarding.
                            </p>

                            <div className="bg-black/40 p-3 pr-3 rounded-[2rem] border border-white/10 flex items-center gap-4 mb-10 hover:border-accent/40 transition-all group overflow-hidden shadow-inner">
                                <div className="bg-white/5 h-14 px-6 rounded-2xl flex items-center text-xs text-slate-400 truncate flex-1 font-mono group-hover:text-white transition-colors">
                                    {window.location.origin}/cahier/{newClient?.slug}
                                </div>
                                <button
                                    onClick={handleCopyLink}
                                    className={`h-14 px-8 ${copied ? 'bg-green-500' : 'bg-accent hover:bg-secondary'} text-primary text-xs font-black rounded-2xl transition-all active:scale-95 flex items-center gap-3 shadow-[0_10px_20px_rgba(0,0,0,0.3)]`}
                                >
                                    {copied ? <Check size={18} strokeWidth={3} /> : <Copy size={18} strokeWidth={3} />}
                                    {copied ? 'COPIÉ' : 'COPIER'}
                                </button>
                            </div>

                            <button onClick={handleClose} className="px-8 py-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-bold rounded-xl transition-all uppercase tracking-widest border border-white/5">
                                Accéder au tableau de bord
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── TOOLBAR & MAIN PAGE ─────────────────────────────────────────────────────

export default function ClientsProjects({ clients, onAddClient, onEditClient, onDeleteClient, currentUser }) {
    // Standard State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null); // For Drawer (reused from prev logic, can import if separated)
    // NOTE: In this single file rewrite, I'll need to re-include Drawer or comment it as "External". 
    // To be safe and "finished", I will include the Drawer code inside this file as well (condensed).
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    // Quick Tabs State
    const tabs = ['Tous', 'En Cours', 'Terminés'];
    const [activeTab, setActiveTab] = useState('Tous');

    // Advanced Filtering Logic
    const filteredClients = useMemo(() => {
        let result = clients;

        // Tab Filter
        if (activeTab === 'En Cours') result = result.filter(c => ['En Développement', 'Nouveau', 'En Attente'].includes(c.status));
        if (activeTab === 'Terminés') result = result.filter(c => ['En Ligne', 'Suspendu'].includes(c.status));

        // Search
        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            result = result.filter(c => c.name.toLowerCase().includes(lower) || c.email?.toLowerCase().includes(lower));
        }

        // Dropdown Status Filter
        if (filterStatus !== 'All') {
            result = result.filter(c => c.status === filterStatus);
        }

        return result;
    }, [clients, activeTab, searchQuery, filterStatus]);

    // Drawer Helpers (Using previous implementation logic)
    // ... [We need to bring back CahierResultsDrawer here or it won't work]
    // I will include a simplified but fully functional version to ensure the file is self-contained.

    // Handlers
    const handleCopyLink = (client) => {
        navigator.clipboard.writeText(`${window.location.origin}/cahier/${client.slug}`);
        // Could show toast here
    };

    return (
        <div className="space-y-8 animate-fade-in-up pb-20">
            <AddClientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={onAddClient}
                currentUser={currentUser}
            />

            {/* We need the Drawer here. I'll import it if it was separate, but since we are rewriting the file, I must define it. */}
            {selectedClient && (
                <CahierResultsDrawer
                    client={selectedClient}
                    onClose={() => setSelectedClient(null)}
                    onEditClient={onEditClient}
                />
            )}

            <SectionHeader
                title="Clients & Projets"
                description="Gérez votre portefeuille clients, suivez l'avancement des développements et accédez aux cahiers des charges en un clic."
                action={
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-3 bg-secondary hover:bg-[#b0cc65] text-primary text-sm font-bold rounded-xl transition-all shadow-lg shadow-secondary/20 hover:shadow-secondary/40 active:scale-95 flex items-center gap-2"
                    >
                        <Plus size={18} /> Nouveau Dossier
                    </button>
                }
            />

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard label="Projets Actifs" value={clients.filter(c => ['En Développement', 'Nouveau'].includes(c.status)).length} icon={Briefcase} colorClass="text-blue-400" trend="+2 ce mois" />
                <StatsCard label="En Attente Cahier" value={clients.filter(c => !c.cahier_completed).length} icon={Clock} colorClass="text-accent" />
                <StatsCard label="Sites En Ligne" value={clients.filter(c => c.status === 'En Ligne').length} icon={Globe} colorClass="text-[#c3dc7f]" />
                <StatsCard label="Total Clients" value={clients.length} icon={Users} colorClass="text-purple-400" />
            </div>

            {/* Main Content Area */}
            <div className="space-y-4">
                {/* Visual Toolbar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-surface-dark/50 backdrop-blur-sm p-2 rounded-2xl border border-white/5 sticky top-4 z-30">

                    {/* Tabs */}
                    <div className="flex bg-surface-dark rounded-xl p-1 border border-white/5 shadow-inner">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === tab ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Search & filters */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Filtrer par nom..."
                                className="w-full bg-surface-dark text-white text-xs font-medium rounded-xl pl-9 pr-4 py-2.5 border border-white/5 focus:border-white/10 outline-none transition-all"
                            />
                        </div>

                        <div className="bg-surface-dark rounded-xl p-1 border border-white/5 flex">
                            {VIEW_OPTIONS.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setViewMode(opt.id)}
                                    className={`p-2 rounded-lg transition-all ${viewMode === opt.id ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                                    title={opt.label}
                                >
                                    <opt.icon size={16} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content */}
                {filteredClients.length === 0 ? (
                    <EmptyState onAction={() => setIsModalOpen(true)} />
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredClients.map(client => (
                            <ClientCard
                                key={client.id}
                                client={client}
                                onDelete={onDeleteClient}
                                onOpen={setSelectedClient}
                                onCopyLink={handleCopyLink}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-surface-dark rounded-2xl border border-white/5 overflow-hidden">
                        <div className="grid grid-cols-12 gap-4 items-center p-4 border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-black/20">
                            <div className="col-span-4">Client</div>
                            <div className="col-span-2">Statut</div>
                            <div className="col-span-3">Progression</div>
                            <div className="col-span-3 text-right">Actions</div>
                        </div>
                        <div className="divide-y divide-white/5">
                            {filteredClients.map(client => (
                                <ClientListItem
                                    key={client.id}
                                    client={client}
                                    onDelete={onDeleteClient}
                                    onOpen={setSelectedClient}
                                    onCopyLink={handleCopyLink}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── RE-INCLUDED DRAWER (Essential for "Finished Version") ────────────────────
// I'm pasting the drawer code here to ensure no imports break. 
// Ideally this should be a separate file, but for improved speed and "all-in-one" fix:

function TimelineItem({ icon: Icon, title, date, description, colorClass = "text-slate-400" }) {
    return (
        <div className="relative pl-8 pb-10 last:pb-0 group">
            <div className="absolute left-0 top-0 h-full w-[2px] bg-white/5 group-last:h-2" />
            <div className={`absolute left-[-9px] top-0 w-5 h-5 rounded-full bg-[#0f1e2d] border-2 border-white/10 flex items-center justify-center z-10 ${colorClass}`}>
                <Icon size={10} />
            </div>
            <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{date}</p>
                <h5 className="text-sm font-bold text-white group-hover:text-accent transition-colors">{title}</h5>
                {description && <p className="text-xs text-slate-400 leading-relaxed">{description}</p>}
            </div>
        </div>
    );
}

function CahierResultsDrawer({ client, onClose, onEditClient }) {
    const [cahier, setCahier] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('infos');
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        if (client) {
            setLoading(true);
            Promise.all([
                getCahierBySlug(client.slug),
                fetchClientActivityLogs(client.id)
            ]).then(([cData, hData]) => {
                setCahier(cData);
                setHistory(hData || []);
            }).catch(console.error).finally(() => setLoading(false));
        }
    }, [client]);

    const handleGeneratePrompt = async () => {
        setGenerating(true);
        try {
            const prompt = await generateLovablePrompt(cahier);
            if (!prompt) throw new Error("Aucun prompt généré");
            await onEditClient(client.id, { lovable_prompt: prompt });
            client.lovable_prompt = prompt;
            // Log activity
            await logClientActivity({
                client_id: client.id,
                action: 'Génération du prompt IA',
                metadata: { timestamp: new Date().toISOString() }
            });

            // Trigger notification
            await addNotification({
                title: 'Prompt IA Généré',
                message: `Un nouveau prompt Lovable a été conçu pour ${client.name}.`,
                type: 'success'
            }).catch(err => console.error('Notification failed:', err));
            // Refresh history
            const newHistory = await fetchClientActivityLogs(client.id);
            setHistory(newHistory);
        } catch (e) {
            console.error(e);
        } finally {
            setGenerating(false);
        }
    };

    if (!client) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-[#070c12]/80 backdrop-blur-md animate-fade-in" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-[#0f1e2d] h-full shadow-[-20px_0_50px_rgba(0,0,0,0.5)] border-l border-white/10 flex flex-col animate-slide-in overflow-hidden">

                {/* Header Area */}
                <div className="p-8 border-b border-white/5 bg-[#142435]/50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-secondary to-accent opacity-50" />
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#1c3144] to-black rounded-2xl flex items-center justify-center font-display font-black text-2xl text-white border border-white/10 shadow-2xl">
                                {client.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-black text-white tracking-tight">{client.name}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{client.email || 'Pas d\'email'}</span>
                                    <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-accent">{client.plan || 'Standard'}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all active:scale-95 border border-white/5"><X size={20} /></button>
                    </div>

                    {/* Apple Style Pill Navigation */}
                    <div className="flex p-1 bg-black/40 rounded-2xl border border-white/5 w-fit">
                        {[
                            { id: 'infos', label: 'Dashboard', icon: LayoutGrid },
                            { id: 'history', label: 'Historique', icon: Activity },
                            { id: 'cahier', label: 'Cahier', icon: FileText },
                            { id: 'prompt', label: 'Prompt IA', icon: Bot }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2.5 px-5 py-2.5 text-xs font-bold rounded-xl transition-all ${activeTab === tab.id ? 'bg-accent text-primary shadow-lg shadow-accent/20' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <tab.icon size={14} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gradient-to-b from-[#0f1e2d] to-black/20">
                    {activeTab === 'infos' && (
                        <div className="space-y-8 animate-fade-in">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#1c3144]/40 p-5 rounded-3xl border border-white/5">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Progression</p>
                                    <p className="text-2xl font-display font-black text-white">{client.progress}%</p>
                                    <div className="mt-4 h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                                        <div className="h-full bg-accent rounded-full" style={{ width: `${client.progress}%` }} />
                                    </div>
                                </div>
                                <div className="bg-[#1c3144]/40 p-5 rounded-3xl border border-white/5">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Responsable</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-6 h-6 rounded-lg bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">{client.assigned_to?.charAt(0)}</div>
                                        <p className="text-sm font-bold text-white">{client.assigned_to}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#1c3144]/40 rounded-[2rem] p-8 border border-white/5 space-y-6">
                                <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400"><LayoutTemplate size={16} /></div>
                                    Pilotage du Statut
                                </h4>

                                <div className="grid grid-cols-2 gap-3">
                                    {Object.keys(STATUS_CONFIG).map(status => (
                                        <button
                                            key={status}
                                            onClick={() => onEditClient(client.id, { status })}
                                            className={`text-[10px] font-black uppercase tracking-widest py-4 px-4 rounded-2xl border transition-all text-center ${client.status === status ? STATUS_CONFIG[status].bg + ' ' + STATUS_CONFIG[status].color + ' ' + STATUS_CONFIG[status].border + ' shadow-lg' : 'bg-black/20 border-white/5 text-slate-600 hover:bg-white/5'}`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-[#1c3144]/40 rounded-[2rem] p-8 border border-white/5">
                                <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-accent/10 rounded-xl text-accent"><Link size={16} /></div>
                                    Espace Client
                                </h4>
                                <div className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-white/5 group">
                                    <div className="flex-1 truncate text-xs text-slate-500 font-mono group-hover:text-slate-300 transition-colors">
                                        {window.location.origin}/cahier/{client.slug}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/cahier/${client.slug}`); }} className="p-2.5 hover:bg-white/5 rounded-xl text-white transition-all"><Copy size={16} /></button>
                                        <button onClick={() => window.open(`/cahier/${client.slug}`, '_blank')} className="p-2.5 bg-accent text-primary rounded-xl hover:scale-105 transition-all shadow-lg shadow-accent/20"><ExternalLink size={16} strokeWidth={3} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="animate-fade-in space-y-6">
                            <div className="bg-[#1c3144]/40 rounded-[2rem] p-8 border border-white/5">
                                <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3 mb-10">
                                    <div className="p-2 bg-accent/10 rounded-xl text-accent"><Activity size={16} /></div>
                                    Chronologie du Projet
                                </h4>

                                {history.length === 0 ? (
                                    <div className="text-center py-20">
                                        <Clock size={40} className="mx-auto text-slate-700 mb-4 opacity-20" />
                                        <p className="text-slate-500 text-sm font-medium">Aucune activité enregistrée.</p>
                                    </div>
                                ) : (
                                    <div className="pl-4">
                                        {history.map((h, i) => (
                                            <TimelineItem
                                                key={i}
                                                icon={h.action.includes('Création') ? Plus : h.action.includes('Prompt') ? Bot : Zap}
                                                title={h.action}
                                                date={new Date(h.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                description={h.metadata?.services ? `Services: ${h.metadata.services.join(', ')}` : null}
                                                colorClass={h.action.includes('Génération') ? 'text-accent' : 'text-blue-400'}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'cahier' && (
                        <div className="space-y-6 pb-20 animate-fade-in">
                            {!client.cahier_completed ? (
                                <div className="text-center py-20 px-10 bg-[#1c3144]/40 rounded-[2rem] border border-white/5 border-dashed">
                                    <Clock size={48} className="mx-auto mb-6 text-slate-700" />
                                    <h5 className="text-lg font-bold text-white mb-2">En attente de réponse</h5>
                                    <p className="text-slate-500 text-sm leading-relaxed">Le client n'a pas encore validé son cahier des charges. Une fois complété, les résultats apparaîtront ici.</p>
                                </div>
                            ) : loading ? <div className="flex justify-center py-20"><Loader className="animate-spin text-accent" size={32} /></div> : (
                                <div className="space-y-6">
                                    <CahierSection title="Identité & Ambiance" icon={Image}>
                                        <div className="grid grid-cols-2 gap-6 mb-6">
                                            <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Style Visuel</p>
                                                <p className="text-sm text-white font-bold">{cahier.style || 'Non spécifié'}</p>
                                            </div>
                                            <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Palette</p>
                                                <p className="text-sm text-white font-bold">{cahier.colors || 'Non spécifié'}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <FileRow label="Logo Client" url={cahier.logo_url} type="image" />
                                            <FileRow label="Charte Graphique" url={cahier.charte_url} type="file" />
                                        </div>
                                    </CahierSection>

                                    <CahierSection title="Le Projet" icon={Layers}>
                                        <div className="bg-black/20 p-5 rounded-2xl border border-white/5 mb-6">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Type & Objectif</p>
                                            <p className="text-sm text-white font-bold mb-1">{cahier.project_type}</p>
                                            <p className="text-xs text-slate-400 leading-relaxed italic">"{cahier.project_goal}"</p>
                                        </div>

                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Fonctionnalités Clés</p>
                                        <div className="flex flex-wrap gap-2">
                                            {cahier.features?.map((s, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-accent/5 border border-accent/10 rounded-xl text-[10px] font-black uppercase text-accent tracking-wider">{s}</span>
                                            ))}
                                        </div>
                                    </CahierSection>

                                    <div className="p-8 text-center">
                                        <p className="text-xs text-slate-600 font-medium italic">Dossier complété le {new Date(cahier.completed_at).toLocaleDateString('fr-FR')}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'prompt' && (
                        <div className="animate-fade-in space-y-6">
                            {!client.cahier_completed ? (
                                <div className="text-center py-20 text-slate-500">
                                    <Bot size={48} className="mx-auto mb-6 text-slate-700 opacity-20" />
                                    <p className="font-medium">Nécessite le cahier des charges.</p>
                                </div>
                            ) : (
                                <div className="bg-[#1c3144]/40 rounded-[2rem] p-8 border border-white/5">
                                    <div className="flex justify-between items-center mb-8">
                                        <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                                            <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400"><Bot size={16} /></div>
                                            IA Generator Output
                                        </h4>
                                        <button
                                            onClick={handleGeneratePrompt}
                                            disabled={generating}
                                            className="px-5 py-2.5 bg-accent/10 text-accent text-[10px] font-black uppercase tracking-widest rounded-xl border border-accent/20 hover:bg-accent hover:text-primary transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            {generating ? 'Processing...' : 'Régénérer'}
                                        </button>
                                    </div>
                                    <div className="group relative">
                                        <div className="absolute inset-0 bg-accent/5 blur-xl group-hover:bg-accent/10 transition-colors pointer-events-none" />
                                        <div className="relative bg-black/60 p-6 rounded-2xl border border-white/5 text-xs text-slate-400 font-mono leading-loose h-[450px] overflow-y-auto custom-scrollbar">
                                            {client.lovable_prompt || "Le moteur IA attend vos instructions."}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(client.lovable_prompt); }}
                                        className="w-full mt-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-3 border border-white/5"
                                    >
                                        <Copy size={18} /> COPIER LE PROMPT
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
