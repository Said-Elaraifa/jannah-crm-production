// src/components/layout/Header.jsx
import { useState } from 'react';
import { Bell, Bot, Menu, Search, X, Activity, Sun, Moon } from 'lucide-react';
import { JannahLogoWithBadge } from '../ui/JannahLogo';
import { useNotifications } from '../../hooks/useNotifications';
import { useTheme } from '../../contexts/ThemeContext';

export default function Header({ onMenuClick, onChatToggle, chatOpen, activeTab }) {
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
    const { theme, toggleTheme } = useTheme();
    const [showNotifications, setShowNotifications] = useState(false);

    const tabTitles = {
        Dashboard: 'Dashboard CEO',
        Sales: 'Sales Pipeline',
        Billing: 'Ventes & Finances',
        Clients: 'Clients & Projets',
        Analytics: 'Analytics & Ads',
        AIChat: 'Bibliothèque IA',
        SOPs: 'SOPs & Docs',
        Settings: 'Paramètres',
    };

    return (
        <header className="sticky top-0 h-16 flex items-center justify-between px-5 md:px-8 border-b border-slate-200 dark:border-white/5 bg-surface-dark/80 backdrop-blur-sm z-30 flex-shrink-0">
            {/* Left: Menu + Title */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="md:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                >
                    <Menu size={20} />
                </button>
                <span className="hidden md:block text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest">
                    {tabTitles[activeTab] || activeTab}
                </span>
                <span className="md:hidden">
                    <JannahLogoWithBadge height={28} badge="OS1.0" />
                </span>
            </div>

            {/* Center: Search */}
            <div className="hidden md:flex items-center bg-slate-100 dark:bg-black/20 rounded-xl px-4 py-2.5 w-80 border border-slate-200 dark:border-white/5 focus-within:border-primary/50 transition-all group">
                <Search size={16} className="text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors mr-3 flex-shrink-0" />
                <input
                    type="text"
                    placeholder="Rechercher..."
                    className="bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none w-full placeholder-slate-400 dark:placeholder-slate-500"
                />
                <div className="flex items-center gap-1 opacity-40 flex-shrink-0">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded px-1.5 py-0.5 font-bold uppercase">⌘K</span>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                <button
                    onClick={toggleTheme}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-bg-dark" />
                        )}
                    </button>

                    {showNotifications && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                            <div className="absolute right-0 mt-3 w-80 bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-2xl z-50 overflow-hidden animate-fade-in">
                                <div className="px-5 py-4 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-white/[0.02]">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Notifications</h3>
                                        {unreadCount > 0 && <span className="text-[9px] px-1.5 py-0.5 bg-accent/20 text-accent rounded-full font-black">{unreadCount}</span>}
                                    </div>
                                    <div className="flex gap-2">
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={markAllAsRead}
                                                className="text-[10px] text-accent hover:text-secondary font-black uppercase tracking-widest transition-colors"
                                                title="Tout marquer comme lu"
                                            >
                                                Tout lu
                                            </button>
                                        )}
                                        {notifications.length > 0 && (
                                            <button
                                                onClick={clearAll}
                                                className="text-[10px] text-slate-500 hover:text-red-400 font-black uppercase tracking-widest transition-colors"
                                            >
                                                Vider
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                    {notifications.length === 0 ? (
                                        <div className="p-10 text-center">
                                            <Bell size={32} className="mx-auto text-slate-700 mb-3 opacity-20" />
                                            <p className="text-sm text-slate-500">Aucune notification</p>
                                        </div>
                                    ) : (
                                        notifications.map((n) => (
                                            <div
                                                key={n.id}
                                                className={`p-5 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer group ${!n.is_read ? 'bg-accent/5' : ''}`}
                                                onClick={() => {
                                                    if (!n.is_read) markAsRead(n.id);
                                                    // Add navigation logic if needed
                                                }}
                                            >
                                                <div className="flex gap-3">
                                                    <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${n.type === 'success' ? 'bg-green-500/10 text-green-400' :
                                                        n.type === 'warning' ? 'bg-yellow-500/10 text-yellow-400' :
                                                            n.type === 'error' ? 'bg-red-500/10 text-red-400' :
                                                                'bg-accent/10 text-accent'
                                                        }`}>
                                                        <Activity size={14} />
                                                    </div>
                                                    <div className="space-y-1 mt-0.5">
                                                        <p className={`text-sm font-bold leading-tight ${!n.is_read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>{n.title}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{n.message}</p>
                                                        <p className="text-[10px] text-slate-400 dark:text-slate-600 font-medium">
                                                            {new Date(n.created_at).toLocaleDateString('fr-FR', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <button
                    onClick={onChatToggle}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg ${chatOpen
                        ? 'bg-accent text-[#12202c] shadow-accent/20'
                        : 'bg-primary hover:bg-green-700 text-white shadow-primary/20'
                        }`}
                >
                    {chatOpen ? <X size={16} /> : <Bot size={16} />}
                    <span className="hidden sm:block">{chatOpen ? 'Fermer' : 'Ask AI'}</span>
                </button>
            </div>
        </header>
    );
}
