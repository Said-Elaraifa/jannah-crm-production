import { supabase } from './supabase';

// ==========================================
// QUOTES (DEVIS)
// ==========================================

export async function getQuotes() {
    const { data, error } = await supabase
        .from('quotes')
        .select('*, clients(name)')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function createQuote(quoteData) {
    try {
        console.log('[API] createQuote Payload:', quoteData);
        const { data, error } = await supabase
            .from('quotes')
            .insert([quoteData])
            .select()
            .single();

        if (error) {
            console.error('[API Error] createQuote:', error);
            throw error;
        }
        console.log('[API] createQuote Response:', data);
        return data;
    } catch (error) {
        console.error('[API Exception] createQuote:', error);
        throw error;
    }
}

export async function updateQuoteStatus(id, newStatus) {
    try {
        console.log(`[API] updateQuoteStatus to ${newStatus} for ID ${id}`);
        const { data, error } = await supabase
            .from('quotes')
            .update({ status: newStatus })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('[API Error] updateQuoteStatus:', error);
            throw error;
        }
        console.log('[API] updateQuoteStatus Response:', data);
        return data;
    } catch (error) {
        console.error('[API Exception] updateQuoteStatus:', error);
        throw error;
    }
}

// ==========================================
// INVOICES (FACTURES)
// ==========================================

export async function getInvoices() {
    const { data, error } = await supabase
        .from('invoices')
        .select('*, clients(name)')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function createInvoiceFromQuote(quoteId) {
    try {
        console.log(`[API] createInvoiceFromQuote for Quote ID: ${quoteId}`);
        // 1. Fetch Quote
        const { data: quote, error: quoteErr } = await supabase
            .from('quotes')
            .select('*')
            .eq('id', quoteId)
            .single();
        if (quoteErr) {
            console.error('[API Error] createInvoiceFromQuote (fetch quote):', quoteErr);
            throw quoteErr;
        }

        // 2. Generate Invoice Number (Mock logic, should be sequence/trigger in reality)
        const invoiceNumber = `FA-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

        const payload = {
            quote_id: quote.id,
            client_id: quote.client_id,
            invoice_number: invoiceNumber,
            amount: quote.total,
            status: 'Pending',
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Net 30
        };

        console.log('[API] createInvoiceFromQuote Invoice Payload:', payload);

        // 3. Create Invoice
        const { data: invoice, error: invoiceErr } = await supabase
            .from('invoices')
            .insert([payload])
            .select()
            .single();

        if (invoiceErr) {
            console.error('[API Error] createInvoiceFromQuote (insert invoice):', invoiceErr);
            throw invoiceErr;
        }

        console.log('[API] createInvoiceFromQuote Response:', invoice);

        // 4. Update Quote Status
        await updateQuoteStatus(quote.id, 'Invoiced');

        return invoice;
    } catch (error) {
        console.error('[API Exception] createInvoiceFromQuote:', error);
        throw error;
    }
}

// ==========================================
// PAYMENT INTEGRATIONS (PLACEHOLDERS)
// ==========================================

/**
 * Creates a Stripe Checkout session for a specific invoice.
 * TODO: Insert actual Stripe API Key and logic via backend Edge Function.
 */
export async function createStripeCheckout(invoiceId, amount) {
    console.log(`[Stripe Mock] Redirecting to checkout for Invoice ${invoiceId} / Amount: ${amount}€`);
    // Placeholder response simulating a checkout URL
    return {
        url: `https://checkout.stripe.demo/pay/${invoiceId}`
    };
}

/**
 * Creates a GoCardless pre-authorization mandate request.
 * TODO: Hook up with GoCardless OAuth API. 
 */
export async function createGoCardlessMandate(clientId) {
    console.log(`[GoCardless Mock] creating mandate link for client ${clientId}`);
    return {
        auth_url: `https://pay.gocardless.demo/flow/${clientId}`
    };
}

/**
 * Placeholder cron-job wrapper for auto-reminders.
 * Real implementation would be inside a separate cron or Edge Function trigger.
 */
export async function triggerPaymentReminders() {
    console.log("[Auto-Reminder Cron] Scanning for overdue invoices...");
    // TODO: Fetch overdue, send emails, log to 'payment_tracking'.
    return { success: true, processed: 0 };
}
