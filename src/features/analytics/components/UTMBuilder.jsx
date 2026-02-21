import { useState, useEffect } from 'react';
import { Link as LinkIcon, Copy } from 'lucide-react';
import { CustomSelect } from '../../../components/ui/CustomSelect';

export function UTMBuilder() {
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
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setGeneratedUrl(baseUrl.toString());
        } catch {
            setGeneratedUrl('');
        }
    }, [url, params]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedUrl);
        alert("URL copiée !");
    };

    return (
        <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 animate-fade-in-up">
            <h3 className="text-base md:text-lg font-bold text-white mb-6 flex items-center gap-3">
                <LinkIcon size={20} className="text-accent" /> UTM Builder Standardisé
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">URL de destination</label>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://monsite.com/landing"
                            className="w-full bg-black/40 text-sm font-bold rounded-xl px-4 py-3 border border-white/10 focus:border-accent/40 outline-none transition-all placeholder:text-slate-700 text-white"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Source</label>
                            <CustomSelect
                                value={params.source}
                                onChange={val => setParams({ ...params, source: val })}
                                options={[
                                    { value: 'facebook', label: 'facebook' },
                                    { value: 'google', label: 'google' },
                                    { value: 'instagram', label: 'instagram' },
                                    { value: 'linkedin', label: 'linkedin' },
                                    { value: 'tiktok', label: 'tiktok' },
                                    { value: 'email', label: 'email' }
                                ]}
                                className="text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Medium</label>
                            <CustomSelect
                                value={params.medium}
                                onChange={val => setParams({ ...params, medium: val })}
                                options={[
                                    { value: 'cpc', label: 'cpc' },
                                    { value: 'organic', label: 'organic' },
                                    { value: 'social', label: 'social' },
                                    { value: 'email', label: 'email' }
                                ]}
                                className="text-white"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Campaign Name</label>
                        <input
                            type="text"
                            value={params.campaign}
                            onChange={(e) => setParams({ ...params, campaign: e.target.value })}
                            placeholder="ex: summer_sale_2024"
                            className="w-full bg-black/40 text-sm font-bold rounded-xl px-4 py-3 border border-white/10 focus:border-accent/40 outline-none transition-all placeholder:text-slate-700 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Ad Content (Optionnel)</label>
                        <input
                            type="text"
                            value={params.content}
                            onChange={(e) => setParams({ ...params, content: e.target.value })}
                            placeholder="ex: video_v1_blue"
                            className="w-full bg-black/40 text-sm font-bold rounded-xl px-4 py-3 border border-white/10 focus:border-accent/40 outline-none transition-all placeholder:text-slate-700 text-white"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-6 p-4 bg-black/40 rounded-xl border border-white/10 flex items-center gap-4">
                <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-2">URL Générée :</p>
                    <p className="text-sm text-accent font-mono font-bold truncate">{generatedUrl}</p>
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
