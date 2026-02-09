import React, { useState, useEffect, useMemo } from 'react';
import { Activity, DollarSign, Shield, AlertTriangle, ArrowUpRight, Zap, Lock, Globe } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import axios from '../../utils/axios';
import Chatbot from '../../components/Chatbot';

const UserDashboard = () => {
    const [stats, setStats] = useState({
        totalRequests: 0,
        allowedRequests: 0,
        blockedRequests: 0,
        balance: 10000
    });
    const [loading, setLoading] = useState(true);

    // Simulated time-series data based on stats for the chart
    // In production, your API could return this historical array
    const chartData = useMemo(() => [
        { name: '00:00', req: 10 },
        { name: '04:00', req: 25 },
        { name: '08:00', req: stats.totalRequests * 0.4 },
        { name: '12:00', req: stats.totalRequests * 0.8 },
        { name: '16:00', req: stats.totalRequests * 0.6 },
        { name: '20:00', req: stats.totalRequests },
    ], [stats.totalRequests]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get('/api/user/dashboard');
            setStats({
                totalRequests: response.data.totalRequests,
                allowedRequests: response.data.allowedRequests,
                blockedRequests: response.data.blockedRequests,
                balance: response.data.balance,
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setStats({ totalRequests: 450, allowedRequests: 412, blockedRequests: 38, balance: 10000 });
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Account Balance',
            value: `$${stats.balance.toLocaleString()}`,
            icon: DollarSign,
            color: 'from-emerald-500 to-teal-600',
            bgColor: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/30'
        },
        {
            title: 'API Throughput',
            value: stats.totalRequests,
            icon: Activity,
            color: 'from-blue-500 to-indigo-600',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/30'
        },
        {
            title: 'Secure Pass',
            value: stats.allowedRequests,
            icon: Shield,
            color: 'from-cyan-500 to-blue-600',
            bgColor: 'bg-cyan-500/10',
            borderColor: 'border-cyan-500/30'
        },
        {
            title: 'Policy Blocks',
            value: stats.blockedRequests,
            icon: AlertTriangle,
            color: 'from-orange-500 to-red-600',
            bgColor: 'bg-orange-500/10',
            borderColor: 'border-orange-500/30'
        }
    ];

    return (
        <div className="space-y-8 p-1">
            <Chatbot />
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                        <Globe className="text-blue-500 animate-pulse" /> Dashboard
                    </h1>
                    <p className="text-slate-400 font-medium mt-1">Real-time API usage and security metrics</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Gateway Live</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className={`${stat.bgColor} border ${stat.borderColor} rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300`}
                    >
                        <div className="relative z-10">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg mb-4 group-hover:rotate-12 transition-transform`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.title}</h3>
                            <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
                        </div>
                        {/* Background Decoration */}
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <stat.icon size={120} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Monitoring Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Traffic Chart */}
                <div className="lg:col-span-2 bg-slate-800/40 border border-slate-700/50 rounded-[2.5rem] p-8 backdrop-blur-sm shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Zap className="text-yellow-400 w-5 h-5" /> Traffic Velocity
                        </h2>
                        <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-900/50 px-3 py-1 rounded-full border border-slate-700">Last 24 Hours</span>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                                    itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="req" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorReq)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Security Breakdown */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-[2.5rem] p-8 backdrop-blur-sm shadow-2xl">
                    <h2 className="text-xl font-bold text-white mb-6">Security Integrity</h2>
                    <div className="space-y-6">
                        <SecurityProgress
                            label="Requests Allowed"
                            value={stats.allowedRequests}
                            total={stats.totalRequests}
                            color="bg-emerald-500 shadow-[0_0_10px_#10b981]"
                        />
                        <SecurityProgress
                            label="Requests Blocked"
                            value={stats.blockedRequests}
                            total={stats.totalRequests}
                            color="bg-red-500 shadow-[0_0_10px_#ef4444]"
                        />
                    </div>

                    <div className="mt-8 p-5 bg-blue-500/5 border border-blue-500/20 rounded-3xl">
                        <div className="flex gap-3 items-start text-blue-400">
                            <Lock className="w-4 h-4 shrink-0 mt-1" />
                            <p className="text-xs leading-relaxed">
                                Gateway is operating in <strong>JWT-Secure</strong> mode. Fraud detection algorithms are currently analyzing your metadata.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <ActionCard
                    title="Make Payment"
                    desc="Transfer funds via secure API"
                    icon={<DollarSign />}
                    color="hover:border-emerald-500/50"
                />
                <ActionCard
                    title="Check Balance"
                    desc="Encrypted balance inquiry"
                    icon={<Shield />}
                    color="hover:border-blue-500/50"
                />
                <ActionCard
                    title="Test Limits"
                    desc="Simulate throughput thresholds"
                    icon={<AlertTriangle />}
                    color="hover:border-orange-500/50"
                />
            </div>
        </div>
    );
};

/* --- Helper Components --- */

const SecurityProgress = ({ label, value, total, color }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                <span className="text-slate-400">{label}</span>
                <span className="text-white">{percentage.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ${color}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

const ActionCard = ({ title, desc, icon, color }) => (
    <div className={`bg-slate-800/40 border border-slate-700/60 rounded-[2rem] p-6 transition-all duration-300 group cursor-pointer ${color} hover:bg-slate-800/80`}>
        <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-slate-900 rounded-2xl text-slate-400 group-hover:text-white group-hover:bg-slate-700 transition-all">
                {React.cloneElement(icon, { size: 20 })}
            </div>
            <ArrowUpRight className="text-slate-600 group-hover:text-white transition-colors" size={20} />
        </div>
        <h3 className="text-white font-bold mb-1">{title}</h3>
        <p className="text-slate-500 text-sm font-medium">{desc}</p>
    </div>
);

export default UserDashboard;