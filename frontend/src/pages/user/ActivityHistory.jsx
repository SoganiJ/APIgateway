import React, { useState, useEffect } from 'react';
import { History, CheckCircle, XCircle, AlertTriangle, Clock, Filter } from 'lucide-react';
import axios from '../../utils/axios';

const ActivityHistory = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const response = await axios.get('/api/user/activity?limit=50');
            setActivities(response.data.activities || []);
        } catch (error) {
            console.error('Error fetching activities:', error);
            // Fallback for demo
            setActivities([
                { id: 1, action: 'Balance Check', details: 'GET /api/balance', status: 'success', timestamp: new Date().toISOString() },
                { id: 2, action: 'Transfer Funds', details: 'POST /api/transfer', status: 'failed', timestamp: new Date(Date.now() - 3600000).toISOString() },
                { id: 3, action: 'Login Attempt', details: 'POST /api/auth/login', status: 'rate-limited', timestamp: new Date(Date.now() - 7200000).toISOString() },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (status) => {
        switch (status) {
            case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'failed': return <XCircle className="w-5 h-5 text-red-400" />;
            case 'rate-limited': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
            default: return <Clock className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            success: 'bg-green-500/10 text-green-400 border-green-500/30',
            failed: 'bg-red-500/10 text-red-400 border-red-500/30',
            'rate-limited': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
        };
        return badges[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString();
    };

    const filteredActivities = activities.filter(activity => {
        if (filter === 'all') return true;
        return activity.status === filter;
    });

    return (
        <div className="max-w-6xl mx-auto space-y-6 px-2 sm:px-4 py-4 md:py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Activity History</h1>
                    <p className="text-gray-400 text-sm">Monitor your real-time API gateway interactions</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20 w-fit">
                    <ActivityIcon className="w-3 h-3" /> LIVE LOGGING ACTIVE
                </div>
            </div>

            {/* Summary Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard label="Total" value={activities.length} color="slate" />
                <StatCard label="Success" value={activities.filter(a => a.status === 'success').length} color="green" />
                <StatCard label="Failed" value={activities.filter(a => a.status === 'failed').length} color="red" />
                <StatCard label="Limited" value={activities.filter(a => a.status === 'rate-limited').length} color="yellow" />
            </div>

            {/* Filter Section */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">Filter by status:</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {['all', 'success', 'failed', 'rate-limited'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                                filter === f
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                    : 'bg-slate-800 text-gray-400 border border-slate-700 hover:border-slate-500'
                            }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Activity List Container */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl overflow-hidden backdrop-blur-sm">
                <div className="p-4 sm:p-6 border-b border-slate-700/60 flex items-center gap-3">
                    <History className="w-5 h-5 text-blue-400" />
                    <h2 className="text-lg font-bold text-white tracking-tight">Recent Interactions</h2>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                        <p className="text-gray-500 text-sm font-medium">Retrieving activity logs...</p>
                    </div>
                ) : filteredActivities.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="font-medium italic">No matches found for the selected filter</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-700/50">
                        {filteredActivities.map((activity) => (
                            <div
                                key={activity.id}
                                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 hover:bg-slate-700/20 transition-all cursor-default"
                            >
                                <div className="flex items-start space-x-4 mb-3 sm:mb-0">
                                    <div className="mt-1 group-hover:scale-110 transition-transform">
                                        {getIcon(activity.status)}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold group-hover:text-blue-400 transition-colors">
                                            {activity.action}
                                        </h3>
                                        <p className="text-sm text-gray-500 font-mono mt-0.5 break-all sm:break-normal">
                                            {activity.details}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center ml-9 sm:ml-0">
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border ${getStatusBadge(activity.status)}`}>
                                        {activity.status}
                                    </span>
                                    <p className="text-xs text-gray-500 sm:mt-2 font-medium">
                                        {formatTimestamp(activity.timestamp)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

/* --- Helper StatCard Component --- */
const StatCard = ({ label, value, color }) => {
    const variants = {
        slate: 'bg-slate-800/50 border-slate-700/50',
        green: 'bg-green-500/5 border-green-500/20 text-green-400',
        red: 'bg-red-500/5 border-red-500/20 text-red-400',
        yellow: 'bg-yellow-500/5 border-yellow-500/20 text-yellow-400',
    };

    return (
        <div className={`p-4 rounded-2xl border transition-all hover:translate-y-[-2px] ${variants[color]}`}>
            <p className="text-gray-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
            <p className="text-xl sm:text-2xl font-black text-white leading-none">{value}</p>
        </div>
    );
};

const ActivityIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

export default ActivityHistory;