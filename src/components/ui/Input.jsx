export function Input({ label, type = 'text', value, onChange, placeholder, required, className = '', ...props }) {
    return (
        <div className={className}>
            {label && <label className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-2">{label}</label>}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full bg-black/20 text-white text-sm rounded-xl px-4 py-3 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors placeholder-slate-500"
                {...props}
            />
        </div>
    );
}
