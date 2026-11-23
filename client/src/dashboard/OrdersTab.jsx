import React, { useState, useEffect } from 'react';
import { orderService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import OrdersAnalyticsModal from '../components/OrdersAnalyticsModal';
import BackButton from '../components/BackButton';
import { 
  Receipt, 
  Calendar, 
  CreditCard, 
  ShieldCheck, 
  BarChart3, 
  Truck, 
  MapPin, 
  Package, 
  CheckCircle2, 
  Clock, 
  XCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

const STATUS_STEPS = [
  'Order Placed',
  'Payment Verified',
  'License Generated',
  'Completed'
];

const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getMyOrders();
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setCancellingId(orderId);
      const res = await orderService.cancelOrder(orderId);
      if (res.data.success) {
        toast.success('Order cancelled successfully.');
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: 'Cancelled' } : o));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancellingId(null);
    }
  };

  const getStepIndex = (status) => {
    if (status === 'Cancelled') return -1;
    const idx = STATUS_STEPS.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  if (loading) {
    return <LoadingSpinner text="Fetching your order history..." />;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No orders found"
        description="When you purchase digital products, your transaction receipts and invoices will appear here."
        actionText="Start Shopping"
        actionLink="/products"
      />
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="flex justify-start">
        <BackButton fallback="/dashboard" label="Back to Dashboard" />
      </div>

      {/* Header with "Orders Analytics" Button (Requirement 5.E) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-navy-900 dark:text-white tracking-tight">
            My Orders & Tracking
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track package delivery, view invoices, and manage order items.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* REQUIRED ORDERS ANALYTICS BUTTON (Requirement 5.E) */}
          <button
            onClick={() => setShowAnalyticsModal(true)}
            className="px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-100 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 text-purple-500" />
            <span>Orders Analytics</span>
          </button>

          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
            {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
          </span>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {orders.map((ord) => {
          const currentStep = getStepIndex(ord.orderStatus || 'Order Placed');
          const isCancelled = ord.orderStatus === 'Cancelled';
          const canCancel = !isCancelled && (currentStep <= 1); // Only Order Placed or Processing

          return (
            <div
              key={ord.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-5"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-navy-900 dark:text-white">
                      {ord.orderId}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      isCancelled
                        ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        : ord.orderStatus === 'Delivered'
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800'
                    }`}>
                      {ord.orderStatus || 'Order Placed'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Placed on {new Date(ord.createdAt).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                      <CreditCard className="w-3.5 h-3.5" />
                      {ord.paymentMethod || 'Cash on Delivery'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 font-medium block">Total Payable</span>
                    <span className="text-xl font-black text-navy-900 dark:text-white font-mono">
                      ${Number(ord.totalAmount).toFixed(2)}
                    </span>
                  </div>

                  {canCancel && (
                    <button
                      onClick={() => handleCancelOrder(ord.id)}
                      disabled={cancellingId === ord.id}
                      className="px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-bold transition-colors"
                    >
                      {cancellingId === ord.id ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                </div>
              </div>

              {/* Visual 5-Step Order Progress Tracker */}
              {!isCancelled ? (
                <div className="py-2 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-5 gap-2 relative">
                    {STATUS_STEPS.map((step, idx) => {
                      const isDone = idx <= currentStep;
                      const isCurrent = idx === currentStep;

                      return (
                        <div key={idx} className="flex flex-col items-center text-center space-y-1 relative">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isDone 
                              ? 'bg-emerald-500 text-white shadow-xs' 
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                          }`}>
                            {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                          </div>
                          <span className={`text-[10px] sm:text-xs leading-tight ${
                            isCurrent 
                              ? 'font-black text-brand-600 dark:text-brand-400' 
                              : isDone 
                              ? 'font-bold text-slate-700 dark:text-slate-300' 
                              : 'text-slate-400'
                          }`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300 font-bold">
                  <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>This order has been cancelled. If payment was collected, refund will process within 3-5 business days.</span>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-3 pt-1">
                {ord.items?.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80'} 
                        alt={item.name} 
                        className="w-14 h-14 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700" 
                      />
                      <div>
                        {item.brand && (
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.brand}</span>
                        )}
                        <h4 className="font-bold text-xs sm:text-sm text-navy-900 dark:text-white line-clamp-1">
                          {item.name || item.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                          <span>Qty: <strong>{item.quantity || 1}</strong></span>
                          {item.selectedSize && <span>Size: <strong>{item.selectedSize}</strong></span>}
                          {item.category && <span className="text-slate-400">({item.category})</span>}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-sm text-navy-900 dark:text-white font-mono">
                        ${(Number(item.price) * (item.quantity || 1)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping Address & Verification Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
                {ord.shippingAddress ? (
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span>Delivered to: <strong>{ord.shippingAddress.fullName}</strong>, {ord.shippingAddress.city} ({ord.shippingAddress.pincode})</span>
                  </div>
                ) : (
                  <span>Standard Go Mart Express Shipping</span>
                )}
                
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Verified Purchase
                </span>
              </div>

            </div>
          );
        })}
      </div>

      {/* Orders Analytics Modal (Requirement 5.E) */}
      <OrdersAnalyticsModal
        orders={orders}
        isOpen={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
      />

    </div>
  );
};

export default OrdersTab;
