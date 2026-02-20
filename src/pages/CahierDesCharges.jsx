// src/pages/CahierDesCharges.jsx
// Public page - no login required, accessible via unique slug
import { useState, useRef } from 'react';
import { CheckCircle, ChevronRight, ChevronLeft, SkipForward, Upload, Palette, Globe, Zap, Users, FileText, Check, Loader2, ExternalLink } from 'lucide-react';
import { saveCahier, uploadFile } from '../services/supabase';
import { JannahLogoWithBadge } from '../components/ui/JannahLogo';

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
        <div className="flex items-center justify-center gap-2 mb-8">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map(step => (
                <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${step < currentStep ? 'bg-secondary text-primary' :
                        step === currentStep ? 'bg-primary text-white ring-4 ring-primary/20' :
                            'bg-white/5 text-slate-500'
                        }`}>
                        {step < currentStep ? <Check size={14} /> : step}
                    </div>
                    {step < totalSteps && (
                        <div className={`w-8 h-0.5 mx-1 transition-all duration-300 ${step < currentStep ? 'bg-secondary' : 'bg-white/10'}`} />
                    )}
                </div>
            ))}
        </div>
    );
}

function SkipButton({ onSkip }) {
    return (
        <button onClick={onSkip} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors">
            <SkipForward size={12} /> Passer cette étape
        </button>
    );
}

function FeatureCheckbox({ feature, checked, onChange }) {
    return (
        <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${checked ? 'bg-primary/10 border-primary/40 text-white' : 'bg-white/3 border-white/5 text-slate-400 hover:border-white/20'
            }`}>
            <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all ${checked ? 'bg-primary' : 'bg-white/5 border border-white/10'
                }`}>
                {checked && <Check size={10} className="text-white" />}
            </div>
            <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
            <span className="text-sm">{feature}</span>
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
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{label}</label>
            <div
                onClick={() => !uploading && inputRef.current.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed transition-all ${uploading ? 'border-primary/30 bg-primary/5 cursor-wait' :
                    file ? 'border-primary/50 bg-primary/5 cursor-pointer' :
                        dragOver ? 'border-secondary/50 bg-secondary/5 cursor-copy' :
                            'border-white/10 hover:border-white/20 bg-white/2 cursor-pointer'
                    }`}
            >
                <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={e => e.target.files[0] && onFile(e.target.files[0])} />
                {uploading ? (
                    <>
                        <Loader2 size={20} className="text-primary animate-spin" />
                        <p className="text-xs text-primary font-semibold">Upload en cours...</p>
                    </>
                ) : file ? (
                    <>
                        <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                            <Check size={16} className="text-secondary" />
                        </div>
                        <p className="text-xs text-secondary font-semibold truncate max-w-full px-2">{file.name}</p>
                        <p className="text-[10px] text-slate-500">{(file.size / 1024).toFixed(0)} KB · Cliquer pour changer</p>
                    </>
                ) : (
                    <>
                        <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                            <Upload size={16} className="text-slate-400" />
                        </div>
                        <p className="text-xs text-slate-400">Glisser-déposer ou <span className="text-secondary">parcourir</span></p>
                        <p className="text-[10px] text-slate-600">{accept.replace(/\./g, '').toUpperCase().replace(/,/g, ', ')}</p>
                    </>
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
            <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center animate-fade-in-up">
                    <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} className="text-secondary" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-white mb-3">Merci !</h2>
                    <p className="text-slate-400 mb-6">
                        Votre cahier des charges a bien été reçu. L'équipe Jannah Agency va l'analyser et vous contacter très prochainement.
                    </p>
                    <div className="bg-surface-dark rounded-2xl p-5 border border-white/5 text-left">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Récapitulatif</p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-slate-500">Entreprise</span><span className="text-white font-semibold">{formData.companyName}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Projet</span><span className="text-white font-semibold">{formData.projectType || '—'}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Style</span><span className="text-white font-semibold">{formData.style || '—'}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Fonctionnalités</span><span className="text-white font-semibold">{formData.features.length} sélectionnées</span></div>
                            {logoUrl && <div className="flex justify-between items-center"><span className="text-slate-500">Logo</span><a href={logoUrl} target="_blank" rel="noreferrer" className="text-secondary text-xs flex items-center gap-1 hover:underline">Voir <ExternalLink size={10} /></a></div>}
                            {charteUrl && <div className="flex justify-between items-center"><span className="text-slate-500">Charte</span><a href={charteUrl} target="_blank" rel="noreferrer" className="text-secondary text-xs flex items-center gap-1 hover:underline">Voir <ExternalLink size={10} /></a></div>}
                        </div>
                    </div>
                    <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-xl">
                        <p className="text-xs text-secondary font-semibold">📧 Nous vous contacterons sous 24-48h</p>
                    </div>
                </div>
            </div>
        );
    }

    const currentStepData = STEPS[currentStep - 1];
    const StepIcon = currentStepData.icon;

    return (
        <div className="min-h-screen bg-bg-dark flex flex-col">
            {/* Header */}
            <div className="bg-[#152636] border-b border-white/5 px-6 py-4 flex items-center justify-between">
                <JannahLogoWithBadge height={30} badge="Cahier des Charges" />
                {clientName && (
                    <div className="text-xs text-slate-500">
                        Pour : <span className="text-white font-semibold">{clientName}</span>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-start justify-center p-6 pt-10">
                <div className="w-full max-w-xl">
                    <StepIndicator currentStep={currentStep} totalSteps={STEPS.length} />

                    {/* Step Header */}
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <StepIcon size={22} className="text-secondary" />
                        </div>
                        <h2 className="text-xl font-display font-bold text-white">{currentStepData.title}</h2>
                        <p className="text-slate-400 text-sm mt-1">{currentStepData.description}</p>
                    </div>

                    {/* Step Content */}
                    <div className="bg-surface-dark rounded-2xl border border-white/5 p-6 mb-6 space-y-5">

                        {/* Step 1: Company */}
                        {currentStep === 1 && (
                            <>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Nom de votre entreprise</label>
                                    <input value={formData.companyName} onChange={e => update('companyName', e.target.value)}
                                        className="w-full bg-bg-dark text-white text-sm rounded-xl px-4 py-3 border border-white/5 focus:border-primary outline-none transition-all placeholder-slate-600"
                                        placeholder="Ex: Boulangerie Martin" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Secteur d'activité</label>
                                    <input value={formData.activity} onChange={e => update('activity', e.target.value)}
                                        className="w-full bg-bg-dark text-white text-sm rounded-xl px-4 py-3 border border-white/5 focus:border-primary outline-none transition-all placeholder-slate-600"
                                        placeholder="Ex: Restauration, Santé, Commerce..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Votre clientèle cible</label>
                                    <textarea value={formData.targetAudience} onChange={e => update('targetAudience', e.target.value)} rows={2}
                                        className="w-full bg-bg-dark text-white text-sm rounded-xl px-4 py-3 border border-white/5 focus:border-primary outline-none transition-all resize-none placeholder-slate-600"
                                        placeholder="Ex: Familles locales, Professionnels 30-50 ans..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sites concurrents (optionnel)</label>
                                    <input value={formData.competitors} onChange={e => update('competitors', e.target.value)}
                                        className="w-full bg-bg-dark text-white text-sm rounded-xl px-4 py-3 border border-white/5 focus:border-primary outline-none transition-all placeholder-slate-600"
                                        placeholder="Ex: concurrent1.fr, concurrent2.com" />
                                </div>
                            </>
                        )}

                        {/* Step 2: Project */}
                        {currentStep === 2 && (
                            <>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Type de projet</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {PROJECT_TYPES.map(type => (
                                            <button key={type} onClick={() => update('projectType', type)}
                                                className={`p-3 rounded-xl border text-sm font-medium transition-all text-left ${formData.projectType === type ? 'bg-primary/10 border-primary/40 text-white' : 'bg-white/3 border-white/5 text-slate-400 hover:border-white/20'
                                                    }`}>
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Objectif principal du site</label>
                                    <textarea value={formData.projectGoal} onChange={e => update('projectGoal', e.target.value)} rows={3}
                                        className="w-full bg-bg-dark text-white text-sm rounded-xl px-4 py-3 border border-white/5 focus:border-primary outline-none transition-all resize-none placeholder-slate-600"
                                        placeholder="Ex: Attirer de nouveaux clients, vendre mes produits en ligne..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Budget mensuel</label>
                                        <select value={formData.budget} onChange={e => update('budget', e.target.value)}
                                            className="w-full bg-bg-dark text-white text-sm rounded-xl px-4 py-3 border border-white/5 focus:border-primary outline-none cursor-pointer">
                                            <option value="">Sélectionner...</option>
                                            <option>Mini (79€/mo)</option>
                                            <option>Standard (149€/mo)</option>
                                            <option>Pro (299€/mo)</option>
                                            <option>Sur mesure</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Délai souhaité</label>
                                        <select value={formData.deadline} onChange={e => update('deadline', e.target.value)}
                                            className="w-full bg-bg-dark text-white text-sm rounded-xl px-4 py-3 border border-white/5 focus:border-primary outline-none cursor-pointer">
                                            <option value="">Sélectionner...</option>
                                            <option>1 semaine</option>
                                            <option>2 semaines</option>
                                            <option>1 mois</option>
                                            <option>2-3 mois</option>
                                            <option>Pas de contrainte</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Step 3: Design */}
                        {currentStep === 3 && (
                            <>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Style visuel souhaité</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {STYLE_OPTIONS.map(style => (
                                            <button key={style} onClick={() => update('style', style)}
                                                className={`p-3 rounded-xl border text-sm font-medium transition-all text-left ${formData.style === style ? 'bg-primary/10 border-primary/40 text-white' : 'bg-white/3 border-white/5 text-slate-400 hover:border-white/20'
                                                    }`}>
                                                {style}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Couleurs de votre marque (optionnel)</label>
                                    <input value={formData.colors} onChange={e => update('colors', e.target.value)}
                                        className="w-full bg-bg-dark text-white text-sm rounded-xl px-4 py-3 border border-white/5 focus:border-primary outline-none transition-all placeholder-slate-600"
                                        placeholder="Ex: Bleu marine, Or, Blanc - ou codes hex: #1a2b3c" />
                                </div>
                                <div className="space-y-3">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ressources visuelles</p>
                                    <FileUploadZone
                                        label="Logo (PNG, JPG, SVG, WebP)"
                                        accept=".png,.jpg,.jpeg,.svg,.webp"
                                        file={logoFile}
                                        uploading={uploadingLogo}
                                        onFile={(f) => handleFileUpload(f, 'logo')}
                                    />
                                    <FileUploadZone
                                        label="Charte graphique (PDF, PNG, JPG)"
                                        accept=".pdf,.png,.jpg,.jpeg,.ai,.psd"
                                        file={charteFile}
                                        uploading={uploadingCharte}
                                        onFile={(f) => handleFileUpload(f, 'charte')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sites qui vous inspirent (optionnel)</label>
                                    <textarea value={formData.inspirationUrls} onChange={e => update('inspirationUrls', e.target.value)} rows={2}
                                        className="w-full bg-bg-dark text-white text-sm rounded-xl px-4 py-3 border border-white/5 focus:border-primary outline-none transition-all resize-none placeholder-slate-600"
                                        placeholder="Ex: apple.com, airbnb.com..." />
                                </div>
                            </>
                        )}

                        {/* Step 4: Features */}
                        {currentStep === 4 && (
                            <>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Fonctionnalités souhaitées</label>
                                    <div className="grid grid-cols-1 gap-2">
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
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Autres fonctionnalités (optionnel)</label>
                                    <textarea value={formData.additionalFeatures} onChange={e => update('additionalFeatures', e.target.value)} rows={2}
                                        className="w-full bg-bg-dark text-white text-sm rounded-xl px-4 py-3 border border-white/5 focus:border-primary outline-none transition-all resize-none placeholder-slate-600"
                                        placeholder="Décrivez toute autre fonctionnalité spécifique..." />
                                </div>
                            </>
                        )}

                        {/* Step 5: Content & Files */}
                        {currentStep === 5 && (
                            <>
                                <div className="space-y-3">
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Contenu disponible</label>
                                    {[
                                        { key: 'hasContent', label: 'J\'ai les textes prêts (descriptions, pages...)' },
                                        { key: 'hasImages', label: 'J\'ai des photos/images de qualité' },
                                    ].map(item => (
                                        <label key={item.key} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${formData[item.key] ? 'bg-primary/10 border-primary/40 text-white' : 'bg-white/3 border-white/5 text-slate-400 hover:border-white/20'
                                            }`}>
                                            <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all ${formData[item.key] ? 'bg-primary' : 'bg-white/5 border border-white/10'
                                                }`}>
                                                {formData[item.key] && <Check size={10} className="text-white" />}
                                            </div>
                                            <input type="checkbox" className="hidden" checked={formData[item.key]} onChange={e => update(item.key, e.target.checked)} />
                                            <span className="text-sm">{item.label}</span>
                                        </label>
                                    ))}
                                </div>

                                <FileUploadZone
                                    label="Fichiers de contenu (textes, images, ZIP — optionnel)"
                                    accept=".pdf,.doc,.docx,.zip,.jpg,.png,.txt"
                                    file={contentFile}
                                    uploading={uploadingContent}
                                    onFile={(f) => handleFileUpload(f, 'content')}
                                />

                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Informations complémentaires</label>
                                    <textarea value={formData.additionalInfo} onChange={e => update('additionalInfo', e.target.value)} rows={4}
                                        className="w-full bg-bg-dark text-white text-sm rounded-xl px-4 py-3 border border-white/5 focus:border-primary outline-none transition-all resize-none placeholder-slate-600"
                                        placeholder="Tout ce qui pourrait nous aider à mieux comprendre votre projet..." />
                                </div>

                                {submitError && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                        <p className="text-xs text-red-400">{submitError}</p>
                                    </div>
                                )}

                                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                                    <p className="text-xs text-slate-400">
                                        🎉 Vous avez presque terminé ! Cliquez sur "Envoyer" pour transmettre votre cahier des charges à l'équipe Jannah Agency.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                        <div>
                            {currentStep > 1 ? (
                                <button onClick={prevStep} className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium rounded-xl transition-all">
                                    <ChevronLeft size={16} /> Retour
                                </button>
                            ) : <div />}
                        </div>
                        <div className="flex items-center gap-3">
                            {currentStep < STEPS.length && <SkipButton onSkip={nextStep} />}
                            <button
                                onClick={nextStep}
                                disabled={isSubmitting || uploadingLogo || uploadingCharte || uploadingContent}
                                className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-green-700 disabled:opacity-60 disabled:cursor-wait text-white text-sm font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-primary/20"
                            >
                                {isSubmitting ? (
                                    <><Loader2 size={15} className="animate-spin" /> Envoi...</>
                                ) : (
                                    <>{currentStep === STEPS.length ? 'Envoyer ✓' : 'Suivant'}{currentStep < STEPS.length && <ChevronRight size={16} />}</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
