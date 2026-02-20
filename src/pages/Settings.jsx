import { useState, useEffect } from 'react';
import { LogOut, CreditCard, Globe, Bot, Rocket, UserPlus, ArrowRight, X, Check, Shield, Users, LayoutGrid, Lock, Activity, Eye, Edit2, Trash2, AlertTriangle, Plus, Settings as SettingsIcon, Search, Sparkles, MessageSquare, Megaphone, Database, Share2, Zap, ShoppingBag, BarChart3, Mail, Monitor, Code } from 'lucide-react';
import { getTeamMembers, addTeamMember, updateTeamMember, deleteTeamMember, uploadProfileImage, signOut, getIntegrations, saveIntegrationConfig, addIntegration } from '../services/supabase';
import { ROLES } from '../data/constants';

const INTEGRATION_CATALOG = [
    {
        name: 'Claude (Anthropic)',
        slug: 'claude',
        icon: Sparkles,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
        category: 'AI',
        description: 'Modèles de langage avancés pour l\'automatisation des tâches complexes.',
        fields: [{ key: 'apiKey', label: 'Claude API Key', type: 'password', placeholder: 'sk-ant-...' }]
    },
    {
        name: 'OpenAI (ChatGPT)',
        slug: 'openai',
        icon: Bot,
        color: 'text-green-400',
        bg: 'bg-green-500/10',
        category: 'AI',
        description: 'Intégration de GPT-4o pour la génération de contenu et l\'analyse.',
        fields: [{ key: 'apiKey', label: 'OpenAI API Key', type: 'password', placeholder: 'sk-...' }]
    },
    {
        name: 'Meta Ads (Facebook)',
        slug: 'meta-ads',
        icon: Megaphone,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        category: 'Marketing',
        description: 'Synchronisation des performances publicitaires Facebook & Instagram.',
        fields: [
            { key: 'pixelId', label: 'ID Pixel', type: 'text', placeholder: '123456...' },
            { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: '...' }
        ]
    },
    {
        name: 'TikTok Ads',
        slug: 'tiktok-ads',
        icon: Share2,
        color: 'text-pink-500',
        bg: 'bg-pink-500/10',
        category: 'Marketing',
        description: 'Gestion des campagnes TikTok Ads directement dans le CRM.',
        fields: [{ key: 'advId', label: 'Advertiser ID', type: 'text', placeholder: '...' }]
    },
    {
        name: 'LinkedIn Ads',
        slug: 'linkedin-ads',
        icon: Share2,
        color: 'text-blue-700',
        bg: 'bg-blue-700/10',
        category: 'Marketing',
        fields: [{ key: 'account_id', label: 'Account ID', type: 'text', placeholder: '...' }]
    },
    {
        name: 'Slack',
        slug: 'slack',
        icon: MessageSquare,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        category: 'Productivity',
        description: 'Alertes et notifications en temps réel sur vos canaux Slack.',
        fields: [{ key: 'webhookUrl', label: 'Webhook URL', type: 'text', placeholder: 'https://hooks.slack.com/...' }]
    },
    {
        name: 'Zapier',
        slug: 'zapier',
        icon: Zap,
        color: 'text-orange-500',
        bg: 'bg-orange-500/10',
        category: 'Productivity',
        description: 'Connectez le CRM à plus de 5000+ applications.',
        fields: [{ key: 'apiKey', label: 'Zapier API Key', type: 'password', placeholder: '...' }]
    },
    {
        name: 'Stripe',
        slug: 'stripe',
        icon: CreditCard,
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10',
        category: 'Finance',
        fields: [
            { key: 'publishableKey', label: 'Publishable Key', type: 'text', placeholder: 'pk_...' },
            { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'sk_...' }
        ]
    },
    {
        name: 'Google Analytics 4',
        slug: 'ga4',
        icon: BarChart3,
        color: 'text-yellow-500',
        bg: 'bg-yellow-500/10',
        category: 'Analytics',
        fields: [{ key: 'measurementId', label: 'Measurement ID', type: 'text', placeholder: 'G-...' }]
    },
    {
        name: 'Mailchimp',
        slug: 'mailchimp',
        icon: Mail,
        color: 'text-yellow-400',
        bg: 'bg-yellow-400/5',
        category: 'Marketing',
        fields: [{ key: 'apiKey', label: 'API Key', type: 'password', placeholder: '...' }]
    },
    {
        name: 'Notion',
        slug: 'notion',
        icon: Database,
        color: 'text-white',
        bg: 'bg-white/10',
        category: 'Productivity',
        fields: [{ key: 'token', label: 'Internal Integration Token', type: 'password', placeholder: 'secret_...' }]
    },
    {
        name: 'Shopify',
        slug: 'shopify',
        icon: ShoppingBag,
        color: 'text-green-500',
        bg: 'bg-green-500/10',
        category: 'E-commerce',
        fields: [{ key: 'shopUrl', label: 'Shop URL', type: 'text', placeholder: 'name.myshopify.com' }]
    },
    {
        name: 'GitHub',
        slug: 'github',
        icon: Code,
        color: 'text-slate-200',
        bg: 'bg-white/5',
        category: 'Dev',
        fields: [{ key: 'token', label: 'Personal Access Token', type: 'password', placeholder: 'ghp_...' }]
    },
    {
        name: 'Gemini 2.0 Flash',
        slug: 'gemini',
        icon: Bot,
        color: 'text-secondary',
        bg: 'bg-secondary/10',
        category: 'AI',
        fields: [{ key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'AIzaSy...' }]
    },
    {
        name: 'Perplexity AI',
        slug: 'perplexity',
        icon: Search,
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        category: 'AI',
        fields: [{ key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'pplx-...' }]
    },
    {
        name: 'ElevenLabs',
        slug: 'elevenlabs',
        icon: Monitor,
        color: 'text-purple-600',
        bg: 'bg-purple-600/10',
        category: 'AI',
        fields: [{ key: 'apiKey', label: 'API Key', type: 'password', placeholder: '...' }]
    }
];

const AUDIT_LOGS = [
    { id: 1, action: "User Created", target: "Sarah Connor", admin: "Ismael", time: "2h ago" },
    { id: 2, action: "Role Changed", target: "Ghassen (Sales -> Admin)", admin: "Ismael", time: "5h ago" },
    { id: 3, action: "API Key Revoked", target: "DeepSeek V3", admin: "Said", time: "1d ago" },
];

function Toggle({ enabled, onChange }) {
    return (
        <button
            onClick={() => onChange(!enabled)}
            className={`w-10 h-5 rounded-full relative transition-all duration-200 ${enabled ? 'bg-primary' : 'bg-white/10'}`}
        >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${enabled ? 'right-0.5' : 'left-0.5'}`} />
        </button>
    );
}

function ConfigModal({ isOpen, onClose, integration, onSave }) {
    const [form, setForm] = useState({});

    useEffect(() => {
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
                    <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                        <SettingsIcon size={18} className="text-primary" /> Configuration : {integration.name}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {integration.fields.map(field => (
                        <div key={field.key}>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{field.label}</label>
                            <input
                                type={field.type}
                                value={form[field.key] || ''}
                                onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                                className="w-full bg-bg-dark text-white text-sm rounded-xl px-4 py-2.5 border border-white/5 focus:border-primary outline-none transition-all placeholder-slate-600"
                                placeholder={field.placeholder}
                            />
                        </div>
                    ))}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium rounded-xl transition-all">Annuler</button>
                        <button type="submit" className="flex-1 py-2.5 bg-primary hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95">Sauvegarder</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function AddIntegrationModal({ isOpen, onClose, onAdd, existingSlugs }) {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);

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
                        <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                            <Plus size={20} className="text-secondary" /> Ajouter une intégration
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">Explorez notre catalogue d'outils professionnels.</p>
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
                            className="w-full bg-bg-dark text-white rounded-xl pl-12 pr-4 py-3 border border-white/5 focus:border-primary outline-none transition-all placeholder-slate-600"
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
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{item.category}</p>
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
                    <button onClick={onClose} className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium rounded-xl transition-all">
                        Fermer le catalogue
                    </button>
                </div>
            </div>
        </div>
    );
}

function InviteModal({ isOpen, onClose, onInvite }) {
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
                    <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                        <UserPlus size={18} className="text-secondary" /> Inviter un membre
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nom complet *</label>
                        <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                            className="w-full bg-bg-dark text-white text-sm rounded-xl px-4 py-2.5 border border-white/5 focus:border-primary outline-none transition-all placeholder-slate-600"
                            placeholder="Prénom Nom" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email *</label>
                        <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                            className="w-full bg-bg-dark text-white text-sm rounded-xl px-4 py-2.5 border border-white/5 focus:border-primary outline-none transition-all placeholder-slate-600"
                            placeholder="membre@jannah.co" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Rôle</label>
                            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                                className="w-full bg-bg-dark text-white text-sm rounded-xl px-4 py-2.5 border border-white/5 focus:border-primary outline-none cursor-pointer">
                                {['CEO', 'COO / Dev', 'Sales', 'Dev', 'Marketing'].map(r => <option key={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Accès</label>
                            <select value={form.access} onChange={e => setForm({ ...form, access: e.target.value })}
                                className="w-full bg-bg-dark text-white text-sm rounded-xl px-4 py-2.5 border border-white/5 focus:border-primary outline-none cursor-pointer">
                                {['Admin', 'Tech', 'Sales', 'Viewer'].map(a => <option key={a}>{a}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
                        <p className="text-xs text-slate-400">📧 Un email d'invitation sera envoyé à cette adresse.</p>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium rounded-xl transition-all">Annuler</button>
                        <button type="submit" className="flex-1 py-2.5 bg-primary hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95">Envoyer l'invitation</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Settings({ currentUser, setCurrentUser }) {
    const [inviteOpen, setInviteOpen] = useState(false);
    const [team, setTeam] = useState([]);
    const [activeTab, setActiveTab] = useState('profile');
    const [notifications, setNotifications] = useState({ Email: true, Slack: false, Push: true });
    const [connecting, setConnecting] = useState(null);
    const [integrations, setIntegrations] = useState([]);
    const [configModalIntegration, setConfigModalIntegration] = useState(null);
    const [inviteSent, setInviteSent] = useState(null);
    const [catalogOpen, setCatalogOpen] = useState(false);

    // Initial Fetch
    useEffect(() => {
        fetchTeam();
        fetchIntegrations();
    }, []);

    const fetchIntegrations = async () => {
        try {
            const data = await getIntegrations();
            setIntegrations(data);
        } catch (err) {
            console.error('Error fetching integrations:', err);
        }
    };

    const fetchTeam = async () => {
        try {
            const data = await getTeamMembers();
            setTeam(data);
        } catch (err) {
            console.error('Error fetching team:', err);
        }
    };

    const handleUploadImage = async (e) => {
        const file = e.target.files[0];
        if (!file || !currentUser) return;

        try {
            const publicUrl = await uploadProfileImage(currentUser.id, file);
            await updateTeamMember(currentUser.id, { avatar_url: publicUrl });
            setCurrentUser({ ...currentUser, avatar_url: publicUrl });
            alert('Image de profil mise à jour !');
        } catch (err) {
            alert('Erreur lors du téléchargement : ' + err.message);
        }
    };

    const canManageMember = (target) => {
        if (!currentUser || !target) return false;
        if (target.id === currentUser.id) return false; // Ne peut pas se gérer soi-même
        if (currentUser.access_level === 'Super Admin') return true; // Super Admin gère tout le monde
        if (currentUser.access_level === 'Admin') {
            // Un Admin ne peut gérer que ceux qui ne sont PAS Admin ou Super Admin
            return target.access_level !== 'Admin' && target.access_level !== 'Super Admin';
        }
        return false;
    };

    const handleDeleteMember = async (id) => {
        const target = team.find(m => m.id === id);
        if (!canManageMember(target)) {
            alert('Vous n\'avez pas les permissions nécessaires pour supprimer ce membre.');
            return;
        }
        if (!confirm('Voulez-vous vraiment supprimer ce membre ?')) return;
        try {
            await deleteTeamMember(id);
            setTeam(team.filter(m => m.id !== id));
        } catch (err) {
            alert('Erreur : ' + err.message);
        }
    };

    const handleConnect = (slug) => {
        const catalogItem = INTEGRATION_CATALOG.find(i => i.slug === slug);
        const saved = integrations.find(i => i.slug === slug);
        // Use default icons/fields from catalog if available, otherwise generic
        const baseInfo = catalogItem || {
            name: saved.name,
            slug: saved.slug,
            icon: Puzzle,
            fields: [{ key: 'apiKey', label: 'API Key', type: 'password' }]
        };
        setConfigModalIntegration({ ...baseInfo, config: saved?.config });
    };

    const handleAddFromCatalog = async (item) => {
        try {
            const saved = await addIntegration(item);
            setIntegrations(prev => [...prev, saved]);
            handleConnect(item.slug); // Open config immediately
        } catch (err) {
            alert('Erreur: ' + err.message);
        }
    };

    const handleSaveConfig = async (slug, config) => {
        try {
            setConnecting(slug);
            const saved = await saveIntegrationConfig(slug, config);
            setIntegrations(prev => prev.map(i => i.slug === slug ? saved : i));
            setConnecting(null);
            alert('Paramètres enregistrés pour ' + slug);
        } catch (err) {
            setConnecting(null);
            alert('Erreur: ' + err.message);
        }
    };
    const handleInvite = async (member) => {
        try {
            const colors = ['bg-purple-500', 'bg-pink-500', 'bg-cyan-500'];
            const textColors = ['text-white', 'text-white', 'text-white'];
            const randomColorIndex = Math.floor(Math.random() * colors.length);

            const newMember = {
                name: member.name,
                role: member.role,
                initial: member.name.charAt(0).toUpperCase(),
                color: colors[randomColorIndex],
                textColor: textColors[randomColorIndex],
                access_level: member.access,
                email: member.email,
                status: 'Active'
            };

            const saved = await addTeamMember(newMember);
            setTeam(prev => [...prev, saved]);
            setInviteSent(member);
            setTimeout(() => setInviteSent(null), 3000);
        } catch (err) {
            alert('Erreur lors de l\'invitation : ' + err.message);
        }
    };

    const isAdmin = currentUser?.access_level === 'Super Admin' || currentUser?.access_level === 'Admin';

    const TABS = [
        { id: 'profile', label: 'Mon Profil', icon: Users },
        { id: 'integrations', label: 'Intégrations', icon: LayoutGrid },
        ...(isAdmin ? [{ id: 'team', label: 'Équipe & Rôles', icon: Shield }] : []),
        ...(isAdmin ? [{ id: 'security', label: 'Sécurité & Logs', icon: Lock }] : []),
    ];

    return (
        <div className="space-y-6 animate-fade-in-up pb-10">
            <InviteModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} onInvite={handleInvite} />
            <ConfigModal
                isOpen={!!configModalIntegration}
                onClose={() => setConfigModalIntegration(null)}
                integration={configModalIntegration}
                onSave={handleSaveConfig}
            />
            <AddIntegrationModal
                isOpen={catalogOpen}
                onClose={() => setCatalogOpen(false)}
                onAdd={handleAddFromCatalog}
                existingSlugs={integrations.map(i => i.slug)}
            />

            {/* Header with Role Simulator */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2">
                        Paramètres {isAdmin && <span className="px-2 py-0.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20">ADMIN MODE</span>}
                    </h2>
                    <p className="text-slate-400 mt-1 text-sm">{isAdmin ? 'Configuration globale et gestion de l\'organisation.' : 'Gérez vos préférences personnelles.'}</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Role Simulator Dropdown */}
                    <div className="relative group">
                        <div className="flex items-center gap-2 px-3 py-2 bg-surface-dark border border-white/10 rounded-xl cursor-pointer hover:border-white/20 transition-all">
                            <Eye size={14} className="text-slate-400" />
                            <span className="text-xs text-slate-300">Voir en tant que :</span>
                            <select
                                value={currentUser?.id}
                                onChange={(e) => {
                                    const selected = team.find(m => m.id === parseInt(e.target.value));
                                    if (selected) setCurrentUser(selected);
                                }}
                                className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer"
                            >
                                {team.map(m => (
                                    <option key={m.id} value={m.id} className="bg-bg-dark text-white">{m.name} ({m.role})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={() => signOut()}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white text-sm font-semibold rounded-xl transition-all border border-red-500/20 active:scale-95"
                    >
                        <LogOut size={15} /> Déconnexion
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-white/5">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-xl border-b-2 transition-all cursor-pointer whitespace-nowrap ${isActive
                                ? 'border-primary text-white bg-white/5'
                                : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon size={16} /> {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Invite success toast */}
            {inviteSent && (
                <div className="flex items-center gap-3 p-4 bg-secondary/10 border border-secondary/20 rounded-xl animate-fade-in-up">
                    <Check size={16} className="text-secondary flex-shrink-0" />
                    <p className="text-sm text-secondary font-semibold">Invitation envoyée à <span className="text-white">{inviteSent.name}</span> !</p>
                </div>
            )}

            {/* CONTENT AREA */}
            <div className="animate-fade-in">

                {/* --- PROFILE TAB --- */}
                {activeTab === 'profile' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-surface-dark rounded-2xl p-6 border border-white/5">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5">Mon Profil</h3>
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-20 h-20 rounded-2xl ${currentUser?.color} flex items-center justify-center overflow-hidden shadow-lg shadow-black/20`}>
                                    {currentUser?.avatar_url ? (
                                        <img src={currentUser.avatar_url} alt={currentUser.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className={`${currentUser?.textColor} font-bold text-3xl`}>{currentUser?.initial}</span>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-xl font-display font-bold text-white">{currentUser?.name}</h4>
                                    <p className="text-sm text-secondary font-semibold uppercase tracking-wider">{currentUser?.role}</p>
                                    <p className="text-xs text-slate-400 mt-1">{currentUser?.email}</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="w-full py-2.5 bg-surface-mid hover:bg-white/10 text-white text-sm font-semibold rounded-xl transition-all border border-white/5 flex items-center justify-center cursor-pointer">
                                    Modifier la photo
                                    <input type="file" className="hidden" accept="image/*" onChange={handleUploadImage} />
                                </label>
                                <button className="w-full py-2.5 bg-primary hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95">
                                    Enregistrer les modifications
                                </button>
                            </div>
                        </div>

                        <div className="bg-surface-dark rounded-2xl p-6 border border-white/5">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Préférences & Notifications</h3>
                            {Object.entries(notifications).map(([type, enabled]) => (
                                <div key={type} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                    <div>
                                        <span className="text-sm text-slate-300 font-medium">{type} Alerts</span>
                                        <p className="text-xs text-slate-500 mt-0.5">{enabled ? 'Vous recevrez des notifications.' : 'Notifications désactivées.'}</p>
                                    </div>
                                    <Toggle enabled={enabled} onChange={(val) => setNotifications(prev => ({ ...prev, [type]: val }))} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- TEAM TAB (ADMIN) --- */}
                {activeTab === 'team' && isAdmin && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-surface-dark p-4 rounded-xl border border-white/5">
                            <div>
                                <h3 className="text-white font-bold">Membres de l'équipe</h3>
                                <p className="text-xs text-slate-400">Gérez les accès et les rôles.</p>
                            </div>
                            <button onClick={() => setInviteOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95">
                                <UserPlus size={16} /> Ajouter un membre
                            </button>
                        </div>

                        <div className="bg-surface-dark rounded-2xl border border-white/5 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/2">
                                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Membre</th>
                                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Rôle</th>
                                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Statut</th>
                                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {team.map(member => (
                                        <tr key={member.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors group">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-lg ${member.color} ${member.text_color} flex items-center justify-center font-bold text-sm`}>
                                                        {member.initial}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{member.name}</p>
                                                        <p className="text-xs text-slate-500">{member.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${ROLES[member.roleId?.toUpperCase()] ? 'bg-primary/10 text-primary border-primary/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                                                    {member.role}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${member.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                    <span className="text-sm text-slate-300">{member.status || 'Active'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white" title="Modifier le rôle"><Edit2 size={16} /></button>
                                                    {canManageMember(member) && (
                                                        <button
                                                            onClick={() => handleDeleteMember(member.id)}
                                                            className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400"
                                                            title="Désactiver le compte"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- INTEGRATIONS TAB --- */}
                {activeTab === 'integrations' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {integrations.map(saved => {
                            const catalogItem = INTEGRATION_CATALOG.find(i => i.slug === saved.slug);
                            const Icon = catalogItem?.icon || LayoutGrid;
                            const isConnected = saved.is_connected;
                            return (
                                <div
                                    key={saved.id}
                                    onClick={() => handleConnect(saved.slug)}
                                    className={`bg-surface-dark rounded-2xl p-5 border border-white/5 hover:border-primary/30 transition-all flex flex-col justify-between group cursor-pointer h-40 relative overflow-hidden ${connecting === saved.slug ? 'opacity-70' : ''}`}
                                >
                                    {connecting === saved.slug && (
                                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center backdrop-blur-[2px]">
                                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                    <div className="flex justify-between items-start">
                                        <div className={`w-12 h-12 ${catalogItem?.bg || 'bg-white/5'} rounded-xl flex items-center justify-center ${catalogItem?.color || 'text-slate-400'}`}>
                                            <Icon size={24} />
                                        </div>
                                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${isConnected ? 'bg-bg-dark border-white/5' : 'bg-red-500/10 border-red-500/20'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isConnected ? 'text-slate-300' : 'text-red-400'}`}>
                                                {isConnected ? 'Connecté' : 'Non configuré'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-base font-bold text-white mb-1">{saved.name}</p>
                                        <p className="text-xs text-slate-500">{isConnected ? 'Dernière synchro: 2 min' : 'Cliquez pour configurer'}</p>
                                    </div>
                                </div>
                            );
                        })}
                        <div
                            onClick={() => setCatalogOpen(true)}
                            className="bg-surface-dark/50 rounded-2xl p-5 border border-white/5 border-dashed flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-dark transition-colors group"
                        >
                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary/20 group-hover:text-primary transition-all text-slate-400">
                                <Plus size={24} />
                            </div>
                            <p className="text-sm font-bold text-slate-300">Ajouter une intégration</p>
                        </div>
                    </div>
                )}

                {/* --- SECURITY TAB (ADMIN) --- */}
                {activeTab === 'security' && isAdmin && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-surface-dark p-5 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3 mb-2">
                                    <Shield size={20} className="text-green-400" />
                                    <h4 className="font-bold text-white">2FA Activé</h4>
                                </div>
                                <p className="text-xs text-slate-500">L'authentification à deux facteurs est forcée pour tous les admins.</p>
                            </div>
                            <div className="bg-surface-dark p-5 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3 mb-2">
                                    <Lock size={20} className="text-accent" />
                                    <h4 className="font-bold text-white">Password Policy</h4>
                                </div>
                                <p className="text-xs text-slate-500">Complexité élevée requise. Rotation tous les 90 jours.</p>
                            </div>
                            <div className="bg-surface-dark p-5 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3 mb-2">
                                    <AlertTriangle size={20} className="text-red-400" />
                                    <h4 className="font-bold text-white">Zones à Risque</h4>
                                </div>
                                <p className="text-xs text-slate-500">Aucune activité suspecte détectée ces 30 derniers jours.</p>
                            </div>
                        </div>

                        <div className="bg-surface-dark rounded-2xl border border-white/5 p-6">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Activity size={16} className="text-slate-400" /> Audit Logs
                            </h3>
                            <div className="space-y-4">
                                {AUDIT_LOGS.map(log => (
                                    <div key={log.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                        <div className="flex items-center gap-4">
                                            <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                                            <div>
                                                <p className="text-sm text-white"><span className="font-bold text-primary">{log.admin}</span> performed <span className="font-bold text-white">{log.action}</span></p>
                                                <p className="text-xs text-slate-500">Target: {log.target}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-slate-500 font-mono">{log.time}</span>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-4 py-2 text-xs font-bold text-slate-500 hover:text-white uppercase tracking-wider transition-colors">
                                Voir tout l'historique
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
