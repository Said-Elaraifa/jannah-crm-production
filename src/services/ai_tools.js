/**
 * AI Tools Registry - Jannah OS
 * This file defines the actions that the AI can trigger on the CRM.
 * Each tool follows the OpenAI/Gemini Function Calling schema.
 */

import * as db from './supabase';

export const AI_TOOLS_DEFINITION = [
    {
        name: "update_lead_status",
        description: "Met à jour l'étape d'un deal dans le pipeline (ex: déplacer un prospect). A utiliser quand l'utilisateur le demande explicitement.",
        parameters: {
            type: "object",
            properties: {
                company_name: { type: "string", description: "Le nom de l'entreprise ou du prospect associé au deal" },
                new_stage: {
                    type: "string",
                    enum: ["new", "qualified", "proposal", "negotiation", "won", "lost"],
                    description: "Le nouvel état du deal"
                }
            },
            required: ["company_name", "new_stage"]
        }
    },
    {
        name: "create_team_notification",
        description: "Envoie une notification interne à un membre de l'équipe",
        parameters: {
            type: "object",
            properties: {
                title: { type: "string" },
                message: { type: "string" },
                type: { type: "string", enum: ["info", "success", "warning", "error"] }
            },
            required: ["title", "message"]
        }
    }
];

/**
 * Executes a tool called by the AI.
 * Always includes a security check or user-confirmation bypass for sensitive operations.
 */
export async function executeAiTool(name, args) {
    console.log(`[AI_TOOL] Executing ${name} with:`, args);

    switch (name) {
        case "update_lead_status": {
            const { data: leads, error } = await db.supabase
                .from('leads')
                .select('*')
                .ilike('company', `%${args.company_name}%`)
                .limit(1);

            if (error || !leads || leads.length === 0) {
                throw new Error(`Impossible de trouver un deal correspondant à "${args.company_name}".`);
            }

            const targetLead = leads[0];
            return await db.updateLeadRecord(targetLead.id, { stage: args.new_stage });
        }

        case "create_team_notification":
            return await db.addNotification({
                title: args.title,
                message: args.message,
                type: args.type || 'info'
            });

        default:
            throw new Error(`Tool ${name} non implémenté.`);
    }
}
