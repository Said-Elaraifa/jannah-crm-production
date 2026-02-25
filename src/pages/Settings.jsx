import { useState, useEffect } from 'react';
import { LogOut, Check, Shield, Users, LayoutGrid, Lock, Eye } from 'lucide-react';
import { getTeamMembers, addTeamMember, updateTeamMember, deleteTeamMember, uploadProfileImage, signOut, getIntegrations, saveIntegrationConfig, addIntegration } from '../services/supabase';

import { INTEGRATION_CATALOG } from '../features/settings/constants';
import { ConfigModal, AddIntegrationModal, InviteModal } from '../features/settings/components/SettingsHelpers';
import { ProfileSection } from '../features/settings/components/ProfileSection';
import { TeamManagement } from '../features/settings/components/TeamManagement';
import { IntegrationsSetup } from '../features/settings/components/IntegrationsSetup';
import { SecuritySettings } from '../features/settings/components/SecuritySettings';
import { CustomSelect } from '../components/ui/CustomSelect';

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

    async function fetchIntegrations() {
        try {
            const data = await getIntegrations();
            setIntegrations(data);
        } catch (err) {
            console.error('Error fetching integrations:', err);
        }
    }

    async function fetchTeam() {
        try {
            const data = await getTeamMembers();
            setTeam(data);
        } catch (err) {
            console.error('Error fetching team:', err);
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchTeam();
        fetchIntegrations();
    }, []);

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
        if (target.id === currentUser.id) return false;
        if (currentUser.access_level === 'Super Admin') return true;
        if (currentUser.access_level === 'Admin') {
            return target.access_level !== 'Admin' && target.access_level !== 'Super Admin';
        }
        return false;
    };

    const handleDeleteMember = async (id) => {
        const target = team.find(m => m.id === id);
        if (!canManageMember(target)) {
            alert("Vous n'avez pas les permissions nécessaires pour supprimer ce membre.");
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
        const baseInfo = catalogItem || {
            name: saved.name,
            slug: saved.slug,
            fields: [{ key: 'apiKey', label: 'API Key', type: 'password' }]
        };
        setConfigModalIntegration({ ...baseInfo, config: saved?.config });
    };

    const handleAddFromCatalog = async (item) => {
        try {
            const saved = await addIntegration(item);
            setIntegrations(prev => [...prev, saved]);
            handleConnect(item.slug);
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
                text_color: textColors[randomColorIndex],
                access_level: member.access,
                email: member.email
            };

            const saved = await addTeamMember(newMember);
            setTeam(prev => [...prev, saved]);
            setInviteSent(member);
            setTimeout(() => setInviteSent(null), 3000);
        } catch (err) {
            alert("Erreur lors de l'invitation : " + err.message);
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
        <div className="space-y-10 animate-fade-in pb-20">
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

            {/* Header Area */}
            <div className="relative mb-8 z-10 w-full flex-shrink-0">
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-accent/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none -translate-y-1/2 animate-pulse-glow" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 w-full">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest text-accent mb-6 shadow-[0_0_15px_rgba(238,180,23,0.2)]">
                            <Shield size={12} className="animate-pulse" /> Configuration Système
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-4 text-slate-900 dark:text-white flex items-center gap-4">
                            Paramètres
                            {isAdmin && <span className="px-3 py-1 rounded-xl bg-red-500/10 text-red-500 text-[10px] md:text-xs font-black uppercase tracking-widest border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)] flex items-center gap-1"><Lock size={10} /> ADMIN</span>}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-base md:text-lg leading-relaxed font-medium mt-4">
                            {isAdmin ? "Configuration globale et gestion de l'organisation." : 'Gérez vos préférences personnelles et la sécurité de votre compte.'}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Role Simulator Dropdown */}
                        <div className="relative group min-w-[200px]">
                            <CustomSelect
                                value={currentUser?.id || ''}
                                onChange={(val) => {
                                    const selected = team.find(m => m.id === parseInt(val));
                                    if (selected) setCurrentUser(selected);
                                }}
                                options={team.map(m => ({ value: m.id, label: m.name }))}
                                placeholder="Voir comme..."
                                icon={Eye}
                                className="!bg-white dark:!bg-surface-dark/40 !backdrop-blur-xl border-slate-200 dark:border-white/10 hover:!border-slate-300 dark:hover:!border-white/20 !py-3 shadow-sm !rounded-xl text-slate-900 dark:text-white"
                            />
                        </div>

                        <button
                            onClick={() => signOut()}
                            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-red-500/10 hover:bg-red-500 text-red-600 dark:text-red-400 hover:text-white text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all border border-red-500/20 active:scale-95 whitespace-nowrap"
                        >
                            <LogOut size={16} strokeWidth={3} /> DÉCONNEXION
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar relative z-10">
                <div className="flex bg-white/50 dark:bg-surface-dark/40 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 p-1 shadow-sm">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${isActive
                                    ? 'bg-slate-900 dark:bg-white text-white dark:text-bg-dark shadow-lg shadow-black/10 dark:shadow-white/10'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                <Icon size={16} /> {tab.label}
                            </button>
                        );
                    })}
                </div>
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
                {activeTab === 'profile' && (
                    <ProfileSection
                        currentUser={currentUser}
                        notifications={notifications}
                        setNotifications={setNotifications}
                        handleUploadImage={handleUploadImage}
                    />
                )}

                {activeTab === 'team' && isAdmin && (
                    <TeamManagement
                        team={team}
                        setInviteOpen={setInviteOpen}
                        canManageMember={canManageMember}
                        handleDeleteMember={handleDeleteMember}
                    />
                )}

                {activeTab === 'integrations' && (
                    <IntegrationsSetup
                        integrations={integrations}
                        handleConnect={handleConnect}
                        connecting={connecting}
                        setCatalogOpen={setCatalogOpen}
                    />
                )}

                {activeTab === 'security' && isAdmin && (
                    <SecuritySettings />
                )}
            </div>
        </div>
    );
}
