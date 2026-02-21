import {
    LayoutDashboard, Target, Users, PieChart, MessageSquare,
    BookOpen, Settings, X, ChevronRight, LogOut, Zap, Receipt,
    LayoutGrid
} from 'lucide-react';
import { JannahLogoWithBadge } from '../ui/JannahLogo';
import { TEAM_MEMBERS } from '../../data/constants';

const NAV_SECTIONS = [
    {
        title: 'GÉNÉRAL',
        items: [
            { id: 'Dashboard', label: 'Dashboard CEO', icon: LayoutDashboard },
        ]
    },
    {
        title: 'BUSINESS',
        items: [
            { id: 'Sales', label: 'Sales Pipeline', icon: Target },
            { id: 'Portfolio', label: 'Portefeuille Clients', icon: LayoutGrid },
            { id: 'Billing', label: 'Ventes & Finances', icon: Receipt },
            { id: 'Clients', label: 'Clients & Projets', icon: Users },
        ]
    },
    {
        title: 'OPÉRATIONS',
        items: [
            { id: 'Analytics', label: 'Analytics & Ads', icon: PieChart },
            { id: 'Tools', label: 'Outils IA', icon: Zap },
        ]
    },
    {
        title: 'SYSTÈME',
        items: [
            { id: 'AIChat', label: 'Bibliothèque IA', icon: MessageSquare },
            { id: 'SOPs', label: 'SOPs & Docs', icon: BookOpen },
            { id: 'Settings', label: 'Paramètres', icon: Settings },
        ]
    }
];

function NavLink({ item, active, onClick }) {
    const Icon = item.icon;
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${active
                ? 'bg-primary text-white font-semibold shadow-lg shadow-primary/20'
                : 'text-slate-400 hover:bg-white/5 hover:text-white transition-colors duration-200'
                }`}
        >
            <Icon size={18} className="flex-shrink-0" />
            <span className={`text-sm ${active ? 'font-semibold' : 'font-medium'} truncate`}>{item.label}</span>
            {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />}
        </button>
    );
}

export default function Sidebar({ activeTab, setActiveTab, isOpen, onClose, currentUser, onLogout }) {
    const handleNav = (id) => {
        setActiveTab(id);
        onClose();
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <aside className={`
        fixed z-50 inset-y-0 left-0 w-64 flex flex-col
        bg-surface-dark border-r border-slate-200 dark:border-white/5
        transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:sticky md:top-0 md:h-screen
      `}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-white/5 flex-shrink-0">
                    <JannahLogoWithBadge height={32} badge="OS1.0" />
                    <button onClick={onClose} className="md:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto custom-scrollbar">
                    {NAV_SECTIONS.map(section => (
                        <div key={section.title} className="space-y-1">
                            <h3 className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3 opacity-80">
                                {section.title}
                            </h3>
                            <div className="space-y-1">
                                {section.items.map(item => (
                                    <NavLink
                                        key={item.id}
                                        item={item}
                                        active={activeTab === item.id}
                                        onClick={() => handleNav(item.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* User profile */}
                <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-surface-dark flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`relative w-9 h-9 rounded-xl ${currentUser?.color || 'bg-slate-500'} flex items-center justify-center ${currentUser?.textColor || 'text-white'} font-bold text-sm flex-shrink-0 overflow-hidden`}>
                            {currentUser?.avatar || TEAM_MEMBERS.find(m => m.id === currentUser?.id || m.name === currentUser?.name)?.avatar ? (
                                <img src={currentUser?.avatar || TEAM_MEMBERS.find(m => m.id === currentUser?.id || m.name === currentUser?.name)?.avatar} alt={currentUser?.name || 'Avatar'} className="w-full h-full object-cover" />
                            ) : (
                                currentUser?.initial || '?'
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{currentUser?.name || 'Visiteur'}</p>
                            <p className="text-xs text-secondary truncate">{currentUser?.role || 'Access Guest'}</p>
                        </div>
                        <button
                            onClick={onLogout}
                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Déconnexion"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
