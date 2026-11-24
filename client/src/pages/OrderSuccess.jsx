import React, { useEffect } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  ArrowRight, 
  Printer, 
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { downloadService } from '../services/api';
import BackButton from '../components/BackButton';
import InvoiceDocument from '../components/InvoiceDocument';
import { toast } from 'react-toastify';

const OrderSuccess = () => {
  const location = useLocation();
  const order = location.state?.order;

  // Trigger celebration confetti upon mount
  useEffect(() => {
    if (order) {
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.55 }
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      
      {/* Print Stylesheet injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible !important;
          }
          #printable-invoice {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 12mm 15mm !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: #0f172a !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      {/* Top Navigation & Status (Screen Only) */}
      <div className="no-print flex items-center justify-between gap-4">
        <BackButton fallback="/dashboard/orders" label="Back to My Orders" />
        
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md shadow-cyan-600/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
          
          <Link
            to="/dashboard/orders"
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center gap-1.5"
          >
            <span>My Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Celebration Banner (Screen Only) */}
      <div className="no-print bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 shrink-0 mx-auto sm:mx-0">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Transaction Authorized & Completed
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              Thank You For Your Order!
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-lg">
              Your official tax invoice and perpetual commercial digital licenses are generated below. You can download assets right from the invoice or print a copy.
            </p>
          </div>
        </div>

        <Link
          to="/products"
          className="px-5 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100/50 transition-colors shrink-0 flex items-center gap-1.5"
        >
          <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {/* Direct Full-Page Official Tax Invoice (Approved Format) */}
      <InvoiceDocument
        order={order}
        onDownload={handleDownload}
        id="printable-invoice"
      />

      {/* Bottom Footer Actions (Screen Only) */}
      <div className="no-print pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={handlePrint}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Print / Save PDF Invoice
        </button>
        <Link
          to="/dashboard/orders"
          className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center justify-center gap-2"
        >
          <span>Track in Order History</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
};

export default OrderSuccess;
