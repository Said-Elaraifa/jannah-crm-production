import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, X, FileText, Loader2 } from 'lucide-react';

export function PrintableDocument({ type, documentData, clientData, onComplete }) {
    const printAreaRef = useRef(null);
    const [isGenerating, setIsGenerating] = useState(false);

    if (!documentData || !clientData) return null;

    const generatePDF = async () => {
        if (!printAreaRef.current) return;
        setIsGenerating(true);

        const isQuote = type === 'quote';
        const docNumber = isQuote ? documentData.title : documentData.invoice_number;
        const fileName = `${isQuote ? 'Devis' : 'Facture'}_${docNumber?.replace(/[^a-zA-Z0-9-]/g, '_') || 'Doc'}_Jannah.pdf`;

        const element = printAreaRef.current;

        try {
            // Give a clean render before capturing
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/jpeg', 1.0);

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(fileName);
        } catch (err) {
            console.error("Erreur détaillée génération PDF:", err);
            alert(`Erreur technique: ${err.message}`);
        } finally {
            setIsGenerating(false);
            // Optionally close automatically, or let user close
            // if (onComplete) onComplete(); 
        }
    };

    const isQuote = type === 'quote';
    const docNumber = isQuote ? documentData.title : documentData.invoice_number;
    const dateLabel = isQuote ? 'Date du devis' : 'Date de facturation';
    const expiryLabel = isQuote ? 'Valable jusqu\'au' : 'Échéance';

    const items = documentData.items || [];
    const taxRate = documentData.tax_rate || 20;
    const subtotal = documentData.subtotal || documentData.amount / (1 + taxRate / 100);
    const total = documentData.total || documentData.amount;

    const dateStr = new Date(documentData.created_at).toLocaleDateString('fr-FR');
    const expiryDate = documentData.expires_at || documentData.due_date;
    const expiryStr = expiryDate ? new Date(expiryDate).toLocaleDateString('fr-FR') : 'À réception';

    return createPortal(
        <div className="fixed inset-0 z-[999999] bg-slate-900/80 flex items-start justify-center overflow-y-auto w-full h-full p-4 md:p-8 backdrop-blur-sm custom-scrollbar">

            <div className="w-full max-w-4xl mx-auto relative animate-fade-in-up">
                {/* Control Bar (Excluded from PDF) */}
                <div className="flex items-center justify-between mb-4 bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-md sticky top-0 z-50">
                    <div className="flex items-center gap-3 text-white">
                        <FileText size={20} />
                        <h2 className="font-bold text-lg hidden sm:block">Aperçu du document</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onComplete}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2"
                        >
                            <X size={16} /> Fermer
                        </button>
                        <button
                            onClick={generatePDF}
                            disabled={isGenerating}
                            className="px-6 py-2 bg-primary hover:bg-green-600 text-white text-sm font-bold rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                            Télécharger PDF
                        </button>
                    </div>
                </div>

                {/* PDF Wrapper - Strict A4 Style */}
                <div className="overflow-x-auto w-full pb-10">
                    {/* The actual A4 document we capture. min-w ensures it never squashes even on small screens */}
                    <div
                        ref={printAreaRef}
                        className="max-w-4xl mx-auto bg-white p-8 md:p-12 text-slate-900 shadow-2xl rounded-sm min-w-[800px] min-h-[1100px] relative flex flex-col font-sans"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-12 border-b-2 border-slate-200 pb-8">
                            <div>
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight">JANNAH</h1>
                                <p className="text-sm text-slate-500 mt-1 font-bold tracking-widest uppercase">Agence Digitale Premium</p>
                                <div className="mt-4 text-sm text-slate-600 space-y-1">
                                    <p>123 Avenue des Champs-Élysées</p>
                                    <p>75008 Paris, France</p>
                                    <p>contact@jannah.agency</p>
                                    <p>SIRET: 123 456 789 00012</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
                                    {isQuote ? 'Devis' : 'Facture'}
                                </h2>
                                <p className="text-lg text-slate-500 font-mono mt-2 flex justify-end gap-2">
                                    <span className="font-bold text-slate-400">N°</span>
                                    <span className="text-slate-900 font-bold">{docNumber}</span>
                                </p>
                            </div>
                        </div>

                        {/* Client Info & Meta */}
                        <div className="grid grid-cols-2 gap-8 mb-16">
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Facturé à</h3>
                                <p className="text-xl font-bold text-slate-900">{clientData.name}</p>
                                {clientData.company_name && <p className="text-sm text-slate-700 font-bold mt-1">{clientData.company_name}</p>}
                                {clientData.email && <p className="text-sm text-slate-600 mt-1">{clientData.email}</p>}
                                {clientData.phone && <p className="text-sm text-slate-600 m-0">{clientData.phone}</p>}
                            </div>
                            <div className="text-right flex flex-col items-end gap-4">
                                <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg w-64">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{dateLabel}</p>
                                    <p className="text-base text-slate-900 font-bold">{dateStr}</p>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg w-64">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{expiryLabel}</p>
                                    <p className="text-base text-slate-900 font-bold">{expiryStr}</p>
                                </div>
                            </div>
                        </div>

                        {/* Line Items Table */}
                        <div className="flex-1">
                            <table className="w-full text-left border-collapse mb-12">
                                <thead>
                                    <tr className="border-b-2 border-slate-800">
                                        <th className="py-4 px-4 text-xs font-bold text-slate-900 uppercase tracking-widest bg-slate-50 rounded-tl-lg">Description</th>
                                        <th className="py-4 px-4 text-xs font-bold text-slate-900 uppercase tracking-widest text-center bg-slate-50">Qté</th>
                                        <th className="py-4 px-4 text-xs font-bold text-slate-900 uppercase tracking-widest text-right bg-slate-50 rounded-tr-lg">Prix Unitaire</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-slate-100">
                                    {items.length > 0 ? items.map((item, i) => (
                                        <tr key={i}>
                                            <td className="py-5 px-4 font-bold text-slate-800">{item.description}</td>
                                            <td className="py-5 px-4 text-center font-mono font-medium text-slate-600">{item.quantity}</td>
                                            <td className="py-5 px-4 text-right font-mono font-bold text-slate-900">{(item.unit_price || 0).toLocaleString('fr-FR')} €</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td className="py-5 px-4 font-bold text-slate-800">Prestation globale (Création web, SEO, Ads)</td>
                                            <td className="py-5 px-4 text-center font-mono font-medium text-slate-600">1</td>
                                            <td className="py-5 px-4 text-right font-mono font-bold text-slate-900">{subtotal.toLocaleString('fr-FR')} €</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals Section */}
                        <div className="flex justify-end mb-16 mt-8">
                            <div className="w-80 bg-slate-50 rounded-xl p-6 border border-slate-100">
                                <div className="flex justify-between py-2 text-sm">
                                    <span className="text-slate-500 font-bold uppercase tracking-widest">Sous-total HT</span>
                                    <span className="font-mono font-bold text-slate-900">{subtotal.toLocaleString('fr-FR')} €</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-200 text-sm mb-4">
                                    <span className="text-slate-500 font-bold uppercase tracking-widest">TVA ({taxRate}%)</span>
                                    <span className="font-mono font-bold text-slate-900">{(total - subtotal).toLocaleString('fr-FR')} €</span>
                                </div>
                                <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-lg shadow-inner">
                                    <span className="text-sm font-black uppercase tracking-widest">Total TTC</span>
                                    <span className="text-xl font-mono font-black text-primary">{total.toLocaleString('fr-FR')} €</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t-2 border-slate-100 pt-8 text-center mt-auto">
                            <p className="text-sm text-slate-900 font-bold">
                                Merci pour votre confiance !
                            </p>
                            <p className="text-xs text-slate-400 mt-2 font-medium">
                                En cas de question concernant cette {isQuote ? 'proposition' : 'facture'}, n'hésitez pas à nous contacter à contact@jannah.agency
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">
                                SIRET: 123 456 789 00012 • TVA Intracommunautaire: FR 12 345678900
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
