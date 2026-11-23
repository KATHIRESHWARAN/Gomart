import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ShieldCheck, 
  ArrowUp,
  Heart,
  Lock,
  Layers,
  Zap,
  FolderDown,
  CheckCircle2
} from 'lucide-react';
import { DIGITAL_CATEGORIES } from './Navbar';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 transition-colors">
      
      {/* Back to Top Ribbon */}
      <button
        onClick={scrollToTop}
        className="w-full py-3 bg-slate-900/90 hover:bg-slate-800 text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 border-b border-slate-800 cursor-pointer"
      >
        <ArrowUp className="w-3.5 h-3.5" />
        <span>Back to top</span>
      </button>

      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-accent-purple flex items-center justify-center text-white shadow-md shadow-brand-500/25">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl text-white tracking-tight leading-none">
                  E-Products <span className="text-brand-400 font-extrabold text-xs uppercase px-1 py-0.5 rounded bg-brand-950 border border-brand-800 ml-1">SaaS</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                  She Software Solutions
                </span>
              </div>
            </Link>

            <p className="text-slate-400 text-xs sm:text-sm max-w-sm leading-relaxed">
              Full-Stack Digital Products Marketplace engineered for developers, students, and digital creators. Buy and sell e-books, source code templates, tutorials, and study materials with instant automated delivery.
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Zap className="w-3.5 h-3.5" /> Instant File Download
              </span>
              <span className="flex items-center gap-1.5 text-brand-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Secure Assets
              </span>
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <Lock className="w-3.5 h-3.5" /> Role-Based Access
              </span>
              <span className="flex items-center gap-1.5 text-purple-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Lifetime Updates
              </span>
            </div>
          </div>

          {/* Column 1: Marketplace Categories (From PDF) */}
          <div>
            <h4 className="text-white text-xs font-bold tracking-wider uppercase mb-4">
              Digital Categories
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              {DIGITAL_CATEGORIES.map(cat => (
                <li key={cat.name}>
                  <Link 
                    to={`/products?category=${encodeURIComponent(cat.name)}`}
                    className="hover:text-brand-400 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Platform Links */}
          <div>
            <h4 className="text-white text-xs font-bold tracking-wider uppercase mb-4">
              Explore & Manage
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/products" className="hover:text-white transition-colors">All Digital Products</Link></li>
              <li><Link to="/dashboard/purchases" className="hover:text-white transition-colors">My Purchases & Downloads</Link></li>
              <li><Link to="/dashboard/upload" className="hover:text-white transition-colors">Sell a Digital Asset</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">Saved Wishlist</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">User Dashboard</Link></li>
              <li><Link to="/admin" className="hover:text-amber-400 font-semibold transition-colors">Admin Governance</Link></li>
            </ul>
          </div>

          {/* Column 3: Assessment Metadata */}
          <div>
            <h4 className="text-white text-xs font-bold tracking-wider uppercase mb-4">
              Assessment Details
            </h4>
            <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
              <p className="font-semibold text-slate-200">Organization:</p>
              <p>She Software Solutions</p>
              <p className="font-semibold text-slate-200 mt-2">Domain:</p>
              <p>Full Stack Developer Intern Assessment</p>
              <p className="font-semibold text-slate-200 mt-2">Stack:</p>
              <p>React 19, Express 5, Firebase Auth & Cloud Firestore</p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} E-Products Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 transition-colors">Digital Goods License</span>
            <span className="hover:text-slate-400 transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-400 transition-colors">Instant Download SLA</span>
          </div>
        </div>

      </div>

    </footer>
  );
};

export default Footer;
