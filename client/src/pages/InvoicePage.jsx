import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService, downloadService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import BackButton from '../components/BackButton';
import InvoiceDocument from '../components/InvoiceDocument';
import { Printer, ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const InvoicePage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await orderService.getById(id);
      if (res.data?.success) {
        setOrder(res.data.data);
      } else {
        setError('Invoice could not be retrieved.');
      }
    } catch (err) {
      console.error('Failed to load invoice order:', err);
      setError(err.response?.data?.message || 'Invoice not found or access restricted.');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return <LoadingSpinner text="Generating official tax invoice..." />;
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Invoice Unavailable</h2>
        <p className="text-xs text-slate-500">{error || 'Unable to locate order records for this invoice.'}</p>
        <Link
          to="/dashboard/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-sm hover:bg-brand-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Orders</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Print Stylesheet injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            color: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            width: 100% !important;
            height: auto !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible !important;
          }
          #printable-invoice {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      {/* Top Header Actions (Screen Only) */}
      <div className="no-print flex items-center justify-between gap-4">
        <BackButton fallback="/dashboard/orders" label="Back to Orders" />
        
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md shadow-cyan-600/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Invoice Sheet */}
      <InvoiceDocument
        order={order}
        onDownload={handleDownload}
        id="printable-invoice"
      />

    </div>
  );
};

export default InvoicePage;
