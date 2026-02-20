// src/components/chat/ChatPanel.jsx
import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Copy, Check } from 'lucide-react';
import { sendMessageToGemini } from '../../services/gemini';

function ChatMessage({ msg }) {
    const isBot = msg.sender === 'bot';
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(msg.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4 animate-fade-in-up group`}>
            {isBot && (
                <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                    <Bot size={14} className="text-secondary" />
                </div>
            )}
            <div className={`max-w-[85%] relative ${isBot ? '' : ''}`}>
                <div className={`p-3 rounded-2xl text-sm leading-relaxed ${isBot
                    ? 'bg-surface-dark text-slate-200 rounded-tl-sm border border-white/5'
                    : 'bg-primary text-white rounded-tr-sm'
                    }`}>
                    {isBot && (
                        <div className="text-[10px] text-secondary font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
                            Jannah AI
                        </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                {isBot && (
                    <button
                        onClick={handleCopy}
                        className="absolute -bottom-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-surface-dark rounded-lg border border-white/5 text-slate-400 hover:text-white"
                    >
                        {copied ? <Check size={12} className="text-secondary" /> : <Copy size={12} />}
                    </button>
                )}
            </div>
        </div>
    );
}

export default function ChatPanel({ isOpen, onClose, initialMessage, onMessageSent, currentUser }) {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (currentUser && messages.length === 0) {
            // Only set/reset if history is empty
            setMessages([
                { id: 'greeting', sender: 'bot', text: `Bonjour ${currentUser.name || '...'} ! 👋 Je suis votre assistant Jannah Intelligence. Je peux vous aider avec l'analyse de performance, la génération de contenu, les stratégies SEO, et bien plus. Comment puis-je vous aider aujourd'hui ?` }
            ]);
        }
    }, [currentUser?.id, currentUser?.name, messages.length]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (initialMessage && isOpen) {
            setInput(initialMessage);
            inputRef.current?.focus();
        }
    }, [initialMessage, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = { id: Date.now(), sender: 'user', text: input.trim() };
        const currentInput = input.trim();
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        if (onMessageSent) onMessageSent(currentInput);

        try {
            const response = await sendMessageToGemini(currentInput, messages, currentUser);
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: response }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'bot',
                text: error.message.includes("Erreur IA") ? error.message : "Désolé, une erreur s'est produite. Veuillez vérifier votre connexion et réessayer."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const quickPrompts = [
        "Analyse mes KPIs du mois",
        "Génère un email de relance",
        "Optimise ma campagne Ads",
        "Crée un plan SEO",
    ];

    return (
        <div className={`
      fixed inset-y-0 right-0 w-full sm:w-96 bg-[#152636] border-l border-white/5
      shadow-2xl z-40 flex flex-col transition-transform duration-300
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}
    `}>
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-surface-dark flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Bot size={18} className="text-secondary" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">Assistant Jannah</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
                            <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider">Gemini 2.0 Flash</span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                    <X size={18} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {messages.map(msg => <ChatMessage key={msg.id} msg={msg} />)}

                {isLoading && (
                    <div className="flex justify-start mb-4">
                        <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center mr-2 flex-shrink-0">
                            <Bot size={14} className="text-secondary" />
                        </div>
                        <div className="bg-surface-dark border border-white/5 rounded-2xl rounded-tl-sm p-3">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Quick prompts */}
            {messages.length === 1 && (
                <div className="px-4 pb-2 flex flex-wrap gap-2">
                    {quickPrompts.map(prompt => (
                        <button
                            key={prompt}
                            onClick={() => setInput(prompt)}
                            className="text-xs px-3 py-1.5 bg-surface-dark border border-white/5 hover:border-primary/50 text-slate-400 hover:text-white rounded-lg transition-all"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-white/5 flex-shrink-0">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Posez votre question..."
                        className="flex-1 bg-surface-dark text-sm text-white rounded-xl px-4 py-2.5 border border-white/5 focus:border-primary outline-none transition-all placeholder-slate-500"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="p-2.5 bg-primary hover:bg-green-700 text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/20 active:scale-95"
                    >
                        <Send size={16} />
                    </button>
                </form>
            </div>
        </div>
    );
}
