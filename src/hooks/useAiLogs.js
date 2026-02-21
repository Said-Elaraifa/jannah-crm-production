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

    useEffect(() => { load(); }, [load]);

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
