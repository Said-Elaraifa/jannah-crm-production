import { supabase } from './supabase';

/**
 * Fetch all messages for a specific client, ordered chronologically.
 */
export async function getClientMessages(clientId) {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('client_id', clientId)
        .order('timestamp', { ascending: true });

    if (error) {
        console.error("Error fetching messages:", error);
        throw error;
    }
    return data;
}

/**
 * Send an outbound message and log it to Supabase.
 * In a real app, this would also trigger an Edge Function or external API to actually transmit the message (e.g. Twilio API).
 */
export async function sendMessage(clientId, text, channel = 'email') {
    // 1. Simulate sending via External APIs
    console.log(`[Messaging Hook] Sending ${channel} to Client ${clientId}: "${text}"`);

    // 2. Persist to DB
    const { data, error } = await supabase
        .from('messages')
        .insert([{
            client_id: clientId,
            content: text,
            channel: channel,
            direction: 'outbound',
            read: true
        }])
        .select()
        .single();

    if (error) {
        console.error("Error saving message:", error);
        throw error;
    }
    return data;
}

/**
 * Helper to generate mock structured webhooks payload.
 * Useful for testing the inbox UI without having to spin up ngrok + Twilio.
 */
export async function simulateInboundWebhook(clientId, channel, content) {
    const { data, error } = await supabase
        .from('messages')
        .insert([{
            client_id: clientId,
            content: content,
            channel: channel,
            direction: 'inbound',
            read: false
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
}
