import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import clsx from 'clsx'; // Utility for class names (assumed or we can just use template literals)

/**
 * A custom dropdown component to replace native `<select>` elements.
 * Adheres to the Jannah OS dark/light theme.
 */
export function CustomSelect({
    value,
    onChange,
    options = [],
    placeholder = "Sélectionner...",
    className = "",
    disabled = false,
    icon: Icon = null,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div ref={containerRef} className="relative w-full">
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={clsx(
                    "w-full flex items-center justify-between text-left",
                    "bg-white/5 border border-white/10 rounded-xl px-4 py-3",
                    "text-sm font-medium transition-all duration-200",
                    "focus:outline-none focus:border-primary/50",
                    disabled ? "opacity-50 cursor-not-allowed" : "hover:border-white/20 cursor-pointer",
                    isOpen ? "border-primary/50 bg-white/10" : "bg-black/20",
                    className
                )}
            >
                <div className="flex items-center gap-3 truncate">
                    {Icon && <Icon size={16} className="text-slate-400" />}
                    <span className={clsx("truncate", !selectedOption && "text-slate-500")}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown
                    size={16}
                    className={clsx(
                        "text-slate-400 transition-transform duration-200 flex-shrink-0 ml-2",
                        isOpen && "rotate-180 text-primary"
                    )}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-surface-dark border border-white/10 rounded-xl shadow-2xl py-2 overflow-hidden animate-fade-in origin-top">
                    {/* Optional max height and scrollbar for large lists */}
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {options.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-slate-500 text-center">Aucune option</div>
                        ) : (
                            options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={clsx(
                                        "w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors",
                                        "hover:bg-primary/10 hover:text-white",
                                        value === option.value ? "bg-primary/5 text-primary font-bold" : "text-slate-300 font-medium"
                                    )}
                                >
                                    <span className="truncate">{option.label}</span>
                                    {value === option.value && (
                                        <Check size={16} className="text-primary flex-shrink-0 ml-2" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default CustomSelect;
