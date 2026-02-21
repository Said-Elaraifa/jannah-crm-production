import { supabase } from './supabase';

/**
 * Fetches the aggregated client portfolio data via a custom Postgres RPC.
 * This includes MRR, active projects, last contact, and calculated health score.
 */
export async function fetchClientPortfolio() {
    try {
        console.log('[API] Invoking get_client_portfolio RPC...');
        const { data, error } = await supabase.rpc('get_client_portfolio');

        if (error) {
            console.error('[API Error] fetchClientPortfolio:', error);
            throw error;
        }

        console.log('[API] fetchClientPortfolio success:', data?.length || 0, 'clients loaded');
        return data || [];
    } catch (e) {
        console.error('[API Exception] fetchClientPortfolio:', e);
        throw e;
    }
}
