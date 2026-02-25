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
            <div className="relative mb-8 z-10 w-full flex-shrink-0">
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-accent/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none -translate-y-1/2 animate-pulse-glow" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 w-full">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest text-accent mb-6 shadow-[0_0_15px_rgba(238,180,23,0.2)]">
                            <TrendingUp size={12} className="animate-pulse" /> Financial Engine
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-4 text-slate-900 dark:text-white">
                            Ventes & <span className="text-accent underline decoration-accent/30 underline-offset-8">Finances</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg leading-relaxed font-medium mt-4">
                            Architecture centrale de vos revenus. Gérez vos devis, factures et encaissements avec une précision chirurgicale.
                        </p>
                    </div>
                    <div>
                        <button onClick={() => setIsQuoteModalOpen(true)} className="flex items-center gap-3 px-8 py-5 bg-gradient-to-r from-accent to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-bg-dark text-[10px] md:text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-accent/20 hover:shadow-accent/30 active:scale-95 group">
                            <Plus size={18} strokeWidth={4} className="group-hover:rotate-90 transition-transform duration-300" /> CRÉER UN DEVIS
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
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white dark:bg-surface-dark/40 backdrop-blur-xl p-4 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden z-10 w-full">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                {/* Tabs switch */}
                <div className="flex bg-slate-100 dark:bg-black/40 rounded-[1.25rem] p-1 gap-1 border border-slate-200 dark:border-white/5 relative z-10 w-full md:w-auto shadow-inner">
                    {[
                        { id: 'quotes', label: 'Devis' },
                        { id: 'invoices', label: 'Factures (CA)' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-8 py-3 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab.id ? 'bg-slate-900 dark:bg-white text-white dark:text-bg-dark shadow-lg shadow-black/10 dark:shadow-white/10' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Toolbar Search */}
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto relative z-10">
                    <div className="relative flex-1 w-full md:w-80 group">
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors" strokeWidth={3} />
                        <input
                            type="text"
                            placeholder="RECHERCHER UN DOCUMENT..."
                            className="w-full bg-slate-50 dark:bg-black/40 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl pl-12 pr-6 py-4 border border-slate-200 dark:border-white/10 focus:border-accent/40 outline-none transition-all placeholder:text-slate-400 text-slate-900 dark:text-white shadow-inner"
                        />
                    </div>
                </div>
            </div>

            {/* Main Data Table Card */}
            <div className="bg-white dark:bg-surface-dark/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden relative z-10">
                <div className="p-8 overflow-x-auto custom-scrollbar">
                    {loading ? (
                        <div className="h-60 flex flex-col items-center justify-center text-slate-500 font-black uppercase tracking-widest text-[10px] gap-4">
                            <Clock className="animate-spin text-accent" size={24} />
                            Chargement des données...
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-white/5">
                                    <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Document</th>
                                    <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Client</th>
                                    <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Montant</th>
                                    <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                    <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                    <th className="pb-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                                {activeTab === 'quotes' ? (
                                    quotes.map(quote => (
                                        <tr key={quote.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all group">
                                            <td className="py-6 text-sm font-black text-slate-900 dark:text-white">{quote.title}</td>
                                            <td className="py-6 text-sm text-slate-600 dark:text-slate-400 font-medium">{quote.clients?.name || 'Inconnu'}</td>
                                            <td className="py-6 text-sm font-mono font-black text-slate-900 dark:text-white">
                                                <span className="bg-accent/10 px-3 py-1.5 rounded-lg text-accent border border-accent/20">
                                                    {quote.total.toLocaleString()} €
                                                </span>
                                            </td>
                                            <td className="py-6 text-sm">
                                                <StatusBadge status={quote.status} />
                                            </td>
                                            <td className="py-6 text-xs text-slate-500 font-medium">{new Date(quote.created_at).toLocaleDateString()}</td>
                                            <td className="py-6 text-right space-x-2 px-4 whitespace-nowrap">
                                                {quote.status !== 'Invoiced' && (
                                                    <button onClick={() => handleConvertToInvoice(quote)} className="text-[10px] font-black uppercase bg-primary hover:bg-green-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20 transition-all opacity-0 group-hover:opacity-100">
                                                        Facturer
                                                    </button>
                                                )}
                                                <button onClick={() => handlePrint('quote', quote)} className="p-2.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all opacity-0 group-hover:opacity-100 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 border border-transparent hover:border-slate-200 dark:hover:border-white/10" title="Télécharger en PDF">
                                                    <Download size={18} />
                                                </button>
                                                <button className="p-2.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all opacity-0 group-hover:opacity-100 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 border border-transparent hover:border-slate-200 dark:hover:border-white/10"><MoreVertical size={18} /></button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    invoices.map(invoice => (
                                        <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all group">
                                            <td className="py-6 text-sm font-black text-slate-900 dark:text-white font-mono">{invoice.invoice_number}</td>
                                            <td className="py-6 text-sm text-slate-600 dark:text-slate-400 font-medium">{invoice.clients?.name || 'Inconnu'}</td>
                                            <td className="py-6 text-sm font-mono font-black text-slate-900 dark:text-white">
                                                <span className="bg-primary/10 px-3 py-1.5 rounded-lg text-primary border border-primary/20">
                                                    {invoice.amount.toLocaleString()} €
                                                </span>
                                            </td>
                                            <td className="py-6 text-sm">
                                                <StatusBadge status={invoice.status} isInvoice />
                                            </td>
                                            <td className="py-6 text-xs text-slate-500 font-medium">Échéance: {new Date(invoice.due_date).toLocaleDateString()}</td>
                                            <td className="py-6 text-right space-x-2 px-4 whitespace-nowrap">
                                                {invoice.status === 'Pending' && (
                                                    <button onClick={() => handleStripePayment(invoice)} className="text-[10px] font-black uppercase bg-[#635BFF] hover:bg-[#5a52e6] text-white px-5 py-2.5 rounded-xl shadow-lg shadow-[#635BFF]/20 transition-all opacity-0 group-hover:opacity-100 inline-flex items-center gap-2">
                                                        <CreditCard size={14} strokeWidth={3} /> Payer
                                                    </button>
                                                )}
                                                <button onClick={() => handlePrint('invoice', invoice)} className="p-2.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all opacity-0 group-hover:opacity-100 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 border border-transparent hover:border-slate-200 dark:hover:border-white/10" title="Télécharger en PDF">
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
                        <div className="py-24 text-center">
                            <FileText size={48} className="mx-auto text-slate-200 dark:text-white/5 mb-4" />
                            <p className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-[10px]">Aucun devis trouvé. Créez-en un pour commencer.</p>
                        </div>
                    )}
                    {!loading && activeTab === 'invoices' && invoices.length === 0 && (
                        <div className="py-24 text-center">
                            <CreditCard size={48} className="mx-auto text-slate-200 dark:text-white/5 mb-4" />
                            <p className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-[10px]">Aucune facture générée.</p>
                        </div>
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
        <div className="bg-white dark:bg-surface-dark/40 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500 ${color}`}>
                <Icon size={120} />
            </div>
            <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-8">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bg} border ${border} ${color} shadow-lg shadow-black/5`}>
                        <Icon size={28} strokeWidth={2.5} />
                    </div>
                </div>
                <div>
                    <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 ml-1">{title}</h3>
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
