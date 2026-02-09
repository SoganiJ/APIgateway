import { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, Ban, Eye, User } from 'lucide-react';
import axios from '../../utils/axios';
import InvestigateModal from '../../components/InvestigateModal';

const SuspiciousActivity = () => {
    const [activities, setActivities] = useState([]);
    const [filter, setFilter] = useState('all'); // all, rate-limited, blocked, suspicious
    const [loading, setLoading] = useState(true);
    const [selectedActivity, setSelectedActivity] = useState(null);

    useEffect(() => {
        fetchSuspiciousActivities();
    }, []);

    const fetchSuspiciousActivities = async () => {
        try {
            const response = await axios.get('/api/admin/suspicious-activity');
            setActivities(response.data.activities || []);
        } catch (error) {
            console.error('Error fetching suspicious activities:', error);
            // Mock data for demo
            setActivities([
                {
                    id: 1,
                    username: 'user_john',
                    action: 'Multiple failed login attempts',
                    type: 'suspicious',
                    severity: 'high',
                    timestamp: new Date().toISOString(),
                    details: '5 failed login attempts in 2 minutes',
                    ip: '192.168.1.105'
                },
                {
                    id: 2,
                    username: 'user_alice',
                    action: 'Rate limit exceeded',
                    type: 'rate-limited',
                    severity: 'medium',
                    timestamp: new Date(Date.now() - 300000).toISOString(),
                    details: '15 requests in 30 seconds to /api/payment',
                    ip: '192.168.1.120'
                },
                {
                    id: 3,
                    username: 'user_bob',
                    action: 'User temporarily blocked',
                    type: 'blocked',
                    severity: 'critical',
                    timestamp: new Date(Date.now() - 600000).toISOString(),
                    details: 'Exceeded rate limit threshold - blocked for 15 minutes',
                    ip: '192.168.1.142'
                },
                {
                    id: 4,
                    username: 'user_eve',
                    action: 'Suspicious payment pattern',
                    type: 'suspicious',
                    severity: 'high',
                    timestamp: new Date(Date.now() - 900000).toISOString(),
                    details: 'Multiple small payments to different accounts',
                    ip: '192.168.1.178'
                },
                {
                    id: 5,
                    username: 'user_charlie',
                    action: 'Rate limit exceeded',
                    type: 'rate-limited',
                    severity: 'medium',
                    timestamp: new Date(Date.now() - 1200000).toISOString(),
                    details: '20 requests in 1 minute to /api/balance',
                    ip: '192.168.1.199'
                },
                {
                    id: 6,
                    username: 'user_mallory',
                    action: 'API key validation failed',
                    type: 'suspicious',
                    severity: 'critical',
                    timestamp: new Date(Date.now() - 1500000).toISOString(),
                    details: 'Multiple requests with invalid API key',
                    ip: '192.168.1.215'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-500/20 text-red-400 border-red-500/50';
            case 'high':
                return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
            case 'medium':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
            case 'low':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'blocked':
                return <Ban className="w-5 h-5 text-red-400" />;
            case 'rate-limited':
                return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
            case 'suspicious':
                return <ShieldAlert className="w-5 h-5 text-orange-400" />;
            default:
                return <Eye className="w-5 h-5 text-gray-400" />;
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredActivities = activities.filter(activity => {
        if (filter === 'all') return true;
        return activity.type === filter;
    });

    const stats = {
        total: activities.length,
        blocked: activities.filter(a => a.type === 'blocked').length,
        rateLimited: activities.filter(a => a.type === 'rate-limited').length,
        suspicious: activities.filter(a => a.type === 'suspicious').length
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Suspicious Activity Logs</h1>
                <p className="text-gray-400">Monitor security threats and anomalous behavior</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <p className="text-gray-400 text-sm mb-1">Total Incidents</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
                    <p className="text-gray-400 text-sm mb-1">Blocked Users</p>
                    <p className="text-2xl font-bold text-red-400">{stats.blocked}</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-xl p-4">
                    <p className="text-gray-400 text-sm mb-1">Rate Limited</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats.rateLimited}</p>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/50 rounded-xl p-4">
                    <p className="text-gray-400 text-sm mb-1">Suspicious</p>
                    <p className="text-2xl font-bold text-orange-400">{stats.suspicious}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700/50 text-gray-400 hover:bg-slate-700'
                        }`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('blocked')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'blocked'
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-700/50 text-gray-400 hover:bg-slate-700'
                        }`}
                >
                    Blocked
                </button>
                <button
                    onClick={() => setFilter('rate-limited')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'rate-limited'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-slate-700/50 text-gray-400 hover:bg-slate-700'
                        }`}
                >
                    Rate Limited
                </button>
                <button
                    onClick={() => setFilter('suspicious')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'suspicious'
                        ? 'bg-orange-600 text-white'
                        : 'bg-slate-700/50 text-gray-400 hover:bg-slate-700'
                        }`}
                >
                    Suspicious
                </button>
            </div>

            {/* Activity List */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-6">
                    <ShieldAlert className="w-6 h-6 text-red-400" />
                    <h2 className="text-xl font-semibold text-white">Security Events</h2>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto"></div>
                    </div>
                ) : filteredActivities.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No suspicious activities found</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredActivities.map((activity) => (
                            <div
                                key={activity.id}
                                className="p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition border border-slate-600 hover:border-orange-500/50"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3 flex-1">
                                        {getTypeIcon(activity.type)}
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="text-white font-semibold">{activity.username}</span>
                                                {activity.accountType && (
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${activity.accountType === 'SAVINGS'
                                                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                                            : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                                        }`}>
                                                        {activity.accountType}
                                                    </span>
                                                )}
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(activity.severity)}`}>
                                                    {activity.severity}
                                                </span>
                                            </div>
                                            <h3 className="text-white font-medium mb-1">{activity.action}</h3>
                                            <p className="text-sm text-gray-400 mb-2">{activity.details}</p>
                                            {activity.riskScore !== undefined && (
                                                <div className="mb-2 p-2 bg-slate-800/50 rounded text-xs">
                                                    <span className="text-gray-400">Risk Score: </span>
                                                    <span className={`font-bold ${activity.riskLevel === 'HIGH' ? 'text-red-400' :
                                                            activity.riskLevel === 'MEDIUM' ? 'text-yellow-400' :
                                                                'text-emerald-400'
                                                        }`}>
                                                        {activity.riskScore} ({activity.riskLevel})
                                                    </span>
                                                    {activity.riskFactors && activity.riskFactors.length > 0 && (
                                                        <div className="mt-1 text-gray-400">
                                                            Factors: {activity.riskFactors.slice(0, 2).map(f => `${f.factor} (+${f.contribution})`).join(', ')}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                <span>IP: {activity.ip}</span>
                                                <span>•</span>
                                                <span>{formatTimestamp(activity.timestamp)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedActivity(activity)}
                                        className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-sm rounded border border-blue-500/30 transition"
                                    >
                                        Investigate
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Investigate Modal */}
            {selectedActivity && (
                <InvestigateModal
                    activity={selectedActivity}
                    onClose={() => setSelectedActivity(null)}
                    onNotificationSent={() => {
                        setSelectedActivity(null);
                        fetchSuspiciousActivities();
                    }}
                />
            )}
        </div>
    );
};

export default SuspiciousActivity;
