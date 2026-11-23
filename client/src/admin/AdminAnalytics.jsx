import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieIcon, Eye, ShoppingCart, Calendar, Filter } from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#f43f5e'];

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('6M'); // '7D', '30D', '6M'

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAnalytics();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Generating Recharts analytics datasets..." />;
  }

  const { monthlySales = [], categoryDistribution = [], mostViewed = [], topSelling = [] } = data || {};

  // Filtered monthly view depending on time tab
  let displayMonthlySales = monthlySales;
  if (timeFilter === '7D') {
    displayMonthlySales = monthlySales.slice(-2);
  } else if (timeFilter === '30D') {
    displayMonthlySales = monthlySales.slice(-3);
  }

  return (
    <div className="space-y-8">
      
      {/* Header with Time Filter Toggle (Requirement 6) */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 text-purple-400 text-xs font-bold uppercase tracking-wider mb-2 border border-purple-800">
            <BarChart3 className="w-3.5 h-3.5" /> Recharts Live Engine
          </div>
          <h2 className="text-2xl font-black text-white">Platform Analytics Dashboard</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time visualization of sales trends, product views, and category distributions.
          </p>
        </div>

        {/* Timeframe Filter Buttons (Requirement 6) */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shrink-0">
          <button
            onClick={() => setTimeFilter('7D')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeFilter === '7D'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeFilter('30D')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeFilter === '30D'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setTimeFilter('6M')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeFilter === '6M'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            6 Months
          </button>
        </div>
      </div>

      {/* Grid of Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Monthly Sales Overview (Line / Area) */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" /> Monthly Revenue Trend ($)
            </h3>
            <span className="text-[10px] text-purple-400 font-bold bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800">
              {timeFilter} View
            </span>
          </div>

          <div className="h-64 w-full">
            {displayMonthlySales.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No monthly sales records to display yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={displayMonthlySales}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} 
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Category Distribution (Pie / Donut) */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-400" /> Product Category Breakdown
            </h3>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Inventory Share</span>
          </div>

          <div className="h-64 w-full">
            {categoryDistribution.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No category data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    fontSize={10}
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Most Viewed Products (Bar Chart) */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-brand-400" /> Most Viewed Products
            </h3>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">User Impressions</span>
          </div>

          <div className="h-64 w-full">
            {mostViewed.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No view metrics recorded.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mostViewed} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} width={90} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} 
                  />
                  <Bar dataKey="views" fill="#6366f1" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 4: Top-Selling Products (Bar Chart) */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-amber-400" /> Top-Selling Products (Copies)
            </h3>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Gross Orders</span>
          </div>

          <div className="h-64 w-full">
            {topSelling.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No purchase metrics recorded.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSelling} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} width={90} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} 
                  />
                  <Bar dataKey="sales" fill="#10b981" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminAnalytics;
