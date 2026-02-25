import { SOURCE_TABS } from '../constants';

export function SourceFilterTabs({ activeTab, onTabChange, counts }) {
    return (
        <div className="flex items-center gap-2 py-1 overflow-x-auto scrollbar-hide -mx-1 px-1">
            {SOURCE_TABS.map(tab => {
                const isActive = activeTab === tab.id;
                const count = counts?.[tab.id] ?? 0;

                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`
                            group flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest
                            border transition-all duration-300 whitespace-nowrap flex-shrink-0
                            ${isActive
                                ? 'bg-accent/15 border-accent/40 text-accent shadow-[0_0_15px_rgba(238,180,23,0.15)]'
                                : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/10 hover:border-white/10'
                            }
                        `}
                    >
                        <span className="text-sm">{tab.emoji}</span>
                        <span>{tab.label}</span>
                        <span className={`
                            text-[9px] px-1.5 py-0.5 rounded-md font-bold ml-0.5
                            ${isActive
                                ? 'bg-accent/20 text-accent'
                                : 'bg-white/5 text-slate-600 group-hover:text-slate-400'
                            }
                        `}>
                            {count}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
