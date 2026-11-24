import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, FileText } from 'lucide-react';
import InvoiceDocument from './InvoiceDocument';

const InvoiceModal = ({ order, isOpen, onClose, onDownload }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        
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

        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm no-print"
        />

        {/* Modal Window Wrapper */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto z-10 my-auto rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-3 sm:p-6 space-y-4"
        >

          {/* Top Control Bar (Screen only) */}
          <div className="no-print flex items-center justify-between pb-3 border-b border-slate-800 text-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Official Tax Invoice</h3>
                <p className="text-[11px] text-slate-400 font-mono">Reference: {order.orderId}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save PDF</span>
              </button>
              
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Printable Invoice Sheet */}
          <InvoiceDocument order={order} onDownload={onDownload} id="printable-invoice" />

        </motion.div>

      </div>
    </AnimatePresence>
  );
};

export default InvoiceModal;
