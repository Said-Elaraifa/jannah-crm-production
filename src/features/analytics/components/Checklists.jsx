import { useState } from 'react';
import { CheckSquare, RefreshCw } from 'lucide-react';

export function Checklists() {
    const [checkedItems, setCheckedItems] = useState({});

    const toggleItem = (id) => {
        setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const checklistItems = [
        { id: 'pixel', text: "Le Pixel / CAPI est actif et reçoit des événements." },
        { id: 'budget', text: "Le budget quotidien/global est correct et validé." },
        { id: 'audience', text: "L'audience cible exclut bien les clients existants (si nécessaire)." },
        { id: 'creative', text: "Les visuels sont au bon format (1:1, 9:16) et HD." },
        { id: 'copy', text: "Le copywriting a été relu (0 fautes d'orthographe)." },
        { id: 'link', text: "Les liens de destination fonctionnent et sont rapides." },
        { id: 'utms', text: "Les UTMs sont configurés correctement." },
    ];

    const progress = Math.round((Object.values(checkedItems).filter(Boolean).length / checklistItems.length) * 100);

    return (
        <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-3">
                    <CheckSquare size={20} className="text-green-400" /> Pre-Flight Checklist
                </h3>
                <div className="text-[10px] md:text-xs font-black uppercase tracking-widest px-3 py-1 bg-white/5 rounded-xl text-slate-300">
                    {progress}% Prêt
                </div>
            </div>

            <div className="w-full bg-white/5 rounded-full h-2 mb-6 overflow-hidden">
                <div className="bg-green-400 h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="space-y-3">
                {checklistItems.map(item => (
                    <div
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${checkedItems[item.id]
                            ? 'bg-green-500/5 border-green-500/20'
                            : 'bg-black/20 border-transparent hover:bg-white/5'
                            }`}
                    >
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${checkedItems[item.id] ? 'bg-green-500 border-green-500' : 'border-slate-600'
                            }`}>
                            {checkedItems[item.id] && <CheckSquare size={14} className="text-bg-dark" />}
                        </div>
                        <span className={`text-sm ${checkedItems[item.id] ? 'text-white line-through opacity-50' : 'text-slate-300'}`}>
                            {item.text}
                        </span>
                    </div>
                ))}
            </div>

            <button
                onClick={() => setCheckedItems({})}
                className="mt-6 text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white flex items-center gap-2 mx-auto transition-colors"
            >
                <RefreshCw size={14} /> Réinitialiser la liste
            </button>
        </div>
    );
}
