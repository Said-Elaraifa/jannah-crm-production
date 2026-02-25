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
        <div className="space-y-12 pb-20 animate-fade-in w-full overflow-hidden">
            {/* Header Area */}
            <div className="relative mb-12 z-10 w-full flex-shrink-0">
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-accent/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none -translate-y-1/2 animate-pulse-glow" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 w-full">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest text-accent mb-6 shadow-[0_0_15px_rgba(238,180,23,0.2)]">
                            <Sparkles size={12} className="animate-pulse" /> IA Marketing Hub
                        </div>
                        <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight mb-4 text-slate-900 dark:text-white">
                            Outils AI <span className="text-accent underline decoration-accent/30 underline-offset-8">Stratégiques</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-base md:text-lg leading-relaxed font-medium mt-4">
                            Propulsez vos campagnes avec des copies publicitaires et des séquences d'emails haute-conversion, générées en quelques secondes par Gemini 2.0 Flash.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
                {/* Selection Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-3 ml-2">
                        <Wand2 size={14} className="text-accent" /> CHOISIR UN OUTIL
                    </h3>
                    <div className="space-y-4">
                        <ToolCard
                            title="Meta Ads Copywriter"
                            description="Génère des accroches percutantes pour Facebook & Instagram."
                            icon={Facebook}
                            active={activeTool === 'meta_ads'}
                            onClick={() => setActiveTool('meta_ads')}
                        />
                        <ToolCard
                            title="Google Ads Expert"
                            description="Titres et descriptions techniques optimisés pour le Search."
                            icon={Globe}
                            active={activeTool === 'google_ads'}
                            onClick={() => setActiveTool('google_ads')}
                        />
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
                <div className="lg:col-span-8 bg-white dark:bg-surface-dark/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-200 dark:border-white/10 p-8 md:p-12 relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 mix-blend-screen pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2 mix-blend-screen pointer-events-none" />

                    <div className="relative space-y-10">
                        <div>
                            <label className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-3 ml-1">
                                <MessageSquare size={14} /> CONTEXTE DU PRODUIT / SERVICE
                            </label>
                            <textarea
                                value={context}
                                onChange={(e) => setContext(e.target.value)}
                                placeholder="Ex: Agence SEO pour plombiers à Paris. Offre promotionnelle : premier mois offert..."
                                className="w-full h-44 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white rounded-[1.5rem] p-6 border border-slate-200 dark:border-white/10 focus:border-accent/40 outline-none transition-all placeholder:text-slate-400 resize-none text-sm font-medium leading-relaxed shadow-inner"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4 ml-1">
                                    <Sparkles size={14} className="inline mr-2 -mt-0.5 text-accent" /> TON DE VOIX
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
                                    className="!bg-slate-50 dark:!bg-black/40 text-slate-900 dark:text-white !border-slate-200 dark:!border-white/10"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4 ml-1">
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
                                    className="!bg-slate-50 dark:!bg-black/40 text-slate-900 dark:text-white !border-slate-200 dark:!border-white/10"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={generating || !context.trim()}
                            className="w-full py-5.5 bg-gradient-to-r from-accent to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 disabled:from-slate-100 disabled:dark:from-slate-800 disabled:to-slate-100 disabled:dark:to-slate-800 disabled:text-slate-400 disabled:dark:text-slate-600 text-bg-dark font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-accent/20 hover:shadow-accent/30 flex items-center justify-center gap-3 active:scale-95 disabled:shadow-none relative overflow-hidden group"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                {generating ? (
                                    <>
                                        <Loader className="animate-spin" size={20} strokeWidth={3} />
                                        Génération en cours...
                                    </>
                                ) : (
                                    <>
                                        <Zap size={20} fill="currentColor" />
                                        Générer le contenu IA
                                    </>
                                )}
                            </span>
                        </button>

                        {/* Result Display */}
                        {result && (
                            <div className="mt-12 animate-fade-in-up">
                                <ResultBlock
                                    title={activeTool.toUpperCase().replace('_', ' ')}
                                    content={result}
                                    onCopy={handleCopy}
                                    copied={copied}
                                />
                                <div className="mt-8 flex justify-center">
                                    <button
                                        onClick={handleGenerate}
                                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-accent flex items-center gap-2 transition-colors group"
                                    >
                                        <RefreshCw size={14} className={`${generating ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
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
