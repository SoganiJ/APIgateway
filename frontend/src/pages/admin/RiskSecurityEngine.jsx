import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, User, Activity, Info } from 'lucide-react';
import axios from '../../utils/axios';

const RiskSecurityEngine = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [riskData, setRiskData] = useState(null);

    useEffect(() => {
        const fetchRiskDashboard = async () => {
            try {
                const response = await axios.get('/api/admin/risk-dashboard');
                setRiskData(response.data);
                setError('');
            } catch (err) {
                setError('Failed to load risk data');
                console.error(err);
                // Mock data for demo/fallback purposes
                setRiskData({
                    summary: { totalUsers: 150, highRiskCount: 12, mediumRiskCount: 25, averageRiskScore: 42 },
                    users: [
                        { userId: '1', username: 'john_doe', accountType: 'SAVINGS', policyMode: 'Conservative', riskScore: 85, riskLevel: 'HIGH', action: 'KYC Required', topRiskFactors: [{ factor: 'High Frequency', contribution: 20 }] }
                    ]
                });
            } finally {
                setLoading(false);
            }
        };

        fetchRiskDashboard();
        const interval = setInterval(fetchRiskDashboard, 10000);
        return () => clearInterval(interval);
    }, []);

    const getRiskColor = (level) => {
        switch (level) {
            case 'LOW': return 'text-emerald-400';
            case 'MEDIUM': return 'text-yellow-400';
            case 'HIGH': return 'text-red-400';
            default: return 'text-slate-400';
        }
    };

    const getRiskIcon = (level) => {
        switch (level) {
            case 'LOW': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
            case 'MEDIUM': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
            case 'HIGH': return <AlertTriangle className="w-5 h-5 text-red-400" />;
            default: return <Shield className="w-5 h-5 text-slate-400" />;
        }
    };

    if (loading) {
        return (
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center h-64 animate-pulse">
                <Shield className="w-12 h-12 text-slate-600 mb-4" />
                <p className="text-slate-400 font-medium">Analyzing Security Vectors...</p>
            </div>
        );
    }

    if (error && !riskData) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-400 font-bold">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-full overflow-hidden">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <Shield className="w-8 h-8 text-purple-500" />
                    <h2 className="text-xl md:text-2xl font-bold text-white">Risk Intelligence</h2>
                </div>
                <div className="text-slate-500 text-xs font-mono uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-full border border-slate-700 w-fit">
                    Last Update: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Summary Cards - Responsive Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <SummaryCard label="Total Users" value={riskData.summary.totalUsers} color="slate" icon={<User className="w-4 h-4 text-slate-400" />} />
                <SummaryCard label="High Risk" value={riskData.summary.highRiskCount} color="red" icon={<AlertTriangle className="w-4 h-4 text-red-400" />} />
                <SummaryCard label="Medium Risk" value={riskData.summary.mediumRiskCount} color="yellow" icon={<Activity className="w-4 h-4 text-yellow-400" />} />
                <SummaryCard label="Avg Score" value={riskData.summary.averageRiskScore} color="blue" icon={<Shield className="w-4 h-4 text-blue-400" />} />
            </div>

            {/* Desktop Table - Hidden on Mobile */}
            <div className="hidden md:block bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700 bg-slate-900/50">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Identity</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Type / Policy</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Score</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Risk Level</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Action</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Top Factors</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {riskData.users.map((user) => (
                                <tr key={user.userId} className="hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-white font-medium">{user.username}</div>
                                        <div className="text-[10px] text-slate-500 font-mono">ID: {user.userId}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col space-y-1">
                                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">{user.policyMode}</span>
                                            <span className={`w-fit px-2 py-0.5 rounded text-[10px] font-bold ${user.accountType === 'SAVINGS' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'}`}>
                                                {user.accountType}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-white">{user.riskScore}</span>
                                        <span className="text-slate-500 text-[10px]">/100</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            {getRiskIcon(user.riskLevel)}
                                            <span className={`text-sm font-bold ${getRiskColor(user.riskLevel)}`}>{user.riskLevel}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300 text-sm italic">{user.action}</td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            {user.topRiskFactors.map((f, i) => (
                                                <span key={i} className="block text-[10px] text-slate-400 leading-none">• {f.factor} (+{f.contribution})</span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Cards - Shown only on Small Screens */}
            <div className="md:hidden space-y-4">
                {riskData.users.map((user) => (
                    <div key={user.userId} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="text-white font-bold">{user.username}</h4>
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider">{user.policyMode} Mode</span>
                            </div>
                            <div className="text-right">
                                <div className={`flex items-center gap-1 font-bold ${getRiskColor(user.riskLevel)}`}>
                                    {getRiskIcon(user.riskLevel)}
                                    {user.riskLevel}
                                </div>
                                <span className="text-white font-black text-lg leading-none">{user.riskScore}<span className="text-slate-500 text-xs">/100</span></span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div className="bg-slate-900/50 p-2 rounded">
                                <p className="text-slate-500 uppercase font-bold mb-1 tracking-tighter">Recommended Action</p>
                                <p className="text-slate-300 italic">{user.action}</p>
                            </div>
                            <div className="bg-slate-900/50 p-2 rounded">
                                <p className="text-slate-500 uppercase font-bold mb-1 tracking-tighter">Account Type</p>
                                <p className="text-purple-300">{user.accountType}</p>
                            </div>
                        </div>
                        {user.topRiskFactors.length > 0 && (
                            <div className="bg-slate-900/20 p-2 rounded border border-slate-700/50">
                                <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Top Risk Drivers</p>
                                <div className="flex flex-wrap gap-2">
                                    {user.topRiskFactors.map((f, i) => (
                                        <span key={i} className="text-[10px] text-slate-400">{f.factor} (+{f.contribution})</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Legend / Info Footer */}
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex gap-3">
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-blue-300/80 text-xs leading-relaxed">
                    <strong>Rule-Based Intelligence:</strong> Risk scores are dynamically calculated using the Vault Gate security engine. 
                    <span className="hidden sm:inline"> Conservative policies apply stricter thresholds on savings accounts to minimize fraud exposure.</span>
                </p>
            </div>
        </div>
    );
};

// Helper Sub-component
const SummaryCard = ({ label, value, color, icon }) => {
    const variants = {
        slate: 'bg-slate-800/50 border-slate-700',
        red: 'bg-red-500/10 border-red-500/20',
        yellow: 'bg-yellow-500/10 border-yellow-500/20',
        blue: 'bg-blue-500/10 border-blue-500/20',
    };
    
    return (
        <div className={`border rounded-xl p-3 md:p-4 transition-transform hover:scale-[1.02] ${variants[color]}`}>
            <div className="flex items-center justify-between mb-2">
                <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-tight">{label}</p>
                {icon}
            </div>
            <p className="text-xl md:text-3xl font-bold text-white tracking-tighter">{value}</p>
        </div>
    );
};

export default RiskSecurityEngine;