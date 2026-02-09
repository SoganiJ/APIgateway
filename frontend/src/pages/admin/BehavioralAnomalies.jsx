import React, { useState, useEffect } from 'react';
import { 
    Brain, Shield, AlertTriangle, Activity, TrendingUp, 
    RefreshCw, Users, Zap, Eye, CheckCircle, XCircle 
} from 'lucide-react';
import axios from '../../utils/axios';

const BehavioralAnomalies = () => {
    const [anomalies, setAnomalies] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        criticalUsers: 0,
        highRiskUsers: 0,
        mediumRiskUsers: 0,
        lowRiskUsers: 0,
        avgAnomalyScore: 0
    });
    const [mlHealth, setMlHealth] = useState(null);
    const [loading, setLoading] = useState(true);
    const [training, setTraining] = useState(false);
    const [windowMinutes, setWindowMinutes] = useState(5);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchData();
        checkMLHealth();
        const interval = setInterval(fetchData, 10000); // Refresh every 10s
        const healthInterval = setInterval(checkMLHealth, 30000); // Health every 30s
        return () => {
            clearInterval(interval);
            clearInterval(healthInterval);
        };
    }, [windowMinutes]);

    const checkMLHealth = async () => {
        try {
            const response = await axios.get('/api/admin/ml/health');
            setMlHealth(response.data);
        } catch (error) {
            console.error('ML health check failed:', error);
            setMlHealth({ status: 'unavailable' });
        }
    };

    const fetchData = async () => {
        setRefreshing(true);
        try {
            const [anomaliesRes, statsRes] = await Promise.all([
                axios.get(`/api/admin/ml/anomalies?window=${windowMinutes}`),
                axios.get(`/api/admin/ml/stats?window=${windowMinutes}`)
            ]);
            
            setAnomalies(anomaliesRes.data.anomalies || []);
            setStats(statsRes.data);
            setError(null);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching anomaly data:', error);
            setError(error.response?.data?.error || 'Failed to fetch anomaly data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleTrainModel = async () => {
        setTraining(true);
        try {
            const response = await axios.post('/api/admin/ml/train', {
                hours: 24,
                sampleInterval: 5
            });
            
            alert(`Model trained successfully!\n\nSamples: ${response.data.trainingDataSize}\nTime Range: ${response.data.timeRange}`);
            await fetchData();
            await checkMLHealth();
            setError(null);
        } catch (error) {
            alert(`Training failed: ${error.response?.data?.error || error.message}`);
            setError(error.response?.data?.error || 'Model training failed');
        } finally {
            setTraining(false);
        }
    };

    const getRiskColor = (score) => {
        if (score > 0.9) return 'text-red-500 bg-red-500/10 border-red-500/30';
        if (score > 0.8) return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
        if (score >= 0.5) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
        return 'text-green-500 bg-green-500/10 border-green-500/30';
    };

    const getRiskIcon = (score) => {
        if (score > 0.8) return <AlertTriangle className="w-5 h-5" />;
        if (score >= 0.5) return <Eye className="w-5 h-5" />;
        return <CheckCircle className="w-5 h-5" />;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center space-x-3">
                        <Brain className="w-8 h-8 text-purple-400" />
                        <span>Behavioral Anomaly Detection</span>
                    </h1>
                    <p className="text-gray-400">AI-powered risk scoring using Isolation Forest</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={handleTrainModel}
                        disabled={training || mlHealth?.status !== 'healthy'}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center space-x-2 disabled:opacity-50"
                    >
                        <Zap className="w-4 h-4" />
                        <span>{training ? 'Training...' : 'Train Model'}</span>
                    </button>
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center space-x-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="p-4 rounded-xl border bg-red-500/10 border-red-500/30">
                    <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <span className="text-white font-semibold">{error}</span>
                        <span className="text-sm text-gray-400">| Check backend + ML service</span>
                    </div>
                </div>
            )}

            {/* ML Service Status */}
            {mlHealth && (
                <div className={`p-4 rounded-xl border ${
                    mlHealth.status === 'healthy' 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-red-500/10 border-red-500/30'
                }`}>
                    <div className="flex items-center space-x-3">
                        {mlHealth.status === 'healthy' ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                        )}
                        <span className="font-semibold text-white">
                            ML Service: {mlHealth.status === 'healthy' ? 'Online' : 'Offline'}
                        </span>
                        {mlHealth.model_loaded && (
                            <span className="text-sm text-gray-400">| Model Loaded</span>
                        )}
                    </div>
                </div>
            )}

            {/* Time Window Selector */}
            <div className="flex items-center space-x-4">
                <label className="text-gray-400">Analysis Window:</label>
                <select
                    value={windowMinutes}
                    onChange={(e) => setWindowMinutes(Number(e.target.value))}
                    className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                    <option value={5}>Last 5 minutes</option>
                    <option value={10}>Last 10 minutes</option>
                    <option value={15}>Last 15 minutes</option>
                    <option value={30}>Last 30 minutes</option>
                    <option value={60}>Last hour</option>
                </select>
                {lastUpdated && (
                    <span className="text-sm text-gray-500">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        <p className="text-gray-400 text-sm">Total Users</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                </div>
                
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <p className="text-gray-400 text-sm">Critical</p>
                    </div>
                    <p className="text-2xl font-bold text-red-400">{stats.criticalUsers}</p>
                </div>
                
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                        <Shield className="w-4 h-4 text-orange-400" />
                        <p className="text-gray-400 text-sm">High Risk</p>
                    </div>
                    <p className="text-2xl font-bold text-orange-400">{stats.highRiskUsers}</p>
                </div>
                
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                        <Eye className="w-4 h-4 text-yellow-400" />
                        <p className="text-gray-400 text-sm">Medium Risk</p>
                    </div>
                    <p className="text-2xl font-bold text-yellow-400">{stats.mediumRiskUsers}</p>
                </div>
                
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <p className="text-gray-400 text-sm">Low Risk</p>
                    </div>
                    <p className="text-2xl font-bold text-green-400">{stats.lowRiskUsers}</p>
                </div>
                
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        <p className="text-gray-400 text-sm">Avg Score</p>
                    </div>
                    <p className="text-2xl font-bold text-purple-400">{stats.avgAnomalyScore}</p>
                </div>
            </div>

            {/* Anomalies Table */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-slate-700">
                    <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                        <Activity className="w-6 h-6 text-purple-400" />
                        <span>Detected Anomalies</span>
                    </h2>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
                    </div>
                ) : anomalies.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No active users in the selected time window</p>
                        <p className="text-sm mt-2">Generate some API traffic to see anomaly detection in action</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-900/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Risk Score</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Risk Level</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Action</th>
                                    {/* <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Reason</th> */}
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Requests</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {anomalies.map((anomaly, index) => (
                                    <tr key={index} className="hover:bg-slate-700/30 transition">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-white font-medium">{anomaly.username || 'Unknown'}</p>
                                                <p className="text-sm text-gray-400">{anomaly.accountType}</p>
                                                {anomaly.ipAddress && (
                                                    <p className="text-xs text-gray-500">IP: {anomaly.ipAddress}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <div className={`p-2 rounded-lg ${getRiskColor(anomaly.anomaly_score)}`}>
                                                    {getRiskIcon(anomaly.anomaly_score)}
                                                </div>
                                                <span className={`text-lg font-bold ${getRiskColor(anomaly.anomaly_score).split(' ')[0]}`}>
                                                    {(anomaly.anomaly_score * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRiskColor(anomaly.anomaly_score)}`}>
                                                {anomaly.risk_level}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-white font-medium">{anomaly.action}</span>
                                        </td>
                                        {/* <td className="px-6 py-4">
                                            <p className="text-sm text-gray-300 max-w-md">{anomaly.reason}</p>
                                        </td> */}
                                        <td className="px-6 py-4 text-gray-300">
                                            {anomaly.total_requests}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Risk Scoring Legend */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <span>Risk Scoring Guide</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-start space-x-3">
                        <div className="w-3 h-3 rounded-full bg-green-500 mt-1"></div>
                        <div>
                            <p className="text-white font-medium">&lt; 0.5 - Allow</p>
                            <p className="text-sm text-gray-400">Normal behavior</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mt-1"></div>
                        <div>
                            <p className="text-white font-medium">0.5-0.8 - Monitor</p>
                            <p className="text-sm text-gray-400">Unusual patterns</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="w-3 h-3 rounded-full bg-orange-500 mt-1"></div>
                        <div>
                            <p className="text-white font-medium">&gt; 0.8 - Throttle</p>
                            <p className="text-sm text-gray-400">High risk + alert</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="w-3 h-3 rounded-full bg-red-500 mt-1"></div>
                        <div>
                            <p className="text-white font-medium">&gt; 0.9 - Block</p>
                            <p className="text-sm text-gray-400">Critical threat</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BehavioralAnomalies;