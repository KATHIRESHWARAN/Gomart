import React from 'react';
import { DownloadCloud } from 'lucide-react';

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
      style={{
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
        pageBreakInside: 'avoid',
        breakInside: 'avoid'
      }}
      className="w-full bg-white text-slate-900 rounded-2xl p-6 sm:p-10 shadow-xl border border-slate-200/90 space-y-5 select-text"
    >
      {/* 1. Header: INVOICE title on Left, Brand on Right */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">INVOICE</h1>
          <p className="text-[11px] font-bold tracking-widest text-slate-500 mt-1.5 font-mono uppercase">
            NO : # {invoiceNumber}
          </p>
        </div>

        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 text-right">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center justify-end gap-1">
              GoMart <span className="text-cyan-600 font-extrabold">DIGITAL</span>
            </h2>
            <p className="text-[10px] font-medium text-slate-500 mt-0.5">She Software Solutions Inc.</p>
          </div>
          <div 
            style={{ backgroundColor: '#0891b2', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
            className="w-9 h-9 rounded-xl text-white flex items-center justify-center shadow-sm shrink-0"
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
        </div>
      </div>

      {/* 2. Metadata Columns (Always 3 columns, never stacked) */}
      <div className="grid grid-cols-12 gap-4 items-start py-1 text-xs">
        
        {/* Column 1: Invoice To */}
        <div className="col-span-5 space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
            Invoice To
          </span>
          <h3 className="text-xs sm:text-sm font-extrabold text-cyan-700">{buyerName}</h3>
          <p className="text-slate-600 text-[11px] font-medium leading-relaxed">
            Account: <span className="font-mono text-slate-900 font-semibold">{buyerEmail}</span><br />
            License: <span className="text-slate-800">{licenseType}</span><br />
            {order.shippingAddress?.phone && (
              <span>Contact: {order.shippingAddress.phone}</span>
            )}
          </p>
        </div>

        {/* Column 2: Order & Transaction */}
        <div className="col-span-4 space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
            Order & Transaction
          </span>
          <div className="space-y-0.5 text-slate-600 text-[11px] font-medium">
            <p><strong className="text-slate-800">Order ID:</strong> <span className="font-mono text-[10px]">{order.orderId}</span></p>
            <p><strong className="text-slate-800">Date:</strong> {formattedDate}</p>
            <p><strong className="text-slate-800">Payment:</strong> {order.paymentMethod || 'card'}</p>
            <p><strong className="text-slate-800">TXN Ref:</strong> <span className="font-mono text-[10px]">{transactionId}</span></p>
          </div>
        </div>

        {/* Column 3: Total Due Prominent Callout */}
        <div className="col-span-3 text-right space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Due:
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
            USD: ${grandTotal}
          </div>
          <span 
            style={{ 
              backgroundColor: '#ecfdf5', 
              color: '#059669', 
              borderColor: '#a7f3d0',
              WebkitPrintColorAdjust: 'exact', 
              printColorAdjust: 'exact' 
            }}
            className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border"
          >
            ● {order.paymentStatus === 'completed' || !order.paymentStatus ? 'Paid in Full' : order.paymentStatus.toUpperCase()}
          </span>
        </div>

      </div>

      {/* 3. Line Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-y-2 border-slate-900 text-slate-900 font-bold uppercase text-[10px]">
              <th className="py-2 px-2 w-8 text-center">No.</th>
              <th className="py-2 px-3">Item Description</th>
              <th className="py-2 px-3 text-right w-24">Unit Price</th>
              <th className="py-2 px-3 text-center w-12">Qty</th>
              <th className="py-2 px-3 text-right w-24">Total</th>
              {onDownload && <th className="py-2 px-2 text-center no-print w-20">Download</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800 text-[11px]">
            {items.map((item, idx) => {
              const itemTotal = (Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2);
              const numPadded = (idx + 1).toString().padStart(2, '0');
              const itemName = item.name || item.title || 'Digital Deliverable';
              return (
                <tr key={idx}>
                  <td className="py-2.5 px-2 text-center font-mono font-medium text-slate-400">{numPadded}</td>
                  <td className="py-2.5 px-3">
                    <p className="font-bold text-slate-900 text-xs">{itemName}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {item.category ? `Category: ${item.category} • ` : ''}Instant Digital Download • Perpetual Commercial License
                    </p>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-800">${Number(item.price || 0).toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-800">{item.quantity || 1}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">${itemTotal}</td>
                  {onDownload && (
                    <td className="py-2.5 px-2 text-center no-print">
                      {item.downloadUrl ? (
                        <button
                          onClick={() => onDownload(item.productId, itemName)}
                          className="px-2 py-0.5 rounded bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-[10px] transition-all inline-flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <DownloadCloud className="w-3 h-3" />
                          <span>Get</span>
                        </button>
                      ) : (
                        <span className="text-[9px] text-slate-400 font-medium">Unlocked</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 4. Lower Section: Payment/Terms on Left, Highlighted Cyan Box on Right (Side by side always) */}
      <div className="grid grid-cols-12 gap-4 items-start pt-1">
        
        {/* Left: Payment Method & Terms */}
        <div className="col-span-7 space-y-3 text-[11px]">
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Payment Method:</h4>
            <p className="text-slate-600 mt-0.5 leading-snug">
              Processed via <strong className="text-slate-800">{order.paymentMethod || 'card'}</strong><br />
              Status: <strong className="text-emerald-600">Authorized & Verified</strong> (256-Bit SSL Encryption)
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Terms & Conditions:</h4>
            <p className="text-slate-500 text-[10px] leading-relaxed mt-0.5">
              All items are digital deliverables with perpetual, non-exclusive commercial licenses. 
              Download access and version updates are permanently accessible from your user dashboard.
            </p>
          </div>
        </div>

        {/* Right: Signature Solid Cyan Totals Box (Fixed width in row, guaranteed print colors) */}
        <div className="col-span-5">
          <div 
            style={{ 
              backgroundColor: '#0891b2', 
              color: '#ffffff',
              WebkitPrintColorAdjust: 'exact', 
              printColorAdjust: 'exact' 
            }}
            className="bg-cyan-600 text-white rounded-xl p-3.5 shadow-md space-y-1.5 text-xs font-medium"
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-cyan-100">Sub-Total:</span>
              <span className="font-mono font-bold text-white">${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-cyan-100">Digital Tax (0%):</span>
              <span className="font-mono font-bold text-white">$0.00</span>
            </div>

            {discount > 0 && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-cyan-100">Coupon Discount:</span>
                <span className="font-mono font-bold text-cyan-200">-${discount.toFixed(2)}</span>
              </div>
            )}

            <div className="border-t border-cyan-400/60 pt-1.5 mt-1 flex items-center justify-between">
              <span className="font-extrabold uppercase tracking-wide text-white text-xs">Grand Total:</span>
              <span className="font-mono font-black text-base text-white">${grandTotal}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 5. Signature Section */}
      <div className="pt-2 flex justify-end">
        <div className="text-center w-48 space-y-0.5">
          <div className="h-8 flex items-center justify-center">
            <span 
              style={{ 
                fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive",
                fontSize: '24px',
                color: '#0e7490'
              }} 
              className="font-bold select-none"
            >
              Micheal Johns
            </span>
          </div>
          <div className="border-t border-slate-900 pt-1">
            <h5 className="text-[11px] font-bold text-slate-900 leading-tight">Micheal Johns</h5>
            <p className="text-[9px] text-slate-500 font-medium leading-none">Director of Licensing & Operations</p>
          </div>
        </div>
      </div>

      {/* 6. Footer: Company Information */}
      <div className="pt-4 border-t border-slate-200 space-y-1 text-[10px] text-slate-500">
        <h5 className="font-bold text-cyan-700 uppercase tracking-wider text-[9px]">Company Information</h5>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <span className="font-semibold text-slate-700">Phone:</span> +91 (800) 555-GOMART
          </div>
          <div className="truncate">
            <span className="font-semibold text-slate-700">Support:</span> support@gomart.digital
          </div>
          <div className="text-right">
            <span className="font-semibold text-slate-700">Platform:</span> She Software Solutions
          </div>
        </div>
      </div>

    </div>
  );
};

export default InvoiceDocument;
