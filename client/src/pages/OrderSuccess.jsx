import React, { useEffect } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  DownloadCloud, 
  ArrowRight, 
  Receipt, 
  ShieldCheck, 
  Truck,
  MapPin,
  Calendar,
  Package,
  CreditCard,
  Printer
} from 'lucide-react';
import { downloadService } from '../services/api';
import BackButton from '../components/BackButton';
import { toast } from 'react-toastify';

const OrderSuccess = () => {
  const location = useLocation();
  const order = location.state?.order;
  const estimatedDelivery = location.state?.estimatedDelivery || 'In 3-4 Business Days';

  // Trigger celebration confetti upon mount
  useEffect(() => {
    if (order) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [order]);

  if (!order) {
    return <Navigate to="/dashboard/orders" replace />;
  }

  const handleDownload = async (productId, productName) => {
    try {
      toast.info(`Preparing secure download for "${productName}"...`);
      const res = await downloadService.download(productId);
      if (res.data.downloadUrl) {
        window.open(res.data.downloadUrl, '_blank');
        toast.success(`Download started for "${productName}".`);
      }
    } catch (err) {
      toast.error('Download authorization error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      
      {/* Back Button */}
      <div className="flex justify-start">
        <BackButton fallback="/dashboard/orders" label="Back to My Orders" />
      </div>

      {/* Confirmation Hero Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-10 shadow-lg space-y-6">
        
        {/* Success Icon & Header */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50/50 dark:ring-emerald-950/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              Order Confirmed
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-navy-900 dark:text-white mt-1">
              Thank You For Your Order!
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              We have received your order. A confirmation email and tracking link have been dispatched.
            </p>
          </div>
        </div>

        {/* Estimated Delivery Ribbon */}
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Estimated Delivery
              </p>
              <h3 className="text-base font-black text-emerald-950 dark:text-emerald-100">
                Arriving by {estimatedDelivery}
              </h3>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-600 text-white shadow-xs">
            {order.orderStatus || 'Order Placed'}
          </span>
        </div>

        {/* Key Order Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Order Number</span>
            <span className="font-mono font-bold text-navy-900 dark:text-white">{order.orderId}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Order Date</span>
            <span className="font-semibold text-navy-900 dark:text-white">
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Total Amount</span>
            <span className="font-bold text-navy-900 dark:text-white font-mono">
              ${Number(order.totalAmount).toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Payment Method</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {order.paymentMethod || 'Cash on Delivery'}
            </span>
          </div>
        </div>

        {/* Shipping Address Details */}
        {order.shippingAddress && (
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1 text-left">
            <h4 className="font-bold text-navy-900 dark:text-white flex items-center gap-1.5 text-xs">
              <MapPin className="w-4 h-4 text-brand-600" /> Delivery Address
            </h4>
            <p className="font-bold text-navy-900 dark:text-white">{order.shippingAddress.fullName}</p>
            <p className="text-slate-600 dark:text-slate-300">
              {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - <strong className="font-mono">{order.shippingAddress.pincode}</strong>
            </p>
            <p className="text-slate-500">
              Contact: <strong className="text-navy-900 dark:text-white">{order.shippingAddress.phone}</strong>
            </p>
          </div>
        )}

        {/* Ordered Items List */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-left space-y-3">
          <h3 className="font-black text-navy-900 dark:text-white text-xs uppercase tracking-wider">
            Items in This Order ({order.items?.length || 0})
          </h3>

          <div className="space-y-3">
            {order.items?.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    {item.brand && (
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.brand}</span>
                    )}
                    <h4 className="font-bold text-navy-900 dark:text-white text-xs sm:text-sm line-clamp-1">
                      {item.name || item.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                      <span>Qty: <strong>{item.quantity || 1}</strong></span>
                      {item.selectedSize && <span>Size: <strong>{item.selectedSize}</strong></span>}
                      {item.category && <span className="text-slate-400">({item.category})</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="font-black text-sm text-navy-900 dark:text-white font-mono">
                    ${(Number(item.price) * (item.quantity || 1)).toFixed(2)}
                  </span>

                  {/* If item is digital download eligible */}
                  {item.downloadUrl && (
                    <button
                      onClick={() => handleDownload(item.productId, item.name || item.title)}
                      className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <DownloadCloud className="w-3.5 h-3.5" /> Download
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/dashboard/orders"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-brand-500/20"
          >
            Track Order in My Orders
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print Invoice
          </button>
          <Link
            to="/products"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors text-center"
          >
            Continue Shopping
          </Link>
        </div>

      </div>

    </div>
  );
};

export default OrderSuccess;
