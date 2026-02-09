import React, { useState, useMemo } from 'react';
import { 
    Zap, AlertTriangle, Play, StopCircle, 
    CheckCircle, XCircle, Activity, ShieldAlert,
    Terminal, Info, BarChart3
} from 'lucide-react';
import axios from '../../utils/axios';

const SpamRequests = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [requests, setRequests] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        success: 0,
        rateLimited: 0,
        blocked: 0
    });

    const sendSpamRequests = async () => {
        setIsRunning(true);
        setRequests([]);
        setStats({ total: 0, success: 0, rateLimited: 0, blocked: 0 });

        const requestCount = 15;

        for (let i = 1; i <= requestCount; i++) {
            const startTime = Date.now();
            try {
                const response = await axios.get('/api/balance');
                const duration = Date.now() - startTime;

                const newRequest = {
                    id: i,
                    status: 'success',
                    message: 'Access Granted',
                    statusCode: response.status,
                    timestamp: new Date().toLocaleTimeString(),
                    duration
                };

                setRequests(prev => [newRequest, ...prev]);
                setStats(prev => ({
                    ...prev,
                    total: prev.total + 1,
                    success: prev.success + 1
                }));
            } catch (error) {
                const duration = Date.now() - startTime;
                let status = 'error';
                let message = error.response?.data?.message || 'Gateway Timeout';

                if (error.response?.status === 429) {
                    status = 'rate-limited';
                    message = '429: Rate Limit Exceeded';
                    setStats(prev => ({
                        ...prev,
                        total: prev.total + 1,
                        rateLimited: prev.rateLimited + 1
                    }));
                } else {
                    setStats(prev => ({ ...prev, total: prev.total + 1 }));
                }

                const newRequest = {
                    id: i,
                    status,
                    message,
                    statusCode: error.response?.status || 500,
                    timestamp: new Date().toLocaleTimeString(),
                    duration
                };

                setRequests(prev => [newRequest, ...prev]);
            }
            await new Promise(resolve => setTimeout(resolve, 150));
        }
        setIsRunning(false);
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'success': return { icon: <CheckCircle className="w-4 h-4" />, color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' };
            case 'rate-limited': return { icon: <AlertTriangle className="w-4 h-4" />, color: 'bg-amber-500/10 border-amber-500/30 text-amber-400' };
            case 'error': return { icon: <XCircle className="w-4 h-4" />, color: 'bg-red-500/10 border-red-500/30 text-red-400' };
            default: return { icon: <Zap className="w-4 h-4" />, color: 'bg-slate-500/10 border-slate-500/30 text-slate-400' };
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 px-4 py-6 md:px-0">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        <ShieldAlert className="text-red-500 w-8 h-8" />
                        Attack Simulation
                    </h1>
                    <p className="text-slate-400 mt-1">Stress test API Gateway rate limiting policies</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 rounded-full border border-red-500/20">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Penetration Test Mode</span>
                </div>
            </div>

            {/* --- STATS GRID --- */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatBox label="Total Requests" value={stats.total} variant="slate" icon={<Activity className="w-4 h-4" />} />
                <StatBox label="Allowed (200)" value={stats.success} variant="green" icon={<CheckCircle className="w-4 h-4" />} />
                <StatBox label="Limited (429)" value={stats.rateLimited} variant="yellow" icon={<AlertTriangle className="w-4 h-4" />} />
                <StatBox label="Blocked" value={stats.blocked} variant="red" icon={<XCircle className="w-4 h-4" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* --- CONTROL PANEL --- */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-md shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <Zap className="w-5 h-5 text-orange-400" />
                            <h2 className="text-lg font-bold text-white uppercase tracking-tighter">Command Center</h2>
                        </div>
                        
                        <p className="text-slate-400 text-xs leading-relaxed mb-6">
                            Triggering a rapid burst of 15 requests will exceed the 10req/min threshold, forcing the 
                            <strong> Redis Rate Limiter</strong> to reject the payload.
                        </p>

                        <button
                            onClick={sendSpamRequests}
                            disabled={isRunning}
                            className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg flex items-center justify-center gap-3 ${
                                isRunning 
                                ? 'bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-600' 
                                : 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500 shadow-orange-900/20'
                            }`}
                        >
                            {isRunning ? (
                                <><StopCircle className="w-5 h-5 animate-pulse" /> Executing Attack...</>
                            ) : (
                                <><Play className="w-5 h-5" /> Start Simulation</>
                            )}
                        </button>
                    </div>

                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5 space-y-4">
                        <h4 className="text-blue-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                            <Info className="w-3 h-3" /> System Logic
                        </h4>
                        
                        <p className="text-slate-500 text-[11px] leading-relaxed italic">
                            The Gateway uses a <strong>Fixed Window Counter</strong> algorithm stored in Redis. Once 
                            the counter for your API key hits 10 within 60 seconds, all further ingress is blocked.
                        </p>
                    </div>
                </div>

                {/* --- REQUEST LOG --- */}
                <div className="lg:col-span-8">
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md h-[550px] flex flex-col">
                        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between bg-slate-900/20">
                            <div className="flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-blue-400" />
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Request Stream</h3>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500">api.vaultgate.v1/balance</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                            {requests.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-20 italic">
                                    <BarChart3 className="w-12 h-12 mb-2" />
                                    <p className="text-sm">No traffic detected</p>
                                </div>
                            ) : (
                                requests.map((req) => {
                                    const style = getStatusStyles(req.status);
                                    return (
                                        <div 
                                            key={req.id} 
                                            className={`flex items-center justify-between p-3 rounded-xl border transition-all animate-in slide-in-from-left-2 ${style.color}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-1.5 bg-white/5 rounded-lg">{style.icon}</div>
                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-tighter">Sequence #{req.id}</p>
                                                    <p className="text-[10px] opacity-80 font-medium">{req.message}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-mono font-bold tracking-widest">{req.statusCode}</p>
                                                <p className="text-[9px] opacity-60 uppercase">{req.duration}ms latency</p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* --- SUB-COMPONENTS --- */

const StatBox = ({ label, value, variant, icon }) => {
    const styles = {
        slate: 'bg-slate-800/40 border-slate-700 text-slate-400',
        green: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        yellow: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        red: 'bg-red-500/10 border-red-500/30 text-red-400',
    };

    return (
        <div className={`p-4 rounded-2xl border transition-all hover:scale-[1.02] ${styles[variant]}`}>
            <div className="flex items-center justify-between mb-1 opacity-60">
                <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
                {icon}
            </div>
            <div className="text-2xl font-black text-white leading-none tracking-tighter">{value}</div>
        </div>
    );
};

export default SpamRequests;