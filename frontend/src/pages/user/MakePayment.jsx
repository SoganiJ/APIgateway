import React, { useState } from 'react';
import { Send, DollarSign, CheckCircle, XCircle, Loader, ShieldCheck, ArrowRight, Activity } from 'lucide-react';
import axios from '../../utils/axios';

const MakePayment = () => {
    const [formData, setFormData] = useState({ recipient: '', amount: '' });
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResponse(null);

        try {
            const res = await axios.post('/api/transfer', {
                recipient: formData.recipient,
                amount: parseFloat(formData.amount)
            });

            setResponse({
                success: true,
                message: res.data.message || 'Payment successful',
                data: res.data
            });

            setFormData({ recipient: '', amount: '' });
        } catch (error) {
            setResponse({
                success: false,
                message: error.response?.data?.message || 'Payment failed',
                status: error.response?.status
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 px-4 py-6 md:px-0">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        <DollarSign className="text-emerald-500 w-8 h-8 md:w-10 md:h-10" />
                        Transfer Funds
                    </h1>
                    <p className="text-slate-400 mt-1 font-medium">Secure cross-account transfers via Vault Gate API</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">End-to-End Encrypted</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* --- LEFT COLUMN: Form --- */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-emerald-500/20 rounded-xl">
                                <Activity className="w-5 h-5 text-emerald-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Payment Details</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="group">
                                <label className="block text-sm font-semibold text-slate-400 mb-2 transition-colors group-focus-within:text-emerald-400 uppercase tracking-wider">
                                    Recipient Username
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">@</div>
                                    <input
                                        type="text"
                                        name="recipient"
                                        value={formData.recipient}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                                        placeholder="Username"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-semibold text-slate-400 mb-2 transition-colors group-focus-within:text-emerald-400 uppercase tracking-wider">
                                    Amount to Send
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">$</div>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        min="0.01"
                                        step="0.01"
                                        className="w-full pl-10 pr-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-bold text-lg"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="w-6 h-6 animate-spin" />
                                        <span>Securing Transfer...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        <span>Send Transfer</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* API Logic Box */}
                    
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5">
                         <div className="flex gap-4">
                            <ShieldCheck className="w-6 h-6 text-blue-400 shrink-0" />
                            <div>
                                <h4 className="text-blue-400 font-bold text-sm uppercase tracking-widest">Gateway Logic</h4>
                                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                                    This request is signed via <strong>HMAC-SHA256</strong>. The gateway validates your session, checks available liquidity via a database lock, and logs the transaction for anti-fraud auditing.
                                </p>
                            </div>
                         </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: Response --- */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm min-h-[300px] flex flex-col shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-slate-400" />
                            Gateway Response
                        </h3>

                        {response ? (
                            <div className={`flex-1 flex flex-col p-6 rounded-2xl border ${
                                response.success ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-red-500/5 border-red-500/30'
                            }`}>
                                <div className="flex items-center gap-4 mb-4">
                                    {response.success ? (
                                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                                    ) : (
                                        <XCircle className="w-8 h-8 text-red-400" />
                                    )}
                                    <div>
                                        <h4 className={`font-black text-xl ${response.success ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {response.success ? 'TRANSACTION SUCCESS' : 'GATEWAY REJECTION'}
                                        </h4>
                                        <p className="text-xs text-slate-500 font-mono">Status Code: {response.status || 200}</p>
                                    </div>
                                </div>
                                
                                <p className="text-slate-200 text-sm font-medium mb-6 bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                                    {response.message}
                                </p>

                                {response.success && response.data && (
                                    <div className="space-y-3 pt-4 border-t border-emerald-500/20">
                                        <ReceiptItem label="Transfer ID" value={response.data.transactionId} mono />
                                        <ReceiptItem label="Network Fee" value="$0.00" />
                                        <ReceiptItem label="Execution Time" value="34ms" />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 border-2 border-dashed border-slate-700 rounded-2xl">
                                <div className="p-4 bg-slate-700/30 rounded-full mb-4">
                                    <Send className="w-10 h-10 text-slate-500" />
                                </div>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Waiting for payload...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Internal Sub-component for clean code
const ReceiptItem = ({ label, value, mono = false }) => (
    <div className="flex justify-between items-center text-xs">
        <span className="text-slate-500 uppercase font-bold tracking-tighter">{label}</span>
        <span className={`${mono ? 'font-mono text-[10px]' : 'font-bold'} text-white`}>{value}</span>
    </div>
);

export default MakePayment;