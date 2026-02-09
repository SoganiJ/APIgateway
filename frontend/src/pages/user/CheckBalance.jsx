import React, { useState, useEffect } from 'react';
import { 
    Wallet, RefreshCw, TrendingUp, DollarSign, 
    ArrowDownRight, ShieldCheck, Activity, Key, Zap 
} from 'lucide-react';
import axios from '../../utils/axios';

const CheckBalance = () => {
    const [balance, setBalance] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchBalance = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/balance');
            setBalance(response.data.balance);
            setTransactions(response.data.transactions || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch balance');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBalance();
    }, []);

    return (
        <div className="max-w-6xl mx-auto space-y-6 px-4 py-6 md:px-0">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="text-green-500 w-8 h-8" />
                        Check Balance
                    </h1>
                    <p className="text-gray-400 text-sm md:text-base mt-1">
                        Securely read your account balance through the Vault Gate API.
                    </p>
                </div>
                <button
                    onClick={fetchBalance}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl transition-all shadow-lg shadow-green-900/20 disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span className="font-medium">Refresh Data</span>
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* --- Left Column: Balance --- */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="relative overflow-hidden bg-gradient-to-br from-green-500/10 via-emerald-600/5 to-transparent border border-green-500/30 rounded-2xl p-6 md:p-10 backdrop-blur-md">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <Wallet className="w-6 h-6 text-green-400" />
                            </div>
                            <h2 className="text-lg font-semibold text-white uppercase tracking-wider">Total Available</h2>
                        </div>

                        {error ? (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
                                <Activity className="text-red-400 w-5 h-5" />
                                <p className="text-red-400 text-sm font-medium">{error}</p>
                            </div>
                        ) : balance !== null ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                                    <span className="text-3xl md:text-4xl font-light text-green-500">$</span>
                                    <span className="text-5xl md:text-7xl font-bold text-white tracking-tighter">
                                        {balance.toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </span>
                                </div>
                                <div className="inline-flex items-center space-x-2 bg-green-500/10 text-green-400 px-3 py-1 rounded-full border border-green-500/20">
                                    <TrendingUp className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-tight">Verified by Gateway</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center py-10 space-y-4">
                                <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
                                <p className="text-gray-400 text-sm animate-pulse font-mono">ENCRYPTING CONNECTION...</p>
                            </div>
                        )}
                        
                        {/* Background Decor */}
                        <div className="absolute -right-8 -bottom-8 opacity-5">
                            <Wallet size={200} />
                        </div>
                    </div>

                    {/* Desktop Transaction Log (Visible only on md+) */}
                    <div className="hidden md:block">
                        <TransactionLog transactions={transactions} />
                    </div>
                </div>

                {/* --- Right Column: API & Info --- */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 backdrop-blur-sm">
                        <h3 className="text-white font-semibold flex items-center gap-2 mb-6">
                            <Key className="w-4 h-4 text-blue-400" />
                            Security Protocol
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            <InfoCard label="Endpoint" value="GET /api/balance" color="text-green-400" />
                            <InfoCard label="Auth Level" value="JWT + HMAC" color="text-blue-400" />
                            <InfoCard label="Rate Limit" value="10/min" color="text-yellow-400" />
                        </div>
                    </div>

                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5">
                        <h4 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2 uppercase tracking-widest">
                            <Zap className="w-3.5 h-3.5" />
                            Validation Flow
                        </h4>
                        
                        <ol className="text-xs text-gray-400 space-y-2.5 list-decimal list-inside leading-relaxed">
                            <li>Headers undergo <span className="text-blue-300">JWT Signature</span> verification.</li>
                            <li>Gateway checks <span className="text-blue-300">x-api-key</span> integrity.</li>
                            <li>Redis rate-limiter validates user quota.</li>
                            <li>Balance decrypted and streamed to client.</li>
                        </ol>
                    </div>
                </div>

                {/* Mobile Transaction Log (Visible only on small screens) */}
                <div className="md:hidden">
                    <TransactionLog transactions={transactions} />
                </div>
            </div>
        </div>
    );
};

/* --- Internal Components --- */

const InfoCard = ({ label, value, color }) => (
    <div className="flex items-center justify-between p-3 bg-slate-900/40 rounded-xl border border-slate-700/30">
        <span className="text-xs text-gray-400 font-medium uppercase">{label}</span>
        <code className={`text-xs font-mono font-bold ${color}`}>{value}</code>
    </div>
);

const TransactionLog = ({ transactions }) => (
    <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-white mb-5">Recent Activity</h3>
        {transactions && transactions.length > 0 ? (
            <div className="space-y-3">
                {transactions.map((txn, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-900/40 hover:bg-slate-700/30 rounded-xl transition-all border border-transparent hover:border-slate-600/50 group">
                        <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-lg ${txn.type === 'debit' ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                                <ArrowDownRight className={`w-5 h-5 ${txn.type === 'debit' ? 'text-red-400' : 'text-green-400 rotate-180'}`} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white group-hover:text-green-400 transition-colors">{txn.description}</p>
                                <p className="text-[10px] text-gray-500 uppercase font-mono mt-0.5 tracking-tighter">
                                    {new Date(txn.timestamp).toLocaleDateString()} • {txn.transactionId.substring(0, 8)}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`text-sm font-bold ${txn.type === 'debit' ? 'text-red-400' : 'text-green-400'}`}>
                                {txn.type === 'debit' ? '-' : '+'} ${txn.amount.toFixed(2)}
                            </p>
                            <span className="text-[9px] text-gray-500 uppercase tracking-widest hidden sm:block">Processed</span>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="py-10 text-center border-2 border-dashed border-slate-700/50 rounded-2xl">
                <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500 text-sm italic">No recent vault activity detected</p>
            </div>
        )}
    </div>
);

export default CheckBalance;