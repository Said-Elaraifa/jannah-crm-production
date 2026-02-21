import { useState, useEffect } from 'react';
import { Activity, User, Calendar, Database, ArrowRight } from 'lucide-react';
import { getActivityLogs } from '../../../services/supabase';

export function ActivityFeed() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLogs = async () => {
            try {
                const logs = await getActivityLogs();
                setActivities(logs || []);
            } catch (err) {
                console.error("Failed to load activity logs:", err);
            } finally {
                setLoading(false);
            }
        };
        loadLogs();

        // Polling every 30 seconds
        const interval = setInterval(loadLogs, 30000);
        return () => clearInterval(interval);
    }, []);

    const getActionColor = (action) => {
        switch (action) {
            case 'CREATE': return 'text-green-400 bg-green-400/10';
            case 'UPDATE': return 'text-blue-400 bg-blue-400/10';
            case 'DELETE': return 'text-red-400 bg-red-400/10';
            default: return 'text-slate-400 bg-slate-400/10';
        }
    };

    if (loading) return <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-12 bg-white/5 rounded-lg" />)}
    </div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> FLUX D'ACTIVITÉ GLOBAL
                </h3>
            </div>

            <div className="space-y-3">
                {activities.map((log) => (
                    <div key={log.id} className="group relative pl-4 pb-4 border-l border-white/10 last:pb-0">
                        <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(195,220,127,0.5)]" />

                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                                        {log.user_name}
                                    </span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${getActionColor(log.action_type)}`}>
                                        {log.action_type}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-300 truncate">
                                    {log.detail}
                                </p>
                            </div>
                            <span className="text-[10px] font-medium text-slate-500 whitespace-nowrap mt-1">
                                {log.time_text}
                            </span>
                        </div>
                    </div>
                ))}

                {activities.length === 0 && (
                    <div className="text-center py-6">
                        <p className="text-xs text-slate-500">Aucune activité récente.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
