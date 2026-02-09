import { AlertTriangle, CheckCircle2, ShieldAlert, User, Mail, TrendingUp } from 'lucide-react';

const impactStyles = {
    LOW: {
        label: 'LOW',
        text: 'text-green-400',
        border: 'border-green-500/40',
        bg: 'bg-green-500/10',
        icon: CheckCircle2
    },
    MEDIUM: {
        label: 'MEDIUM',
        text: 'text-yellow-400',
        border: 'border-yellow-500/40',
        bg: 'bg-yellow-500/10',
        icon: AlertTriangle
    },
    HIGH: {
        label: 'HIGH',
        text: 'text-red-400',
        border: 'border-red-500/40',
        bg: 'bg-red-500/10',
        icon: ShieldAlert
    }
};

const SimulationResultCard = ({ result }) => {
    if (!result) return null;

    const impact = impactStyles[result.estimatedImpact] || impactStyles.LOW;
    const ImpactIcon = impact.icon;

    return (
        <div className="space-y-4">
            <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-purple-300">Simulation only – no rules enforced</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-5">
                    <p className="text-sm text-gray-400">Affected users</p>
                    <p className="text-3xl font-semibold text-white mt-2">{result.affectedUsers}</p>
                    <p className="text-xs text-gray-500 mt-2">Users active in recent traffic window.</p>
                </div>

                <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-5">
                    <p className="text-sm text-gray-400">Throttled percentage</p>
                    <p className="text-3xl font-semibold text-white mt-2">{result.throttledPercentage}%</p>
                    <p className="text-xs text-gray-500 mt-2">Hypothetical throttling under new limit.</p>
                </div>

                <div className={`${impact.bg} ${impact.border} border rounded-xl p-5`}
                >
                    <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-slate-900/60">
                            <ImpactIcon className={`w-5 h-5 ${impact.text}`} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Estimated impact</p>
                            <p className={`text-2xl font-semibold ${impact.text}`}>{impact.label}</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">Risk threshold and rate limit projection.</p>
                </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
                <span className="text-sm text-gray-400">Restricted users (risk threshold)</span>
                <span className="text-lg font-semibold text-white">{result.restrictedUsers}</span>
            </div>

            {/* Affected Users Details */}
            {result.affectedUserDetails && result.affectedUserDetails.length > 0 && (
                <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Affected Users Details</h3>
                    <p className="text-xs text-gray-400 mb-4">
                        Showing {Math.min(result.affectedUserDetails.length, 10)} of {result.affectedUsers} affected users
                    </p>

                    <div className="space-y-3">
                        {result.affectedUserDetails.slice(0, 10).map((user, index) => {
                            const riskColor = user.wouldBeRestricted
                                ? 'border-red-500/30 bg-red-500/5'
                                : user.wouldBeThrottled
                                    ? 'border-yellow-500/30 bg-yellow-500/5'
                                    : 'border-green-500/30 bg-green-500/5';

                            const statusBadge = user.wouldBeRestricted
                                ? { text: 'Risk Restricted', color: 'bg-red-500/20 text-red-300' }
                                : user.wouldBeThrottled
                                    ? { text: 'Throttled', color: 'bg-yellow-500/20 text-yellow-300' }
                                    : { text: 'Safe', color: 'bg-green-500/20 text-green-300' };

                            return (
                                <div key={index} className={`border rounded-lg p-4 ${riskColor}`}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center space-x-3 flex-1">
                                            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-white">{user.username || user.name || 'Unknown User'}</p>
                                                <div className="flex items-center space-x-1 text-xs text-gray-400 mt-1">
                                                    <Mail className="w-3 h-3" />
                                                    <span>{user.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.color}`}>
                                            {statusBadge.text}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-current border-opacity-10">
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Requests</p>
                                            <p className="text-sm font-bold text-white mt-1">{user.requestCount || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Risk Score</p>
                                            <p className="text-sm font-bold text-white mt-1">{user.maxRisk || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Role</p>
                                            <p className="text-sm font-bold text-white mt-1 capitalize">{user.role || 'user'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Balance</p>
                                            <p className="text-sm font-bold text-white mt-1">
                                                ${typeof user.balance === 'number' ? user.balance.toLocaleString() : '0'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {result.affectedUserDetails.length > 10 && (
                        <div className="mt-4 p-3 bg-slate-700/30 rounded-lg text-center">
                            <p className="text-xs text-gray-400">
                                ... and {result.affectedUserDetails.length - 10} more users
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SimulationResultCard;
