import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Activity,
    ShieldAlert,
    UserCircle,
    LogOut,
    Shield,
    Beaker,
    Brain,
    Menu,
    X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout = ({ children }) => {
    const { logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/admin/traffic', icon: Activity, label: 'API Traffic' },
        { to: '/admin/suspicious', icon: ShieldAlert, label: 'Suspicious Activity' },
        { to: '/admin/risk-analysis', icon: Shield, label: 'Risk Analysis' },
        { to: '/admin/behavioral-anomalies', icon: Brain, label: 'ML Anomaly Detection' },
        { to: '/admin/policy-simulation', icon: Beaker, label: 'Policy Simulation' }
    ];

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <header className="md:hidden bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded flex items-center justify-center">
                        <span className="text-white font-bold text-sm">V</span>
                    </div>
                    <h1 className="text-white font-bold tracking-tight">Vault Gate</h1>
                </div>
                <button 
                    onClick={toggleMobileMenu}
                    className="p-2 text-gray-400 hover:text-white transition"
                    aria-label="Toggle Menu"
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </header>

            {/* Sidebar Overlay (Mobile only) */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 flex flex-col transform transition-transform duration-300 ease-in-out
                md:relative md:translate-x-0 
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Logo Section */}
                <div className="p-6 border-b border-slate-700 hidden md:block">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <span className="text-white font-bold text-lg">V</span>
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-lg leading-tight">Vault Gate</h1>
                            <p className="text-xs text-gray-400">Admin Panel</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-4 md:mt-0">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setIsMobileMenuOpen(false)} // Close menu on click for mobile
                            className={({ isActive }) =>
                                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                                    : 'text-gray-400 hover:bg-slate-700/50 hover:text-white'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                            <span className="font-medium text-sm">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom Section */}
                <div className="p-4 border-t border-slate-700 space-y-1 bg-slate-800/50">
                    <NavLink
                        to="/admin/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive
                                ? 'bg-slate-700 text-white'
                                : 'text-gray-400 hover:bg-slate-700/50 hover:text-white'
                            }`
                        }
                    >
                        <UserCircle className="w-5 h-5" />
                        <span className="font-medium text-sm">Profile</span>
                    </NavLink>
                    <button
                        onClick={logout}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors group"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium text-sm">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 overflow-hidden">
                <div className="p-4 sm:p-6 md:p-8 h-full">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;