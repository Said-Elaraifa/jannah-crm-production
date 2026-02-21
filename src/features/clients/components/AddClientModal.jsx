import { useState, memo } from 'react';
import { X, CheckCircle2, Copy } from 'lucide-react';
import { SERVICE_ICONS } from '../constants';

export const AddClientModal = memo(({ isOpen, onClose, onAdd, currentUser }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [selectedServices, setSelectedServices] = useState(['Web']);
    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState(null);

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setName('');
            setEmail('');
            setSelectedServices(['Web']);
            setSuccessData(null);
        }, 300);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
            await onAdd({
                name,
                email,
                services: selectedServices,
                status: 'Nouveau',
                progress: 0,
                assigned_to: currentUser?.name || 'Ismael',
                slug,
                last_contact: 'Moins d\'une heure'
            });
            // Generate link to the Cahier des charges
            const cahierLink = `${window.location.origin}/cahier/${slug}`;
            setSuccessData({ name, link: cahierLink });

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#070c12]/90 backdrop-blur-xl animate-fade-in" onClick={handleClose} />
            <div
                onClick={e => e.stopPropagation()}
                className="relative bg-surface-dark w-full max-w-xl rounded-[2rem] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] animate-zoom-in overflow-hidden"
            >
                {successData ? (
                    <div className="p-10 text-center space-y-6">
                        <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                            <CheckCircle2 size={40} />
                        </div>
                        <h3 className="text-2xl font-display font-black text-white">Dossier Initialisé !</h3>
                        <p className="text-slate-400 text-sm">Le projet pour <span className="text-white font-bold">{successData.name}</span> a été créé avec succès.</p>

                        <div className="mt-8 p-5 bg-black/40 border border-white/5 rounded-2xl text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Lien du cahier des charges (Pour le client)</p>
                            <div className="flex items-center gap-3">
                                <input type="text" readOnly value={successData.link} className="flex-1 bg-transparent text-sm text-white outline-none font-mono" />
                                <button onClick={() => navigator.clipboard.writeText(successData.link)} className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors shadow-lg shadow-black/20">
                                    <Copy size={16} />
                                </button>
                            </div>
                        </div>

                        <button onClick={handleClose} className="w-full py-4 mt-6 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all">
                            Terminer
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="p-10 space-y-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl md:text-2xl font-display font-bold text-white mb-2">Initialiser un Dossier</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">Capturez les bases technologiques du projet.</p>
                                </div>
                                <button type="button" onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Entité / Entreprise</label>
                                    <input
                                        required
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-accent/50 outline-none transition-all font-bold placeholder:text-slate-700"
                                        placeholder="E.g. Jannah Digital"
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Principal</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-accent/50 outline-none transition-all font-bold placeholder:text-slate-700"
                                        placeholder="contact@jannah.os"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Expertises Requises</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {Object.keys(SERVICE_ICONS).map(service => (
                                            <button
                                                key={service}
                                                type="button"
                                                onClick={() => setSelectedServices(prev => prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service])}
                                                className={`flex items-center gap-3 p-4 rounded-xl border transition-colors font-bold text-xs ${selectedServices.includes(service) ? 'bg-accent/10 border-accent/30 text-accent shadow-lg shadow-accent/5' : 'bg-black/20 border-white/5 text-slate-400 hover:bg-white/5 hover:text-white'}`}
                                            >
                                                <div className={`p-2 rounded-lg ${selectedServices.includes(service) ? 'bg-accent/20 text-accent' : 'bg-white/5 text-slate-500'}`}>
                                                    {(() => { const Icon = SERVICE_ICONS[service]; return <Icon size={14} /> })()}
                                                </div>
                                                {service}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-primary hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'CALCUL EN COURS...' : 'DÉPLOYER LE DOSSIER'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
});

AddClientModal.displayName = 'AddClientModal';
