export function ScoreBadge({ score }) {
    if (score >= 80) return <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-green-400 bg-green-500/10 px-2.5 py-1 rounded-xl">🔥 {score}</span>;
    if (score >= 60) return <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-accent bg-accent/10 px-2.5 py-1 rounded-xl">⚡ {score}</span>;
    return <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-500/10 px-2.5 py-1 rounded-xl">❄️ {score}</span>;
}

export const Field = ({ label, children }) => (
    <div>
        <label className="block text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">{label}</label>
        {children}
    </div>
);
