// src/components/ui/StatCard.jsx
import { TrendingUp, TrendingDown } from 'lucide-react';

export function StatCard({ kpi }) {
    const isUp = kpi.trend === 'up';
    return (
        <div className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-lg hover:border-primary/30 transition-all duration-300 group animate-fade-in-up">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider leading-tight">{kpi.label}</h3>
                <div className={`p-1.5 rounded-lg ${kpi.bgColor} ${kpi.color}`}>
                    {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                </div>
            </div>
            <div className="mb-2">
                <span className="text-3xl font-display font-bold text-white tracking-tight">{kpi.value}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
                <span className={`${kpi.color} font-bold px-1.5 py-0.5 rounded ${kpi.bgColor}`}>{kpi.change}</span>
                <span className="text-slate-500">vs mois dernier</span>
            </div>
        </div>
    );
}

// src/components/ui/Badge.jsx
export function Badge({ children, color = 'primary' }) {
    const colors = {
        primary: 'bg-primary/20 text-green-400 border-primary/30',
        accent: 'bg-accent/20 text-accent border-accent/30',
        secondary: 'bg-secondary/20 text-secondary border-secondary/30',
        blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        red: 'bg-red-500/20 text-red-400 border-red-500/30',
        slate: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
        purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${colors[color] || colors.primary}`}>
            {children}
        </span>
    );
}

// src/components/ui/Button.jsx
export function Button({ children, onClick, variant = 'primary', size = 'md', className = '', disabled = false, type = 'button' }) {
    const variants = {
        primary: 'bg-primary hover:bg-green-700 text-white shadow-lg shadow-primary/20',
        secondary: 'bg-secondary hover:bg-[#b0cc65] text-primary font-bold shadow-lg shadow-secondary/20',
        accent: 'bg-accent hover:bg-yellow-500 text-[#12202c] font-bold shadow-lg shadow-accent/20',
        outline: 'bg-transparent border border-white/10 hover:border-primary text-slate-300 hover:text-white',
        danger: 'bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20',
        ghost: 'bg-transparent hover:bg-white/5 text-slate-400 hover:text-white',
    };
    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3 text-sm font-semibold',
    };
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex items-center gap-2 rounded-xl font-medium transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {children}
        </button>
    );
}

// src/components/ui/Modal.jsx
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    if (!isOpen) return null;
    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-6xl',
    };
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" style={{ zIndex: 9999 }} onClick={onClose}>
            <div
                className={`bg-surface-dark w-full ${sizes[size]} rounded-2xl border border-white/10 shadow-2xl animate-fade-in-up max-h-[90vh] flex flex-col`}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b border-white/5 flex-shrink-0">
                    <h3 className="text-lg font-display font-bold text-white">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg">
                        <X size={20} />
                    </button>
                </div>
                <div className="overflow-y-auto custom-scrollbar flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
}

// src/components/ui/Input.jsx
export function Input({ label, type = 'text', value, onChange, placeholder, required, className = '', ...props }) {
    return (
        <div className={className}>
            {label && <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{label}</label>}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full bg-bg-dark text-white text-sm rounded-xl px-4 py-3 border border-white/5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-slate-500"
                {...props}
            />
        </div>
    );
}

export function Select({ label, value, onChange, children, className = '' }) {
    return (
        <div className={className}>
            {label && <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{label}</label>}
            <select
                value={value}
                onChange={onChange}
                className="w-full bg-bg-dark text-white text-sm rounded-xl px-4 py-3 border border-white/5 focus:border-primary outline-none transition-all cursor-pointer"
            >
                {children}
            </select>
        </div>
    );
}

export function Textarea({ label, value, onChange, placeholder, rows = 4, className = '' }) {
    return (
        <div className={className}>
            {label && <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{label}</label>}
            <textarea
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                className="w-full bg-bg-dark text-white text-sm rounded-xl px-4 py-3 border border-white/5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-slate-500 resize-none"
            />
        </div>
    );
}

// src/components/ui/ScoreBar.jsx
export function ScoreBar({ score, label = 'Score IA' }) {
    const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-accent' : score >= 40 ? 'bg-orange-500' : 'bg-red-500';
    const textColor = score >= 80 ? 'text-green-400' : score >= 60 ? 'text-accent' : score >= 40 ? 'text-orange-400' : 'text-red-400';
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-500">{label}</span>
                <span className={`text-xs font-bold ${textColor}`}>{score}/100</span>
            </div>
            <div className="w-full bg-bg-dark rounded-full h-1.5">
                <div className={`${color} h-1.5 rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
            </div>
        </div>
    );
}

// src/components/ui/EmptyState.jsx
export function EmptyState({ icon: Icon, title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-surface-dark rounded-2xl flex items-center justify-center mb-4 border border-white/5">
                <Icon size={28} className="text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-xs">{description}</p>
            {action}
        </div>
    );
}
