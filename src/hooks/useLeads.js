import { useState, useEffect, useCallback } from 'react';
import * as db from '../services/supabase';

export function useLeads() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const data = await db.getLeads();
            setLeads(data);
        } catch (e) {
            console.error('useLeads error:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();

        // Real-time synchronization
        const subscription = db.supabase
            .channel('leads-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setLeads(prev => {
                        if (prev.find(l => l.id === payload.new.id)) return prev;
                        return [payload.new, ...prev];
                    });
                } else if (payload.eventType === 'UPDATE') {
                    setLeads(prev => prev.map(l => l.id === payload.new.id ? payload.new : l));
                } else if (payload.eventType === 'DELETE') {
                    setLeads(prev => prev.filter(l => l.id !== payload.old.id));
                }
            })
            .subscribe();

        return () => {
            db.supabase.removeChannel(subscription);
        };
    }, [load]);

    const addLead = async (lead) => {
        const newLead = await db.addLeadRecord(lead);
        setLeads(prev => [newLead, ...prev]);

        // Trigger notification
        await db.addNotification({
            title: 'Nouveau Lead',
            message: `${newLead.company} (${newLead.contact}) a été ajouté au pipeline.`,
            type: 'warning'
        }).catch(err => console.error('Notification failed:', err));

        return newLead;
    };

    const editLead = async (id, updates) => {
        const updated = await db.updateLeadRecord(id, updates);
        setLeads(prev => prev.map(l => l.id === id ? updated : l));
        return updated;
    };

    const removeLead = async (id) => {
        await db.removeLeadRecord(id);
        setLeads(prev => prev.filter(l => l.id !== id));
    };

    const moveLead = async (id, newStage) => {
        return editLead(id, { stage: newStage });
    };

    return { leads, setLeads, loading, addLead, editLead, removeLead, moveLead };
}
