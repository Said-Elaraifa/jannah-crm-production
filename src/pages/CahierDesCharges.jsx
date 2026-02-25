// src/pages/CahierDesCharges.jsx
// Public page - no login required, accessible via unique slug
import { useState, useRef, useEffect } from 'react';
import { CheckCircle, ChevronRight, ChevronLeft, SkipForward, Upload, Palette, Globe, Zap, Users, FileText, Check, Loader2, ExternalLink } from 'lucide-react';
import { saveCahier, uploadFile, getClientNameBySlug } from '../services/supabase';
import { JannahLogoIcon } from '../components/ui/JannahLogo';
import { CustomSelect } from '../components/ui/CustomSelect';

const STEPS = [
    { id: 1, title: "Votre Entreprise", icon: Users, description: "Parlez-nous de vous" },
    { id: 2, title: "Votre Projet", icon: Globe, description: "Quel site souhaitez-vous ?" },
    { id: 3, title: "Design & Style", icon: Palette, description: "Votre identité visuelle" },
    { id: 4, title: "Fonctionnalités", icon: Zap, description: "Ce dont vous avez besoin" },
    { id: 5, title: "Contenu & Fichiers", icon: FileText, description: "Vos ressources disponibles" },
];

const PROJECT_TYPES = ['Site Vitrine', 'E-commerce', 'Landing Page', 'Blog / Magazine', 'Portfolio', 'Application Web'];
const STYLE_OPTIONS = ['Moderne & Épuré', 'Luxe & Premium', 'Chaleureux & Convivial', 'Futuriste & Tech', 'Classique & Élégant', 'Coloré & Créatif'];
const FEATURE_OPTIONS = [
    'Formulaire de contact', 'Galerie photos/vidéos', 'Blog intégré', 'Réservation en ligne',
    'E-commerce / boutique', 'Chat en direct', 'Carte Google Maps', 'Témoignages clients',
    'FAQ interactive', 'Newsletter', 'Espace membres', 'Multi-langues',
];

function StepIndicator({ currentStep, totalSteps }) {
    return (
        <div className="flex items-center justify-center gap-0.5 md:gap-3 mb-1.5 md:mb-8">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map(step => (
                <div key={step} className="flex items-center">
                    <div className={`w-5 h-5 md:w-10 md:h-10 rounded md:rounded-2xl flex items-center justify-center text-[8px] md:text-sm font-black transition-all duration-500 border ${step < currentStep ? 'bg-primary border-primary text-white' :
                        step === currentStep ? 'bg-white dark:bg-white text-slate-900 border-accent ring-1 md:ring-4 ring-accent/20 shadow-sm shadow-accent/10' :
                            'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-white/5'
                        }`}>
                        {step < currentStep ? <Check size={8} strokeWidth={3} /> : step}
                    </div>
                    {step < totalSteps && (
                        <div className={`w-2 md:w-10 h-px md:h-1 mx-0.5 md:mx-1.5 rounded-full transition-all duration-500 ${step < currentStep ? 'bg-primary' : 'bg-slate-200 dark:bg-white/5'}`} />
                    )}
                </div>
            ))}
        </div>
    );
}

function SkipButton({ onSkip }) {
    return (
        <button onClick={onSkip} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 transition-colors">
            <SkipForward size={12} /> Passer cette étape
        </button>
    );
}

function FeatureCheckbox({ feature, checked, onChange }) {
    return (
        <label className={`flex items-center gap-2 p-2.5 md:p-4 rounded-lg md:rounded-xl border cursor-pointer transition-all ${checked
            ? 'bg-primary/10 border-primary/30 text-slate-900 dark:text-white shadow-sm'
            : 'bg-white dark:bg-white/2 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/10'
            }`}>
            <div className={`w-4 h-4 md:w-5 md:h-5 rounded flex items-center justify-center flex-shrink-0 transition-all border ${checked
                ? 'bg-primary border-primary shadow-sm shadow-primary/20'
                : 'bg-slate-50 dark:bg-white/5 border-slate-300 dark:border-white/10'
                }`}>
                {checked && <Check size={10} strokeWidth={4} className="text-white" />}
            </div>
            <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
            <span className="text-[9px] md:text-[10px] sm:text-xs font-bold uppercase tracking-widest">{feature}</span>
        </label>
    );
}

function FileUploadZone({ label, accept, onFile, file, uploading }) {
    const inputRef = useRef();
    const [dragOver, setDragOver] = useState(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) onFile(f);
    };

    return (
        <div>
            <label className="block text-[8px] md:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 md:mb-3 ml-1">{label}</label>
            <div
                onClick={() => !uploading && inputRef.current.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center gap-1 p-2 md:p-6 rounded-lg md:rounded-2xl border border-dashed transition-all duration-300 ${uploading ? 'border-primary/20 bg-primary/5 cursor-wait' :
                    file ? 'border-primary/30 bg-primary/5 cursor-pointer' :
                        dragOver ? 'border-accent/40 bg-accent/5 cursor-copy scale-[1.02] shadow-xl shadow-accent/5' :
                            'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-white/2 cursor-pointer'
                    }`}
            >
                <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={e => e.target.files[0] && onFile(e.target.files[0])} />
                {uploading ? (
                    <>
                        <Loader2 size={14} strokeWidth={3} className="text-primary animate-spin" />
                        <p className="text-[8px] text-primary font-black uppercase tracking-widest mt-1">Upload...</p>
                    </>
                ) : file ? (
                    <div className="flex flex-col items-center gap-1">
                        <div className="w-5 h-5 bg-primary/20 rounded flex items-center justify-center">
                            <Check size={12} className="text-primary" strokeWidth={3} />
                        </div>
                        <p className="text-[8px] md:text-[10px] text-slate-900 dark:text-white font-black uppercase tracking-widest truncate max-w-full px-1">{file.name}</p>
                        <p className="text-[7px] md:text-[9px] text-slate-500 font-bold max-w-[80px] text-center leading-tight">{(file.size / 1024).toFixed(0)} KB · Changer</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-0.5">
                        <Upload size={14} className="text-slate-400 dark:text-slate-500 mb-0.5" />
                        <p className="text-[7px] md:text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest text-center leading-tight">Glisser ou <span className="text-accent underline underline-offset-2">parcourir</span></p>
                        <p className="text-[7px] md:text-[9px] text-slate-400 dark:text-slate-500 font-black tracking-widest text-center">{accept.split(',').join(', ')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CahierDesCharges({ clientSlug, clientName, onComplete }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // File state
    const [logoFile, setLogoFile] = useState(null);
    const [charteFile, setCharteFile] = useState(null);
    const [contentFile, setContentFile] = useState(null);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingCharte, setUploadingCharte] = useState(false);
    const [uploadingContent, setUploadingContent] = useState(false);

    // Uploaded URLs
    const [logoUrl, setLogoUrl] = useState(null);
    const [charteUrl, setCharteUrl] = useState(null);
    const [contentUrl, setContentUrl] = useState(null);
    const [displayName, setDisplayName] = useState(clientName || clientSlug);

    const [formData, setFormData] = useState({
        companyName: clientName || '',
        activity: '',
        targetAudience: '',
        competitors: '',
        projectType: '',
        projectGoal: '',
        budget: '',
        deadline: '',
        style: '',
        colors: '',
        hasLogo: false,
        hasCharte: false,
        inspirationUrls: '',
        features: [],
        additionalFeatures: '',
        hasContent: false,
        hasImages: false,
        additionalInfo: '',
    });

    const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    // Fetch real client name from DB if not available (e.g. public user visiting the link)
    useEffect(() => {
        const syncName = async () => {
            console.log('[Cahier] Syncing name for:', clientSlug, 'Initial name:', clientName);
            let nameToUse = clientName;

            // If the name is missing or is just the slug, fetch the real name from DB
            if (!nameToUse || nameToUse === clientSlug || nameToUse.toLowerCase() === clientSlug.toLowerCase()) {
                try {
                    const dbName = await getClientNameBySlug(clientSlug);
                    console.log('[Cahier] DB Name fetched:', dbName);
                    if (dbName) nameToUse = dbName;
                } catch (err) {
                    console.error('[Cahier] Failed to fetch client name:', err);
                }
            }

            if (nameToUse) {
                setDisplayName(nameToUse);
                setFormData(prev => {
                    // Update only if companyName is still the slug or empty
                    if (!prev.companyName || prev.companyName === clientSlug || prev.companyName === clientName || prev.companyName === '') {
                        return { ...prev, companyName: nameToUse };
                    }
                    return prev;
                });
            }
        };

        syncName();
    }, [clientName, clientSlug]);
    const toggleFeature = (feature) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.includes(feature)
                ? prev.features.filter(f => f !== feature)
                : [...prev.features, feature],
        }));
    };

    const handleFileUpload = async (file, type) => {
        const setUploading = { logo: setUploadingLogo, charte: setUploadingCharte, content: setUploadingContent }[type];
        const setFile = { logo: setLogoFile, charte: setCharteFile, content: setContentFile }[type];
        const setUrl = { logo: setLogoUrl, charte: setCharteUrl, content: setContentUrl }[type];
        const updateKey = { logo: 'hasLogo', charte: 'hasCharte', content: 'hasContent' }[type];

        setFile(file);
        setUploading(true);
        try {
            const url = await uploadFile(clientSlug, type, file);
            setUrl(url);
            update(updateKey, true);
        } catch (e) {
            console.error(`Upload ${type} failed:`, e);
        } finally {
            setUploading(false);
        }
    };

    const nextStep = () => {
        if (currentStep < STEPS.length) setCurrentStep(s => s + 1);
        else handleComplete();
    };

    const prevStep = () => { if (currentStep > 1) setCurrentStep(s => s - 1); };

    const handleComplete = async () => {
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            await saveCahier(clientSlug, {
                ...formData,
                logoUrl,
                charteUrl,
                contentUrl,
            });
            if (onComplete) await onComplete(formData);
            setIsCompleted(true);
        } catch (e) {
            console.error('Submit error:', e);
            setSubmitError('Erreur lors de l\'envoi. Veuillez réessayer.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isCompleted) {
        return (
            <div className="min-h-screen bg-white dark:bg-bg-dark flex items-center justify-center p-6 transition-colors duration-500 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-accent/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none -translate-y-1/2 animate-pulse-glow" />

                <div className="max-w-md w-full text-center animate-fade-in relative z-10">
                    <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary/10 border border-primary/20">
                        <CheckCircle size={48} className="text-primary animate-bounce-slow" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-4xl font-display font-black text-slate-900 dark:text-white mb-4 tracking-tight">Merci !</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium leading-relaxed">
                        Votre cahier des charges a bien été reçu. L'équipe <span className="text-accent font-black">Jannah Agency</span> va l'analyser et vous contacter sous 24h.
                    </p>

                    <div className="bg-white dark:bg-surface-dark/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/10 text-left shadow-2xl scale-105">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] mb-6">Récapitulatif de soumission</p>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between items-center"><span className="text-slate-400 font-medium tracking-tight">Entreprise</span><span className="text-slate-900 dark:text-white font-black uppercase text-xs">{formData.companyName}</span></div>
                            <div className="flex justify-between items-center"><span className="text-slate-400 font-medium tracking-tight">Projet</span><span className="text-slate-900 dark:text-white font-black uppercase text-xs">{formData.projectType || '—'}</span></div>
                            <div className="flex justify-between items-center"><span className="text-slate-400 font-medium tracking-tight">Style</span><span className="text-slate-900 dark:text-white font-black uppercase text-xs">{formData.style || '—'}</span></div>
                            <div className="flex justify-between items-center"><span className="text-slate-400 font-medium tracking-tight">Fonctionnalités</span><span className="text-slate-900 dark:text-white font-black uppercase text-xs">{formData.features.length} MODULES</span></div>
                            <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-3">
                                {logoUrl && <div className="flex justify-between items-center"><span className="text-slate-400 font-medium tracking-tight">Logo</span><a href={logoUrl} target="_blank" rel="noreferrer" className="text-accent text-[10px] flex items-center gap-1.5 hover:underline font-black uppercase tracking-widest"><ExternalLink size={12} strokeWidth={3} /> VÉRIFIER</a></div>}
                                {charteUrl && <div className="flex justify-between items-center"><span className="text-slate-400 font-medium tracking-tight">Charte</span><a href={charteUrl} target="_blank" rel="noreferrer" className="text-accent text-[10px] flex items-center gap-1.5 hover:underline font-black uppercase tracking-widest"><ExternalLink size={12} strokeWidth={3} /> VÉRIFIER</a></div>}
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        );
    }

    const currentStepData = STEPS[currentStep - 1];
    const StepIcon = currentStepData.icon;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-bg-dark flex flex-col transition-colors duration-500 font-sans">
            {/* Header — Ultra-slim premium bar */}
            <div className="bg-gradient-to-r from-[#0a1628] via-[#0f1d32] to-[#0a1628] backdrop-blur-xl border-b border-white/10 px-3 md:px-8 py-1.5 md:py-4 flex items-center justify-between relative z-50 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
                <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-primary/5 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
                <div className="flex items-center gap-1.5 md:gap-4 relative z-10">
                    <JannahLogoIcon size={22} className="text-white md:hidden" />
                    <JannahLogoIcon size={32} className="text-white hidden md:block" />
                    <div className="flex flex-col">
                        <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: '13px', color: 'white', letterSpacing: '-0.5px', lineHeight: 1 }} className="md:text-lg">Jannah</span>
                        <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '6px', color: '#c3dc7f', letterSpacing: '0.15em', textTransform: 'uppercase', lineHeight: 1 }} className="md:text-[9px]">Cahier des Charges</span>
                    </div>
                </div>
                {displayName && (
                    <div className="flex items-center gap-1 md:gap-3 px-2 md:px-4 py-0.5 md:py-2 bg-white/5 rounded md:rounded-xl border border-accent/20 relative z-10">
                        <span className="text-[6px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">Client</span>
                        <span className="text-[8px] md:text-xs font-black text-accent uppercase tracking-wider truncate max-w-[70px] md:max-w-none">{displayName}</span>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-start justify-center px-2 md:p-6 pt-1.5 md:pt-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-accent/5 blur-[80px] md:blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/5 blur-[80px] md:blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <div className="w-full max-w-2xl relative z-10">
                    <StepIndicator currentStep={currentStep} totalSteps={STEPS.length} />

                    {/* Step Content Card */}
                    <div className="bg-white dark:bg-black/40 backdrop-blur-2xl rounded-xl md:rounded-[2.5rem] border border-slate-200 dark:border-white/10 p-2.5 md:p-10 mb-1.5 md:mb-8 space-y-2 md:space-y-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-accent/5 blur-[80px] md:blur-[100px] pointer-events-none rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-primary/5 blur-2xl md:blur-3xl pointer-events-none rounded-full" />

                        {/* Step Header — minimal on mobile */}
                        <div className="flex flex-row items-center gap-1.5 md:gap-6 pb-1.5 md:pb-8 border-b border-slate-100 dark:border-white/5">
                            <div className="w-6 h-6 md:w-16 md:h-16 bg-accent/10 dark:bg-white/5 rounded-md md:rounded-[1.5rem] flex items-center justify-center flex-shrink-0">
                                <StepIcon size={14} className="text-accent" strokeWidth={2.5} />
                            </div>
                            <div className="text-left">
                                <h2 className="text-[11px] md:text-4xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none md:leading-normal">{currentStepData.title}</h2>
                                <p className="hidden md:block text-slate-400 dark:text-slate-500 text-sm font-black uppercase tracking-widest leading-relaxed mt-2">{currentStepData.description}</p>
                            </div>
                        </div>

                        {/* Step 1: Company */}
                        {currentStep === 1 && (
                            <div className="space-y-1.5 md:space-y-4 animate-fade-in">
                                <div>
                                    <label className="block text-[8px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5 md:mb-3 ml-1">Nom de votre entreprise</label>
                                    <input value={formData.companyName} onChange={e => update('companyName', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-xs md:text-sm font-bold rounded-lg md:rounded-2xl px-3 md:px-5 py-2 md:py-5 border border-slate-200 dark:border-white/10 focus:border-accent ring-accent/20 focus:ring-2 md:focus:ring-4 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                        placeholder="Ex: Boulangerie Martin" />
                                </div>
                                <div>
                                    <label className="block text-[8px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5 md:mb-3 ml-1">Secteur d'activité</label>
                                    <input value={formData.activity} onChange={e => update('activity', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-xs md:text-sm font-bold rounded-lg md:rounded-2xl px-3 md:px-5 py-2 md:py-5 border border-slate-200 dark:border-white/10 focus:border-accent ring-accent/20 focus:ring-2 md:focus:ring-4 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                        placeholder="Ex: Restauration, Santé, Commerce..." />
                                </div>
                                <div>
                                    <label className="block text-[8px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5 md:mb-3 ml-1">Votre clientèle cible</label>
                                    <input value={formData.targetAudience} onChange={e => update('targetAudience', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-xs md:text-sm font-bold rounded-lg md:rounded-2xl px-3 md:px-5 py-2 md:py-5 border border-slate-200 dark:border-white/10 focus:border-accent ring-accent/20 focus:ring-2 md:focus:ring-4 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                        placeholder="Ex: Familles locales, Professionnels 30-50 ans..." />
                                </div>
                                <div>
                                    <label className="block text-[8px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5 md:mb-3 ml-1">Sites concurrents (optionnel)</label>
                                    <input value={formData.competitors} onChange={e => update('competitors', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-xs md:text-sm font-bold rounded-lg md:rounded-2xl px-3 md:px-5 py-2 md:py-5 border border-slate-200 dark:border-white/10 focus:border-accent ring-accent/20 focus:ring-2 md:focus:ring-4 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                        placeholder="Ex: concurrent1.fr, concurrent2.com" />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Project */}
                        {currentStep === 2 && (
                            <div className="space-y-2 md:space-y-8 animate-fade-in text-[10px]">
                                <div>
                                    <label className="block font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 md:mb-4 ml-1 text-[8px] md:text-[10px]">Type de projet</label>
                                    <div className="grid grid-cols-2 gap-1.5 md:gap-3">
                                        {PROJECT_TYPES.map(type => (
                                            <button key={type} onClick={() => update('projectType', type)}
                                                className={`py-1.5 px-1 md:p-4 rounded-md md:rounded-xl border text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all text-center leading-tight ${formData.projectType === type
                                                    ? 'bg-primary border-primary text-white shadow-sm shadow-primary/20'
                                                    : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
                                                    }`}>
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5 md:mb-3 ml-1 text-[8px] md:text-[10px]">Objectif principal du site</label>
                                    <input value={formData.projectGoal} onChange={e => update('projectGoal', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-[10px] md:text-sm font-bold rounded-lg md:rounded-2xl px-2.5 md:px-5 py-1.5 md:py-5 border border-slate-200 dark:border-white/10 focus:border-accent ring-accent/20 focus:ring-2 outline-none transition-all placeholder:text-slate-400"
                                        placeholder="Ex: Attirer de nouveaux clients..." />
                                </div>
                                <div className="grid grid-cols-2 gap-2 md:gap-6">
                                    <div>
                                        <label className="block font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5 md:mb-3 ml-1 text-[8px] md:text-[10px]">Budget mensuel</label>
                                        <CustomSelect
                                            value={formData.budget}
                                            onChange={val => update('budget', val)}
                                            options={[
                                                { value: '', label: 'Sélectionner...' },
                                                { value: 'Mini (79€/mo)', label: 'Mini (79€/mo)' },
                                                { value: 'Standard (149€/mo)', label: 'Standard (149€/mo)' },
                                                { value: 'Pro (299€/mo)', label: 'Pro (299€/mo)' },
                                                { value: 'Sur mesure', label: 'Sur mesure' }
                                            ]}
                                            className="w-full !bg-slate-50 dark:!bg-white/5 !text-slate-900 dark:!text-white !text-[8px] md:!text-xs !font-black !uppercase !tracking-widest !border-slate-200 dark:!border-white/10 !rounded-lg md:!rounded-2xl !py-1.5 md:!py-4"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5 md:mb-3 ml-1 text-[8px] md:text-[10px]">Délai souhaité</label>
                                        <CustomSelect
                                            value={formData.deadline}
                                            onChange={val => update('deadline', val)}
                                            options={[
                                                { value: '', label: 'Sélectionner...' },
                                                { value: '1 semaine', label: '1 semaine' },
                                                { value: '2 semaines', label: '2 semaines' },
                                                { value: '1 mois', label: '1 mois' },
                                                { value: '2-3 mois', label: '2-3 mois' },
                                                { value: 'Pas de contrainte', label: 'Pas de contrainte' }
                                            ]}
                                            className="w-full !bg-slate-50 dark:!bg-white/5 !text-slate-900 dark:!text-white !text-[8px] md:!text-xs !font-black !uppercase !tracking-widest !border-slate-200 dark:!border-white/10 !rounded-lg md:!rounded-2xl !py-1.5 md:!py-4"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Design */}
                        {currentStep === 3 && (
                            <div className="space-y-2 md:space-y-8 animate-fade-in text-[10px]">
                                <div>
                                    <label className="block font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 md:mb-4 ml-1 text-[8px] md:text-[10px]">Style visuel souhaité</label>
                                    <div className="grid grid-cols-2 gap-1.5 md:gap-3">
                                        {STYLE_OPTIONS.map(style => (
                                            <button key={style} onClick={() => update('style', style)}
                                                className={`py-1.5 px-1 md:p-4 rounded-md md:rounded-xl border text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all text-center leading-tight ${formData.style === style
                                                    ? 'bg-accent border-accent text-primary shadow-sm shadow-accent/20'
                                                    : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
                                                    }`}>
                                                {style}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 md:gap-6">
                                    <FileUploadZone
                                        label="Logo"
                                        accept=".png,.jpg,.jpeg,.svg,.webp"
                                        file={logoFile}
                                        uploading={uploadingLogo}
                                        onFile={(f) => handleFileUpload(f, 'logo')}
                                    />
                                    <FileUploadZone
                                        label="Charte graphique"
                                        accept=".pdf,.png,.jpg,.jpeg,.ai,.psd"
                                        file={charteFile}
                                        uploading={uploadingCharte}
                                        onFile={(f) => handleFileUpload(f, 'charte')}
                                    />
                                </div>
                                <div>
                                    <label className="block font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5 md:mb-3 ml-1 text-[8px] md:text-[10px]">Sites qui vous inspirent</label>
                                    <input value={formData.inspirationUrls} onChange={e => update('inspirationUrls', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-[10px] md:text-sm font-bold rounded-lg md:rounded-2xl px-2.5 md:px-5 py-1.5 md:py-5 border border-slate-200 dark:border-white/10 focus:border-accent ring-accent/20 focus:ring-2 outline-none transition-all placeholder:text-slate-400"
                                        placeholder="Ex: apple.com, airbnb.com..." />
                                </div>
                            </div>
                        )}

                        {/* Step 4: Features */}
                        {currentStep === 4 && (
                            <div className="space-y-2 md:space-y-8 animate-fade-in text-[10px]">
                                <div>
                                    <label className="block font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 md:mb-6 ml-1 text-center text-[8px] md:text-[10px]">Modules indispensables</label>
                                    <div className="grid grid-cols-2 gap-1.5 md:gap-4">
                                        {FEATURE_OPTIONS.map(feature => (
                                            <FeatureCheckbox
                                                key={feature}
                                                feature={feature}
                                                checked={formData.features.includes(feature)}
                                                onChange={() => toggleFeature(feature)}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5 md:mb-3 ml-1 text-[8px] md:text-[10px]">Autres besoins</label>
                                    <input value={formData.additionalFeatures} onChange={e => update('additionalFeatures', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-[10px] md:text-sm font-bold rounded-lg md:rounded-2xl px-2.5 md:px-5 py-1.5 md:py-5 border border-slate-200 dark:border-white/10 focus:border-accent ring-accent/20 focus:ring-2 outline-none transition-all placeholder:text-slate-400"
                                        placeholder="Précisez ici..." />
                                </div>
                            </div>
                        )}

                        {/* Step 5: Content & Files */}
                        {currentStep === 5 && (
                            <div className="space-y-2 md:space-y-8 animate-fade-in text-[10px]">
                                <div className="grid grid-cols-2 gap-1.5 md:gap-4">
                                    {[
                                        { key: 'hasContent', label: 'Textes prêts' },
                                        { key: 'hasImages', label: 'Photos / Images' },
                                    ].map(item => (
                                        <label key={item.key} className={`flex items-center gap-2 md:gap-4 p-2.5 md:p-5 rounded-lg md:rounded-2xl border cursor-pointer transition-all ${formData[item.key]
                                            ? 'bg-primary/10 border-primary/30 text-primary shadow-sm'
                                            : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
                                            }`}>
                                            <div className={`w-4 h-4 md:w-6 md:h-6 rounded flex items-center justify-center flex-shrink-0 transition-all border ${formData[item.key]
                                                ? 'bg-primary border-primary shadow-sm shadow-primary/20'
                                                : 'bg-white dark:bg-white/5 border-slate-300 dark:border-white/10'
                                                }`}>
                                                {formData[item.key] && <Check size={10} strokeWidth={4} className="text-white" />}
                                            </div>
                                            <input type="checkbox" className="hidden" checked={formData[item.key]} onChange={e => update(item.key, e.target.checked)} />
                                            <span className="text-[9px] md:text-xs font-black uppercase tracking-widest">{item.label}</span>
                                        </label>
                                    ))}
                                </div>

                                <FileUploadZone
                                    label="Dossier de contenu"
                                    accept=".pdf,.doc,.docx,.zip,.jpg,.png,.txt"
                                    file={contentFile}
                                    uploading={uploadingContent}
                                    onFile={(f) => handleFileUpload(f, 'content')}
                                />

                                <div>
                                    <label className="block font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5 md:mb-3 ml-1 text-[8px] md:text-[10px]">Note pour l'agence</label>
                                    <input value={formData.additionalInfo} onChange={e => update('additionalInfo', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-[10px] md:text-sm font-bold rounded-lg md:rounded-2xl px-2.5 md:px-5 py-1.5 md:py-5 border border-slate-200 dark:border-white/10 focus:border-accent ring-accent/20 focus:ring-2 md:focus:ring-4 outline-none transition-all placeholder:text-slate-400"
                                        placeholder="Commentaires..." />
                                </div>

                                {submitError && (
                                    <div className="p-2 md:p-5 bg-red-500/10 border border-red-500/20 rounded-lg md:rounded-2xl animate-shake">
                                        <p className="text-[8px] md:text-[10px] text-red-500 font-black uppercase tracking-widest text-center">{submitError}</p>
                                    </div>
                                )}

                                <div className="bg-accent/5 border border-accent/20 rounded-lg md:rounded-[1.5rem] p-2 md:p-6 text-center">
                                    <p className="text-[8px] md:text-[10px] text-slate-600 dark:text-slate-400 font-black uppercase tracking-[0.1em] md:tracking-[0.15em] leading-relaxed">
                                        Cliquez sur <strong className="text-accent underline underline-offset-4 tracking-[0.15em]">"Soumettre"</strong>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation — zero-waste on mobile */}
                    <div className="flex flex-row items-center justify-between mt-1 md:mt-4 gap-2 md:gap-3">
                        <div className="flex-1 sm:flex-none">
                            {currentStep > 1 && (
                                <button onClick={prevStep} className="w-full sm:w-auto group flex items-center justify-center gap-1 px-3 md:px-8 py-1.5 md:py-4 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-md md:rounded-2xl transition-all active:scale-95 border border-slate-200 dark:border-white/10">
                                    <ChevronLeft size={10} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" /> <span className="hidden xs:inline">Retour</span>
                                </button>
                            )}
                        </div>
                        <div className="flex-[2] sm:flex-none flex items-center gap-2 md:gap-6 justify-end">
                            {currentStep < STEPS.length && <div className="hidden xs:block"><SkipButton onSkip={nextStep} /></div>}
                            <button
                                onClick={nextStep}
                                disabled={isSubmitting || uploadingLogo || uploadingCharte || uploadingContent}
                                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 md:px-10 py-2 md:py-5 disabled:opacity-60 disabled:cursor-wait text-white text-[8px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] rounded-md md:rounded-2xl transition-all active:scale-95 shadow-xl ${currentStep === STEPS.length
                                    ? 'bg-gradient-to-r from-accent to-yellow-500 shadow-accent/20 hover:shadow-accent/30 text-primary'
                                    : 'bg-slate-900 dark:bg-white text-white dark:text-bg-dark hover:scale-105 shadow-black/10 dark:shadow-white/10'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <><Loader2 size={12} strokeWidth={3} className="animate-spin" /> ...</>
                                ) : (
                                    <>
                                        <span className="truncate">{currentStep === STEPS.length ? 'Soumettre' : 'Suivant'}</span>
                                        {currentStep < STEPS.length && <ChevronRight size={12} strokeWidth={3} />}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
