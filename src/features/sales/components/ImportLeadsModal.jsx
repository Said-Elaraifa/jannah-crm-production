import { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, Check, Loader2 } from 'lucide-react';

/**
 * Parses raw CSV text into an array of objects.
 * Handles quoted fields (including commas inside quotes).
 */
function parseCSV(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return [];

    // Parse a single CSV line respecting quoted fields
    const parseLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
                inQuotes = !inQuotes;
            } else if ((ch === ',' || ch === ';') && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += ch;
            }
        }
        result.push(current.trim());
        return result;
    };

    const headers = parseLine(lines[0]);
    return lines.slice(1).map(line => {
        const values = parseLine(line);
        const obj = {};
        headers.forEach((h, i) => { obj[h] = values[i] || ''; });
        return obj;
    });
}

export function ImportLeadsModal({ isOpen, onClose, onImport }) {
    const [parsedRows, setParsedRows] = useState([]);
    const [fileName, setFileName] = useState('');
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const fileRef = useRef();

    if (!isOpen) return null;

    const handleFile = (file) => {
        if (!file) return;
        setFileName(file.name);
        setError(null);
        setResult(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const rows = parseCSV(e.target.result);
                if (rows.length === 0) {
                    setError('Fichier vide ou format invalide.');
                    return;
                }
                setParsedRows(rows);
            } catch {
                setError('Erreur de parsing du fichier CSV.');
            }
        };
        reader.readAsText(file, 'UTF-8');
    };

    const handleImport = async () => {
        setImporting(true);
        try {
            const count = await onImport(parsedRows);
            setResult(`${count} leads importés avec succès !`);
            setParsedRows([]);
            setFileName('');
        } catch (err) {
            setError(`Erreur d'import: ${err.message}`);
        } finally {
            setImporting(false);
        }
    };

    const handleClose = () => {
        setParsedRows([]);
        setFileName('');
        setError(null);
        setResult(null);
        onClose();
    };

    const previewHeaders = parsedRows.length > 0 ? Object.keys(parsedRows[0]) : [];
    const previewRows = parsedRows.slice(0, 5);

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" style={{ zIndex: 9999 }} onClick={handleClose}>
            <div className="bg-surface-dark w-full max-w-2xl rounded-[2rem] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] animate-zoom-in overflow-hidden" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex justify-between items-center p-8 border-b border-white/5">
                    <h3 className="text-xl md:text-2xl font-display font-bold text-white flex items-center gap-3">
                        <FileSpreadsheet size={20} className="text-accent" />
                        Importer des Leads
                    </h3>
                    <button onClick={handleClose} className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg"><X size={18} /></button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">

                    {/* Info */}
                    <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex gap-3 items-start">
                        <AlertCircle size={16} className="text-accent flex-shrink-0 mt-0.5" />
                        <div className="text-[10px] md:text-xs text-slate-400 leading-relaxed">
                            <p className="font-black text-white uppercase tracking-widest mb-1">Format CSV requis</p>
                            <p>Colonnes recommandées : <span className="text-accent font-bold">Nom, Email, Tel, Entreprise, Source, Valeur</span></p>
                            <p className="mt-1">La colonne <span className="font-bold text-white">Source</span> (ou <span className="font-bold text-white">Réseau</span>) détermine le classement automatique par réseau social.</p>
                        </div>
                    </div>

                    {/* Upload Zone */}
                    <div
                        onClick={() => fileRef.current?.click()}
                        className={`flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
                            ${fileName
                                ? 'border-accent/30 bg-accent/5'
                                : 'border-white/10 bg-white/2 hover:border-white/20 hover:bg-white/5'
                            }`}
                    >
                        <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={e => handleFile(e.target.files[0])} />
                        <Upload size={24} className={fileName ? 'text-accent' : 'text-slate-500'} />
                        {fileName ? (
                            <p className="text-xs text-accent font-black uppercase tracking-widest">{fileName} ({parsedRows.length} lignes)</p>
                        ) : (
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Glisser un fichier CSV ou <span className="text-accent underline">parcourir</span></p>
                        )}
                    </div>

                    {/* Preview Table */}
                    {previewHeaders.length > 0 && (
                        <div className="rounded-xl overflow-hidden border border-white/10">
                            <div className="overflow-x-auto">
                                <table className="w-full text-[10px]">
                                    <thead>
                                        <tr className="bg-white/5 border-b border-white/5">
                                            {previewHeaders.map(h => (
                                                <th key={h} className="px-3 py-2 text-left font-black uppercase tracking-widest text-accent">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewRows.map((row, i) => (
                                            <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                {previewHeaders.map(h => (
                                                    <td key={h} className="px-3 py-2 text-slate-400 truncate max-w-[150px]">{row[h]}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {parsedRows.length > 5 && (
                                <div className="px-3 py-2 bg-white/5 text-[9px] text-slate-500 font-bold text-center">
                                    + {parsedRows.length - 5} autres lignes…
                                </div>
                            )}
                        </div>
                    )}

                    {/* Error / Success */}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
                            <AlertCircle size={14} className="text-red-400" />
                            <p className="text-xs text-red-400 font-bold">{error}</p>
                        </div>
                    )}
                    {result && (
                        <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-2">
                            <Check size={14} className="text-secondary" />
                            <p className="text-xs text-secondary font-bold">{result}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 flex gap-3">
                    <button type="button" onClick={handleClose} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors">
                        Annuler
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={parsedRows.length === 0 || importing}
                        className="flex-1 py-3 bg-gradient-to-r from-accent to-yellow-500 hover:from-yellow-400 hover:to-yellow-300 text-bg-dark font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg shadow-accent/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {importing ? (
                            <><Loader2 size={14} className="animate-spin" /> Import...</>
                        ) : (
                            <><FileSpreadsheet size={14} /> Importer {parsedRows.length > 0 ? `(${parsedRows.length})` : ''}</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
