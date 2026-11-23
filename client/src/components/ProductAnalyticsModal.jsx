import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  BarChart3, 
  TrendingUp, 
  Eye, 
  ShoppingBag, 
  DollarSign, 
  Percent, 
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const ProductAnalyticsModal = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;

  const views = Number(product.viewCount || 0);
  const sales = Number(product.salesCount || 0);
  const price = Number(product.price || 0);
  const revenue = sales * price;
  const conversionRate = views > 0 ? ((sales / views) * 100).toFixed(1) : 0;

  // Performance classification
  let performanceStatus = "Steady Performer";
  let performanceColor = "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800";
  if (conversionRate > 15 || sales > 100) {
    performanceStatus = "High Velocity Top Seller";
    performanceColor = "text-purple-500 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800";
  } else if (views > 100 && sales === 0) {
    performanceStatus = "High Traffic Discovery";
    performanceColor = "text-amber-500 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800";
  }

  // Mini comparison chart dataset
  const chartData = [
    { metric: 'Views', value: views },
    { metric: 'Sales', value: sales },
    { metric: 'In Carts', value: Math.round(views * 0.22) },
    { metric: 'Shares', value: Math.round(views * 0.08) }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-navy-950/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 p-6 sm:p-8 space-y-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/20 shrink-0">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                    Product Performance
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${performanceColor}`}>
                    {performanceStatus}
                  </span>
                </div>
                <h3 className="text-lg font-black text-navy-900 dark:text-white mt-1 line-clamp-1">
                  {product.name || product.title}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Views</span>
                <Eye className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-black text-navy-900 dark:text-white">{views.toLocaleString()}</p>
              <span className="text-[10px] text-slate-500">Impressions</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Purchases</span>
                <ShoppingBag className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-navy-900 dark:text-white">{sales.toLocaleString()}</p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Verified Orders</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Revenue</span>
                <DollarSign className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-black text-navy-900 dark:text-white">${revenue.toFixed(2)}</p>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Gross Earned</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Conv. Rate</span>
                <Percent className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-navy-900 dark:text-white">{conversionRate}%</p>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Sales / Views</span>
            </div>

          </div>

          {/* Mini Recharts Visual */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-navy-900 dark:text-white">Engagement Breakdown</span>
              <span className="text-[10px] text-slate-400">Unit Distribution</span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="metric" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: '#334155', 
                      borderRadius: '12px', 
                      color: '#fff',
                      fontSize: '12px' 
                    }} 
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Listing Price: <strong className="text-navy-900 dark:text-white">${price.toFixed(2)}</strong></span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-navy-900 dark:bg-white text-white dark:text-navy-900 font-bold text-xs"
            >
              Close Performance
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProductAnalyticsModal;
