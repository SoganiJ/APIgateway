import React from 'react';
import { Link } from 'react-router-dom';
import { 
    ShieldCheck, Activity, Zap, Lock, ArrowRight, 
    Server, Users, BarChart3, ChevronRight, Globe, 
    ShieldAlert, Terminal 
} from 'lucide-react';

const features = [
    {
        icon: ShieldCheck,
        title: 'Secure by Design',
        description: 'Military-grade JWT authentication, dynamic API key rotation, and granular RBAC built into the core.',
        color: 'blue'
    },
    {
        icon: Activity,
        title: 'Live Traffic Analytics',
        description: 'Visualize every request in real-time. Identify patterns, latency spikes, and anomalies instantly.',
        color: 'cyan'
    },
    {
        icon: ShieldAlert,
        title: 'Throttling & Guardrails',
        description: 'Advanced rate limiting that adapts to user behavior, preventing DDoS and resource exhaustion.',
        color: 'purple'
    }
];

const Landing = () => {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30 font-sans">
            {/* Nav - Elevated Glassmorphism */}
            <nav className="fixed top-0 w-full z-[100] border-b border-white/5 bg-[#020617]/70 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-3 group cursor-pointer">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-6 transition-transform">
                            <ShieldCheck className="text-white w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">Vault Gate</span>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        {['Features', 'Solutions', 'Docs', 'Pricing'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-slate-400 hover:text-blue-400 transition-colors">
                                {item}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center space-x-4">
                        <Link to="/login" className="hidden sm:block text-sm font-semibold text-slate-300 hover:text-white transition">
                            Sign in
                        </Link>
                        <Link to="/signup" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/25 active:scale-95">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section - Visual Impact */}
            <section className="relative pt-48 pb-32 px-6 overflow-hidden">
                {/* Dynamic Background */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 blur-[100px] rounded-full" />
                </div>

                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div className="text-center lg:text-left">
                        <div className="inline-flex items-center space-x-2 bg-white/5 text-blue-400 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-8 border border-white/10">
                            <Terminal className="w-3.5 h-3.5" />
                            <span>v2.4 Ready for Production</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black leading-[1.05] mb-8 text-white tracking-tight">
                            The Secure Edge for <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400">
                                Modern Fintech.
                            </span>
                        </h1>
                        <p className="text-slate-400 text-lg md:text-xl leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0">
                            Deploy high-performance API gateways with built-in financial compliance. Stop unauthorized egress and ingest with 30ms latency.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                            <Link to="/signup" className="group inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-2xl bg-white text-slate-950 font-black transition-all hover:bg-blue-50 active:scale-95 shadow-xl shadow-white/5">
                                <span>Start Building</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-slate-900 border border-slate-800 text-white font-bold hover:bg-slate-800 transition-all">
                                View Documentation
                            </button>
                        </div>
                        
                        <div className="mt-12 flex items-center justify-center lg:justify-start space-x-8 grayscale opacity-50">
                            <Globe className="w-8 h-8" />
                            <Zap className="w-8 h-8" />
                            <Server className="w-8 h-8" />
                        </div>
                    </div>

                    {/* Interactive Stack Visual */}
                    <div className="relative lg:h-[500px] flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-transparent blur-3xl opacity-30 rounded-full" />
                        <div className="relative w-full max-w-md bg-slate-900/80 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-sm shadow-2xl overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                            <h3 className="text-lg font-black mb-8 flex items-center gap-2">
                                <Terminal className="w-5 h-5 text-blue-500" />
                                Security Middleware Stack
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'Layer 7 WAF Filtering', status: 'Active', color: 'blue' },
                                    { label: 'mTLS Handshake', status: 'Verified', color: 'emerald' },
                                    { label: 'Token Introspection', status: 'Active', color: 'indigo' },
                                    { label: 'Anomaly Scoring', status: 'Monitoring', color: 'cyan' }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:border-blue-500/30 transition-all">
                                        <span className="text-slate-300 font-bold text-sm tracking-wide">{item.label}</span>
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded bg-${item.color}-500/20 text-${item.color}-400 border border-${item.color}-500/30`}>
                                            {item.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 px-6 bg-[#020617]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Built for scale, hardened for trust.</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg">Infrastructure designed to handle the complexity of modern financial data without the operational overhead.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((f, i) => (
                            <div key={i} className="group p-10 rounded-[2rem] bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 transition-all duration-500 relative overflow-hidden">
                                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-600/5 blur-2xl rounded-full group-hover:bg-blue-600/10 transition-all" />
                                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                    <f.icon className="w-7 h-7 text-blue-400" />
                                </div>
                                <h4 className="text-xl font-black text-white mb-4 tracking-tight">{f.title}</h4>
                                <p className="text-slate-400 leading-relaxed text-sm">{f.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Architecture Section */}
            
            <section className="py-32 px-6 max-w-7xl mx-auto border-t border-white/5">
                <div className="grid lg:grid-cols-2 gap-24 items-center">
                    <div className="grid grid-cols-2 gap-6 relative">
                        <div className="space-y-6">
                            <FeatureMiniCard icon={Server} title="Edge Nodes" desc="Global points of presence" />
                            <FeatureMiniCard icon={Users} title="IAM Sync" desc="Native Auth0/Okta support" />
                        </div>
                        <div className="space-y-6 pt-12">
                            <FeatureMiniCard icon={BarChart3} title="Audit Trail" desc="Immutable log storage" />
                            <FeatureMiniCard icon={Zap} title="Cold Starts" desc="Under 10ms execution" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tighter">Unified Control Plane</h2>
                        <p className="text-slate-400 text-lg mb-10 leading-relaxed font-medium">
                            Managing APIs shouldn't feel like managing a mainframe. Vault Gate provides a high-level abstraction over your entire infrastructure.
                        </p>
                        <div className="space-y-6">
                            {['Zero-latency overhead on headers', 'Global edge network protection', 'Automated SSL with Let\'s Encrypt'].map((li) => (
                                <div key={li} className="flex items-center space-x-4">
                                    <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                        <ChevronRight className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <span className="text-slate-200 font-bold text-sm tracking-wide">{li}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-12">
                            <Link to="/signup" className="text-blue-400 font-black text-sm uppercase tracking-widest hover:text-blue-300 flex items-center gap-2">
                                Explore the Platform <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto rounded-[3rem] bg-gradient-to-b from-blue-600 to-indigo-700 p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-500/20">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">Ready to harden your APIs?</h2>
                    <p className="text-blue-100 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium">
                        Join 500+ fintech companies securing their infrastructure with Vault Gate. Setup takes less than 5 minutes.
                    </p>
                    <Link to="/signup" className="px-10 py-5 rounded-2xl bg-white text-blue-700 font-black text-lg hover:shadow-2xl transition-all hover:-translate-y-1">
                        Get Started for Free
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 border-t border-white/5 bg-[#010409]">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-2 md:col-span-1">
                         <div className="flex items-center space-x-3 mb-6">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <ShieldCheck className="text-white w-5 h-5" />
                            </div>
                            <span className="text-lg font-bold text-white tracking-tight">Vault Gate</span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Protecting the world's most sensitive financial data with edge computing.
                        </p>
                    </div>
                    <div>
                        <h5 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Product</h5>
                        <ul className="space-y-4 text-slate-500 text-sm">
                            <li className="hover:text-blue-400 cursor-pointer transition-colors">API Gateway</li>
                            <li className="hover:text-blue-400 cursor-pointer transition-colors">Risk Engine</li>
                            <li className="hover:text-blue-400 cursor-pointer transition-colors">Edge WAF</li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Company</h5>
                        <ul className="space-y-4 text-slate-500 text-sm">
                            <li className="hover:text-blue-400 cursor-pointer transition-colors">About Us</li>
                            <li className="hover:text-blue-400 cursor-pointer transition-colors">Security</li>
                            <li className="hover:text-blue-400 cursor-pointer transition-colors">Careers</li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Legal</h5>
                        <ul className="space-y-4 text-slate-500 text-sm">
                            <li className="hover:text-blue-400 cursor-pointer transition-colors">Privacy Policy</li>
                            <li className="hover:text-blue-400 cursor-pointer transition-colors">Terms of Service</li>
                            <li className="hover:text-blue-400 cursor-pointer transition-colors">GDPR</li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-600 text-xs font-medium uppercase tracking-widest">© 2026 Vault Gate. Secure Node Infrastructure.</p>
                    <div className="flex space-x-6">
                        <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-white cursor-pointer transition-colors">
                            <Globe className="w-4 h-4" />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-white cursor-pointer transition-colors">
                            <Terminal className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const FeatureMiniCard = ({ icon: Icon, title, desc }) => (
    <div className="p-6 rounded-[2rem] bg-slate-900 border border-white/5 hover:border-blue-500/40 transition-all group">
        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-all">
            <Icon className="w-5 h-5 text-blue-400 group-hover:text-white" />
        </div>
        <h5 className="text-white font-black text-sm uppercase tracking-wider mb-1">{title}</h5>
        <p className="text-slate-500 text-xs font-medium leading-relaxed">{desc}</p>
    </div>
);

export default Landing;