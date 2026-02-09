import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Lock, User, Key, Briefcase } from 'lucide-react';
import axios from '../utils/axios';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        accountType: 'SAVINGS'
    });
    const [apiKey, setApiKey] = useState('');
    const [accountType, setAccountType] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setApiKey('');

        try {
            const response = await axios.post('/auth/register', formData);
            setApiKey(response.data.apiKey);
            setAccountType(response.data.accountType);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo/Header */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Secure API Gateway</h1>
                    <p className="text-purple-300">Create Your Account</p>
                </div>

                {/* Signup Form */}
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-slate-700 animate-slide-up">
                    <div className="flex items-center space-x-2 mb-6">
                        <UserPlus className="w-6 h-6 text-purple-400" />
                        <h2 className="text-2xl font-semibold text-white">Sign Up</h2>
                    </div>

                    {!apiKey ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Username Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Username
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                        placeholder="Choose a username"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Account Type Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-3">
                                    <Briefcase className="w-4 h-4 inline mr-2" />
                                    Account Type
                                </label>
                                <div className="space-y-3">
                                    {/* SAVINGS Account Option */}
                                    <label className="flex items-start p-4 bg-slate-700/30 border border-slate-600 rounded-lg cursor-pointer hover:bg-slate-700/50 transition">
                                        <input
                                            type="radio"
                                            name="accountType"
                                            value="SAVINGS"
                                            checked={formData.accountType === 'SAVINGS'}
                                            onChange={handleChange}
                                            className="mt-1 w-4 h-4 text-purple-600 cursor-pointer"
                                        />
                                        <div className="ml-3">
                                            <p className="font-semibold text-white">Savings Account</p>
                                            <p className="text-xs text-gray-400">Conservative security • Lower request limits • Higher sensitivity</p>
                                        </div>
                                    </label>

                                    {/* CURRENT Account Option */}
                                    <label className="flex items-start p-4 bg-slate-700/30 border border-slate-600 rounded-lg cursor-pointer hover:bg-slate-700/50 transition">
                                        <input
                                            type="radio"
                                            name="accountType"
                                            value="CURRENT"
                                            checked={formData.accountType === 'CURRENT'}
                                            onChange={handleChange}
                                            className="mt-1 w-4 h-4 text-purple-600 cursor-pointer"
                                        />
                                        <div className="ml-3">
                                            <p className="font-semibold text-white">Current Account</p>
                                            <p className="text-xs text-gray-400">High-throughput mode • Higher request limits • Burst tolerance</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 rounded-lg transition duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>
                    ) : (
                        /* Success State - Show API Key */
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4">
                                <p className="text-green-400 font-semibold mb-2">Account Created Successfully!</p>
                                <p className="text-gray-300 text-sm">Your API key has been generated.</p>
                                <p className="text-gray-400 text-xs mt-2">Account Type: <span className="font-semibold">{accountType}</span></p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                                    <Key className="w-4 h-4" />
                                    <span>Your API Key</span>
                                </label>
                                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                                    <code className="text-yellow-400 text-sm break-all">{apiKey}</code>
                                </div>
                                <p className="text-xs text-orange-400 mt-2">
                                    ⚠️ Save this API key securely! You'll need it to login.
                                </p>
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4">
                                <p className="text-blue-300 text-sm">
                                    Use your <span className="font-semibold">username</span> and this{' '}
                                    <span className="font-semibold">API key</span> to login.
                                </p>
                            </div>

                            <button
                                onClick={() => navigate('/login')}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition duration-200 transform hover:scale-[1.02]"
                            >
                                Go to Login
                            </button>
                        </div>
                    )}

                    {/* Login Link */}
                    {!apiKey && (
                        <div className="mt-6 text-center">
                            <p className="text-gray-400">
                                Already have an account?{' '}
                                <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition">
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Note */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        Secured with JWT Authentication & Risk-Based Security Scoring
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
