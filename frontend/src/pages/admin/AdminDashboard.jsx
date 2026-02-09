import React, { useState, useEffect, useMemo } from 'react';
import {
    Shield, Activity, Users, AlertTriangle, TrendingUp,
    Globe, Lock, RefreshCcw, Zap, ChevronRight, Server, Database
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import axios from '../../utils/axios';
import Chatbot from '../../components/Chatbot';

/**
 * AdminDashboard Component
 * Provides a high-fidelity interface for monitoring API Gateway security.
 * Features: Responsive Grid, Recharts Integration, Real-time Sync.
 */
const AdminDashboard = () => {
    // Primary Metrics State
    const [metrics, setMetrics] = useState({
        totalRequests: 0,
        allowedRequests: 0,
        blockedRequests: 0,
        rateLimitedRequests: 0,
        activeUsers: 0,
        suspiciousActivities: 0
    });

    // Real-time Gateway State
    const [gatewayMetrics, setGatewayMetrics] = useState({
        totalRequests: 0,
        blockedRequests: 0,
        allowedRequests: 0,
        activeOffenders: 0,
        blockRate: '0.00',
        uptime: '99.99'
    });

    // Traffic history state
    const [trafficHistory, setTrafficHistory] = useState([]);

    // // Traffic history state
    // const [trafficHistory, setTrafficHistory] = useState([]);

    const [loading, setLoading] = useState(true);

    const distributionData = [
        { name: 'Allowed', value: metrics.allowedRequests || 1, color: '#10b981' },
        { name: 'Blocked', value: metrics.blockedRequests || 0, color: '#ef4444' },
        { name: 'Limited', value: metrics.rateLimitedRequests || 0, color: '#f59e0b' },
    ];

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [mRes, gRes, tRes] = await Promise.all([
                axios.get('/api/admin/metrics'),
                axios.get('/api/admin/gateway-metrics'),
                axios.get('/api/admin/traffic-history')
            ]);
            setMetrics(mRes.data);
            setGatewayMetrics(gRes.data);
            setTrafficHistory(tRes.data);
        } catch (error) {
            console.warn('API Error: Falling back to demo data.');
            setMetrics({
                totalRequests: 15240,
                allowedRequests: 13800,
                blockedRequests: 840,
                rateLimitedRequests: 600,
                activeUsers: 124,
                suspiciousActivities: 12
            });
            setGatewayMetrics(prev => ({ ...prev, totalRequests: 15240, blockRate: '5.51' }));
            // Fallback traffic history
            setTrafficHistory([
                { time: '00:00', total: 400, blocked: 20 },
                { time: '04:00', total: 300, blocked: 10 },
                { time: '08:00', total: 900, blocked: 120 },
                { time: '12:00', total: 1500, blocked: 80 },
                { time: '16:00', total: 2100, blocked: 250 },
                { time: '20:00', total: 1200, blocked: 60 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
        // Live sync for gateway specific metrics every 5s
        const interval = setInterval(() => {
            axios.get('/api/admin/gateway-metrics')
                .then(res => setGatewayMetrics(res.data))
                .catch(() => { });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-8 space-y-6">
            <Chatbot />

            {/* --- TOP NAVIGATION / HEADER --- */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
                            <Shield className="text-white w-6 h-6" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                            Gateway Sentinel
                        </h1>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">Cloud Infrastructure Security & Traffic Analytics</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex flex-col items-end mr-4">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">System Status</span>
                        <span className="text-xs text-green-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            All Systems Operational
                        </span>
                    </div>
                    <button
                        onClick={fetchAllData}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl transition-all active:scale-95"
                    >
                        <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span className="font-semibold text-sm">Refresh Data</span>
                    </button>
                </div>
            </header>

            {/* --- KEY PERFORMANCE INDICATORS --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <KPICard
                    title="API Traffic Volume"
                    value={metrics.totalRequests}
                    icon={Globe}
                    trend="+14.2%"
                    variant="blue"
                />
                <KPICard
                    title="Authenticated Users"
                    value={metrics.activeUsers}
                    icon={Users}
                    trend="+5.7%"
                    variant="purple"
                />
                <KPICard
                    title="Active Threats"
                    value={metrics.suspiciousActivities}
                    icon={AlertTriangle}
                    trend="-2.4%"
                    variant="red"
                />
            </div>

            {/* --- ANALYTICS SECTION --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Traffic Chart */}
                <div className="lg:col-span-2 bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-white">Traffic Velocity</h3>
                            <p className="text-xs text-slate-400">Request load over the last 24 hours</p>
                        </div>
                        <Activity className="text-blue-500 w-5 h-5 opacity-50" />
                    </div>
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trafficHistory}>
                                <defs>
                                    <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fill="url(#colorTraffic)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Request Composition Pie Chart */}
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm flex flex-col items-center">
                    <h3 className="text-lg font-bold text-white self-start mb-2">Integrity Breakdown</h3>
                    <p className="text-xs text-slate-400 self-start mb-6">Distribution of filtering outcomes</p>
                    <div className="h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={distributionData}
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {distributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="w-full mt-6 space-y-3">
                        {distributionData.map(item => (
                            <div key={item.name} className="flex justify-between items-center bg-slate-900/40 p-2 rounded-lg border border-slate-800">
                                <span className="flex items-center gap-2 text-xs font-medium text-slate-300">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                    {item.name}
                                </span>
                                <span className="text-xs font-bold text-white">
                                    {((item.value / (metrics.totalRequests || 1)) * 100).toFixed(1)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- LIVE REDIS ENFORCEMENT MONITOR --- */}
            <div className="bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-900 border border-red-500/20 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
                <div className="bg-red-500/5 p-5 border-b border-red-500/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-red-500/20 p-2.5 rounded-xl border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                            <Lock className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <h2 className="font-bold text-white text-lg">Live Edge Enforcement</h2>
                            <p className="text-xs text-slate-400">Real-time Redis rate-limiting and IP blacklisting</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block border-r border-slate-700 pr-4">
                            <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest">Gateway Uptime</span>
                            <span className="text-sm font-mono text-green-400">99.998%</span>
                        </div>
                        <div className="px-3 py-1.5 bg-green-500/10 rounded-full border border-green-500/20 flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                            <span className="text-[10px] font-black text-green-500 uppercase tracking-tighter">Syncing</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                    <MiniMetric label="Total Sync" value={gatewayMetrics.totalRequests} icon={Database} />
                    <MiniMetric label="Passed" value={gatewayMetrics.allowedRequests} icon={Shield} color="text-green-400" />
                    <MiniMetric label="Blocked" value={gatewayMetrics.blockedRequests} icon={AlertTriangle} color="text-red-400" />
                    <MiniMetric label="Offenders" value={gatewayMetrics.activeOffenders} icon={Zap} color="text-orange-400" />
                </div>

                <div className="px-6 pb-6">
                    <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800 flex flex-col md:flex-row items-center gap-6">
                        <div className="flex flex-col items-center md:items-start">
                            <span className="text-4xl font-black text-blue-500 leading-none">{gatewayMetrics.blockRate}%</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase mt-1 tracking-widest">Current Block Rate</span>
                        </div>
                        <div className="flex-1 w-full space-y-2">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                <span>Security Load</span>
                                <span>High Sensitivity Mode</span>
                            </div>
                            <div className="h-3 bg-slate-800 rounded-full p-0.5 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.4)]"
                                    style={{ width: `${gatewayMetrics.blockRate}%` }}
                                />
                            </div>
                        </div>
                        <button className="whitespace-nowrap flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/5 px-4 py-2 rounded-lg border border-blue-500/10">
                            Policy Control <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- SYSTEM HEALTH FOOTER --- */}
            <footer className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <HealthBar label="API Engine" status="Operational" load="24%" />
                <HealthBar label="Redis Cache" status="Operational" load="12%" />
            </footer>
        </div>
    );
};

/* --- REUSABLE SUB-COMPONENTS --- */

const KPICard = ({ title, value, icon: Icon, trend, variant }) => {
    const variants = {
        blue: "from-blue-600 to-blue-400 border-blue-500/20 bg-blue-500/5",
        purple: "from-purple-600 to-indigo-400 border-purple-500/20 bg-purple-500/5",
        red: "from-red-600 to-orange-500 border-red-500/20 bg-red-500/5"
    };

    return (
        <div className={`p-6 rounded-2xl border backdrop-blur-md transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20 ${variants[variant]}`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br shadow-lg ${variants[variant].split(' ').slice(0, 2).join(' ')}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Weekly</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg bg-white/5 border border-white/10 ${trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                        {trend}
                    </span>
                </div>
            </div>
            <div>
                <h4 className="text-slate-400 text-sm font-semibold tracking-tight">{title}</h4>
                <div className="text-3xl font-black text-white mt-1 tracking-tighter">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </div>
            </div>
        </div>
    );
};

const MiniMetric = ({ label, value, icon: Icon, color = "text-white" }) => (
    <div className="bg-slate-950/30 p-4 rounded-2xl border border-slate-800/50">
        <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Icon className="w-3.5 h-3.5 opacity-60" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        </div>
        <div className={`text-2xl font-black tracking-tight ${color}`}>{value.toLocaleString()}</div>
    </div>
);

const HealthBar = ({ label, status, load }) => (
    <div className="bg-slate-800/20 border border-slate-700/50 p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Server className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-bold text-slate-300">{label}</span>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Load</div>
                <div className="text-xs font-mono text-white">{load}</div>
            </div>
            <div className="px-3 py-1 rounded-md bg-green-500/10 border border-green-500/20">
                <span className="text-[10px] font-black text-green-500 uppercase">{status}</span>
            </div>
        </div>
    </div>
);

export default AdminDashboard;