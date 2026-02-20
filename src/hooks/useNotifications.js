import { useState, useEffect } from 'react';
import { supabase, getNotifications, markNotificationRead, markAllNotificationsRead, clearAllNotifications } from '../services/supabase';

export function useNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initial fetch
        const loadNotifications = async () => {
            try {
                const data = await getNotifications();
                setNotifications(data || []);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            } finally {
                setLoading(false);
            }
        };

        loadNotifications();

        // Subscribe to real-time changes
        const subscription = supabase
            .channel('public:notifications')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setNotifications(prev => [payload.new, ...prev]);
                } else if (payload.eventType === 'UPDATE') {
                    setNotifications(prev => prev.map(n => n.id === payload.new.id ? payload.new : n));
                } else if (payload.eventType === 'DELETE') {
                    setNotifications(prev => prev.filter(n => n.id === payload.old.id));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const markAsRead = async (id) => {
        try {
            await markNotificationRead(id);
            // Real-time listener will update the state
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const clearAll = async () => {
        try {
            await clearAllNotifications();
            setNotifications([]);
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, loading };
}
