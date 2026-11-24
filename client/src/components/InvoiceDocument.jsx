import React from 'react';
import { DownloadCloud } from 'lucide-react';

const cleanProductName = (rawName) => {
  if (!rawName) return 'Digital Product Package';
  return rawName
    .replace(/_[a-z0-9]{4,16}$/i, '')
    .replace(/179\d{10,}/g, '')
    .replace(/[-_]+/g, ' ')
    .trim();
};

const InvoiceDocument = ({ order, onDownload, id = 'printable-invoice' }) => {
  if (!order) return null;

  const invoiceNumber = order.orderId 
    ? order.orderId
    : (order.id ? `ORD-${order.id.slice(0, 10).toUpperCase()}` : 'ORD-2026-023465');

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
        backgroundColor: '#ffffff',
        color: '#0f172a',
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
        pageBreakInside: 'avoid',
        breakInside: 'avoid',
        boxSizing: 'border-box'
      }}
      className="w-full max-w-3xl mx-auto bg-white rounded-2xl p-6 sm:p-10 shadow-xl border border-slate-300 text-slate-900 select-text"
    >
      {/* 1. Top Header: INVOICE title on Left, Brand on Right */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b-2 border-slate-200">
        <div>
          <h1 
            style={{ color: '#0f172a', margin: 0, lineHeight: 1 }}
            className="text-3xl sm:text-4xl font-black tracking-tight"
          >
            INVOICE
          </h1>
          <p 
            style={{ color: '#64748b', marginTop: '6px' }}
            className="text-xs font-bold tracking-wider font-mono uppercase"
          >
            NO : #{invoiceNumber}
          </p>
        </div>

        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 text-right">
          <div>
            <h2 
              style={{ color: '#0f172a', margin: 0 }}
              className="text-lg sm:text-xl font-black tracking-tight flex items-center justify-end gap-1"
            >
              GoMart <span style={{ color: '#0891b2' }} className="font-extrabold">DIGITAL</span>
            </h2>
            <p style={{ color: '#64748b', margin: '2px 0 0 0' }} className="text-[10px] font-semibold">
              She Software Solutions Inc.
            </p>
          </div>
          <div 
            style={{ 
              backgroundColor: '#0891b2', 
              color: '#ffffff',
              WebkitPrintColorAdjust: 'exact', 
              printColorAdjust: 'exact' 
            }}
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0"
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
        </div>
      </div>

      {/* 2. Structured 3-Box Metadata Grid (Guaranteed alignment with clean borders) */}
      <div className="grid grid-cols-12 gap-3 sm:gap-4 items-stretch my-4">
        
        {/* Box 1: Invoice To */}
        <div 
          style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
          className="col-span-5 border rounded-xl p-3 sm:p-4 space-y-1"
        >
          <span 
            style={{ color: '#0891b2' }}
            className="text-[10px] font-extrabold uppercase tracking-wider block"
          >
            INVOICE TO
          </span>
          <h3 
            style={{ color: '#0f172a' }}
            className="text-xs sm:text-sm font-extrabold"
          >
            {buyerName}
          </h3>
          <p 
            style={{ color: '#475569' }}
            className="text-[11px] leading-relaxed font-medium"
          >
            Account: <strong style={{ color: '#0f172a' }} className="font-mono">{buyerEmail}</strong><br />
            License: <span style={{ color: '#334155' }}>{licenseType}</span><br />
            {order.shippingAddress?.phone && (
              <span>Contact: {order.shippingAddress.phone}</span>
            )}
          </p>
        </div>

        {/* Box 2: Order & Transaction Details */}
        <div 
          style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
          className="col-span-4 border rounded-xl p-3 sm:p-4 space-y-1"
        >
          <span 
            style={{ color: '#0891b2' }}
            className="text-[10px] font-extrabold uppercase tracking-wider block"
          >
            ORDER DETAILS
          </span>
          <div 
            style={{ color: '#475569' }}
            className="text-[11px] leading-snug space-y-0.5 font-medium"
          >
            <p><strong style={{ color: '#1e293b' }}>Order ID:</strong> <span className="font-mono text-[10px]">{order.orderId}</span></p>
            <p><strong style={{ color: '#1e293b' }}>Date:</strong> {formattedDate}</p>
            <p><strong style={{ color: '#1e293b' }}>Payment:</strong> {order.paymentMethod || 'card'}</p>
            <p><strong style={{ color: '#1e293b' }}>TXN Ref:</strong> <span className="font-mono text-[10px]">{transactionId}</span></p>
          </div>
        </div>

        {/* Box 3: Total Due Banner */}
        <div 
          style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
          className="col-span-3 border rounded-xl p-3 sm:p-4 flex flex-col justify-between text-right"
        >
          <span 
            style={{ color: '#64748b' }}
            className="text-[10px] font-bold uppercase tracking-wider block"
          >
            TOTAL DUE
          </span>
          <div 
            style={{ color: '#0f172a' }}
            className="text-xl sm:text-2xl font-black font-mono tracking-tight"
          >
            USD: ${grandTotal}
          </div>
          <div>
            <span 
              style={{ 
                backgroundColor: '#ecfdf5', 
                color: '#059669', 
                borderColor: '#a7f3d0',
                WebkitPrintColorAdjust: 'exact', 
                printColorAdjust: 'exact' 
              }}
              className="inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border"
            >
              ● {order.paymentStatus === 'completed' || !order.paymentStatus ? 'PAID IN FULL' : order.paymentStatus.toUpperCase()}
            </span>
          </div>
        </div>

      </div>

      {/* 3. Structured Line Items Table (Fully bordered and aligned) */}
      <div 
        style={{ borderColor: '#cbd5e1' }}
        className="border rounded-xl overflow-hidden my-4"
      >
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr 
              style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
              className="font-bold uppercase text-[10px]"
            >
              <th style={{ borderColor: '#334155' }} className="py-2.5 px-3 w-10 text-center border-r">No.</th>
              <th style={{ borderColor: '#334155' }} className="py-2.5 px-3 border-r">Item Description</th>
              <th style={{ borderColor: '#334155' }} className="py-2.5 px-3 text-right w-24 border-r">Unit Price</th>
              <th style={{ borderColor: '#334155' }} className="py-2.5 px-3 text-center w-14 border-r">Qty</th>
              <th className="py-2.5 px-3 text-right w-24">Total</th>
              {onDownload && <th className="py-2.5 px-2 text-center no-print w-20">Deliverable</th>}
            </tr>
          </thead>
          <tbody className="text-[11px]">
            {items.map((item, idx) => {
              const itemTotal = (Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2);
              const numPadded = (idx + 1).toString().padStart(2, '0');
              const itemName = cleanProductName(item.name || item.title);
              const isEven = idx % 2 === 0;

              return (
                <tr 
                  key={idx}
                  style={{ 
                    backgroundColor: isEven ? '#ffffff' : '#f8fafc',
                    borderColor: '#e2e8f0' 
                  }}
                  className="border-b"
                >
                  <td 
                    style={{ borderColor: '#e2e8f0', color: '#64748b' }}
                    className="py-3 px-3 text-center font-mono font-medium border-r"
                  >
                    {numPadded}
                  </td>
                  <td 
                    style={{ borderColor: '#e2e8f0' }}
                    className="py-3 px-3 border-r"
                  >
                    <p style={{ color: '#0f172a' }} className="font-extrabold text-xs">{itemName}</p>
                    <p style={{ color: '#64748b' }} className="text-[10px] mt-0.5">
                      {item.category ? `Category: ${item.category} • ` : ''}Instant Digital Download • Perpetual Commercial License
                    </p>
                  </td>
                  <td 
                    style={{ borderColor: '#e2e8f0', color: '#0f172a' }}
                    className="py-3 px-3 text-right font-mono font-bold border-r"
                  >
                    ${Number(item.price || 0).toFixed(2)}
                  </td>
                  <td 
                    style={{ borderColor: '#e2e8f0', color: '#0f172a' }}
                    className="py-3 px-3 text-center font-mono font-bold border-r"
                  >
                    {item.quantity || 1}
                  </td>
                  <td 
                    style={{ color: '#0f172a' }}
                    className="py-3 px-3 text-right font-mono font-black"
                  >
                    ${itemTotal}
                  </td>
                  {onDownload && (
                    <td className="py-3 px-2 text-center no-print">
                      {item.downloadUrl ? (
                        <button
                          onClick={() => onDownload(item.productId, itemName)}
                          className="px-2 py-0.5 rounded bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-[10px] transition-all inline-flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <DownloadCloud className="w-3 h-3" />
                          <span>Get</span>
                        </button>
                      ) : (
                        <span style={{ color: '#64748b' }} className="text-[9px] font-medium">Ready</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 4. Lower Section: Payment/Terms on Left, Solid Cyan Totals Box on Right */}
      <div className="grid grid-cols-12 gap-4 items-start my-4">
        
        {/* Left Column: Payment & Terms */}
        <div 
          style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
          className="col-span-7 border rounded-xl p-3 sm:p-4 space-y-2.5 text-[11px]"
        >
          <div>
            <h4 
              style={{ color: '#0f172a' }}
              className="font-bold uppercase tracking-wider text-[10px] mb-0.5"
            >
              PAYMENT METHOD
            </h4>
            <p style={{ color: '#475569' }} className="leading-snug">
              Processed via <strong style={{ color: '#0f172a' }}>{order.paymentMethod || 'card'}</strong> (256-Bit SSL Encryption) • <strong style={{ color: '#059669' }}>Authorized & Verified</strong>
            </p>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
            <h4 
              style={{ color: '#0f172a' }}
              className="font-bold uppercase tracking-wider text-[10px] mb-0.5"
            >
              TERMS & CONDITIONS
            </h4>
            <p style={{ color: '#64748b' }} className="text-[10px] leading-relaxed">
              All items are digital deliverables with perpetual, non-exclusive commercial licenses. Download access and version updates are permanently accessible from your user dashboard.
            </p>
          </div>
        </div>

        {/* Right Column: Signature Solid Cyan Totals Box */}
        <div className="col-span-5">
          <div 
            style={{ 
              backgroundColor: '#0891b2', 
              color: '#ffffff',
              WebkitPrintColorAdjust: 'exact', 
              printColorAdjust: 'exact' 
            }}
            className="rounded-xl p-4 shadow-md space-y-1.5 text-xs font-medium"
          >
            <div className="flex items-center justify-between text-[11px]">
              <span style={{ color: '#cffafe' }}>Sub-Total:</span>
              <strong style={{ color: '#ffffff' }} className="font-mono">${subtotal.toFixed(2)}</strong>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span style={{ color: '#cffafe' }}>Digital Tax (0%):</span>
              <strong style={{ color: '#ffffff' }} className="font-mono">$0.00</strong>
            </div>

            {discount > 0 && (
              <div className="flex items-center justify-between text-[11px]">
                <span style={{ color: '#cffafe' }}>Coupon Discount:</span>
                <strong style={{ color: '#a5f3fc' }} className="font-mono">-${discount.toFixed(2)}</strong>
              </div>
            )}

            <div 
              style={{ borderTop: '1px solid rgba(255, 255, 255, 0.4)' }}
              className="pt-2 mt-1 flex items-center justify-between"
            >
              <span style={{ color: '#ffffff' }} className="font-black uppercase tracking-wide text-xs">
                GRAND TOTAL:
              </span>
              <strong style={{ color: '#ffffff' }} className="font-mono font-black text-lg">
                ${grandTotal}
              </strong>
            </div>
          </div>
        </div>

      </div>

      {/* 5. Signature Section */}
      <div className="flex justify-end my-3">
        <div className="text-center w-48 space-y-1">
          <div className="h-8 flex items-center justify-center">
            <span 
              style={{ 
                fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive",
                fontSize: '26px',
                color: '#0e7490',
                fontWeight: 'bold'
              }} 
              className="select-none"
            >
              Micheal Johns
            </span>
          </div>
          <div style={{ borderTop: '1px solid #334155' }} className="pt-1">
            <h5 style={{ color: '#0f172a' }} className="text-[11px] font-extrabold leading-tight">Micheal Johns</h5>
            <p style={{ color: '#64748b' }} className="text-[9px] font-semibold leading-none">Director of Licensing & Operations</p>
          </div>
        </div>
      </div>

      {/* 6. Footer: Company Information */}
      <div 
        style={{ borderTop: '1px solid #e2e8f0' }}
        className="pt-3 space-y-1 text-[10px]"
      >
        <span 
          style={{ color: '#0891b2' }}
          className="font-extrabold uppercase tracking-wider text-[9px] block mb-1"
        >
          COMPANY INFORMATION
        </span>
        <div 
          style={{ color: '#64748b' }}
          className="grid grid-cols-3 gap-2"
        >
          <div>
            <strong style={{ color: '#334155' }}>Phone:</strong> +91 (800) 555-GOMART
          </div>
          <div className="text-center truncate">
            <strong style={{ color: '#334155' }}>Support:</strong> support@gomart.digital
          </div>
          <div className="text-right">
            <strong style={{ color: '#334155' }}>Platform:</strong> She Software Solutions
          </div>
        </div>
      </div>

    </div>
  );
};

export default InvoiceDocument;
