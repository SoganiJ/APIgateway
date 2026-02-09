import { useState, useEffect } from 'react';
import { X, User, Mail, Clock, AlertTriangle, Send } from 'lucide-react';
import axios from '../utils/axios';

const InvestigateModal = ({ activity, onClose, onNotificationSent }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [notificationForm, setNotificationForm] = useState({
        title: 'Suspicious Activity Alert',
        message: ''
    });

    const fetchUserInfo = async () => {
        try {
            const response = await axios.get(`/api/admin/user/${activity.userId}`);
            setUserInfo(response.data);
        } catch (error) {
            console.error('Error fetching user info:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activity.userId) {
            fetchUserInfo();
        }
    }, [activity.userId]);

    const handleSendNotification = async () => {
        if (!notificationForm.message.trim()) {
            alert('Please enter a message');
            return;
        }

        setSending(true);
        try {
            await axios.post('/api/admin/notify', {
                userId: activity.userId,
                title: notificationForm.title,
                message: notificationForm.message,
                type: 'alert',
                severity: activity.severity,
                actionRequired: true,
                details: {
                    endpoint: activity.details,
                    ipAddress: activity.ip,
                    timestamp: activity.timestamp
                }
            });

            alert('Notification sent successfully!');
            setNotificationForm({ title: 'Suspicious Activity Alert', message: '' });
            onNotificationSent?.();
        } catch (error) {
            alert('Error sending notification: ' + (error.response?.data?.message || error.message));
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
                {/* Header - Sticky */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700 bg-slate-800 rounded-t-xl shrink-0">
                    <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-5 h-5 sm:w-6 h-6 text-orange-400" />
                        <h2 className="text-lg sm:text-xl font-semibold text-white">Investigate Activity</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-700 rounded-lg transition text-gray-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
                    {/* Activity Info */}
                    <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-700/50">
                        <h3 className="text-sm font-semibold text-gray-300 mb-3 border-b border-slate-700 pb-2">Suspicious Activity</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-300">
                            <p><strong className="text-gray-400">Action:</strong> {activity.action}</p>
                            <p><strong className="text-gray-400">Type:</strong> {activity.type}</p>
                            <p><strong className="text-gray-400">Severity:</strong> 
                                <span className={`ml-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                                    activity.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                                }`}>
                                    {activity.severity}
                                </span>
                            </p>
                            <p><strong className="text-gray-400">IP Address:</strong> {activity.ip}</p>
                            <p className="sm:col-span-2"><strong className="text-gray-400">Details:</strong> {activity.details}</p>
                            <p className="sm:col-span-2"><strong className="text-gray-400">Time:</strong> {new Date(activity.timestamp).toLocaleString()}</p>
                        </div>
                    </div>

                    {/* User Info */}
                    {loading ? (
                        <div className="text-center py-6">
                            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                            <p className="text-xs text-gray-500 mt-2">Fetching user profile...</p>
                        </div>
                    ) : userInfo ? (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-blue-300 mb-3 border-b border-blue-500/20 pb-2">User Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-300">
                                <div className="flex items-center space-x-2">
                                    <User className="w-4 h-4 text-blue-400 shrink-0" />
                                    <p><strong className="text-gray-400">Username:</strong> {userInfo.user?.username}</p>
                                </div>
                                <p><strong className="text-gray-400">Role:</strong> {userInfo.user?.role}</p>
                                <p><strong className="text-gray-400">Member Since:</strong> {new Date(userInfo.user?.createdAt).toLocaleDateString()}</p>
                                <p><strong className="text-gray-400">Recent API Calls:</strong> {userInfo.recentLogs?.length || 0}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-700/20 rounded-lg p-4 text-center border border-slate-700">
                            <p className="text-sm text-gray-500">No additional user information available.</p>
                        </div>
                    )}

                    {/* Send Notification */}
                    <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-700/50">
                        <h3 className="text-sm font-semibold text-gray-300 mb-3">Send Alert to User</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1.5 uppercase font-bold tracking-wider">Subject</label>
                                <input
                                    type="text"
                                    value={notificationForm.title}
                                    onChange={(e) =>
                                        setNotificationForm({ ...notificationForm, title: e.target.value })
                                    }
                                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                    placeholder="Alert subject"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1.5 uppercase font-bold tracking-wider">Message</label>
                                <textarea
                                    value={notificationForm.message}
                                    onChange={(e) =>
                                        setNotificationForm({ ...notificationForm, message: e.target.value })
                                    }
                                    rows="4"
                                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                                    placeholder="Describe the suspicious activity and recommended action..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer - Sticky */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 p-4 sm:p-6 border-t border-slate-700 bg-slate-800 rounded-b-xl shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-6 py-2 rounded-lg border border-slate-600 text-gray-300 hover:bg-slate-700 transition font-medium order-2 sm:order-1"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleSendNotification}
                        disabled={sending || !notificationForm.message.trim()}
                        className="w-full sm:w-auto px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 flex items-center justify-center space-x-2 font-medium order-1 sm:order-2"
                    >
                        {sending ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                        <span>{sending ? 'Sending...' : 'Send Alert'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InvestigateModal;