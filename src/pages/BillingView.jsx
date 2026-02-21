import { useState, useEffect } from 'react';
import { FileText, CreditCard, DollarSign, TrendingUp, Plus, Clock, Search, MoreVertical, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { getQuotes, getInvoices, createInvoiceFromQuote, createStripeCheckout } from '../services/billing';
import { getClients } from '../services/supabase';
import { QuoteModal } from '../features/billing/components/QuoteModal';
import { PrintableDocument } from '../features/billing/components/PrintableDocument';

export default function BillingView() {
    const [quotes, setQuotes] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('quotes'); // quotes | invoices
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [documentToPrint, setDocumentToPrint] = useState(null); // { type: 'quote' | 'invoice', data: Object, client: Object }

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [qRes, iRes, cRes] = await Promise.allSettled([
                getQuotes(),
                getInvoices(),
                getClients()
            ]);

            if (qRes.status === 'fulfilled') setQuotes(qRes.value || []);
            else console.error("Quotes fetch error:", qRes.reason);

            if (iRes.status === 'fulfilled') setInvoices(iRes.value || []);
            else console.error("Invoices fetch error:", iRes.reason);

            if (cRes.status === 'fulfilled') setClients(cRes.value || []);
            else console.error("Clients fetch error:", cRes.reason);
        } catch (error) {
            console.error("Dashboard fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateQuote = (newQuote) => {
        setQuotes(prev => [newQuote, ...prev]);
    };

    const handleConvertToInvoice = async (quote) => {
        if (!window.confirm("Convertir ce devis en facture ?")) return;
        try {
            const newInvoice = await createInvoiceFromQuote(quote.id);
            alert(`Facture ${newInvoice.invoice_number} générée avec succès !`);
            fetchData();
        } catch (error) {
            alert("Erreur: " + error.message);
        }
    };

    const handleStripePayment = async (invoice) => {
        try {
            const res = await createStripeCheckout(invoice.id, invoice.amount);
            alert(`Simulation de paiement Stripe. Lien : ${res.url}`);
        } catch (error) {
            alert("Erreur Stripe: " + error.message);
        }
    };

    const handlePrint = (type, item) => {
        const client = clients.find(c => c.id === item.client_id) || { name: item.clients?.name || 'Inconnu' };
        setDocumentToPrint({ type, data: item, client });
    };

    // Calculate metrics
    const totalPendingInvoices = invoices.filter(i => i.status === 'Pending').reduce((sum, i) => sum + i.amount, 0);
    const totalPaidInvoices = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0);

    return (
        <div className="w-full space-y-6 animate-fade-in pb-10">
            {/* Header Area */}
            <div className="relative mb-8 flex-shrink-0">
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-accent/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none -translate-y-1/2 animate-pulse-glow" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest text-accent mb-6 shadow-[0_0_15px_rgba(238,180,23,0.2)]">
                            <TrendingUp size={12} className="animate-pulse" /> Financial Engine
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-4 text-slate-900 dark:text-white">
                            Ventes & <span className="text-accent underline decoration-accent/30 underline-offset-8">Finances</span>
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg leading-relaxed font-medium mt-4">
                            Architecture centrale de vos revenus. Gérez vos devis, factures et encaissements avec une précision chirurgicale.
                        </p>
                    </div>
                    <div>
                        <button onClick={() => setIsQuoteModalOpen(true)} className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-accent to-yellow-500 hover:from-yellow-400 hover:to-yellow-300 text-bg-dark text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(238,180,23,0.3)] active:scale-95">
                            <Plus size={16} strokeWidth={3} /> CRÉER UN DEVIS
                        </button>
                    </div>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <MetricCard title="Factures en Attente" amount={totalPendingInvoices} icon={Clock} color="text-accent" bg="bg-accent/10" border="border-accent/20" />
                <MetricCard title="Chiffre d'Affaires" amount={totalPaidInvoices} icon={DollarSign} color="text-primary" bg="bg-primary/10" border="border-primary/20" />
                <MetricCard title="Devis en Cours" amount={quotes.filter(q => q.status === 'Draft').length} isCount icon={FileText} color="text-secondary" bg="bg-secondary/10" border="border-secondary/20" />
            </div>

            {/* Tabs & Toolbar Container */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-surface-dark/40 backdrop-blur-xl p-4 rounded-3xl border border-slate-200 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative overflow-hidden z-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                {/* Tabs switch */}
                <div className="flex bg-slate-100 dark:bg-black/40 rounded-2xl p-1 gap-1 border border-slate-200 dark:border-white/5 relative z-10 w-full md:w-auto">
                    {[
                        { id: 'quotes', label: 'Devis' },
                        { id: 'invoices', label: 'Factures (CA)' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-2.5 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab.id ? 'bg-accent text-primary shadow-lg shadow-accent/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Toolbar Search mockup (can be expanded later if needed) */}
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto relative z-10">
                    <div className="relative flex-1 w-full md:w-80 group">
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-accent transition-colors" />
                        <input
                            type="text"
                            placeholder="RECHERCHER UN DOCUMENT..."
                            className="w-full bg-slate-100 dark:bg-black/40 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl pl-12 pr-6 py-4 border border-slate-200 dark:border-white/10 focus:border-accent/40 outline-none transition-all placeholder:text-slate-500 text-slate-900 dark:text-white"
                        />
                    </div>
                </div>
            </div>

            {/* Main Data Table Card */}
            <div className="bg-surface-dark/40 backdrop-blur-xl rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden relative z-10">
                <div className="p-8 overflow-x-auto custom-scrollbar">
                    {loading ? (
                        <div className="h-40 flex items-center justify-center text-slate-500 font-bold animate-pulse">Chargement des données...</div>
                    ) : (
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr>
                                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Document</th>
                                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Client</th>
                                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Montant</th>
                                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Date</th>
                                    <th className="pb-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeTab === 'quotes' ? (
                                    quotes.map(quote => (
                                        <tr key={quote.id} className="border-t border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all group">
                                            <td className="py-5 text-sm font-bold text-slate-900 dark:text-white">{quote.title}</td>
                                            <td className="py-5 text-sm text-slate-600 dark:text-slate-400 font-medium">{quote.clients?.name || 'Inconnu'}</td>
                                            <td className="py-5 text-sm font-mono font-bold text-slate-900 dark:text-white">
                                                <span className="text-accent">{quote.total.toLocaleString()} €</span>
                                            </td>
                                            <td className="py-4">
                                                <StatusBadge status={quote.status} />
                                            </td>
                                            <td className="py-4 text-xs text-slate-500">{new Date(quote.created_at).toLocaleDateString()}</td>
                                            <td className="py-4 text-right space-x-2">
                                                {quote.status !== 'Invoiced' && (
                                                    <button onClick={() => handleConvertToInvoice(quote)} className="text-[10px] font-black uppercase bg-primary text-white hover:bg-green-700 px-4 py-2 rounded-xl shadow-lg shadow-primary/20 transition-all opacity-0 group-hover:opacity-100">
                                                        Facturer
                                                    </button>
                                                )}
                                                <button onClick={() => handlePrint('quote', quote)} className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all opacity-0 group-hover:opacity-100 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10" title="Télécharger en PDF">
                                                    <Download size={18} />
                                                </button>
                                                <button className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all opacity-0 group-hover:opacity-100 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10"><MoreVertical size={18} /></button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    invoices.map(invoice => (
                                        <tr key={invoice.id} className="border-t border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all group">
                                            <td className="py-5 text-sm font-bold text-slate-900 dark:text-white font-mono">{invoice.invoice_number}</td>
                                            <td className="py-5 text-sm text-slate-600 dark:text-slate-400 font-medium">{invoice.clients?.name || 'Inconnu'}</td>
                                            <td className="py-5 text-sm font-mono font-bold text-slate-900 dark:text-white">
                                                <span className="text-primary">{invoice.amount.toLocaleString()} €</span>
                                            </td>
                                            <td className="py-4">
                                                <StatusBadge status={invoice.status} isInvoice />
                                            </td>
                                            <td className="py-4 text-xs text-slate-500">Échéance: {new Date(invoice.due_date).toLocaleDateString()}</td>
                                            <td className="py-4 text-right space-x-2">
                                                {invoice.status === 'Pending' && (
                                                    <button onClick={() => handleStripePayment(invoice)} className="text-[10px] font-black uppercase bg-[#635BFF] text-white hover:bg-[#5851e5] px-4 py-2 rounded-xl shadow-lg shadow-[#635BFF]/20 transition-all opacity-0 group-hover:opacity-100 flex items-center gap-2 ml-auto">
                                                        <CreditCard size={14} /> Payer
                                                    </button>
                                                )}
                                                <button onClick={() => handlePrint('invoice', invoice)} className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all opacity-0 group-hover:opacity-100 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10" title="Télécharger en PDF">
                                                    <Download size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}

                    {/* Empty states */}
                    {!loading && activeTab === 'quotes' && quotes.length === 0 && (
                        <div className="py-12 text-center text-slate-500">Aucun devis trouvé. Créez-en un pour commencer.</div>
                    )}
                    {!loading && activeTab === 'invoices' && invoices.length === 0 && (
                        <div className="py-12 text-center text-slate-500">Aucune facture générée.</div>
                    )}
                </div>
            </div>

            <QuoteModal
                isOpen={isQuoteModalOpen}
                onClose={() => setIsQuoteModalOpen(false)}
                clients={clients}
                onSave={handleCreateQuote}
            />

            {/* Hidden Printable Document */}
            {documentToPrint && (
                <PrintableDocument
                    type={documentToPrint.type}
                    documentData={documentToPrint.data}
                    clientData={documentToPrint.client}
                    onComplete={() => setDocumentToPrint(null)}
                />
            )}
        </div>
    );
}

function MetricCard({ title, amount, isCount, icon: Icon, color, bg, border }) {
    return (
        <div className="bg-surface-dark/40 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-6 opacity-20 group-hover:scale-110 transition-transform duration-500 ${color}`}>
                <Icon size={64} />
            </div>
            <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bg} border ${border} ${color} shadow-lg shadow-black/5`}>
                        <Icon size={24} />
                    </div>
                </div>
                <div>
                    <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">{title}</h3>
                    <p className="text-3xl md:text-4xl font-display font-black text-slate-900 dark:text-white tracking-tight">
                        {isCount ? amount : `${amount.toLocaleString()} €`}
                    </p>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status, isInvoice }) {
    const config = {
        'Draft': { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', label: 'Brouillon' },
        'Sent': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', label: 'Envoyé' },
        'Invoiced': { bg: 'bg-secondary/10', text: 'text-secondary', border: 'border-secondary/20', label: 'Facturé' },
        'Pending': { bg: 'bg-accent/10', text: 'text-accent', border: 'border-accent/20', label: 'En attente' },
        'Paid': { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20', label: 'Payée' },
        'Overdue': { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', label: 'En retard' }
    };

    const style = config[status] || config['Draft'];

    return (
        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${style.bg} ${style.text} ${style.border} shadow-sm transition-all hover:scale-105 cursor-default`}>
            {status === 'Paid' ? <CheckCircle2 size={12} /> : status === 'Overdue' ? <AlertCircle size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_rgba(0,0,0,0.2)]" />}
            {style.label}
        </span>
    );
}
