import React, { useState, useEffect } from 'react';
import {
    Bell, CheckCircle, AlertCircle, AlertTriangle,
    X, Info, ShieldAlert, Clock, MailOpen, Trash2
} from 'lucide-react';
import axios from '../../utils/axios';

const NotificationsPanel = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000); // Polling every 10s
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get('/api/notifications');
            const notifs = response.data.notifications || [];
            setNotifications(notifs);
            setUnreadCount(notifs.filter(n => !n.read).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            // Mock data for demo/preview if API fails
            const mock = [
                { _id: '1', title: 'Suspicious Login', message: 'A login attempt was detected from a new IP address in Tokyo.', type: 'suspicious', severity: 'critical', read: false, createdAt: new Date(), actionRequired: true },
                { _id: '2', title: 'Rate Limit Reached', message: 'You have exceeded the API request threshold for the balance endpoint.', type: 'warning', severity: 'medium', read: true, createdAt: new Date() }
            ];
            setNotifications(mock);
            setUnreadCount(1);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.patch(`/api/notifications/${notificationId}/read`);
            setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 px-4 py-6 md:px-0">
            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/50 pb-6">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Bell className="w-8 h-8 text-blue-500" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] font-bold text-white items-center justify-center">
                                    {unreadCount}
                                </span>
                            </span>
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Security Alerts</h1>
                        <p className="text-slate-400 text-sm">Monitor system logs and account security</p>
                    </div>
                </div>

                <button
                    onClick={fetchNotifications}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition text-sm font-medium border border-slate-700"
                >
                    <Clock className="w-4 h-4" />
                    Refresh Feed
                </button>
            </div>

            {/* --- NOTIFICATIONS LIST --- */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                        <p className="text-slate-500 text-sm font-medium animate-pulse">Decrypting alerts...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-20 bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-700">
                        <MailOpen className="w-16 h-16 mx-auto mb-4 text-slate-600 opacity-20" />
                        <h3 className="text-slate-400 font-semibold text-lg">Inbox Zero</h3>
                        <p className="text-slate-500 text-sm">You're all caught up with security notifications.</p>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <NotificationItem
                            key={notif._id}
                            notif={notif}
                            onMarkRead={markAsRead}
                        />
                    ))
                )}
            </div>

            {/* --- SYSTEM STATUS INFO --- */}

            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl flex gap-3 items-start">
                <ShieldAlert className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400 leading-relaxed">
                    <strong className="text-blue-300">Security Note:</strong> These alerts are generated by the Vault Gate real-time monitoring engine. High-severity alerts require manual review to maintain account integrity.
                </p>
            </div>
        </div>
    );
};

/* --- HELPER SUB-COMPONENT: NotificationItem --- */
const NotificationItem = ({ notif, onMarkRead }) => {
    const getIcon = (type) => {
        switch (type) {
            case 'suspicious': return <ShieldAlert className="w-6 h-6 text-red-400" />;
            case 'warning': return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
            case 'info': return <Info className="w-6 h-6 text-blue-400" />;
            default: return <Bell className="w-6 h-6 text-slate-400" />;
        }
    };

    const getSeverityStyles = (severity) => {
        switch (severity) {
            case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        }
    };

    return (
        <div className={`relative group p-4 md:p-5 rounded-2xl border transition-all duration-300 ${notif.read
                ? 'bg-slate-800/20 border-slate-800 opacity-70 hover:opacity-100'
                : 'bg-slate-800/60 border-slate-700 shadow-lg shadow-blue-900/5 ring-1 ring-blue-500/10'
            }`}>
            <div className="flex items-start gap-4">
                {/* Icon Column */}
                <div className={`p-3 rounded-xl bg-slate-900 border border-slate-700 shrink-0 ${!notif.read && 'ring-2 ring-blue-500/20'}`}>
                    {getIcon(notif.type)}
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className={`font-bold text-sm md:text-base tracking-tight ${notif.read ? 'text-slate-300' : 'text-white'}`}>
                            {notif.title}
                        </h3>
                        {notif.actionRequired && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-black uppercase rounded animate-pulse">
                                Required
                            </span>
                        )}
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded border uppercase tracking-wider ${getSeverityStyles(notif.severity)}`}>
                            {notif.severity}
                        </span>
                    </div>

                    <p className="text-slate-400 text-sm leading-relaxed mb-3">
                        {notif.message}
                    </p>

                    {/* Meta & Details */}
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                            <Clock className="w-3 h-3" />
                            {new Date(notif.createdAt).toLocaleString()}
                        </div>
                        {notif.details?.ipAddress && (
                            <div className="text-[11px] text-slate-600 bg-slate-900 px-2 py-0.5 rounded font-mono">
                                IP: {notif.details.ipAddress}
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Column */}
                <div className="flex flex-col items-center gap-2">
                    {!notif.read && (
                        <button
                            onClick={() => onMarkRead(notif._id)}
                            className="p-2 hover:bg-blue-500/10 rounded-full transition-colors group/btn"
                            title="Mark as read"
                        >
                            <CheckCircle className="w-6 h-6 text-slate-500 group-hover/btn:text-blue-400" />
                        </button>
                    )}
                </div>
            </div>

            {/* Unread Glow Indicator */}
            {!notif.read && (
                <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
            )}
        </div>
    );
};

export default NotificationsPanel;