import { memo, useState } from 'react';
import { Image, FileText, ShieldCheck, ExternalLink, Download, Eye, Check } from 'lucide-react';

// eslint-disable-next-line no-unused-vars
export const InfoRow = memo(({ label, value, icon: Icon }) => (
    <div className="flex items-center justify-between p-4 bg-surface-dark rounded-xl border border-white/5">
        <div className="flex items-center gap-3 text-slate-400">
            <Icon size={14} />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-sm font-bold text-white">{value || 'N/A'}</span>
    </div>
));
InfoRow.displayName = 'InfoRow';

// eslint-disable-next-line no-unused-vars
export const SectionBlock = memo(({ title, icon: Icon, children }) => (
    <div className="space-y-4">
        <h4 className="flex items-center gap-3 text-[10px] md:text-xs font-black uppercase tracking-widest text-accent/60 mb-6">
            <Icon size={12} />
            {title}
        </h4>
        <div className="grid grid-cols-1 gap-3">
            {children}
        </div>
    </div>
));
SectionBlock.displayName = 'SectionBlock';

// Extract a readable filename from a Supabase storage URL
function getFileName(url) {
    if (!url) return null;
    try {
        const parts = decodeURIComponent(url).split('/');
        // The filename is the last part, strip any query string
        const raw = parts[parts.length - 1].split('?')[0];
        // Remove the timestamp prefix (e.g. "1772300000000.pdf" -> keep full)
        return raw;
    } catch {
        return 'fichier';
    }
}

// Force-download a file via fetch → blob (bypasses browser inline preview for PDFs/ZIPs)
async function forceDownload(url, filename) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename || 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch (e) {
        // Fallback: open in new tab
        window.open(url, '_blank', 'noopener,noreferrer');
    }
}

export const FileRow = memo(({ label, url, type }) => {
    const [downloading, setDownloading] = useState(false);
    const [downloaded, setDownloaded] = useState(false);
    const fileName = getFileName(url);

    const handleDownload = async () => {
        if (!url) return;
        setDownloading(true);
        await forceDownload(url, fileName);
        setDownloading(false);
        setDownloaded(true);
        setTimeout(() => setDownloaded(false), 2500);
    };

    return (
        <div className={`flex items-center justify-between p-4 rounded-xl border transition-all group ${url ? 'bg-surface-dark border-white/5 hover:border-white/10' : 'bg-black/10 border-white/3 opacity-50'}`}>
            <div className="flex items-center gap-4 min-w-0">
                <div className={`p-3 rounded-xl transition-colors flex-shrink-0 ${url ? 'bg-black/20 text-slate-500 group-hover:text-accent' : 'bg-black/10 text-slate-700'}`}>
                    {type === 'image' ? <Image size={16} /> : <FileText size={16} />}
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-0.5">{label}</p>
                    {url ? (
                        <p className="text-xs font-bold text-slate-300 truncate max-w-[180px]" title={fileName}>{fileName}</p>
                    ) : (
                        <p className="text-sm font-bold text-slate-600 italic">Non fourni</p>
                    )}
                </div>
            </div>

            {url && (
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    {/* Preview / Open */}
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Ouvrir dans un nouvel onglet"
                        className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-blue-400 transition-colors"
                    >
                        <Eye size={15} />
                    </a>
                    {/* Force Download */}
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        title="Télécharger le fichier"
                        className={`p-2 rounded-lg transition-all ${downloaded
                            ? 'text-green-400 bg-green-500/10'
                            : 'text-slate-500 hover:text-accent hover:bg-accent/10'
                            } disabled:opacity-50`}
                    >
                        {downloaded
                            ? <Check size={15} />
                            : <Download size={15} className={downloading ? 'animate-bounce' : ''} />
                        }
                    </button>
                </div>
            )}
        </div>
    );
});
FileRow.displayName = 'FileRow';

// eslint-disable-next-line no-unused-vars
export const TimelineItem = memo(({ icon: Icon, title, date, description, colorClass = "text-slate-400" }) => (
    <div className="relative pl-8 pb-10 last:pb-0 group">
        <div className="absolute left-0 top-0 h-full w-[2px] bg-white/5 group-last:h-2" />
        <div className={`absolute left-[-9px] top-0 w-5 h-5 rounded-full bg-bg-dark border-2 border-white/10 flex items-center justify-center z-10 ${colorClass}`}>
            <Icon size={10} />
        </div>
        <div className="space-y-1">
            <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500">{date}</p>
            <h5 className="text-base font-bold text-white group-hover:text-accent transition-colors">{title}</h5>
            {description && <p className="text-sm text-slate-400 leading-relaxed italic">{description}</p>}
        </div>
    </div>
));
TimelineItem.displayName = 'TimelineItem';

export function SectionHeader({ title, description, action }) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest text-accent mb-3">
                    <ShieldCheck size={14} />
                    <span>Jannah Agency OS</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight mb-4">
                    {title}
                </h2>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                    {description}
                </p>
            </div>
            <div className="flex items-center gap-3">
                {action}
            </div>
        </div>
    );
}
