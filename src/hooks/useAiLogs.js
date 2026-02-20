import { useState, useEffect, useCallback } from 'react';
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

    const addAiLog = async (log) => {
        const newLog = await db.addAiLogRecord(log);
        setAiLogs(prev => [newLog, ...prev]);
        return newLog;
    };

    const removeAiLog = async (id) => {
        await db.removeAiLogRecord(id);
        setAiLogs(prev => prev.filter(l => l.id !== id));
    };

    return { aiLogs, setAiLogs, loading, addAiLog, removeAiLog };
}
