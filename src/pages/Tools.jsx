import { useState } from 'react';
import {
    Zap, Mail, Send, RefreshCw,
    Sparkles, Target, MessageSquare, Loader,
    Facebook, Globe, Wand2
} from 'lucide-react';
import { generateMarketingContent } from '../services/gemini';
import { ToolCard, ResultBlock } from '../features/ai-tools/components/ToolComponents';
import { CustomSelect } from '../components/ui/CustomSelect';

export default function Tools({ onAddLog }) {
    const [activeTool, setActiveTool] = useState('meta_ads'); // meta_ads, google_ads, email_sequence
    const [context, setContext] = useState('');
    const [tone, setTone] = useState('Créatif & Percutant');
    const [audience, setAudience] = useState('PME Françaises');
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState('');
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!context.trim()) return;
        setGenerating(true);
        setResult('');
        try {
            const output = await generateMarketingContent(
                activeTool === 'meta_ads' || activeTool === 'google_ads' ?
                    (activeTool === 'meta_ads' ? 'ad_copy_meta' : 'ad_copy_google') :
                    'email_sequence',
                context,
                { tone, audience }
            );
            setResult(output);

            // Log activity
            if (onAddLog) {
                await onAddLog({
                    prompt: `[Tools: ${activeTool}] Contexte: ${context}, Ton: ${tone}, Audience: ${audience}`,
                    response: output,
                    status: 'Success',
                    model: 'gemini-2.0-flash'
                });
            }
        } catch (error) {
            console.error(error);
            setResult("Erreur lors de la génération. Veuillez vérifier votre clé API.");

            if (onAddLog) {
                await onAddLog({
                    prompt: `[Tools: ${activeTool}] Contexte: ${context}`,
                    response: error.message,
                    status: 'Error',
                    model: 'gemini-2.0-flash'
                });
            }
        } finally {
            setGenerating(false);
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-10 pb-20 animate-fade-in">
            {/* Header Area */}
            <div className="relative mb-12">
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-accent/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none -translate-y-1/2 animate-pulse-glow" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest text-accent mb-6 shadow-[0_0_15px_rgba(238,180,23,0.2)]">
                            <Sparkles size={12} className="animate-pulse" /> IA Marketing Hub
                        </div>
                        <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight mb-4">
                            <span className="bg-gradient-to-br from-white via-white to-slate-500 bg-clip-text text-transparent">Outils AI</span> <span className="text-accent relative inline-block">Stratégiques
                                <svg className="absolute -bottom-2 md:-bottom-4 left-0 w-full h-3 md:h-4 text-accent/40" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </span>
                        </h1>
                        <p className="text-slate-400 max-w-2xl text-base md:text-lg leading-relaxed font-medium mt-4">
                            Propulsez vos campagnes avec des copies publicitaires et des séquences d'emails haute-conversion, générées en quelques secondes par Gemini 2.0.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Selection Sidebar */}
                <div className="lg:col-span-4 space-y-4">
                    <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-3">
                        <Wand2 size={14} className="text-primary" /> CHOISIR UN OUTIL
                    </h3>
                    <div className="p-1 rounded-[1.5rem] bg-gradient-to-b from-white/5 to-transparent border border-white/5">
                        <ToolCard
                            title="Meta Ads Copywriter"
                            description="Génère des accroches percutantes pour Facebook & Instagram."
                            icon={Facebook}
                            active={activeTool === 'meta_ads'}
                            onClick={() => setActiveTool('meta_ads')}
                        />
                        <div className="h-2" />
                        <ToolCard
                            title="Google Ads Expert"
                            description="Titres et descriptions techniques optimisés pour le Search."
                            icon={Globe}
                            active={activeTool === 'google_ads'}
                            onClick={() => setActiveTool('google_ads')}
                        />
                        <div className="h-2" />
                        <ToolCard
                            title="Email Architect"
                            description="Séquences complètes de 3 emails (Brise-glace, Preuve, CTA)."
                            icon={Mail}
                            active={activeTool === 'email_sequence'}
                            onClick={() => setActiveTool('email_sequence')}
                        />
                    </div>
                </div>

                {/* Generator Form */}
                <div className="lg:col-span-8 bg-surface-dark/40 backdrop-blur-xl rounded-[2rem] border border-white/10 p-8 md:p-10 relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 mix-blend-screen pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2 mix-blend-screen pointer-events-none" />

                    <div className="relative space-y-8">
                        <div>
                            <label className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-3 ml-1">
                                <MessageSquare size={14} /> CONTEXTE DU PRODUIT / SERVICE
                            </label>
                            <textarea
                                value={context}
                                onChange={(e) => setContext(e.target.value)}
                                placeholder="Ex: Agence SEO pour plombiers à Paris. Offre promotionnelle : premier mois offert..."
                                className="w-full h-40 bg-black/40 text-white rounded-2xl p-6 border border-white/10 focus:border-accent/40 outline-none transition-all placeholder:text-slate-700 resize-none text-sm leading-relaxed"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-4 ml-1">
                                    <Sparkles size={14} className="inline mr-2 -mt-0.5" /> TON DE VOIX
                                </label>
                                <CustomSelect
                                    value={tone}
                                    onChange={setTone}
                                    options={[
                                        'Professionnel & Sérieux',
                                        'Créatif & Percutant',
                                        'Aggressif & Sales',
                                        'Humoristique & Léger'
                                    ].map(t => ({ value: t, label: t }))}
                                    className="!bg-black/40 text-white !border-white/10"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 mb-4 ml-1">
                                    <Target size={14} className="inline mr-2 -mt-0.5 text-accent" /> AUDIENCE CIBLE
                                </label>
                                <CustomSelect
                                    value={audience}
                                    onChange={setAudience}
                                    options={[
                                        'PME Françaises',
                                        'Décideurs B2B / High-Ticket',
                                        'Particuliers (B2C)',
                                        'Startups Tech'
                                    ].map(a => ({ value: a, label: a }))}
                                    className="!bg-black/40 text-white !border-white/10"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={generating || !context.trim()}
                            className="w-full py-5 bg-gradient-to-r from-accent to-yellow-500 hover:from-yellow-400 hover:to-yellow-300 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-bg-dark font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_30px_rgba(238,180,23,0.4)] hover:shadow-[0_0_40px_rgba(238,180,23,0.6)] flex items-center justify-center gap-3 active:scale-95 disabled:shadow-none relative overflow-hidden group"
                        >
                            {!generating && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />}
                            <span className="relative z-10 flex items-center gap-3">
                                {generating ? (
                                    <>
                                        <Loader className="animate-spin" size={20} />
                                        Génération en cours...
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        Générer le contenu IA
                                    </>
                                )}
                            </span>
                        </button>

                        {/* Result Display */}
                        {result && (
                            <div className="mt-10 animate-fade-in-up">
                                <ResultBlock
                                    title={activeTool.toUpperCase().replace('_', ' ')}
                                    content={result}
                                    onCopy={handleCopy}
                                    copied={copied}
                                />
                                <div className="mt-6 flex justify-center">
                                    <button
                                        onClick={handleGenerate}
                                        className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-accent flex items-center gap-2 transition-colors"
                                    >
                                        <RefreshCw size={12} className={generating ? 'animate-spin' : ''} />
                                        Régénérer une autre variante
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
