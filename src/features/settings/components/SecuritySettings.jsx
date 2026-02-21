import { Shield, Lock, AlertTriangle, Activity } from 'lucide-react';
import { AUDIT_LOGS } from '../constants';

export function SecuritySettings() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface-dark p-6 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield size={20} className="text-green-400" />
                        <h4 className="text-sm md:text-base font-bold text-white">2FA Activé</h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">L'authentification à deux facteurs est forcée pour tous les admins.</p>
                </div>
                <div className="bg-surface-dark p-6 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                        <Lock size={20} className="text-accent" />
                        <h4 className="text-sm md:text-base font-bold text-white">Password Policy</h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">Complexité élevée requise. Rotation tous les 90 jours.</p>
                </div>
                <div className="bg-surface-dark p-6 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle size={20} className="text-red-400" />
                        <h4 className="text-sm md:text-base font-bold text-white">Zones à Risque</h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">Aucune activité suspecte détectée ces 30 derniers jours.</p>
                </div>
            </div>

            <div className="bg-surface-dark rounded-2xl border border-white/5 p-6">
                <h3 className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-3">
                    <Activity size={16} className="text-slate-400" /> Audit Logs
                </h3>
                <div className="space-y-4">
                    {AUDIT_LOGS.map(log => (
                        <div key={log.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                            <div className="flex items-center gap-4">
                                <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                                <div>
                                    <p className="text-sm text-slate-300"><span className="font-bold text-primary">{log.admin}</span> performed <span className="font-bold text-white">{log.action}</span></p>
                                    <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mt-1">Target: {log.target}</p>
                                </div>
                            </div>
                            <span className="text-xs font-semibold text-slate-500">{log.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
