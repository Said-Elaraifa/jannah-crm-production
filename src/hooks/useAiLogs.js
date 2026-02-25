import { useState, useEffect, useCallback, useMemo } from 'react';
import * as db from '../services/supabase';

export function useAiLogs() {
    const [aiLogs, setAiLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const data = await db.getAiLogs();
            setAiLogs(data);
        } catch (e) {
            console.error('useAiLogs error:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();

        // Real-time synchronization
        const subscription = db.supabase
            .channel('ai-logs-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'ai_logs' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setAiLogs(prev => {
                        if (prev.find(l => l.id === payload.new.id)) return prev;
                        return [payload.new, ...prev];
                    });
                } else if (payload.eventType === 'UPDATE') {
                    setAiLogs(prev => prev.map(l => l.id === payload.new.id ? payload.new : l));
                } else if (payload.eventType === 'DELETE') {
                    setAiLogs(prev => prev.filter(l => l.id !== payload.old.id));
                }
            })
            .subscribe();

        return () => {
            db.supabase.removeChannel(subscription);
        };
    }, [load]);

    const addAiLog = useCallback(async (log) => {
        const newLog = await db.addAiLogRecord(log);
        setAiLogs(prev => [newLog, ...prev]);
        return newLog;
    }, []);

    const removeAiLog = useCallback(async (id) => {
        await db.removeAiLogRecord(id);
        setAiLogs(prev => prev.filter(l => l.id !== id));
    }, []);

    return useMemo(() => ({
        aiLogs,
        setAiLogs,
        loading,
        addAiLog,
        removeAiLog
    }), [aiLogs, loading, addAiLog, removeAiLog]);
}
