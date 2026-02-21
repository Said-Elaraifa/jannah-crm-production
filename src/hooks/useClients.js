import { useState, useEffect, useCallback, useMemo } from 'react';
import * as db from '../services/supabase';

export function useClients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const data = await db.getClients();
            setClients(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();

        // Real-time synchronization
        const subscription = db.supabase
            .channel('clients-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setClients(prev => {
                        if (prev.find(c => c.id === payload.new.id)) return prev;
                        return [payload.new, ...prev];
                    });
                } else if (payload.eventType === 'UPDATE') {
                    setClients(prev => prev.map(c => c.id === payload.new.id ? payload.new : c));
                } else if (payload.eventType === 'DELETE') {
                    setClients(prev => prev.filter(c => c.id !== payload.old.id));
                }
            })
            .subscribe();

        return () => {
            db.supabase.removeChannel(subscription);
        };
    }, [load]);

    const addClient = useCallback(async (client) => {
        const newClient = await db.addClientRecord(client);
        setClients(prev => [newClient, ...prev]);

        // Trigger notification
        await db.addNotification({
            title: 'Nouveau Dossier',
            message: `${newClient.name} a été ajouté aux projets.`,
            type: 'success'
        }).catch(err => console.error('Notification failed:', err));

        return newClient;
    }, []);

    const editClient = useCallback(async (id, updates) => {
        const updated = await db.updateClientRecord(id, updates);
        setClients(prev => prev.map(c => c.id === id ? updated : c));

        // If status changed, notify
        if (updates.status) {
            await db.addNotification({
                title: 'Statut Mis à Jour',
                message: `${updated.name} est maintenant : ${updated.status}`,
                type: 'info'
            }).catch(err => console.error('Notification failed:', err));
        }

        return updated;
    }, []);

    const removeClient = useCallback(async (id) => {
        await db.removeClientRecord(id);
        setClients(prev => prev.filter(c => c.id !== id));
    }, []);

    return useMemo(() => ({
        clients,
        setClients,
        loading,
        error,
        addClient,
        editClient,
        removeClient,
        reload: load
    }), [clients, loading, error, addClient, editClient, removeClient, load]);
}
