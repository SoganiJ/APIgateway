import { useState } from 'react';
import { Beaker, RefreshCcw } from 'lucide-react';
import axios from '../utils/axios';
import SimulationResultCard from '../components/SimulationResultCard';

const PolicySimulation = () => {
    const [form, setForm] = useState({
        accountType: 'SAVINGS',
        endpoint: '/payment',
        rateLimit: 120,
        riskThreshold: 60
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === 'rateLimit' || name === 'riskThreshold' ? Number(value) : value
        }));
    };

    const handleSimulate = async () => {
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await axios.post('/api/admin/simulate-policy', form);
            setResult(response.data);
        } catch (err) {
            setError(err?.response?.data?.message || 'Unable to run simulation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Policy Simulation Engine</h1>
                    <p className="text-gray-400">Preview the impact of rate limits and risk thresholds before enforcing them.</p>
                </div>
                <button
                    onClick={handleSimulate}
                    disabled={loading}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center space-x-2 disabled:opacity-60"
                >
                    {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Beaker className="w-4 h-4" />}
                    <span>{loading ? 'Simulating...' : 'Simulate Policy'}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700 rounded-xl p-6 space-y-5">
                    <h2 className="text-xl font-semibold text-white">Simulation Inputs</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="space-y-2">
                            <span className="text-sm text-gray-400">Account type</span>
                            <select
                                name="accountType"
                                value={form.accountType}
                                onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2"
                            >
                                <option value="SAVINGS">Savings</option>
                                <option value="CURRENT">Current</option>
                            </select>
                        </label>

                        <label className="space-y-2">
                            <span className="text-sm text-gray-400">API endpoint</span>
                            <select
                                name="endpoint"
                                value={form.endpoint}
                                onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2"
                            >
                                <option value="/payment">/payment</option>
                                <option value="/balance">/balance</option>
                            </select>
                        </label>

                        <label className="space-y-2">
                            <span className="text-sm text-gray-400">Rate limit (requests/hour)</span>
                            <input
                                type="number"
                                name="rateLimit"
                                min="1"
                                value={form.rateLimit}
                                onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2"
                            />
                        </label>

                        <label className="space-y-2">
                            <span className="text-sm text-gray-400">Risk threshold</span>
                            <input
                                type="number"
                                name="riskThreshold"
                                min="0"
                                max="100"
                                value={form.riskThreshold}
                                onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2"
                            />
                        </label>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-300 text-sm">
                            {error}
                        </div>
                    )}
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
                    <div className="flex items-start space-x-3">
                        <Beaker className="w-6 h-6 text-purple-300" />
                        <div>
                            <h3 className="text-white font-semibold mb-2">Decision Support Mode</h3>
                            <p className="text-gray-300 text-sm">
                                This tool models expected impact using recent traffic patterns. It never touches live policies,
                                blocks users, or modifies gateway enforcement rules.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <SimulationResultCard result={result} />
        </div>
    );
};

export default PolicySimulation;
