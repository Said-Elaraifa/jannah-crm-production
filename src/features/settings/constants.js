import { Sparkles, Bot, Megaphone, Share2, MessageSquare, Zap, CreditCard, BarChart3, Mail, Database, ShoppingBag, Code, Search, Monitor } from 'lucide-react';

export const INTEGRATION_CATALOG = [
    {
        name: 'Claude (Anthropic)',
        slug: 'claude',
        icon: Sparkles,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
        category: 'AI',
        description: 'Modèles de langage avancés pour l\'automatisation des tâches complexes.',
        fields: [{ key: 'apiKey', label: 'Claude API Key', type: 'password', placeholder: 'sk-ant-...' }]
    },
    {
        name: 'OpenAI (ChatGPT)',
        slug: 'openai',
        icon: Bot,
        color: 'text-green-400',
        bg: 'bg-green-500/10',
        category: 'AI',
        description: 'Intégration de GPT-4o pour la génération de contenu et l\'analyse.',
        fields: [{ key: 'apiKey', label: 'OpenAI API Key', type: 'password', placeholder: 'sk-...' }]
    },
    {
        name: 'Meta Ads (Facebook)',
        slug: 'meta-ads',
        icon: Megaphone,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        category: 'Marketing',
        description: 'Synchronisation des performances publicitaires Facebook & Instagram.',
        fields: [
            { key: 'pixelId', label: 'ID Pixel', type: 'text', placeholder: '123456...' },
            { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: '...' }
        ]
    },
    {
        name: 'TikTok Ads',
        slug: 'tiktok-ads',
        icon: Share2,
        color: 'text-pink-500',
        bg: 'bg-pink-500/10',
        category: 'Marketing',
        description: 'Gestion des campagnes TikTok Ads directement dans le CRM.',
        fields: [{ key: 'advId', label: 'Advertiser ID', type: 'text', placeholder: '...' }]
    },
    {
        name: 'LinkedIn Ads',
        slug: 'linkedin-ads',
        icon: Share2,
        color: 'text-blue-700',
        bg: 'bg-blue-700/10',
        category: 'Marketing',
        fields: [{ key: 'account_id', label: 'Account ID', type: 'text', placeholder: '...' }]
    },
    {
        name: 'Slack',
        slug: 'slack',
        icon: MessageSquare,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        category: 'Productivity',
        description: 'Alertes et notifications en temps réel sur vos canaux Slack.',
        fields: [{ key: 'webhookUrl', label: 'Webhook URL', type: 'text', placeholder: 'https://hooks.slack.com/...' }]
    },
    {
        name: 'Zapier',
        slug: 'zapier',
        icon: Zap,
        color: 'text-orange-500',
        bg: 'bg-orange-500/10',
        category: 'Productivity',
        description: 'Connectez le CRM à plus de 5000+ applications.',
        fields: [{ key: 'apiKey', label: 'Zapier API Key', type: 'password', placeholder: '...' }]
    },
    {
        name: 'Stripe',
        slug: 'stripe',
        icon: CreditCard,
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10',
        category: 'Finance',
        fields: [
            { key: 'publishableKey', label: 'Publishable Key', type: 'text', placeholder: 'pk_...' },
            { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'sk_...' }
        ]
    },
    {
        name: 'Google Analytics 4',
        slug: 'ga4',
        icon: BarChart3,
        color: 'text-yellow-500',
        bg: 'bg-yellow-500/10',
        category: 'Analytics',
        fields: [{ key: 'measurementId', label: 'Measurement ID', type: 'text', placeholder: 'G-...' }]
    },
    {
        name: 'Mailchimp',
        slug: 'mailchimp',
        icon: Mail,
        color: 'text-yellow-400',
        bg: 'bg-yellow-400/5',
        category: 'Marketing',
        fields: [{ key: 'apiKey', label: 'API Key', type: 'password', placeholder: '...' }]
    },
    {
        name: 'Notion',
        slug: 'notion',
        icon: Database,
        color: 'text-white',
        bg: 'bg-white/10',
        category: 'Productivity',
        fields: [{ key: 'token', label: 'Internal Integration Token', type: 'password', placeholder: 'secret_...' }]
    },
    {
        name: 'Shopify',
        slug: 'shopify',
        icon: ShoppingBag,
        color: 'text-green-500',
        bg: 'bg-green-500/10',
        category: 'E-commerce',
        fields: [{ key: 'shopUrl', label: 'Shop URL', type: 'text', placeholder: 'name.myshopify.com' }]
    },
    {
        name: 'GitHub',
        slug: 'github',
        icon: Code,
        color: 'text-slate-200',
        bg: 'bg-white/5',
        category: 'Dev',
        fields: [{ key: 'token', label: 'Personal Access Token', type: 'password', placeholder: 'ghp_...' }]
    },
    {
        name: 'Gemini 2.0 Flash',
        slug: 'gemini',
        icon: Bot,
        color: 'text-secondary',
        bg: 'bg-secondary/10',
        category: 'AI',
        fields: [{ key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'AIzaSy...' }]
    },
    {
        name: 'Perplexity AI',
        slug: 'perplexity',
        icon: Search,
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        category: 'AI',
        fields: [{ key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'pplx-...' }]
    },
    {
        name: 'ElevenLabs',
        slug: 'elevenlabs',
        icon: Monitor,
        color: 'text-purple-600',
        bg: 'bg-purple-600/10',
        category: 'AI',
        fields: [{ key: 'apiKey', label: 'API Key', type: 'password', placeholder: '...' }]
    }
];

export const AUDIT_LOGS = [
    { id: 1, action: "User Created", target: "Sarah Connor", admin: "Ismael", time: "2h ago" },
    { id: 2, action: "Role Changed", target: "Ghassen (Sales -> Admin)", admin: "Ismael", time: "5h ago" },
    { id: 3, action: "API Key Revoked", target: "DeepSeek V3", admin: "Said", time: "1d ago" },
];
