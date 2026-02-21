import { UserPlus, Edit2, Trash2 } from 'lucide-react';
import { ROLES } from '../../../data/constants';

export function TeamManagement({ team, setInviteOpen, canManageMember, handleDeleteMember }) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-surface-dark p-6 rounded-2xl border border-white/5">
                <div>
                    <h3 className="text-base md:text-lg font-bold text-white">Membres de l'équipe</h3>
                    <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mt-1">Gérez les accès et les rôles.</p>
                </div>
                <button onClick={() => setInviteOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-green-700 text-white text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95">
                    <UserPlus size={16} /> Ajouter un membre
                </button>
            </div>

            <div className="bg-surface-dark rounded-2xl border border-white/5 overflow-hidden overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/5">
                            <th className="p-4 text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest">Membre</th>
                            <th className="p-4 text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest">Rôle</th>
                            <th className="p-4 text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest">Statut</th>
                            <th className="p-4 text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
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
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${ROLES[member.role?.toUpperCase()] || ROLES.SALES ? 'bg-primary/10 text-primary border-primary/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
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
    );
}
