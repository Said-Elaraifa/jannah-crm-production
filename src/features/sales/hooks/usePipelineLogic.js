import { useState, useRef, useMemo, useCallback } from 'react';
import { updateLeadRecord } from '../../../services/supabase';
import { SOURCE_TABS } from '../constants';

/**
 * Custom hook that centralizes ALL pipeline logic:
 * - Source tab filtering
 * - Search, assignee, source filters
 * - Drag & drop state
 * - Webhook lead injection
 * - CSV bulk import
 * - KPI computation
 */
export function usePipelineLogic(leads, setLeads, { onAddLead, onEditLead, onMoveLead, onDeleteLead } = {}) {
    // Source tab state  
    const [activeSourceTab, setActiveSourceTab] = useState('all');

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [filterAssignee, setFilterAssignee] = useState('All');
    const [filterSource, setFilterSource] = useState('All');

    // Drag & drop
    const dragLeadId = useRef(null);
    const [dragOverStage, setDragOverStage] = useState(null);

    // ─── Source tab matching ────────────────────────────────
    const matchesSourceTab = useCallback((lead) => {
        if (activeSourceTab === 'all') return true;
        const tab = SOURCE_TABS.find(t => t.id === activeSourceTab);
        if (!tab || !tab.match) return true;
        // Check if lead.source matches any of the tab's match values
        return tab.match.some(m =>
            (lead.source || '').toLowerCase().includes(m.toLowerCase())
        );
    }, [activeSourceTab]);

    // ─── Filtered leads ────────────────────────────────────
    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const searchStr = `${lead.company || ''}${lead.contact || ''}${lead.email || ''}`.toLowerCase();
            const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
            const matchesAssignee = filterAssignee === 'All' || lead.assigned_to === filterAssignee;
            const matchesSource = filterSource === 'All' || lead.source === filterSource;
            const matchesTab = matchesSourceTab(lead);
            return matchesSearch && matchesAssignee && matchesSource && matchesTab;
        });
    }, [leads, searchQuery, filterAssignee, filterSource, matchesSourceTab]);

    // ─── KPI stats ─────────────────────────────────────────
    const stats = useMemo(() => {
        const totalValue = filteredLeads.reduce((sum, l) => sum + (l.value || 0), 0);
        const weightedPipeline = filteredLeads.reduce((sum, l) => sum + ((l.value || 0) * ((l.probability || 50) / 100)), 0);
        const wonCount = filteredLeads.filter(l => l.stage === 'won').length;
        const avgProbability = filteredLeads.length > 0
            ? Math.round(filteredLeads.reduce((sum, l) => sum + (l.probability || 50), 0) / filteredLeads.length)
            : 0;
        return { totalValue, weightedPipeline, wonCount, avgProbability };
    }, [filteredLeads]);

    // ─── Source tab counts ─────────────────────────────────
    const sourceTabCounts = useMemo(() => {
        const counts = {};
        SOURCE_TABS.forEach(tab => {
            if (!tab.match) {
                counts[tab.id] = leads.length;
            } else {
                counts[tab.id] = leads.filter(l =>
                    tab.match.some(m => (l.source || '').toLowerCase().includes(m.toLowerCase()))
                ).length;
            }
        });
        return counts;
    }, [leads]);

    // ─── CRUD operations ───────────────────────────────────
    const handleSave = useCallback(async (lead) => {
        if (lead.id) {
            if (onEditLead) await onEditLead(lead.id, lead);
            else setLeads(prev => prev.map(l => l.id === lead.id ? lead : l));
        } else {
            if (onAddLead) await onAddLead(lead);
            else setLeads(prev => [lead, ...prev]);
        }
    }, [onAddLead, onEditLead, setLeads]);

    const deleteLead = useCallback(async (id) => {
        if (onDeleteLead) await onDeleteLead(id);
        else setLeads(prev => prev.filter(l => l.id !== id));
    }, [onDeleteLead, setLeads]);

    const moveLead = useCallback(async (id, newStage) => {
        if (onMoveLead) await onMoveLead(id, newStage);
        else {
            await updateLeadRecord(id, { stage: newStage });
            setLeads(prev => prev.map(l => l.id === id ? { ...l, stage: newStage } : l));
        }
    }, [onMoveLead, setLeads]);

    // ─── Drag & Drop ───────────────────────────────────────
    const handleDragStart = useCallback((e, leadId) => {
        dragLeadId.current = leadId;
        e.dataTransfer.effectAllowed = 'move';
    }, []);
    const handleDragEnd = useCallback(() => {
        dragLeadId.current = null;
        setDragOverStage(null);
    }, []);
    const handleDragOver = useCallback((e, stageId) => {
        e.preventDefault();
        setDragOverStage(stageId);
    }, []);
    const handleDrop = useCallback((e, stageId) => {
        e.preventDefault();
        if (dragLeadId.current) moveLead(dragLeadId.current, stageId);
        setDragOverStage(null);
    }, [moveLead]);

    // ─── Meta Webhook Handler ──────────────────────────────
    const handleWebhookLead = useCallback((payload) => {
        /**
         * Parses a Meta Instant Forms webhook payload and injects a new lead.
         * Expected payload shape:
         * {
         *   field_data: [
         *     { name: "full_name", values: ["Jean Dupont"] },
         *     { name: "email", values: ["jean@example.com"] },
         *     { name: "phone_number", values: ["+33612345678"] },
         *   ],
         *   form_id: "...",
         *   created_time: "2026-02-25T17:00:00+0000"
         * }
         */
        const extract = (name) => {
            const field = (payload.field_data || []).find(f => f.name === name);
            return field?.values?.[0] || '';
        };

        const newLead = {
            company: extract('company_name') || extract('full_name') || 'Lead Facebook',
            contact: extract('full_name') || 'Contact Meta',
            email: extract('email') || '',
            phone: extract('phone_number') || '',
            value: 0,
            stage: 'new',
            score: 40,
            source: 'Meta Ads',  // Auto-categorized as Facebook
            assigned_to: '',
            probability: 30,
            next_step: 'Qualifier le lead',
            last_contact: new Date().toISOString().split('T')[0],
            notes: `Lead reçu via Meta Instant Forms — Form ID: ${payload.form_id || 'N/A'}`,
            created_at: new Date().toISOString(),
        };

        // Inject directly if no backend handler
        if (onAddLead) {
            onAddLead(newLead);
        } else {
            setLeads(prev => [{ ...newLead, id: `meta_${Date.now()}` }, ...prev]);
        }

        return newLead;
    }, [onAddLead, setLeads]);

    // ─── CSV Bulk Import ───────────────────────────────────
    const importLeadsFromCSV = useCallback((rows) => {
        /**
         * rows: Array of objects from parsed CSV, e.g.:
         * [{ Nom: "...", Email: "...", Tel: "...", Source: "LinkedIn", Entreprise: "...", Valeur: "2500" }]
         */
        const mapped = rows.map((row, i) => {
            const source = row.Source || row.source || row['Réseau'] || row.reseau || 'Inbound';
            return {
                id: `csv_${Date.now()}_${i}`,
                company: row.Entreprise || row.Company || row.entreprise || row.Nom || '',
                contact: row.Nom || row.Contact || row.contact || row.Name || '',
                email: row.Email || row.email || row.Mail || '',
                phone: row.Tel || row.tel || row.Phone || row.phone || row['Téléphone'] || '',
                value: parseInt(row.Valeur || row.Value || row.value || '0') || 0,
                stage: 'new',
                score: 50,
                source: source,
                assigned_to: '',
                probability: 30,
                next_step: '',
                last_contact: new Date().toISOString().split('T')[0],
                notes: `Importé via CSV`,
                created_at: new Date().toISOString(),
            };
        });

        if (onAddLead) {
            mapped.forEach(lead => onAddLead(lead));
        } else {
            setLeads(prev => [...mapped, ...prev]);
        }

        return mapped.length;
    }, [onAddLead, setLeads]);

    return {
        // Source tabs
        activeSourceTab,
        setActiveSourceTab,
        sourceTabCounts,

        // Filters
        searchQuery, setSearchQuery,
        filterAssignee, setFilterAssignee,
        filterSource, setFilterSource,

        // Data
        filteredLeads,
        stats,

        // CRUD
        handleSave,
        deleteLead,
        moveLead,

        // Drag & Drop
        dragOverStage,
        handleDragStart,
        handleDragEnd,
        handleDragOver,
        handleDrop,

        // Special handlers
        handleWebhookLead,
        importLeadsFromCSV,
    };
}
