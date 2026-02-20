import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY, SEO_SYSTEM_PROMPT, LOVABLE_SEO_ADDON } from "../data/constants";
import { supabase } from "./supabase";

let lastUsedKeySource = "Inconnu";

async function getAIInstance(forceDefault = false) {
    try {
        if (forceDefault) {
            lastUsedKeySource = "par Défaut (Force)";
            return [new GoogleGenerativeAI(GEMINI_API_KEY), lastUsedKeySource];
        }

        const { data, error } = await supabase
            .from('integrations')
            .select('config, is_connected')
            .eq('slug', 'gemini')
            .maybeSingle();

        if (error) console.warn("[GEMINI] Erreur Supabase:", error.message);

        const hasDbKey = data?.is_connected && data?.config?.apiKey && data.config.apiKey.length > 20;

        if (hasDbKey) {
            const key = data.config.apiKey;
            lastUsedKeySource = `Personnelle (${key.substring(0, 6)}...)`;
            return [new GoogleGenerativeAI(key), lastUsedKeySource];
        }

        lastUsedKeySource = "Partagée (CRM)";
        return [new GoogleGenerativeAI(GEMINI_API_KEY), lastUsedKeySource];
    } catch (e) {
        lastUsedKeySource = "Fallback (Erreur)";
        return [new GoogleGenerativeAI(GEMINI_API_KEY), lastUsedKeySource];
    }
}

const JANNAH_SYSTEM_PROMPT = `Tu es l'Assistant IA de Jannah Agency, une agence de marketing digital spécialisée dans la création de sites web et le SEO pour les PME françaises. 

L'équipe est composée de :
- Ismael (CEO) : vision stratégique et business development
- Said (COO / Dev) : développement technique et déploiement
- Ghassen (Sales) : vente et relation client

Tu es expert en :
- Marketing digital et stratégie de croissance
- SEO/GEO et référencement local
- Création de sites web avec Lovable (plateforme no-code IA)
- Gestion de campagnes Google Ads et Meta Ads
- Analyse de performance et KPIs

${SEO_SYSTEM_PROMPT}

Réponds toujours en français, de manière professionnelle mais accessible. Sois précis, actionnable et orienté résultats.`;

export async function sendMessageToGemini(userMessage, conversationHistory = [], currentUser = null) {
    const userName = currentUser?.name || 'Saïd';
    const userRole = currentUser?.role || 'Admin';
    const systemText = `Tu es Jannah AI, l'assistant de Jannah Agency. Tu parles avec ${userName} (${userRole}).\n${JANNAH_SYSTEM_PROMPT}\n\nRESTE DANS TON ROLE.`;

    const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];

    let lastError = null;
    let hadQuotaError = false;
    let currentKeySource = "Inconnu";

    for (const modelName of modelsToTry) {
        try {
            const [genAI, keySource] = await getAIInstance();
            currentKeySource = keySource;

            const model = genAI.getGenerativeModel({
                model: modelName,
                systemInstruction: systemText
            });

            const history = conversationHistory
                .filter(m => m.id !== 'greeting' && m.id !== 'error' && m.text)
                .map(m => ({
                    role: m.sender === 'user' ? 'user' : 'model',
                    parts: [{ text: m.text }]
                }));

            const chat = model.startChat({
                history: history,
                generationConfig: { maxOutputTokens: 2000 }
            });

            const result = await chat.sendMessage(userMessage);
            return result.response.text();

        } catch (error) {
            lastError = error;
            const errorMsg = error.message?.toLowerCase() || '';
            const isQuota = errorMsg.includes('429') || errorMsg.includes('quota');
            const isNotFound = errorMsg.includes('404') || errorMsg.includes('not found');

            if (isQuota) hadQuotaError = true;

            console.warn(`[GEMINI] ${modelName} failed (${currentKeySource}):`, error.message);

            if (isQuota || isNotFound) {
                if (modelName !== modelsToTry[modelsToTry.length - 1]) {
                    await new Promise(r => setTimeout(r, 400));
                    continue;
                }
            }
            break;
        }
    }

    const prefix = `Erreur IA [Clé ${currentKeySource}] : `;
    if (hadQuotaError) {
        throw new Error(`${prefix}Quota dépassé. Détails: ${lastError?.message || "RPM atteint"}`);
    }
    throw new Error(`${prefix}${lastError?.message || "Service indisponible"}`);
}

export async function generateLovablePrompt(cahierDesChargesData) {
    const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];

    const d = {
        company: cahierDesChargesData.companyName || cahierDesChargesData.company_name,
        activity: cahierDesChargesData.activity,
        type: cahierDesChargesData.projectType || cahierDesChargesData.project_type,
        style: cahierDesChargesData.style || 'Moderne et professionnel',
        colors: cahierDesChargesData.colors || 'À définir',
        features: (cahierDesChargesData.features || []).join(', '),
        target: cahierDesChargesData.targetAudience || cahierDesChargesData.target_audience || 'PME',
        competitors: cahierDesChargesData.competitors || 'Non spécifié',
        budget: cahierDesChargesData.budget || 'Standard',
        deadline: cahierDesChargesData.deadline || '2-3 semaines',
        info: cahierDesChargesData.additionalInfo || cahierDesChargesData.additional_info || 'Aucune',
        content: (cahierDesChargesData.hasContent || cahierDesChargesData.has_content) ? 'Oui' : 'Non'
    };

    const dataDescription = `
Entreprise : ${d.company}
Secteur : ${d.activity}
Type de projet : ${d.type}
Style visuel : ${d.style}
Couleurs : ${d.colors}
Fonctionnalités : ${d.features}
Public cible : ${d.target}
Concurrents : ${d.competitors}
Info supp : ${d.info}
Contenu fourni : ${d.content}
`;

    const prompt = `Tu es un expert en vibe coding with Lovable (plateforme de création de sites web IA). 
    
Génère un prompt COMPLET et DÉTAILLÉ pour créer un site web professionnel sur Lovable.dev en utilisant les informations suivantes du cahier des charges :

${dataDescription}

Le prompt doit :
1. Commencer par "Crée un site web [type] pour [entreprise]..."
2. Décrire précisément le design visuel (couleurs, typographie, style)
3. Lister toutes les sections/pages nécessaires
4. Décrire les fonctionnalités interactives
5. Inclure des instructions pour le responsive design
6. Mentionner les animations et micro-interactions souhaitées
7. Être en français, clair et directement utilisable dans Lovable

${LOVABLE_SEO_ADDON}

Génère UNIQUEMENT le prompt, sans explication ni introduction. Le prompt doit être prêt à être copié-collé dans Lovable.`;

    let lastError = null;
    let hadQuotaError = false;
    let currentKeySource = "Inconnu";

    for (const modelName of modelsToTry) {
        try {
            const [genAI, keySource] = await getAIInstance();
            currentKeySource = keySource;
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            lastError = error;
            const errorMsg = error.message?.toLowerCase() || '';
            const isQuota = errorMsg.includes('429') || errorMsg.includes('quota');
            const isNotFound = errorMsg.includes('404') || errorMsg.includes('not found');

            if (isQuota) hadQuotaError = true;

            console.warn(`[GEMINI_PROMPT] ${modelName} failed (${currentKeySource}):`, error.message);

            if ((isQuota || isNotFound) && modelName !== modelsToTry[modelsToTry.length - 1]) {
                await new Promise(r => setTimeout(r, 400));
                continue;
            }
            break;
        }
    }

    const prefix = `Erreur IA [Clé ${currentKeySource}] : `;
    if (hadQuotaError) {
        throw new Error(`${prefix}Quota dépassé. Détails: ${lastError?.message || "RPM atteint"}`);
    }
    throw new Error(`${prefix}${lastError?.message || "Impossible de générer le prompt"}`);
}

/**
 * Analyse un lead pour proposer une stratégie de closing personnalisée.
 */
export async function analyzeLeadStrategic(lead) {
    const prompt = `Tu es Ghassen, l'expert Sales de Jannah Agency. Analyse ce lead et propose une STRATÉGIE DE CLOSING.
    
ENTREPRISE : ${lead.company}
CONTACT : ${lead.contact}
VALEUR : ${lead.value}€
SOURCE : ${lead.source}
NOTES : ${lead.notes || 'Aucune note'}
PROBABILITÉ : ${lead.probability}%

Formatte ta réponse avec :
1. 🎯 L'ANGLE D'ATTAQUE (Le point de douleur principal à exploiter)
2. 💡 ARGUMENTS CLÉS (3 points spécifiques à ce secteur/contexte)
3. ⚠️ POINTS DE VIGILANCE (Les objections possibles)
4. 🚀 ACTION IMMÉDIATE (La prochaine étape précise)

Sois percutant, bref et très orienté business. Pas de blabla inutile.`;

    const [genAI] = await getAIInstance();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
}

/**
 * Prédit le succès d'une campagne Ads selon des paramètres de simulation.
 */
export async function predictAdsRoi(data) {
    const prompt = `Tu es l'expert Media Buyer de Jannah Agency. Analyse cette simulation de campagne Ads.

BUDGET : ${data.budget}€
CPD CIBLE (Coût par Lead) : ${data.cpa}€
PANIER MOYEN (High Ticket) : ${data.aov}€
TAUX DE CLOSING ESTIMÉ : ${data.closingRate}%

Analyse :
1. 📊 POTENTIEL DE CA (Calcul et réalisme)
2. ⚖️ FAISEABILITÉ (Est-ce que le CPA cible est cohérent avec le budget ?)
3. 🛠️ CONSEIL TECHNIQUE (Une astuce pour optimiser cette structure)

Génère une réponse courte et technique.`;

    const [genAI] = await getAIInstance();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
}
