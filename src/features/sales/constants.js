import { Clock, AlertCircle } from 'lucide-react';

export const STAGES = [
    { id: 'new', label: 'Nouveaux Leads', color: 'border-slate-500', dot: 'bg-slate-400', textColor: 'text-slate-400', bg: 'bg-slate-500/10' },
    { id: 'qualified', label: 'Qualifiés', color: 'border-accent', dot: 'bg-accent', textColor: 'text-accent', bg: 'bg-accent/10' },
    { id: 'proposal', label: 'Offre Envoyée', color: 'border-blue-400', dot: 'bg-blue-400', textColor: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 'won', label: 'Signés 🎉', color: 'border-primary', dot: 'bg-secondary', textColor: 'text-secondary', bg: 'bg-primary/10' },
];

export const SOURCES = ['Google Ads', 'Meta Ads', 'SEO', 'LinkedIn', 'Référence', 'Inbound', 'Cold Email', 'Événement'];

export function getDealRottingStatus(lastContactDate) {
    if (!lastContactDate) return { color: 'text-slate-500', icon: Clock, label: 'Nouveau' };
    const days = Math.floor((new Date() - new Date(lastContactDate)) / (1000 * 60 * 60 * 24));

    if (days > 14) return { color: 'text-red-400', icon: AlertCircle, label: `${days}j sans contact` };
    if (days > 7) return { color: 'text-accent', icon: Clock, label: `${days}j sans contact` };
    return { color: 'text-slate-400', icon: Clock, label: `${days}j` };
}
