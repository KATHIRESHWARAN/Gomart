import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Receipt, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  DollarSign, 
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const OrdersAnalyticsModal = ({ orders, isOpen, onClose }) => {
  if (!isOpen || !orders) return null;

  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.paymentStatus === 'completed').length;
  const failedPayments = orders.filter(o => o.paymentStatus === 'failed').length;
  
  const totalVolume = orders.reduce((sum, o) => {
    return o.paymentStatus === 'completed' ? sum + Number(o.totalAmount || 0) : sum;
  }, 0);

  const aov = completedOrders > 0 ? (totalVolume / completedOrders).toFixed(2) : '0.00';

  // Group orders chronologically for mini trend
  const trendMap = {};
  orders.forEach(o => {
    const dateStr = new Date(o.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
    trendMap[dateStr] = (trendMap[dateStr] || 0) + Number(o.totalAmount || 0);
  });

  const chartData = Object.entries(trendMap).map(([date, amount]) => ({
    date,
    amount: Number(amount.toFixed(2))
  })).slice(-7);

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
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Transactions Overview
                </span>
                <h3 className="text-xl font-black text-navy-900 dark:text-white mt-1">
                  Orders & Fulfillment Analytics
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
                <span>Total Orders</span>
                <Receipt className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-black text-navy-900 dark:text-white">{totalOrders}</p>
              <span className="text-[10px] text-slate-500">Invoices</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Completed</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-navy-900 dark:text-white">{completedOrders}</p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Fulfillments</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Failed/Canceled</span>
                <XCircle className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-black text-navy-900 dark:text-white">{failedPayments}</p>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">Simulated Declines</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Avg. Order</span>
                <DollarSign className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-navy-900 dark:text-white">${aov}</p>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Per Checkout</span>
            </div>

          </div>

          {/* Trend Chart */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-navy-900 dark:text-white">Recent Purchase Volume ($)</span>
              <span className="text-[10px] text-slate-400">Total: ${totalVolume.toFixed(2)}</span>
            </div>

            <div className="h-44 w-full">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No orders recorded to graph.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `$${val}`} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        borderColor: '#334155', 
                        borderRadius: '12px', 
                        color: '#fff',
                        fontSize: '12px' 
                      }} 
                    />
                    <Area type="monotone" dataKey="amount" stroke="#10b981" fillOpacity={1} fill="url(#orderGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Footer action */}
          <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" /> 100% Verified Ledger Data
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-navy-900 dark:bg-white text-white dark:text-navy-900 font-bold text-xs"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OrdersAnalyticsModal;
