import { Toggle } from './SettingsHelpers';
import { useTheme } from '../../../contexts/ThemeContext';

export function ProfileSection({ currentUser, notifications, setNotifications, handleUploadImage }) {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-dark rounded-2xl p-6 border border-white/5">
                <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Mon Profil</h3>
                <div className="flex items-center gap-4 mb-6">
                    <div className={`w-20 h-20 rounded-2xl ${currentUser?.color || 'bg-slate-500'} flex items-center justify-center overflow-hidden shadow-lg shadow-black/20`}>
                        {currentUser?.avatar_url ? (
                            <img src={currentUser.avatar_url} alt={currentUser.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className={`${currentUser?.textColor || 'text-white'} font-bold text-3xl`}>{currentUser?.initial || 'U'}</span>
                        )}
                    </div>
                    <div>
                        <h4 className="text-xl md:text-2xl font-display font-bold text-white tracking-tight">{currentUser?.name || 'Utilisateur'}</h4>
                        <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-secondary mt-1">{currentUser?.role || 'Rôle'}</p>
                        <p className="text-sm text-slate-400 mt-1">{currentUser?.email || 'email@exemple.com'}</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <label className="w-full py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all border border-white/5 flex items-center justify-center cursor-pointer">
                        Modifier la photo
                        <input type="file" className="hidden" accept="image/*" onChange={handleUploadImage} />
                    </label>
                    <button className="w-full py-3 bg-primary hover:bg-green-700 text-white text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95">
                        Enregistrer les modifications
                    </button>
                </div>
            </div>

            <div className="bg-surface-dark rounded-2xl p-8 border border-white/5">
                <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Préférences & Notifications</h3>
                {Object.entries(notifications).map(([type, enabled]) => (
                    <div key={type} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                        <div>
                            <span className="text-sm text-slate-300 font-medium">{type} Alerts</span>
                            <p className="text-xs text-slate-500 mt-0.5">{enabled ? 'Vous recevrez des notifications.' : 'Notifications désactivées.'}</p>
                        </div>
                        <Toggle enabled={enabled} onChange={(val) => setNotifications(prev => ({ ...prev, [type]: val }))} />
                    </div>
                ))}

                <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 mt-4">
                    <div>
                        <span className="text-sm text-slate-300 font-medium whitespace-nowrap">Mode Sombre</span>
                        <p className="text-xs text-slate-500 mt-0.5">Activer l'interface premium sombre.</p>
                    </div>
                    <Toggle enabled={theme === 'dark'} onChange={toggleTheme} />
                </div>
            </div>
        </div>
    );
}
