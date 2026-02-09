import { User, ShieldCheck, Key, Clock, Briefcase } from 'lucide-react';
import { getUserId, getUserRole, getTokenExpiry, getUsername, getAccountType } from '../utils/auth';

const Profile = () => {
    const username = getUsername();
    const role = getUserRole();
    const userId = getUserId();
    const apiKey = localStorage.getItem('apiKey');
    const expiry = getTokenExpiry();
    const accountType = getAccountType();

    const maskedApiKey = apiKey
        ? `${apiKey.slice(0, 6)}••••${apiKey.slice(-4)}`
        : 'Not available';

    const getPolicyMode = () => {
        return accountType === 'SAVINGS' ? 'Conservative' : 'High-Throughput';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Profile</h1>
                    <p className="text-slate-400">Account details and credentials</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <h2 className="text-lg font-semibold text-white">Identity</h2>
                    </div>
                    <div className="space-y-3 text-slate-300">
                        <div className="flex items-center justify-between">
                            <span>Username</span>
                            <span className="font-semibold text-white">{username || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Role</span>
                            <span className="font-semibold text-white">{role || 'user'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>User ID</span>
                            <span className="font-semibold text-white text-right text-xs">{userId || 'Unknown'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <Briefcase className="w-5 h-5 text-violet-400" />
                        <h2 className="text-lg font-semibold text-white">Account Type</h2>
                    </div>
                    <div className="space-y-3 text-slate-300">
                        <div className="flex items-center justify-between">
                            <span>Type</span>
                            <span className="font-semibold text-white">{accountType || 'SAVINGS'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Policy Mode</span>
                            <span className="font-semibold text-violet-300">{getPolicyMode()}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-2">
                            {accountType === 'SAVINGS'
                                ? '⚙️ Lower request limits, higher security sensitivity'
                                : '⚙️ Higher request limits, burst tolerance enabled'
                            }
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <Key className="w-5 h-5 text-yellow-400" />
                        <h2 className="text-lg font-semibold text-white">API Credentials</h2>
                    </div>
                    <div className="space-y-3 text-slate-300">
                        <div className="flex items-center justify-between">
                            <span>API Key</span>
                            <span className="font-semibold text-white">{maskedApiKey}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Status</span>
                            <span className="font-semibold text-emerald-400">Active</span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <Clock className="w-5 h-5 text-blue-400" />
                        <h2 className="text-lg font-semibold text-white">Session</h2>
                    </div>
                    <p className="text-slate-300">
                        Token expiry:{' '}
                        <span className="font-semibold text-white">
                            {expiry ? expiry.toLocaleString() : 'Unknown'}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Profile;
