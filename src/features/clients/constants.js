import { Loader, Globe, Sparkles, Clock, AlertCircle, Zap, Search, Image } from 'lucide-react';

export const STATUS_CONFIG = {
    'En Développement': { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Loader, label: 'En Progrès' },
    'En Ligne': { color: 'text-[#c3dc7f]', bg: 'bg-[#c3dc7f]/10', border: 'border-[#c3dc7f]/20', icon: Globe, label: 'Live' },
    'Nouveau': { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Sparkles, label: 'Nouveau' },
    'En Attente': { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: Clock, label: 'En Pause' },
    'Suspendu': { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: AlertCircle, label: 'Suspendu' },
};

export const SERVICE_ICONS = {
    'Web': Globe,
    'Ads': Zap,
    'SEO': Search,
    'Logo': Image,
};
