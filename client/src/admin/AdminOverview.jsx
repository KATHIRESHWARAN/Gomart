import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Package, 
  Users, 
  DollarSign, 
  Receipt, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  BarChart3,
  Sparkles,
  PieChart as PieIcon
} from 'lucide-react';

const AdminOverview = ({ setActiveTab }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDashboard();
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving platform operations stats..." />;
  }

  return (
    <div className="space-y-8">
      
      {/* Top Banner with Prominent "Analytics Overview" Button (Requirement 5.D) */}
      <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-navy-950 p-6 sm:p-8 rounded-3xl border border-purple-800/60 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400 bg-purple-950/80 px-2.5 py-1 rounded-full border border-purple-700/60 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Executive Operations Center
          </span>
          <h2 className="text-2xl font-black text-white mt-2">Platform Performance & Governance</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Centralized control over digital catalogs, creator accounts, fulfillment audit logs, and gross platform revenue.
          </p>
        </div>

        {/* PROMINENT REQUIRED ANALYTICS BUTTON (Requirement 5.D) */}
        <button
          onClick={() => setActiveTab('analytics')}
          className="px-6 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xl shadow-purple-600/30 hover:scale-105 transition-all flex items-center justify-center gap-2 shrink-0 group"
        >
          <BarChart3 className="w-4 h-4 text-purple-200 group-hover:rotate-12 transition-transform" />
          Analytics Overview
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Products */}
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Products</span>
            <h3 className="text-2xl font-black text-white mt-1">{stats?.totalProducts || 0}</h3>
            <span className="text-[11px] text-purple-400 font-semibold">{stats?.approvedProducts || 0} active</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-950/60 border border-purple-800 text-purple-400 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Total Registered Users */}
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Users</span>
            <h3 className="text-2xl font-black text-white mt-1">{stats?.totalUsers || 0}</h3>
            <span className="text-[11px] text-blue-400 font-semibold">Buyers & Creators</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-950/60 border border-blue-800 text-blue-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Platform Orders */}
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Orders</span>
            <h3 className="text-2xl font-black text-white mt-1">{stats?.totalOrders || 0}</h3>
            <span className="text-[11px] text-emerald-400 font-semibold">Completed transactions</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-400 flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        {/* Total Platform Sales */}
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Sales</span>
            <h3 className="text-2xl font-black text-white mt-1">${(stats?.totalSales || 0).toFixed(2)}</h3>
            <span className="text-[11px] text-amber-400 font-semibold">Simulated revenue</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-950/60 border border-amber-800 text-amber-400 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Quick Operational Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/60 text-purple-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Product Catalog</h4>
              <p className="text-xs text-slate-400">Review, approve, or reject products</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('products')}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            Manage All Products <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/60 text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">User Directory</h4>
              <p className="text-xs text-slate-400">Accounts, roles, and status control</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('users')}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            View User Directory <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Visual Analytics</h4>
              <p className="text-xs text-slate-400">Recharts monthly sales & trends</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('analytics')}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-purple-600/20"
          >
            Open Analytics Suite <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};

export default AdminOverview;
