import { useState } from 'react';
import { supabase } from '../services/supabase';
import { JannahLogoWithBadge } from '../components/ui/JannahLogo';
import { Lock, Mail, ArrowRight, Loader } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (authError) throw authError;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#070c12] flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Dynamic Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-12 animate-fade-in-up">
                    <div className="flex justify-center mb-6">
                        <JannahLogoWithBadge height={45} badge="OS1.0" />
                    </div>
                    <h1 className="text-3xl font-display font-black text-white tracking-tight mb-3">Content de vous revoir</h1>
                    <p className="text-slate-400 text-sm font-medium">Connectez-vous à votre poste de commande Jannah.</p>
                </div>

                <div className="bg-[#152636]/60 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] ring-1 ring-white/5 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[11px] font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email Professionnel</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/30 text-white text-sm font-bold rounded-2xl pl-12 pr-5 py-4 border border-white/5 focus:border-accent/50 focus:bg-black/50 outline-none transition-all placeholder-slate-700"
                                    placeholder="nom@jannah.agency"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Mot de Passe</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/30 text-white text-sm font-bold rounded-2xl pl-12 pr-5 py-4 border border-white/5 focus:border-accent/50 focus:bg-black/50 outline-none transition-all placeholder-slate-700"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-accent hover:bg-secondary text-primary text-sm font-black rounded-2xl transition-all shadow-[0_15px_30px_rgba(238,180,23,0.2)] active:scale-95 disabled:opacity-60 flex justify-center items-center gap-3 overflow-hidden relative group"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                {loading ? <Loader size={20} className="animate-spin" /> : <>CONNEXION <ArrowRight size={18} /></>}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-white/5 text-center">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Contactez l'administration pour vos accès</p>
                    </div>
                </div>

                <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">© {new Date().getFullYear()} Jannah Agency OS1.0 — Tous droits réservés</p>
                </div>
            </div>
        </div>
    );
}
