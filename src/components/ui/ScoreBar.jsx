export function ScoreBar({ score, label = 'Score IA' }) {
    const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-accent' : score >= 40 ? 'bg-orange-500' : 'bg-red-500';
    const textColor = score >= 80 ? 'text-green-400' : score >= 60 ? 'text-accent' : score >= 40 ? 'text-orange-400' : 'text-red-400';
    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500">{label}</span>
                <span className={`text-[10px] md:text-xs font-black tracking-widest ${textColor}`}>{score}/100</span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
                <div className={`${color} h-1.5 rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
            </div>
        </div>
    );
}
