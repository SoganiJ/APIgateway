import { useState, useEffect } from 'react';
import { Activity, TrendingUp, Globe, Clock, RefreshCw } from 'lucide-react';
import axios from '../../utils/axios';

const APITraffic = () => {
    const [traffic, setTraffic] = useState([]);
    const [stats, setStats] = useState({
        requestsPerMinute: 0,
        avgResponseTime: 0,
        totalEndpoints: 0,
        peakLoad: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrafficData();
        const interval = setInterval(fetchTrafficData, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchTrafficData = async () => {
        try {
            const response = await axios.get('/api/admin/traffic');
            setTraffic(response.data.traffic || []);
            setStats(response.data.stats || {});
        } catch (error) {
            console.error('Error fetching traffic data:', error);
            // Mock data for demo
            setStats({
                requestsPerMinute: 127,
                avgResponseTime: 45,
                totalEndpoints: 12,
                peakLoad: 340
            });
            setTraffic([
                {
                    id: 1,
                    endpoint: '/api/payment',
                    method: 'POST',
                    requests: 245,
                    avgTime: 52,
                    status: 'healthy',
                    successRate: 98.7
                },
                {
                    id: 2,
                    endpoint: '/api/balance',
                    method: 'GET',
                    requests: 512,
                    avgTime: 28,
                    status: 'healthy',
                    successRate: 99.8
                },
                {
                    id: 3,
                    endpoint: '/api/transfer',
                    method: 'POST',
                    requests: 178,
                    avgTime: 67,
                    status: 'warning',
                    successRate: 94.2
                },
                {
                    id: 4,
                    endpoint: '/api/user/activity',
                    method: 'GET',
                    requests: 312,
                    avgTime: 35,
                    status: 'healthy',
                    successRate: 99.5
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'healthy':
                return 'bg-green-500/10 text-green-400 border-green-500/30';
            case 'warning':
                return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
            case 'critical':
                return 'bg-red-500/10 text-red-400 border-red-500/30';
            default:
                return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
        }
    };

    const getMethodColor = (method) => {
        switch (method) {
            case 'GET':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'POST':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'PUT':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'DELETE':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">API Traffic Monitoring</h1>
                    <p className="text-gray-400">Real-time monitoring of all API endpoints</p>
                </div>
                <button
                    onClick={fetchTrafficData}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center space-x-2"
                >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-500/10 border border-blue-500/50 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-2">
                        <Activity className="w-5 h-5 text-blue-400" />
                        <p className="text-gray-400 text-sm">Requests/Min</p>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.requestsPerMinute}</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-2">
                        <Clock className="w-5 h-5 text-green-400" />
                        <p className="text-gray-400 text-sm">Avg Response</p>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.avgResponseTime}ms</p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/50 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-2">
                        <Globe className="w-5 h-5 text-purple-400" />
                        <p className="text-gray-400 text-sm">Total Endpoints</p>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.totalEndpoints}</p>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/50 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-2">
                        <TrendingUp className="w-5 h-5 text-orange-400" />
                        <p className="text-gray-400 text-sm">Peak Load</p>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.peakLoad}</p>
                </div>
            </div>

            {/* Traffic Table */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-slate-700">
                    <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                        <Globe className="w-6 h-6 text-blue-400" />
                        <span>Endpoint Traffic</span>
                    </h2>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-900/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Endpoint
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Method
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Requests
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Avg Time
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Success Rate
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {traffic.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-700/30 transition">
                                        <td className="px-6 py-4">
                                            <code className="text-sm text-blue-400">{item.endpoint}</code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium border ${getMethodColor(item.method)}`}>
                                                {item.method}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-white font-semibold">
                                            {item.requests.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">
                                            {item.avgTime}ms
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden max-w-20">
                                                    <div
                                                        className={`h-full ${item.successRate >= 99 ? 'bg-green-500' :
                                                                item.successRate >= 95 ? 'bg-yellow-500' :
                                                                    'bg-red-500'
                                                            }`}
                                                        style={{ width: `${item.successRate}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-gray-300">{item.successRate}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default APITraffic;
