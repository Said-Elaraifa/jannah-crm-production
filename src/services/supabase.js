import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nyajfqdhybsmhlvwvguk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55YWpmcWRoeWJzbWhsdnd2Z3VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNjEzNzcsImV4cCI6MjA4NjkzNzM3N30.jz54grOktRoDiu2vkMf4LkMeZiyDPs-2EAKjkUx7DpY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

// ─── CLIENTS ────────────────────────────────────────────────────────────────

export async function getClients() {
    const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function addClientRecord(client) {
    const { data, error } = await supabase.from('clients').insert([client]).select().single();
    if (error) throw error;
    return data;
}

export async function updateClientRecord(id, updates) {
    const { data, error } = await supabase.from('clients').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
}

export async function removeClientRecord(id) {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw error;
}

// ─── CAHIER DES CHARGES ──────────────────────────────────────────────────────

export async function getCahierBySlug(slug) {
    const { data, error } = await supabase
        .from('cahier_des_charges')
        .select('*')
        .eq('client_slug', slug)
        .maybeSingle();
    if (error) throw error;
    return data;
}

export async function getCahierByClientId(clientId) {
    const { data, error } = await supabase
        .from('cahier_des_charges')
        .select('*')
        .eq('client_id', clientId)
        .maybeSingle();
    if (error) throw error;
    return data;
}

export async function saveCahier(slug, formData) {
    // First check if record exists
    const existing = await getCahierBySlug(slug);

    const payload = {
        client_slug: slug,
        company_name: formData.companyName,
        activity: formData.activity,
        target_audience: formData.targetAudience,
        competitors: formData.competitors,
        project_type: formData.projectType,
        project_goal: formData.projectGoal,
        budget: formData.budget,
        deadline: formData.deadline,
        style: formData.style,
        colors: formData.colors,
        has_logo: formData.hasLogo,
        has_charte: formData.hasCharte,
        inspiration_urls: formData.inspirationUrls,
        logo_url: formData.logoUrl || null,
        charte_url: formData.charteUrl || null,
        features: formData.features || [],
        additional_features: formData.additionalFeatures,
        has_content: formData.hasContent,
        has_images: formData.hasImages,
        content_url: formData.contentUrl || null,
        additional_info: formData.additionalInfo,
        completed_at: new Date().toISOString(),
    };

    if (existing) {
        const { data, error } = await supabase
            .from('cahier_des_charges')
            .update(payload)
            .eq('id', existing.id)
            .select()
            .single();
        if (error) throw error;
        return data;
    } else {
        const { data, error } = await supabase
            .from('cahier_des_charges')
            .insert([payload])
            .select()
            .single();
        if (error) throw error;
        return data;
    }
}

export async function updateCahierPrompt(slug, prompt) {
    const { error } = await supabase
        .from('cahier_des_charges')
        .update({ lovable_prompt: prompt })
        .eq('client_slug', slug);
    if (error) throw error;
}

// ─── LEADS ──────────────────────────────────────────────────────────────────

export async function getLeads() {
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function addLeadRecord(lead) {
    const { data, error } = await supabase.from('leads').insert([lead]).select().single();
    if (error) throw error;

    // Trigger Slack Notification if configured
    try {
        const { data: slackInt } = await supabase
            .from('integrations')
            .select('config, is_connected')
            .eq('slug', 'slack')
            .single();

        if (slackInt?.is_connected && slackInt?.config?.webhookUrl) {
            await fetch(slackInt.config.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: `🚀 *Nouveau Lead sur Jannah CRM !*\n\n*Nom:* ${lead.name}\n*Email:* ${lead.email}\n*Source:* ${lead.source}\n*Valeur:* ${lead.value}€`
                })
            });
        }
    } catch (slackErr) {
        console.error('Slack notification failed:', slackErr);
    }

    return data;
}

export async function updateLeadRecord(id, updates) {
    const { data, error } = await supabase.from('leads').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
}

export async function removeLeadRecord(id) {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) throw error;
}

// ─── SOPS ────────────────────────────────────────────────────────────────────

export async function getSops() {
    const { data, error } = await supabase.from('sops').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function addSopRecord(sop) {
    const { data, error } = await supabase.from('sops').insert([sop]).select().single();
    if (error) throw error;
    return data;
}

export async function updateSopRecord(id, updates) {
    const { data, error } = await supabase.from('sops').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
}

export async function removeSopRecord(id) {
    const { error } = await supabase.from('sops').delete().eq('id', id);
    if (error) throw error;
}

// ─── AI LOGS ─────────────────────────────────────────────────────────────────

export async function getAiLogs() {
    const { data, error } = await supabase.from('ai_logs').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function addAiLogRecord(log) {
    const { data, error } = await supabase.from('ai_logs').insert([log]).select().single();
    if (error) throw error;
    return data;
}

export async function removeAiLogRecord(id) {
    const { error } = await supabase.from('ai_logs').delete().eq('id', id);
    if (error) throw error;
}

// ─── STORAGE ─────────────────────────────────────────────────────────────────

export async function uploadFile(clientSlug, fileType, file) {
    const ext = file.name.split('.').pop();
    const path = `${clientSlug}/${fileType}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
        .from('cahier-files')
        .upload(path, file, { upsert: true });

    if (error) throw error;

    const { data } = supabase.storage.from('cahier-files').getPublicUrl(path);
    return data.publicUrl;
}

// ... (previous code)

export async function getFileUrl(path) {
    const { data } = supabase.storage.from('cahier-files').getPublicUrl(path);
    return data.publicUrl;
}

// ─── DASHBOARD DATA ──────────────────────────────────────────────────────────

export async function getKpisData() {
    const { data, error } = await supabase.from('kpis_data').select('*').order('order_index');
    if (error) throw error;
    return data;
}

export async function getRevenueData() {
    const { data, error } = await supabase.from('revenue_data').select('*').order('order_index');
    if (error) throw error;
    return data;
}

export async function getActivityLogs() {
    // Ideally limit to recent ones
    const { data, error } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(10);
    if (error) throw error;
    return data;
}

// ─── ANALYTICS DATA ──────────────────────────────────────────────────────────

export async function getAdsKpis() {
    const { data, error } = await supabase.from('ads_kpis').select('*').order('order_index');
    if (error) throw error;
    return data;
}

export async function getAdsCampaigns() {
    const { data, error } = await supabase.from('ads_campaigns').select('*');
    if (error) throw error;
    return data;
}

// ─── SETTINGS / TEAM ─────────────────────────────────────────────────────────

export async function getTeamMembers() {
    const { data, error } = await supabase.from('team_members').select('*');
    if (error) throw error;
    return data;
}

export async function addTeamMember(member) {
    const { data, error } = await supabase.from('team_members').insert([member]).select().single();
    if (error) throw error;
    return data;
}

export async function updateTeamMember(id, updates) {
    const { data, error } = await supabase.from('team_members').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
}

export async function deleteTeamMember(id) {
    const { error } = await supabase.from('team_members').delete().eq('id', id);
    if (error) throw error;
}

export async function uploadProfileImage(userId, file) {
    const ext = file.name.split('.').pop();
    const path = `avatars/${userId}_${Date.now()}.${ext}`;

    const { error } = await supabase.storage
        .from('profiles')
        .upload(path, file, { upsert: true });

    if (error) throw error;

    const { data } = supabase.storage.from('profiles').getPublicUrl(path);
    return data.publicUrl;
}

// ─── CLIENT ACTIVITY / HISTORY ───────────────────────────────────────────────

export async function fetchClientActivityLogs(clientId) {
    const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function logClientActivity(log) {
    const { data, error } = await supabase
        .from('activity_logs')
        .insert([log])
        .select()
        .single();
    if (error) throw error;
    return data;
}
// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
export async function getNotifications() {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
    if (error) throw error;
    return data;
}

export async function addNotification(notification) {
    const { data, error } = await supabase
        .from('notifications')
        .insert([notification])
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function markNotificationRead(id) {
    const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ─── INTEGRATIONS ────────────────────────────────────────────────────────────

export async function getIntegrations() {
    const { data, error } = await supabase.from('integrations').select('*');
    if (error) throw error;
    return data;
}

export async function saveIntegrationConfig(slug, config) {
    const { data, error } = await supabase
        .from('integrations')
        .update({ config, is_connected: true, updated_at: new Date().toISOString() })
        .eq('slug', slug)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function addIntegration(integration) {
    const { data, error } = await supabase
        .from('integrations')
        .insert([{
            name: integration.name,
            slug: integration.slug,
            config: {},
            is_connected: false
        }])
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function markAllNotificationsRead() {
    const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false)
        .select();
    if (error) throw error;
    return data;
}

export async function clearAllNotifications() {
    const { error } = await supabase
        .from('notifications')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) throw error;
}
