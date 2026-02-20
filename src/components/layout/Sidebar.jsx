import {
    LayoutDashboard, Target, Users, PieChart, MessageSquare,
    BookOpen, Settings, X, ChevronRight, LogOut
} from 'lucide-react';
import { JannahLogoWithBadge } from '../ui/JannahLogo';

const NAV_ITEMS = [
    { id: 'Dashboard', label: 'Dashboard CEO', icon: LayoutDashboard },
    { id: 'Sales', label: 'Sales Pipeline', icon: Target },
    { id: 'Clients', label: 'Clients & Projets', icon: Users },
    { id: 'Analytics', label: 'Analytics & Ads', icon: PieChart },
];

const SYSTEM_ITEMS = [
    { id: 'AIChat', label: 'Bibliothèque IA', icon: MessageSquare },
    { id: 'SOPs', label: 'SOPs & Docs', icon: BookOpen },
    { id: 'Settings', label: 'Paramètres', icon: Settings },
];

function NavLink({ item, active, onClick }) {
    const Icon = item.icon;
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${active
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
        >
            <Icon size={18} className="flex-shrink-0" />
            <span className="text-sm font-medium truncate">{item.label}</span>
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
        bg-[#152636] border-r border-white/5
        transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:relative md:inset-auto
      `}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-5 border-b border-white/5 flex-shrink-0">
                    <JannahLogoWithBadge height={32} badge="OS1.0" />
                    <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white p-1">
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto custom-scrollbar">
                    {NAV_ITEMS.map(item => (
                        <NavLink
                            key={item.id}
                            item={item}
                            active={activeTab === item.id}
                            onClick={() => handleNav(item.id)}
                        />
                    ))}

                    <div className="pt-5 pb-2 px-3">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Système</p>
                    </div>

                    {SYSTEM_ITEMS.map(item => (
                        <NavLink
                            key={item.id}
                            item={item}
                            active={activeTab === item.id}
                            onClick={() => handleNav(item.id)}
                        />
                    ))}
                </nav>

                {/* User profile */}
                <div className="p-4 border-t border-white/5 bg-surface-dark flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl ${currentUser?.color || 'bg-slate-500'} flex items-center justify-center ${currentUser?.textColor || 'text-white'} font-bold text-sm flex-shrink-0`}>
                            {currentUser?.initial || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{currentUser?.name || 'Visiteur'}</p>
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
