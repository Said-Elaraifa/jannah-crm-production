import { useState, useEffect, useRef } from 'react';
import { Send, Mail, MessageCircle, Send as SendOutline, Loader2 } from 'lucide-react';
import { getClientMessages, sendMessage } from '../../../services/messages';
import { supabase } from '../../../services/supabase';
import { CustomSelect } from '../../../components/ui/CustomSelect';

// Helper Map for Channel styling
const CHANNEL_CONFIG = {
    'email': { icon: Mail, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    'whatsapp': { icon: MessageCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
    'linkedin': { icon: SendOutline, color: 'text-sky-400', bg: 'bg-sky-400/10' }
};

export function OmnichannelChat({ clientId, clientName }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    // Controlled inputs
    const [draft, setDraft] = useState('');
    const [selectedChannel, setSelectedChannel] = useState('email');

    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!clientId) return;

        // Initial Fetch
        fetchMessages();

        // Realtime Subscription
        const subscription = supabase
            .channel(`messages_for_${clientId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `client_id=eq.${clientId}` },
                (payload) => {
                    setMessages(prev => [...prev, payload.new]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [clientId]);

    useEffect(() => {
        // Auto-scroll on new message
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const data = await getClientMessages(clientId);
            setMessages(data || []);
        } catch (error) {
            console.error("Failed to load chat:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!draft.trim()) return;

        setSending(true);
        try {
            await sendMessage(clientId, draft.trim(), selectedChannel);
            setDraft(''); // Clear input
            // Optimistic update isn't strictly necessary since we have a realtime channel listener,
            // but the listener will pick it up instantly.
        } catch (error) {
            alert("Erreur d'envoi du message: " + error.message);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center text-slate-500 font-bold">
                <Loader2 className="animate-spin mr-2" size={18} /> Chargement de l'historique...
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-surface-darker/50 rounded-2xl border border-white/5 overflow-hidden">

            {/* Chat History Viewport */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
                        <MessageCircle size={32} className="mb-3 opacity-20" />
                        <p className="font-bold text-slate-400 mb-1">Journal de Communications</p>
                        <p className="text-center max-w-xs text-xs">
                            Aucun échange enregistré avec {clientName}.<br />
                            Gardez une trace de vos emails, appels ou messages WhatsApp ici.
                        </p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isOutbound = msg.direction === 'outbound';
                        const config = CHANNEL_CONFIG[msg.channel] || CHANNEL_CONFIG['email'];
                        const Icon = config.icon;
                        const dateCode = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                        return (
                            <div key={msg.id || idx} className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-xl ${isOutbound
                                    ? 'bg-primary/20 border border-primary/30 text-white rounded-br-sm'
                                    : 'bg-white/5 border border-white/10 text-slate-300 rounded-bl-sm'
                                    }`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`p-1.5 rounded-lg ${config.bg} ${config.color}`}>
                                            <Icon size={12} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                            {isOutbound ? 'Vous' : clientName} • {dateCode}
                                        </span>
                                    </div>
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-surface-dark">
                <form onSubmit={handleSend} className="relative">
                    <div className="flex bg-black/40 border border-white/10 rounded-2xl overflow-hidden focus-within:border-primary/50 transition-colors">

                        {/* Channel Selector */}
                        <div className="w-36 border-r border-white/5">
                            <CustomSelect
                                value={selectedChannel}
                                onChange={setSelectedChannel}
                                options={[
                                    { value: 'email', label: 'Email' },
                                    { value: 'whatsapp', label: 'WhatsApp' },
                                    { value: 'linkedin', label: 'LinkedIn' },
                                    { value: 'call', label: 'Appel' }
                                ]}
                                className="!border-0 !rounded-none !bg-transparent !px-3"
                            />
                        </div>

                        {/* Message Input */}
                        <input
                            type="text"
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            placeholder="Consigner un message dans l'historique..."
                            className="flex-1 bg-transparent text-sm text-white px-4 py-3 focus:outline-none placeholder-slate-600"
                            disabled={sending}
                        />

                        {/* Send Button */}
                        <button
                            type="submit"
                            disabled={!draft.trim() || sending}
                            title="Enregistrer dans l'historique CRM"
                            className="bg-primary/20 hover:bg-primary/30 text-primary disabled:opacity-50 disabled:hover:bg-primary/20 px-5 flex items-center justify-center transition-colors border-l border-primary/20"
                        >
                            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} strokeWidth={2.5} />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
