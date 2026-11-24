import React from 'react';
import { DownloadCloud, CheckCircle2 } from 'lucide-react';

const InvoiceDocument = ({ order, onDownload, id = 'printable-invoice' }) => {
  if (!order) return null;

  const invoiceNumber = order.orderId 
    ? order.orderId.replace(/[^a-zA-Z0-9]/g, ' ').trim()
    : (order.id ? order.id.slice(0, 10).toUpperCase() : '023465875');

  const formattedDate = order.createdAt 
    ? new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

  const buyerName = order.buyerName || order.shippingAddress?.fullName || 'Valued Customer';
  const buyerEmail = order.buyerEmail || order.shippingAddress?.email || 'customer@gomart.digital';
  const licenseType = order.shippingAddress?.licenseType || 'Commercial / Developer License';
  const transactionId = order.transactionId || order.paymentDetails?.transactionId || `TXN-${(order.id || Date.now()).toString().slice(-8).toUpperCase()}`;

  const items = order.items && order.items.length > 0 ? order.items : [
    {
      name: 'Digital Asset Deliverable',
      description: 'Standard Digital Package with Lifetime Updates',
      price: order.totalAmount || 0,
      quantity: 1,
      category: 'Digital Product'
    }
  ];

  const subtotal = items.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
  const discount = order.discountAmount ? Number(order.discountAmount) : (order.coupon?.discountAmount ? Number(order.coupon.discountAmount) : 0);
  const grandTotal = Number(order.totalAmount || (subtotal - discount)).toFixed(2);

  return (
    <div
      id={id}
      className="w-full bg-white text-slate-800 rounded-2xl p-6 sm:p-12 shadow-xl border border-slate-200/80 space-y-8 select-text"
    >
      {/* 1. Header: INVOICE title on Left, Brand on Right */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">INVOICE</h1>
          <p className="text-xs font-semibold tracking-widest text-slate-400 mt-1 font-mono uppercase">
            NO : # {invoiceNumber}
          </p>
        </div>

        {/* Brand Logo & Name */}
        <div className="flex items-center sm:items-start gap-3 sm:text-right">
          <div className="order-2 sm:order-1">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center sm:justify-end gap-1">
              GoMart <span className="text-cyan-600 font-extrabold">DIGITAL</span>
            </h2>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">She Software Solutions Inc.</p>
          </div>
          <div className="order-1 sm:order-2 w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-400 text-white flex items-center justify-center shadow-md shadow-cyan-500/20 shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
        </div>
      </div>

      {/* 2. Metadata Columns (Invoice To | Order & Transaction | Total Due) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start py-1 text-xs">
        
        {/* Column 1: Invoice To */}
        <div className="md:col-span-5 space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
            Invoice To
          </span>
          <h3 className="text-sm font-extrabold text-cyan-600">{buyerName}</h3>
          <p className="text-slate-600 font-medium leading-relaxed">
            Account: <span className="font-mono text-slate-800">{buyerEmail}</span><br />
            License: <span className="text-slate-800">{licenseType}</span><br />
            {order.shippingAddress?.phone && (
              <span>Contact: {order.shippingAddress.phone}</span>
            )}
          </p>
        </div>

        {/* Column 2: Order & Transaction */}
        <div className="md:col-span-4 space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
            Order & Transaction
          </span>
          <div className="space-y-1 text-slate-600 font-medium">
            <p><strong className="text-slate-800">Order ID:</strong> <span className="font-mono">{order.orderId}</span></p>
            <p><strong className="text-slate-800">Date:</strong> {formattedDate}</p>
            <p><strong className="text-slate-800">Payment:</strong> {order.paymentMethod || 'Online Payment'}</p>
            <p><strong className="text-slate-800">TXN Ref:</strong> <span className="font-mono text-[11px]">{transactionId}</span></p>
          </div>
        </div>

        {/* Column 3: Total Due Prominent Callout */}
        <div className="md:col-span-3 text-left md:text-right space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Due:
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
            USD: ${grandTotal}
          </div>
          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-200">
            ● {order.paymentStatus === 'completed' || !order.paymentStatus ? 'Paid in Full' : order.paymentStatus.toUpperCase()}
          </span>
        </div>

      </div>

      {/* 3. Line Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-y-2 border-slate-900 text-slate-900 font-bold uppercase text-[11px]">
              <th className="py-2.5 px-2 w-10 text-center">No.</th>
              <th className="py-2.5 px-3">Item Description</th>
              <th className="py-2.5 px-3 text-right">Unit Price</th>
              <th className="py-2.5 px-3 text-center">Qty</th>
              <th className="py-2.5 px-3 text-right">Total</th>
              {onDownload && <th className="py-2.5 px-3 text-center no-print w-24">Deliverable</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-700">
            {items.map((item, idx) => {
              const itemTotal = (Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2);
              const numPadded = (idx + 1).toString().padStart(2, '0');
              const itemName = item.name || item.title || 'Digital Deliverable';
              return (
                <tr key={idx}>
                  <td className="py-3 px-2 text-center font-mono font-medium text-slate-400">{numPadded}</td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900 text-xs sm:text-sm">{itemName}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.category ? `Category: ${item.category} • ` : ''}Instant Digital Download • Perpetual Commercial License
                    </p>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800">${Number(item.price || 0).toFixed(2)}</td>
                  <td className="py-3 px-3 text-center font-mono font-semibold text-slate-800">{item.quantity || 1}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">${itemTotal}</td>
                  {onDownload && (
                    <td className="py-3 px-3 text-center no-print">
                      {item.downloadUrl ? (
                        <button
                          onClick={() => onDownload(item.productId, itemName)}
                          className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-[11px] transition-all inline-flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <DownloadCloud className="w-3.5 h-3.5" />
                          <span>Get File</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">Ready</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 4. Lower Section: Payment & Terms on Left, Highlighted Cyan Box on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pt-2">
        
        {/* Left: Payment Method & Terms */}
        <div className="md:col-span-7 space-y-4 text-xs">
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Payment Method:</h4>
            <p className="text-slate-600 mt-0.5 leading-relaxed">
              Processed via <strong className="text-slate-800">{order.paymentMethod || 'Online Secure Gateway'}</strong><br />
              Status: <strong className="text-emerald-600">Authorized & Verified</strong> (256-Bit SSL Encryption)
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Terms & Conditions:</h4>
            <p className="text-slate-500 text-[11px] leading-relaxed mt-0.5">
              All items are digital deliverables with perpetual, non-exclusive commercial licenses. 
              Download access and version updates are permanently accessible from your user dashboard.
            </p>
          </div>
        </div>

        {/* Right: Signature Solid Cyan/Teal Totals Box */}
        <div className="md:col-span-5">
          <div className="bg-cyan-600 text-white rounded-xl p-4 sm:p-5 shadow-lg space-y-2 text-xs font-medium">
            
            <div className="flex items-center justify-between">
              <span className="text-cyan-100">Sub-Total:</span>
              <span className="font-mono font-bold text-sm text-white">${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-cyan-100">Digital Tax (0%):</span>
              <span className="font-mono font-bold text-white">$0.00</span>
            </div>

            {discount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-cyan-100">Coupon Discount:</span>
                <span className="font-mono font-bold text-cyan-200">-${discount.toFixed(2)}</span>
              </div>
            )}

            <div className="border-t border-cyan-500/80 pt-2 mt-1.5 flex items-center justify-between text-sm">
              <span className="font-extrabold uppercase tracking-wide text-white">Grand Total:</span>
              <span className="font-mono font-black text-lg text-white">${grandTotal}</span>
            </div>

          </div>
        </div>

      </div>

      {/* 5. Signature Section */}
      <div className="pt-4 flex justify-end">
        <div className="text-center w-52 space-y-1">
          <div className="h-10 flex items-center justify-center">
            <span className="font-serif italic text-2xl text-cyan-800 font-bold tracking-wide select-none">
              Micheal Johns
            </span>
          </div>
          <div className="border-t border-slate-900 pt-1">
            <h5 className="text-xs font-bold text-slate-900">Micheal Johns</h5>
            <p className="text-[10px] text-slate-400 font-medium">Director of Licensing & Operations</p>
          </div>
        </div>
      </div>

      {/* 6. Footer: Company Information */}
      <div className="pt-6 border-t border-slate-200 space-y-2">
        <h5 className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider">Company Information</h5>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">Phone:</span>
            <span>+91 (800) 555-GOMART</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">Support:</span>
            <span className="truncate">support@gomart.digital</span>
          </div>
          <div className="flex items-center gap-1.5 sm:justify-end">
            <span className="font-semibold text-slate-700">Platform:</span>
            <span>She Software Solutions</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default InvoiceDocument;
