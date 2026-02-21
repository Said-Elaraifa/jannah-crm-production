export function Button({ children, onClick, variant = 'primary', size = 'md', className = '', disabled = false, type = 'button' }) {
    const variants = {
        primary: 'bg-primary hover:bg-green-700 text-white shadow-lg shadow-primary/20',
        secondary: 'bg-secondary hover:bg-[#b0cc65] text-primary font-bold shadow-lg shadow-secondary/20',
        accent: 'bg-accent hover:bg-yellow-500 text-[#12202c] font-bold shadow-lg shadow-accent/20',
        outline: 'bg-transparent border border-white/10 hover:border-white/20 text-slate-300 hover:text-white',
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
            className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {children}
        </button>
    );
}
