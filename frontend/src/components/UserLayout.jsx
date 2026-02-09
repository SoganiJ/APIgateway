import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    DollarSign,
    Wallet,
    Zap,
    History,
    UserCircle,
    Bell,
    LogOut,
    Menu,
    X,
    ShieldCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const UserLayout = ({ children }) => {
    const { logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { to: '/user/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/user/payment', icon: DollarSign, label: 'Make Payment' },
        { to: '/user/balance', icon: Wallet, label: 'Check Balance' },
        { to: '/user/spam', icon: Zap, label: 'Spam Requests' },
        { to: '/user/activity', icon: History, label: 'Activity History' },
        { to: '/user/notifications', icon: Bell, label: 'Notifications' }
    ];

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMenu = () => setIsMobileMenuOpen(false);

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row">
            
            {/* --- MOBILE HEADER --- */}
            <header className="md:hidden bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded flex items-center justify-center">
                        <span className="text-white font-bold text-sm">V</span>
                    </div>
                    <h1 className="text-white font-bold tracking-tight">Vault Gate</h1>
                </div>
                <button 
                    onClick={toggleMenu}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* --- SIDEBAR OVERLAY (Mobile only) --- */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={closeMenu}
                />
            )}

            {/* --- SIDEBAR --- */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 flex flex-col transform transition-transform duration-300 ease-in-out
                md:relative md:translate-x-0 
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Branding Section */}
                <div className="p-6 border-b border-slate-700 hidden md:block">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <span className="text-white font-bold text-lg">V</span>
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-lg leading-tight">Vault Gate</h1>
                            <p className="text-xs text-slate-500 font-medium">Client Portal</p>
                        </div>
                    </div>
                </div>

                {/* Main Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-2 md:mt-2">
                        Menu
                    </div>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={closeMenu}
                            className={({ isActive }) =>
                                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                                }`
                            }
                        >
                            <item.icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110`} />
                            <span className="font-medium text-sm">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom Profile/Actions */}
                <div className="p-4 border-t border-slate-700 space-y-1 bg-slate-800/50">
                    <NavLink
                        to="/user/profile"
                        onClick={closeMenu}
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${isActive
                                ? 'bg-slate-700 text-white border border-slate-600'
                                : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                            }`
                        }
                    >
                        <UserCircle className="w-5 h-5" />
                        <span className="font-medium text-sm">Profile Settings</span>
                    </NavLink>
                    
                    <button
                        onClick={logout}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors group"
                    >
                        <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        <span className="font-medium text-sm">Sign Out</span>
                    </button>
                    
                    {/* Security Badge */}
                    <div className="mt-4 px-4 py-2 bg-slate-900/50 rounded-lg flex items-center space-x-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">SECURE NODE ACTIVE</span>
                    </div>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 overflow-x-hidden min-h-screen">
                <div className="p-4 sm:p-6 md:p-10 lg:p-12 h-full">
                    {/* Centered container for dashboard content */}
                    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserLayout;