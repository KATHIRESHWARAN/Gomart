import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import {
  ShieldCheck,
  LayoutDashboard,
  Package,
  Users,
  Receipt,
  BarChart3,
  LogOut,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

import AdminOverview from './AdminOverview';
import AdminProducts from './AdminProducts';
import AdminUsers from './AdminUsers';
import AdminOrders from './AdminOrders';
import AdminAnalytics from './AdminAnalytics';

const AdminDashboard = ({ tab }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const getInitialTab = () => {
    if (tab) return tab;
    const p = location.pathname;
    if (p.includes('/admin/products') || p.includes('/admin/categories')) return 'products';
    if (p.includes('/admin/orders')) return 'orders';
    if (p.includes('/admin/users')) return 'users';
    if (p.includes('/admin/analytics')) return 'analytics';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname, tab]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    if (newTab === 'overview') navigate('/admin');
    else navigate(`/admin/${newTab}`);
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Manage Products', icon: Package },
    { id: 'users', label: 'Manage Users', icon: Users },
    { id: 'orders', label: 'Manage Orders', icon: Receipt },
    { id: 'analytics', label: 'Platform Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">

      {/* Admin Top Bar */}
      <header className="bg-navy-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-tight text-white">Go Mart Admin Panel</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-900/60 text-purple-300 border border-purple-700/60 px-2 py-0.5 rounded-full">
                Root Access
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Operational & Catalog Management</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <BackButton fallback="/" label="Marketplace Front" />
          <button
            onClick={logout}
            className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-rose-950/40 border border-rose-900/50 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </header>

      {/* Admin Body Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Sidebar Nav */}
        <aside className="lg:col-span-3 bg-slate-900 rounded-3xl border border-slate-800 p-4 space-y-1 sticky top-24">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Admin Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Main Admin View */}
        <main className="lg:col-span-9 min-h-[550px]">
          {activeTab === 'overview' && <AdminOverview setActiveTab={setActiveTab} />}
          {activeTab === 'products' && <AdminProducts />}
          {activeTab === 'users' && <AdminUsers />}
          {activeTab === 'orders' && <AdminOrders />}
          {activeTab === 'analytics' && <AdminAnalytics />}
        </main>

      </div>

    </div>
  );
};

export default AdminDashboard;
