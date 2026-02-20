import { useState, useEffect, useCallback } from 'react';
import * as db from '../services/supabase';

export function useSops() {
    const [sops, setSops] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const data = await db.getSops();
            setSops(data);
        } catch (e) {
            console.error('useSops error:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const addSop = async (sop) => {
        const newSop = await db.addSopRecord(sop);
        setSops(prev => [newSop, ...prev]);
        return newSop;
    };

    const editSop = async (id, updates) => {
        const updated = await db.updateSopRecord(id, updates);
        setSops(prev => prev.map(s => s.id === id ? updated : s));
        return updated;
    };

    const removeSop = async (id) => {
        await db.removeSopRecord(id);
        setSops(prev => prev.filter(s => s.id !== id));
    };

    return { sops, setSops, loading, addSop, editSop, removeSop };
}
