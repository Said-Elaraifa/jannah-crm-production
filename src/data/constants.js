// src/data/constants.js
// Global constants and initial data for Jannah CRM

export const GEMINI_API_KEY = "AIzaSyAdHArjAtR4ca86-7EE1r5hEz1ZghheUxw";

// Role Definitions
export const ROLES = {
    ADMIN: { id: 'admin', label: 'Admin (CEO)', permissions: ['all'] },
    TECH: { id: 'tech', label: 'Tech Lead', permissions: ['tech_dashboard', 'manage_sops', 'view_all'] },
    SALES: { id: 'sales', label: 'Sales Manager', permissions: ['sales_dashboard', 'manage_leads'] },
    VIEWER: { id: 'viewer', label: 'Spectateur', permissions: ['view_only'] }
};

export const TEAM_MEMBERS = [
    { id: 1, name: "Ismael", role: "CEO", roleId: 'admin', initial: "I", color: "bg-accent", textColor: "text-[#12202c]", access: "Admin", email: "ismael@jannah.co", status: "Active" },
    { id: 2, name: "Said", role: "COO / Dev", roleId: 'tech', initial: "S", color: "bg-blue-500", textColor: "text-white", access: "Tech", email: "said@jannah.co", status: "Active" },
    { id: 3, name: "Ghassen", role: "Sales", roleId: 'sales', initial: "G", color: "bg-secondary", textColor: "text-primary", access: "Sales", email: "ghassen@jannah.co", status: "Active" },
];

export const MOCK_CURRENT_USER = TEAM_MEMBERS[0]; // Default to Ismael

export const KPIS_DATA = [
    { id: 1, label: "MRR (Revenus)", value: "52,450€", change: "+12%", trend: "up", color: "text-green-400", bgColor: "bg-green-500/10", borderColor: "border-green-500/20" },
    { id: 2, label: "Total Clients", value: "1,250", change: "+5.4%", trend: "up", color: "text-accent", bgColor: "bg-accent/10", borderColor: "border-accent/20" },
    { id: 3, label: "Churn Rate", value: "1.2%", change: "-0.5%", trend: "down", color: "text-red-400", bgColor: "bg-red-500/10", borderColor: "border-red-500/20" },
    { id: 4, label: "Nouveaux Leads", value: "+320", change: "+18%", trend: "up", color: "text-blue-400", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/20" },
];

export const REVENUE_CHART_DATA = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû'],
    revenue: [30000, 35000, 32000, 45000, 42000, 55000, 52000, 60000],
    ads: [8000, 10000, 9000, 14000, 13000, 16000, 15000, 18000],
};

export const RECENT_ACTIVITY_DATA = [
    { id: 1, user: "So", userColor: "bg-secondary/20 text-primary", action: "Nouveau contrat signé", detail: "Site Standard (149€/mo)", time: "Il y a 2 min" },
    { id: 2, user: "Th", userColor: "bg-accent/20 text-yellow-700", action: "Ticket Tech ouvert", detail: "Update DNS client #402", time: "Il y a 15 min" },
    { id: 3, user: "IA", userColor: "bg-primary/30 text-white", action: "Score Lead Calculé", detail: "Lead #5092 qualifié 'Hot'", time: "Il y a 23 min" },
    { id: 4, user: "Ad", userColor: "bg-purple-500/20 text-purple-400", action: "Campagne Publiée", detail: "Google Ads - Q3 Push", time: "1h" },
];

export const ADS_KPIS_DATA = [
    { id: 1, label: "Dépenses Pub (30j)", value: "2,150€", change: "+5%", trend: "up", color: "text-slate-400", bgColor: "bg-slate-500/10" },
    { id: 2, label: "ROAS (Retour Pub)", value: "4.2x", change: "+0.3", trend: "up", color: "text-accent", bgColor: "bg-accent/10" },
    { id: 3, label: "CPL Moyen", value: "18.50€", change: "-12%", trend: "down", color: "text-secondary", bgColor: "bg-secondary/10" },
    { id: 4, label: "Impressions", value: "45k", change: "+8%", trend: "up", color: "text-blue-400", bgColor: "bg-blue-500/10" },
];

export const ADS_CAMPAIGNS_LIST = [
    { id: 1, name: "Search - 'Agence Web' Exact", platform: "Google Ads", status: "Active", spend: "1,250€", leads: 45, cpl: "27.7€", roas: "3.2x" },
    { id: 2, name: "Retargeting - Visiteurs 30j", platform: "Meta Ads", status: "Active", spend: "450€", leads: 38, cpl: "11.8€", roas: "5.8x" },
    { id: 3, name: "Brand Awareness - Jannah", platform: "Meta Ads", status: "Pausée", spend: "320€", leads: 12, cpl: "26.7€", roas: "1.9x" },
];

export const INITIAL_PIPELINE = [
    { id: 'l1', company: "Garage V. Auto", contact: "Vincent M.", value: 1500, stage: 'new', score: 45, source: "Google Ads", email: "vincent@garage.fr", phone: "+33 6 12 34 56 78", notes: "Intéressé par site vitrine", assignedTo: "Gassene", createdAt: "2024-11-10" },
    { id: 'l2', company: "Boulangerie Pâtisserie", contact: "Marie L.", value: 3000, stage: 'qualified', score: 85, source: "SEO", email: "marie@boulangerie.fr", phone: "+33 6 98 76 54 32", notes: "Besoin urgent refonte site", assignedTo: "Gassene", createdAt: "2024-11-08" },
    { id: 'l3', company: "Startup TechFlow", contact: "Karim B.", value: 12000, stage: 'proposal', score: 92, source: "LinkedIn", email: "karim@techflow.io", phone: "+33 6 55 44 33 22", notes: "Projet e-commerce + SEO", assignedTo: "Ismael", createdAt: "2024-11-05" },
    { id: 'l4', company: "Cabinet Juridique Moreau", contact: "Sophie M.", value: 2500, stage: 'won', score: 98, source: "Référence", email: "s.moreau@cabinet.fr", phone: "+33 6 11 22 33 44", notes: "Contrat signé - onboarding en cours", assignedTo: "Gassene", createdAt: "2024-10-28" },
];

export const INITIAL_CLIENTS = [
    {
        id: 1,
        name: "Clinique du Sud",
        project: "Refonte Site Web",
        status: "En Développement",
        progress: 65,
        url: "dev.clinique.fr",
        plan: "Standard (149€/mo)",
        lastUpdate: "Hier",
        statusColor: "text-blue-400 bg-blue-400/10",
        cahierDesChargesCompleted: false,
        cahierDesChargesData: null,
        lovablePrompt: null,
        slug: "clinique-du-sud-abc123",
        email: "contact@clinique-sud.fr",
        phone: "+33 4 91 12 34 56",
        assignedTo: "Said",
    },
    {
        id: 2,
        name: "Pizzeria Napoli",
        project: "Site Vitrine + SEO",
        status: "En Ligne",
        progress: 100,
        url: "pizzeria-napoli.com",
        plan: "Mini (79€/mo)",
        lastUpdate: "3j",
        statusColor: "text-secondary bg-secondary/10",
        cahierDesChargesCompleted: true,
        cahierDesChargesData: {
            companyName: "Pizzeria Napoli",
            activity: "Restaurant",
            projectType: "Vitrine",
            style: "Chaleureux & Moderne",
            colors: "#e63946, #f1faee, #1d3557",
            features: ["Menu en ligne", "Réservation", "Galerie photos", "Contact"],
            targetAudience: "Familles et couples locaux",
            competitors: "pizzeria-roma.fr",
            budget: "79€/mo",
            deadline: "2 semaines",
        },
        lovablePrompt: null,
        slug: "pizzeria-napoli-def456",
        email: "napoli@pizzeria.fr",
        phone: "+33 4 93 56 78 90",
        assignedTo: "Said",
    },
];

export const INITIAL_SOPS = [
    {
        id: 1,
        title: "Onboarding Nouveau Client (V2.0 Automated)",
        category: "Sales",
        type: "Checklist",
        lastUpdated: "12 Oct 2024",
        author: "Ghassen",
        content: "### Phase 1 : Pré-Kickoff\n1. [ ] Envoyer email de bienvenue (Template #ONB-01)\n2. [ ] Créer dossier Drive partagé + Slack channel\n3. [ ] Envoyer questionnaire de pré-qualification technique\n\n### Phase 2 : Kickoff Call (45 min)\n1. [ ] Présentation de l'équipe dédiée\n2. [ ] Review des objectifs KPI (SMART)\n3. [ ] Validation du planning prévisionnel\n\n### Phase 3 : Setup\n1. [ ] Accès Analytics & Ads Manager récupérés\n2. [ ] Audit technique initial lancé (Screaming Frog)\n3. [ ] Premier rapport à J+7"
    },
    {
        id: 2,
        title: "Protocole de Gestion de Crise (Site Down)",
        category: "Tech",
        type: "Guide",
        lastUpdated: "Hier",
        author: "Said",
        content: "### 🚨 URGENT : SITE CLIENT INACCESSIBLE\n\n**Étape 1 : Diagnostic Rapide (5 min)**\n- Vérifier statut hébergeur (Vercel Status, AWS Health)\n- Tester DNS (whatsmydns.net)\n- Vérifier déploiement récent (GitHub Actions)\n\n**Étape 2 : Communication Client**\n- Envoyer message type : 'Nous avons détecté une anomalie, équipe sur le coup.' (Ne pas promettre de délai avant diag complet)\n\n**Étape 3 : Résolution**\n- Si erreur 500 : Consulter logs serveur\n- Si erreur DNS : Contacter registrar\n- Si attaque DDoS : Activer Cloudflare Under Attack Mode\n\n**Post-Mortem**\n- Rédiger rapport d'incident sous 24h."
    },
    {
        id: 3,
        title: "Script de Closing High-Ticket (>5k€)",
        category: "Sales",
        type: "Document",
        lastUpdated: "05 Nov 2024",
        author: "Ismael",
        content: "**Philosophie** : Ne vendez pas, diagnostiquez.\n\n### 1. Le Cadre (The Frame)\n'Le but de cet appel est de voir si nous sommes un bon fit. Si oui, on avance. Si non, je vous recommanderai quelqu'un d'autre. Ça vous va ?'\n\n### 2. Douleur (Pain)\n'Pourquoi chercher une agence maintenant ? Qu'est-ce qui coûte de l'argent actuellement dans votre setup ?'\n\n### 3. Le Coût de l'Inaction\n'Si vous ne changez rien, où en sera votre CA dans 6 mois ?'\n\n### 4. La Solution (Le Pont)\n'D'après ce que vous me dites, vous avez besoin de X et Y. C'est exactement ce qu'on a fait pour [Client Similaire].'\n\n### 5. Closing\n'Voulez-vous qu'on règle ce problème ensemble ?'"
    },
    {
        id: 4,
        title: "Routine Hebdomadaire Account Manager",
        category: "Marketing",
        type: "Checklist",
        lastUpdated: "01 Nov 2024",
        author: "Ismael",
        content: "### Lundi : Audit & Planif\n- [ ] Review des dépenses Ads vs Budget Pacing\n- [ ] Check des KPIs (CPL, ROAS) vs S-1\n- [ ] Email hebdo 'Semaine à venir' aux clients focus\n\n### Mercredi : Optimisation\n- [ ] Kill des ads sous-performantes (< 1.5 ROAS)\n- [ ] Scale des winners (+20% budget)\n- [ ] Relance créas graphiste si fatigue publicitaire\n\n### Vendredi : Reporting\n- [ ] Préparation des Looms de fin de semaine\n- [ ] Mise à jour du CRM (Statuts, Notes)\n- [ ] Cleanup inbox"
    },
    {
        id: 5,
        title: "Récupération Compte Publicitaire Banni",
        category: "Marketing",
        type: "Guide",
        lastUpdated: "Aujourd'hui",
        author: "Ghassen",
        content: "### Cas 1 : Suspicion d'Activité Inhabituelle\n- Action : Vérifier méthode de paiement (nom CB = nom Admin)\n- Appel : Contacter support via Chat Pro (pas le formulaire auto)\n\n### Cas 2 : Violation de Policy (Contournement)\n- **Ne jamais admettre la faute directement**\n- Script : 'Nous pensons qu'il s'agit d'une erreur de l'IA. Notre landing page respecte les règles X et Y.'\n- Toujours demander une *Human Review*.\n\n### Plan B : Business Manager de Secours\n- Toujours avoir un BM 'Warm' prêt à prendre le relais (voir Process #BM-BACKUP)."
    }
];

export const INITIAL_AI_LOGS = [
    { id: 1, query: "Analyse les performances de notre campagne Google Ads du mois dernier et propose des optimisations.", user: "Ismael", date: "Aujourd'hui", category: "Analytics", status: "Success", tokens: 850 },
    { id: 2, query: "Génère un email de relance pour les leads qui n'ont pas répondu depuis 7 jours.", user: "Gassene", date: "Hier", category: "Sales", status: "Success", tokens: 420 },
    { id: 3, query: "Crée un plan de contenu SEO pour le mois de décembre ciblant les PME locales.", user: "Ismael", date: "Il y a 3j", category: "SEO", status: "Success", tokens: 1200 },
];

export const PROMPT_LIBRARY = [
    {
        id: 'p1',
        title: "Chain of Thought Strategy",
        category: "Strategy",
        tags: ["CoT", "Planning", "High Level"],
        template: "Agis comme un expert en stratégie {{domaine}}. Je veux atteindre {{objectif}}. \n\nRéfléchis étape par étape (Chain of Thought) :\n1. Analyse de la situation actuelle\n2. Identification des obstacles potentiels\n3. Élaboration de 3 scénarios stratégiques\n4. Recommandation finale avec plan d'action sur 30 jours.\n\nContexte additionnel : {{contexte}}",
        variables: ["domaine", "objectif", "contexte"],
        likes: 12
    },
    {
        id: 'p2',
        title: "Générateur de Hooks Viraux",
        category: "Content",
        tags: ["Social Media", "Copywriting", "Viral"],
        template: "Tu es un expert en copywriting viral pour {{plateforme}}.\n\nAnalyse le sujet suivant : {{sujet}}.\n\nGénère 10 accroches (hooks) basées sur ces cadres psychologiques :\n- La curiosité inassouvie\n- La peur de manquer (FOMO)\n- La promesse de résultat immédiat\n- La contrariété (Polarizing)\n\nPour chaque hook, explique brièvement pourquoi il fonctionne.",
        variables: ["plateforme", "sujet"],
        likes: 45
    },
    {
        id: 'p3',
        title: "Audit SEO Technique",
        category: "SEO",
        tags: ["Technical", "Audit", "Screaming Frog"],
        template: "Tu es un consultant SEO Senior. Je vais te fournir un export de Screaming Frog ou une liste d'URLs.\n\nTa mission :\n1. Identifier les erreurs critiques (404, 500, chaînes de redirection).\n2. Analyser les Title et H1 manquants ou dupliqués.\n3. Prioriser les correctifs par impact business estimé.\n\nListe des URLs/Données : {{donnees_seo}}",
        variables: ["donnees_seo"],
        likes: 8
    },
    {
        id: 'p4',
        title: "Simulateur de Négociation",
        category: "Sales",
        tags: ["Roleplay", "Closing", "Objection"],
        template: "Jouons un jeu de rôle. Tu es un prospect difficile nommé {{nom_prospect}} qui dirige {{entreprise}}.\n\nTon objection principale est : {{objection}}.\n\nJe vais essayer de te convaincre. Si je marque un point pertinent, dis '(+1)'. Si je fais une erreur, dis '(-1)' et explique pourquoi.\n\nCommençons. Je suis le vendeur.",
        variables: ["nom_prospect", "entreprise", "objection"],
        likes: 23
    },
    {
        id: 'p5',
        title: "Code Refactoring Expert",
        category: "Tech",
        tags: ["Clean Code", "React", "Optimization"],
        template: "Tu es un Senior Software Engineer chez Google. Analyse ce composant {{langage}}.\n\nPropose un refactoring qui améliore :\n1. La lisibilité (Clean Code)\n2. La performance (Complexité algorithmique)\n3. La maintenabilité (SOLID principles)\n\nCode à analyser : \n{{code_snippet}}",
        variables: ["langage", "code_snippet"],
        likes: 150
    }
];

export const SEO_SYSTEM_PROMPT = `Tu es un expert SEO/GEO spécialisé dans l'optimisation intelligente et non-intrusive des pages web. Ta mission est d'améliorer drastiquement le référencement SANS casser l'esthétique, la structure visuelle ou l'expérience utilisateur existante.

RÈGLE D'OR : PRÉSERVATION DE L'EXISTANT
- Analyse la structure actuelle de la page avant toute modification
- N'applique QUE les optimisations SEO qui s'intègrent naturellement
- JAMAIS de modifications qui cassent l'esthétique ou la mise en page

OPTIMISATIONS AUTORISÉES :
✅ Balises <title>, <meta description>, <canonical>
✅ Données structurées JSON-LD (Schema.org)
✅ Open Graph / Twitter Card
✅ Attributs alt descriptifs sur images
✅ Balises sémantiques HTML5 (header, main, section, article, nav, footer)
✅ Hiérarchie H1-H6 correcte (UN SEUL H1)
✅ Attributs loading="lazy", fetchpriority="high" sur images
✅ Attributs aria-label pour l'accessibilité

INTERDICTIONS ABSOLUES :
❌ Ne JAMAIS modifier les couleurs, fonts, espacements existants
❌ Ne JAMAIS casser le responsive design
❌ Ne JAMAIS modifier l'ordre des sections si cela nuit à l'UX`;

export const LOVABLE_SEO_ADDON = `

## OPTIMISATION SEO INTÉGRÉE (OBLIGATOIRE)

Intègre systématiquement ces optimisations SEO dans le code généré :

### Balises <head> obligatoires :
\`\`\`html
<title>[Nom Entreprise] - [Service Principal] | [Ville/Région]</title>
<meta name="description" content="[Bénéfice principal] + [Preuve sociale] + [CTA] (140-160 caractères)" />
<link rel="canonical" href="[URL complète]" />
<meta property="og:title" content="[Titre optimisé]" />
<meta property="og:description" content="[Description engageante]" />
<meta property="og:image" content="[URL image 1200x630px]" />
<meta property="og:type" content="website" />
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "[Nom Entreprise]",
  "description": "[Description]",
  "url": "[URL]",
  "telephone": "[Téléphone]",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "[Ville]",
    "addressCountry": "FR"
  }
}
</script>
\`\`\`

### Structure HTML sémantique :
- UN SEUL <h1> avec le mot-clé principal
- <h2> pour les sections principales
- Balises sémantiques : <header>, <main>, <section>, <article>, <footer>
- Attributs alt descriptifs sur TOUTES les images
- loading="lazy" sur images hors viewport, fetchpriority="high" sur l'image héro

### Performance :
- Images en format WebP
- Scripts non-critiques avec defer/async
- Préchargement des fonts critiques`;
