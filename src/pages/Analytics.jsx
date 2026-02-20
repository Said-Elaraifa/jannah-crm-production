// src/pages/Analytics.jsx
import { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import {
    TrendingUp, TrendingDown, Calculator, Link as LinkIcon,
    CheckSquare, BarChart2, Copy, RefreshCw, ExternalLink,
    PieChart, Target, Zap, MousePointer, DollarSign,
    Sparkles, Loader2, MessageSquareText
} from 'lucide-react';
import { getAdsKpis, getAdsCampaigns } from '../services/supabase';
import { predictAdsRoi } from '../services/gemini';

Chart.register(...registerables);

// --- Components ---

function TabButton({ id, label, icon: Icon, active, onClick }) {
    return (
        <button
            onClick={() => onClick(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${active
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
        >
            <Icon size={16} />
            {label}
        </button>
    );
}

function StatCard({ label, value, trend, subtext, icon: Icon, color = "text-primary", bgColor = "bg-primary/10" }) {
    const isUp = trend === 'up';
    return (
        <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${bgColor} ${color} group-hover:scale-110 transition-transform`}>
                    <Icon size={20} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${isUp ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        <span>{isUp ? '+' : ''}12%</span>
                    </div>
                )}
            </div>
            <h3 className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">{label}</h3>
            <p className="text-2xl font-display font-bold text-white mb-1">{value}</p>
            {subtext && <p className="text-xs text-slate-500">{subtext}</p>}
        </div>
    );
}

// --- Tools Sections ---

function ROASCalculator() {
    const [values, setValues] = useState({
        margin: 30,
        aov: 80,
        cpc: 1.5,
        conversionRate: 2
    });

    const [results, setResults] = useState({
        breakEvenROAS: 0,
        targetCPA: 0,
        profitPerSale: 0
    });

    useEffect(() => {
        const breakEvenROAS = values.margin > 0 ? (100 / values.margin) : 0;
        const targetCPA = (values.aov * values.margin) / 100;
        const profitPerSale = values.aov - targetCPA; // Simplified
        setResults({
            breakEvenROAS: breakEvenROAS.toFixed(2),
            targetCPA: targetCPA.toFixed(2),
            profitPerSale: profitPerSale.toFixed(2)
        });
    }, [values]);

    const handleChange = (e) => {
        setValues({ ...values, [e.target.name]: parseFloat(e.target.value) || 0 });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
            <div className="bg-surface-dark p-6 rounded-2xl border border-white/5">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Calculator size={20} className="text-secondary" /> Paramètres
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">Marge Produit (%)</label>
                        <input type="number" name="margin" value={values.margin} onChange={handleChange} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-secondary transition-colors" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">Panier Moyen (€)</label>
                        <input type="number" name="aov" value={values.aov} onChange={handleChange} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-secondary transition-colors" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">CPC (€)</label>
                        <input type="number" name="cpc" value={values.cpc} onChange={handleChange} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-secondary transition-colors" />
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-surface-dark to-surface-dark/50 p-6 rounded-2xl border border-white/5 flex flex-col justify-center">
                <h3 className="text-lg font-bold text-white mb-6">Résultats</h3>
                <div className="space-y-6">
                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-slate-400">ROAS Breakeven</span>
                        <span className="text-2xl font-display font-bold text-red-400">{results.breakEvenROAS}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-slate-400">CPA Max (Breakeven)</span>
                        <span className="text-2xl font-display font-bold text-white">{results.targetCPA} €</span>
                    </div>
                    <div className="p-4 bg-secondary/10 rounded-xl border border-secondary/20">
                        <p className="text-xs text-secondary mb-1 uppercase tracking-wider font-bold">Conseil :</p>
                        <p className="text-sm text-slate-300">
                            Pour être rentable, vos publicités doivent générer au moins <strong className="text-white">{results.breakEvenROAS}€</strong> pour chaque 1€ dépensé.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function UTMBuilder() {
    const [url, setUrl] = useState('https://');
    const [params, setParams] = useState({
        source: 'facebook',
        medium: 'cpc',
        campaign: '',
        content: '',
        term: ''
    });
    const [generatedUrl, setGeneratedUrl] = useState('');

    useEffect(() => {
        try {
            const baseUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
            if (params.source) baseUrl.searchParams.set('utm_source', params.source);
            if (params.medium) baseUrl.searchParams.set('utm_medium', params.medium);
            if (params.campaign) baseUrl.searchParams.set('utm_campaign', params.campaign.replace(/\s+/g, '_').toLowerCase());
            if (params.content) baseUrl.searchParams.set('utm_content', params.content.replace(/\s+/g, '_').toLowerCase());
            if (params.term) baseUrl.searchParams.set('utm_term', params.term.replace(/\s+/g, '_').toLowerCase());
            setGeneratedUrl(baseUrl.toString());
        } catch (e) {
            setGeneratedUrl('');
        }
    }, [url, params]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedUrl);
        alert("URL copiée !");
    };

    return (
        <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 animate-fade-in-up">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <LinkIcon size={20} className="text-accent" /> UTM Builder Standardisé
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">URL de destination</label>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://monsite.com/landing"
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-accent transition-colors"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">Source</label>
                            <select
                                value={params.source}
                                onChange={(e) => setParams({ ...params, source: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-accent transition-colors appearance-none"
                            >
                                <option value="facebook">facebook</option>
                                <option value="google">google</option>
                                <option value="instagram">instagram</option>
                                <option value="linkedin">linkedin</option>
                                <option value="tiktok">tiktok</option>
                                <option value="email">email</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">Medium</label>
                            <select
                                value={params.medium}
                                onChange={(e) => setParams({ ...params, medium: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-accent transition-colors appearance-none"
                            >
                                <option value="cpc">cpc</option>
                                <option value="organic">organic</option>
                                <option value="social">social</option>
                                <option value="email">email</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">Campaign Name</label>
                        <input
                            type="text"
                            value={params.campaign}
                            onChange={(e) => setParams({ ...params, campaign: e.target.value })}
                            placeholder="ex: summer_sale_2024"
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-accent transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">Ad Content (Optionnel)</label>
                        <input
                            type="text"
                            value={params.content}
                            onChange={(e) => setParams({ ...params, content: e.target.value })}
                            placeholder="ex: video_v1_blue"
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-accent transition-colors"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-6 p-4 bg-black/40 rounded-xl border border-white/10 flex items-center gap-4">
                <div className="flex-1 overflow-hidden">
                    <p className="text-xs text-slate-500 mb-1">URL Générée :</p>
                    <p className="text-sm text-accent font-mono truncate">{generatedUrl}</p>
                </div>
                <button
                    onClick={copyToClipboard}
                    className="p-3 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors"
                >
                    <Copy size={20} />
                </button>
            </div>
        </div>
    );
}

function NamingConventionBuilder() {
    const [elements, setElements] = useState({
        date: new Date().toISOString().slice(0, 10),
        geo: 'FR',
        offer: '',
        objective: 'CONV',
        type: 'COLD'
    });

    const generatedName = `${elements.date}_${elements.geo}_${elements.offer.replace(/\s+/g, '').toUpperCase() || 'OFFER'}_${elements.objective}_${elements.type}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedName);
        alert("Nom copiée !");
    };

    return (
        <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 animate-fade-in-up">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Target size={20} className="text-purple-400" /> Naming Convention Generator
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                <div>
                    <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Date</label>
                    <input
                        type="date"
                        value={elements.date}
                        onChange={(e) => setElements({ ...elements, date: e.target.value })}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-xs text-white"
                    />
                </div>
                <div>
                    <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Geo</label>
                    <input
                        type="text"
                        value={elements.geo}
                        onChange={(e) => setElements({ ...elements, geo: e.target.value.toUpperCase() })}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-xs text-white"
                        placeholder="FR, UK..."
                    />
                </div>
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Offre / Produit</label>
                    <input
                        type="text"
                        value={elements.offer}
                        onChange={(e) => setElements({ ...elements, offer: e.target.value })}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-xs text-white"
                        placeholder="Ebook, Promo..."
                    />
                </div>
                <div>
                    <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Objectif</label>
                    <select
                        value={elements.objective}
                        onChange={(e) => setElements({ ...elements, objective: e.target.value })}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-xs text-white appearance-none"
                    >
                        <option value="CONV">CONV</option>
                        <option value="LEAD">LEAD</option>
                        <option value="TRAFFIC">TRAFFIC</option>
                        <option value="AWARENESS">AWARENESS</option>
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Type</label>
                    <select
                        value={elements.type}
                        onChange={(e) => setElements({ ...elements, type: e.target.value })}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-xs text-white appearance-none"
                    >
                        <option value="COLD">COLD</option>
                        <option value="RETARGETING">RETARGETING</option>
                        <option value="LOOKALIKE">LOOKALIKE</option>
                        <option value="LOYALTY">LOYALTY</option>
                    </select>
                </div>
            </div>

            <div className="p-4 bg-black/40 rounded-xl border border-white/10 flex items-center gap-4">
                <div className="flex-1 overflow-hidden">
                    <p className="text-xs text-slate-500 mb-1">Nom de Campagne :</p>
                    <p className="text-sm text-purple-400 font-mono font-bold truncate">{generatedName}</p>
                </div>
                <button
                    onClick={copyToClipboard}
                    className="p-3 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500/20 transition-colors"
                >
                    <Copy size={20} />
                </button>
            </div>
        </div>
    );
}

function Checklists() {
    const [checkedItems, setCheckedItems] = useState({});

    const toggleItem = (id) => {
        setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const checklistItems = [
        { id: 'pixel', text: "Le Pixel / CAPI est actif et reçoit des événements." },
        { id: 'budget', text: "Le budget quotidien/global est correct et validé." },
        { id: 'audience', text: "L'audience cible exclut bien les clients existants (si nécessaire)." },
        { id: 'creative', text: "Les visuels sont au bon format (1:1, 9:16) et HD." },
        { id: 'copy', text: "Le copywriting a été relu (0 fautes d'orthographe)." },
        { id: 'link', text: "Les liens de destination fonctionnent et sont rapides." },
        { id: 'utms', text: "Les UTMs sont configurés correctement." },
    ];

    const progress = Math.round((Object.values(checkedItems).filter(Boolean).length / checklistItems.length) * 100);

    return (
        <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <CheckSquare size={20} className="text-green-400" /> Pre-Flight Checklist
                </h3>
                <div className="text-xs font-bold px-3 py-1 bg-white/5 rounded-full text-slate-300">
                    {progress}% Prêt
                </div>
            </div>

            <div className="w-full bg-white/5 rounded-full h-2 mb-6 overflow-hidden">
                <div className="bg-green-400 h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="space-y-3">
                {checklistItems.map(item => (
                    <div
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${checkedItems[item.id]
                            ? 'bg-green-500/5 border-green-500/20'
                            : 'bg-black/20 border-transparent hover:bg-white/5'
                            }`}
                    >
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${checkedItems[item.id] ? 'bg-green-500 border-green-500' : 'border-slate-600'
                            }`}>
                            {checkedItems[item.id] && <CheckSquare size={14} className="text-bg-dark" />}
                        </div>
                        <span className={`text-sm ${checkedItems[item.id] ? 'text-white line-through opacity-50' : 'text-slate-300'}`}>
                            {item.text}
                        </span>
                    </div>
                ))}
            </div>

            <button
                onClick={() => setCheckedItems({})}
                className="mt-6 text-xs text-slate-500 hover:text-white flex items-center gap-2 mx-auto"
            >
                <RefreshCw size={12} /> Réinitialiser la liste
            </button>
        </div>
    );
}

function ROIPredictor() {
    const [sim, setSim] = useState({
        budget: 5000,
        cpa: 25,
        aov: 1500,
        closingRate: 20
    });
    const [prediction, setPrediction] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePredict = async () => {
        setLoading(true);
        try {
            const res = await predictAdsRoi(sim);
            setPrediction(res);
        } catch (err) {
            setPrediction(`Erreur d'analyse : ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const estRevenue = (sim.budget / sim.cpa) * sim.aov * (sim.closingRate / 100);
    const estLeads = Math.round(sim.budget / sim.cpa);
    const estROAS = (estRevenue / sim.budget).toFixed(2);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
            <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Zap size={20} className="text-secondary" /> Simulation
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1.5">Budget Mensuel (€)</label>
                        <input type="number" value={sim.budget} onChange={e => setSim({ ...sim, budget: parseFloat(e.target.value) || 0 })} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-secondary outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1.5">CPL Cible (Coût Lead)</label>
                        <input type="number" value={sim.cpa} onChange={e => setSim({ ...sim, cpa: parseFloat(e.target.value) || 0 })} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-secondary outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1.5">Panier Moyen (€)</label>
                        <input type="number" value={sim.aov} onChange={e => setSim({ ...sim, aov: parseFloat(e.target.value) || 0 })} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-secondary outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1.5">Closing Rate (%)</label>
                        <input type="number" value={sim.closingRate} onChange={e => setSim({ ...sim, closingRate: parseFloat(e.target.value) || 0 })} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-secondary outline-none transition-all" />
                    </div>
                </div>
                <button
                    onClick={handlePredict}
                    disabled={loading}
                    className="w-full py-4 bg-primary hover:bg-green-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    {loading ? 'Analyse par Gemini...' : 'Lancer la Prédiction IA'}
                </button>
            </div>

            <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-surface-dark p-4 rounded-2xl border border-white/5 text-center">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Leads Estimés</p>
                        <p className="text-xl font-display font-bold text-white">{estLeads}</p>
                    </div>
                    <div className="bg-surface-dark p-4 rounded-2xl border border-white/5 text-center">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Revenue Potentiel</p>
                        <p className="text-xl font-display font-bold text-secondary">{estRevenue.toLocaleString()}€</p>
                    </div>
                    <div className="bg-surface-dark p-4 rounded-2xl border border-white/5 text-center">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">ROAS Estimé</p>
                        <p className="text-xl font-display font-bold text-accent">{estROAS}x</p>
                    </div>
                </div>

                <div className="bg-black/30 p-6 rounded-2xl border border-primary/20 h-full min-h-[300px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Sparkles size={80} className="text-primary" />
                    </div>
                    <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                        Analyse de l'Expert IA
                    </h4>
                    {prediction ? (
                        <div className="prose prose-invert max-w-none text-sm text-slate-300 leading-relaxed whitespace-pre-line animate-fade-in">
                            {prediction}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center py-10">
                            <MessageSquareText size={40} className="text-slate-700 mb-3" />
                            <p className="text-slate-500 italic">Configurez vos paramètres et lancez l'IA pour obtenir une analyse stratégique de cette simulation.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Main Page ---

const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'calculators', label: 'Simulateurs', icon: Calculator },
    { id: 'prediction', label: 'Intelligence ROI', icon: Sparkles },
    { id: 'tracking', label: 'Tracking & UTMs', icon: LinkIcon },
    { id: 'checklists', label: 'Process & QA', icon: CheckSquare },
];

export default function Analytics() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    // Data States
    const [adsKpis, setAdsKpis] = useState([]);
    const [campaigns, setCampaigns] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            const [kpis, camps] = await Promise.all([
                getAdsKpis(),
                getAdsCampaigns()
            ]);
            setAdsKpis(kpis);
            setCampaigns(camps);
        };
        loadData();
    }, []);

    // Re-initialize chart when tab is dashboard
    useEffect(() => {
        if (activeTab === 'dashboard' && chartRef.current && campaigns.length > 0) {
            if (chartInstance.current) chartInstance.current.destroy();

            const ctx = chartRef.current.getContext('2d');
            chartInstance.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: campaigns.map(c => c.name.substring(0, 15) + '...'),
                    datasets: [
                        { label: 'Leads', data: campaigns.map(c => c.leads), backgroundColor: '#c3dc7f', borderRadius: 4 },
                        { label: 'Dépenses', data: campaigns.map(c => parseFloat(c.spend.replace(/[^0-9.]/g, ''))), backgroundColor: '#eeb417', borderRadius: 4 },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { labels: { color: '#94a3b8' } } },
                    scales: {
                        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' }, border: { display: false } },
                        x: { grid: { display: false }, ticks: { color: '#64748b' }, border: { display: false } },
                    },
                },
            });
        }
    }, [activeTab, campaigns]);

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-display font-bold text-white">Analytics & Ads</h2>
                    <p className="text-slate-400 mt-1">Votre centre de commande personnel. Données, Outils et Process.</p>
                </div>
                <div className="flex gap-2 p-1 bg-surface-dark rounded-xl border border-white/5">
                    {TABS.map(tab => (
                        <TabButton key={tab.id} {...tab} active={activeTab === tab.id} onClick={setActiveTab} />
                    ))}
                </div>
            </div>

            {/* Content Switcher */}
            {activeTab === 'dashboard' && (
                <div className="space-y-6 animate-fade-in-up">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {adsKpis.map((kpi, index) => (
                            <StatCard
                                key={index}
                                label={kpi.label}
                                value={kpi.value}
                                trend={kpi.trend}
                                icon={index === 0 ? DollarSign : index === 1 ? Target : index === 2 ? PieChart : MousePointer}
                                color={kpi.color}
                                bgColor={kpi.bg_color}
                            />
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-surface-dark p-6 rounded-2xl border border-white/5 h-[400px]">
                            <h3 className="text-sm font-bold text-white mb-4">Performance Hebdomadaire</h3>
                            <div className="h-[320px]">
                                <canvas ref={chartRef} />
                            </div>
                        </div>
                        <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
                            <h3 className="text-sm font-bold text-white mb-2">Liens Rapides</h3>
                            <a href="https://business.facebook.com" target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group">
                                <span className="text-sm font-medium text-white">Meta Ads Manager</span>
                                <ExternalLink size={16} className="text-slate-500 group-hover:text-white" />
                            </a>
                            <a href="https://ads.google.com" target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group">
                                <span className="text-sm font-medium text-white">Google Ads</span>
                                <ExternalLink size={16} className="text-slate-500 group-hover:text-white" />
                            </a>
                            <a href="https://analytics.google.com" target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group">
                                <span className="text-sm font-medium text-white">Google Analytics 4</span>
                                <ExternalLink size={16} className="text-slate-500 group-hover:text-white" />
                            </a>
                            <div className="mt-auto p-4 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl border border-primary/10">
                                <p className="text-xs text-primary font-bold mb-1 uppercase">Pro Tip</p>
                                <p className="text-xs text-slate-300">Vérifiez vos exclusions d'audience tous les vendredis.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'calculators' && <ROASCalculator />}
            {activeTab === 'prediction' && <ROIPredictor />}

            {activeTab === 'tracking' && (
                <div className="space-y-6 animate-fade-in-up">
                    <UTMBuilder />
                    <NamingConventionBuilder />
                </div>
            )}

            {activeTab === 'checklists' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
                    <Checklists />
                    <div className="bg-surface-dark p-6 rounded-2xl border border-white/5">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Zap size={20} className="text-yellow-400" /> Routine Quotidienne
                        </h3>
                        <ul className="space-y-4">
                            {[
                                "Vérifier les dépenses d'hier vs budget.",
                                "Analyser les coûts par résultat (CPA/CPL).",
                                "Vérifier les commentaires sous les ads.",
                                "Couper les adsets perdants (ROAS < 1.5).",
                                "Scaler les vainqueurs (+20% budget)."
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-slate-300 p-3 bg-white/5 rounded-xl">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
