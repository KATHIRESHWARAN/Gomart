import React from 'react';
import { DownloadCloud, Phone, Mail, Globe, MapPin } from 'lucide-react';

const cleanProductName = (rawName) => {
  if (!rawName) return 'Digital Product Deliverable';
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
  const buyerPhone = order.shippingAddress?.phone || '+91 (800) 555-GOMART';
  const transactionId = order.transactionId || order.paymentDetails?.transactionId || `TXN-${(order.id || Date.now()).toString().slice(-8).toUpperCase()}`;

  const items = order.items && order.items.length > 0 ? order.items : [
    {
      name: 'Digital Asset Deliverable',
      description: 'Standard Digital Package with Lifetime Updates',
      price: order.totalAmount || 0,
      quantity: 1,
      category: 'Digital Deliverable'
    }
  ];

  const subtotal = items.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
  const discount = order.discountAmount ? Number(order.discountAmount) : (order.coupon?.discountAmount ? Number(order.coupon.discountAmount) : 0);
  const grandTotal = Number(order.totalAmount || (subtotal - discount)).toFixed(2);

  // Spaced invoice number format like "# 0 2 3 4 6 5 8 7 5" from Bound Box
  const rawNum = invoiceNumber.replace(/[^a-zA-Z0-9]/g, '');
  const spacedNumber = rawNum.split('').slice(0, 16).join(' ');

  return (
    <div
      id={id}
      style={{
        backgroundColor: '#ffffff',
        color: '#0f172a',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
        pageBreakInside: 'avoid',
        breakInside: 'avoid',
        boxSizing: 'border-box'
      }}
      className="w-full max-w-3xl mx-auto bg-white rounded-2xl p-6 sm:p-10 shadow-xl border border-slate-200 text-slate-900 select-text"
    >
      {/* 1. TOP HEADER (Bound Box Style): INVOICE on left, Brand Logo + Total Due on right */}
      <div className="flex items-start justify-between gap-6 pb-6 border-b border-slate-200">
        
        {/* Left: INVOICE title & Spaced Number */}
        <div>
          <h1 
            style={{ color: '#0f172a', margin: 0, letterSpacing: '0.04em', lineHeight: 1 }}
            className="text-3xl sm:text-4xl font-black tracking-tight"
          >
            INVOICE
          </h1>
          <p 
            style={{ color: '#475569', marginTop: '8px', letterSpacing: '0.15em' }}
            className="text-xs font-bold font-mono uppercase"
          >
            NO : # {spacedNumber}
          </p>
        </div>

        {/* Right: Modern Geometric Logo + Total Due Display */}
        <div className="text-right flex flex-col items-end">
          <div className="flex items-center gap-2.5 mb-2">
            <div>
              <h2 
                style={{ color: '#0f172a', margin: 0 }}
                className="text-base sm:text-lg font-black tracking-tight leading-none"
              >
                GoMart <span style={{ color: '#0891b2' }}>DIGITAL</span>
              </h2>
              <p style={{ color: '#64748b', margin: '2px 0 0 0' }} className="text-[10px] font-semibold">
                She Software Solutions Inc.
              </p>
            </div>
            {/* Bound Box Inspired Geometric Logo Icon */}
            <div 
              style={{ 
                backgroundColor: '#0891b2', 
                color: '#ffffff',
                WebkitPrintColorAdjust: 'exact', 
                printColorAdjust: 'exact' 
              }}
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-xs shrink-0"
            >
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </div>
          </div>

          {/* Bound Box Total Due Prominent Display */}
          <div className="mt-1">
            <span style={{ color: '#64748b' }} className="text-[10px] font-bold uppercase tracking-wider block">
              Total Due:
            </span>
            <div 
              style={{ color: '#0f172a' }}
              className="text-2xl sm:text-3xl font-black font-mono tracking-tight"
            >
              USD: ${grandTotal}
            </div>
          </div>
        </div>

      </div>

      {/* 2. METADATA ROW (Bound Box Style: Clean Typography, No Heavy Grey Card Boxes) */}
      <div className="grid grid-cols-12 gap-6 my-6 text-xs">
        
        {/* Left: Invoice To */}
        <div className="col-span-12 sm:col-span-6 space-y-1">
          <span 
            style={{ color: '#0891b2' }}
            className="text-[11px] font-bold uppercase tracking-wider block mb-1"
          >
            Invoice To:
          </span>
          <h3 
            style={{ color: '#0f172a' }}
            className="text-sm sm:text-base font-extrabold"
          >
            {buyerName}
          </h3>
          <p style={{ color: '#475569' }} className="leading-relaxed text-[11px]">
            <strong>Account:</strong> <span className="font-mono text-slate-800">{buyerEmail}</span><br />
            <strong>License:</strong> <span>{licenseType}</span><br />
            <strong>Phone:</strong> <span>{buyerPhone}</span>
          </p>
        </div>

        {/* Right: Order & Payment Details (Matching Bound Box Bank Details Section) */}
        <div className="col-span-12 sm:col-span-6 space-y-1 sm:text-right">
          <span 
            style={{ color: '#0891b2' }}
            className="text-[11px] font-bold uppercase tracking-wider block mb-1"
          >
            Order & Transaction Details:
          </span>
          <div style={{ color: '#475569' }} className="leading-relaxed text-[11px] space-y-0.5">
            <p><strong>Order ID:</strong> <span className="font-mono text-slate-800">{invoiceNumber}</span></p>
            <p><strong>Invoice Date:</strong> <span>{formattedDate}</span></p>
            <p><strong>Payment Method:</strong> <span className="capitalize">{order.paymentMethod || 'Credit / Debit Card'}</span></p>
            <p><strong>Transaction Ref:</strong> <span className="font-mono text-[10px] text-slate-700">{transactionId}</span></p>
          </div>
        </div>

      </div>

      {/* 3. BOUND BOX TABLE (Clean Horizontal Borders, No Clunky Vertical Columns) */}
      <div className="my-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr 
              style={{ borderTop: '1.5px solid #cbd5e1', borderBottom: '1.5px solid #cbd5e1' }}
              className="text-[11px] font-bold uppercase text-slate-700 tracking-wider"
            >
              <th className="py-2.5 px-2 w-12 text-center">No.</th>
              <th className="py-2.5 px-3">Item Description</th>
              <th className="py-2.5 px-3 text-right w-28">Unit Price</th>
              <th className="py-2.5 px-3 text-center w-16">Qty</th>
              <th className="py-2.5 px-3 text-right w-28">Total</th>
              {onDownload && <th className="py-2.5 px-2 text-center no-print w-20">Deliverable</th>}
            </tr>
          </thead>
          <tbody className="text-xs">
            {items.map((item, idx) => {
              const itemTotal = (Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2);
              const numPadded = (idx + 1).toString().padStart(2, '0');
              const itemName = cleanProductName(item.name || item.title);

              return (
                <tr 
                  key={idx}
                  style={{ borderBottom: '1px solid #e2e8f0' }}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td 
                    style={{ color: '#64748b' }}
                    className="py-3 px-2 text-center font-mono font-medium text-[11px]"
                  >
                    {numPadded}
                  </td>
                  <td className="py-3 px-3">
                    <p style={{ color: '#0f172a' }} className="font-bold text-xs sm:text-sm">
                      {itemName}
                    </p>
                    <p style={{ color: '#64748b' }} className="text-[10px] mt-0.5">
                      {item.category ? `Category: ${item.category} • ` : ''}Instant Digital Download • Perpetual Commercial License
                    </p>
                  </td>
                  <td 
                    style={{ color: '#0f172a' }}
                    className="py-3 px-3 text-right font-mono font-semibold"
                  >
                    ${Number(item.price || 0).toFixed(2)}
                  </td>
                  <td 
                    style={{ color: '#0f172a' }}
                    className="py-3 px-3 text-center font-mono font-semibold"
                  >
                    {item.quantity || 1}
                  </td>
                  <td 
                    style={{ color: '#0f172a' }}
                    className="py-3 px-3 text-right font-mono font-bold"
                  >
                    ${itemTotal}
                  </td>
                  {onDownload && (
                    <td className="py-3 px-2 text-center no-print">
                      {item.downloadUrl ? (
                        <button
                          onClick={() => onDownload(item.productId, itemName)}
                          className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-[10px] transition-all inline-flex items-center gap-1 shadow-xs cursor-pointer"
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

      {/* 4. LOWER SECTION: Payment & Terms on Left, Bound Box Signature Solid Cyan Box on Right */}
      <div className="grid grid-cols-12 gap-6 items-start my-6">
        
        {/* Left (7 Columns): Payment Method & Terms */}
        <div className="col-span-12 sm:col-span-7 space-y-4 text-xs">
          
          {/* Payment Method */}
          <div className="space-y-1">
            <h4 
              style={{ color: '#0f172a' }}
              className="font-bold uppercase tracking-wider text-[11px]"
            >
              Payment Method:
            </h4>
            <p style={{ color: '#475569' }} className="text-[11px] leading-relaxed">
              Processed via <strong style={{ color: '#0f172a' }}>{order.paymentMethod || 'Credit / Debit Card'}</strong> (256-Bit SSL Encryption)<br />
              Card Payment Accepted: <span style={{ color: '#334155' }}>Visa, MasterCard, Amex, PayPal, Net Banking</span><br />
              Status: <strong style={{ color: '#059669' }}>Authorized & Verified</strong>
            </p>
          </div>

          {/* Terms & Conditions */}
          <div className="space-y-1">
            <h4 
              style={{ color: '#0f172a' }}
              className="font-bold uppercase tracking-wider text-[11px]"
            >
              Terms & Condition:
            </h4>
            <p style={{ color: '#64748b' }} className="text-[10px] leading-relaxed">
              All digital deliverables grant a perpetual, non-exclusive commercial license. Access links, file archives, and lifetime version updates are permanently accessible from your GoMart account dashboard.
            </p>
          </div>

        </div>

        {/* Right (5 Columns): Bound Box Iconic Solid Cyan/Teal Grand Total Card */}
        <div className="col-span-12 sm:col-span-5">
          <div 
            style={{ 
              backgroundColor: '#0891b2', 
              color: '#ffffff',
              WebkitPrintColorAdjust: 'exact', 
              printColorAdjust: 'exact' 
            }}
            className="rounded-2xl p-4 sm:p-5 shadow-lg space-y-2 text-xs"
          >
            <div className="flex items-center justify-between text-[11px]">
              <span style={{ color: '#cffafe' }} className="font-medium">Sub-Total:</span>
              <strong style={{ color: '#ffffff' }} className="font-mono">${subtotal.toFixed(2)}</strong>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span style={{ color: '#cffafe' }} className="font-medium">Tax: Digital VAT (0%):</span>
              <strong style={{ color: '#ffffff' }} className="font-mono">$0.00</strong>
            </div>

            {discount > 0 && (
              <div className="flex items-center justify-between text-[11px]">
                <span style={{ color: '#cffafe' }} className="font-medium">Discount (Promo):</span>
                <strong style={{ color: '#a5f3fc' }} className="font-mono">-${discount.toFixed(2)}</strong>
              </div>
            )}

            <div 
              style={{ borderTop: '1px solid rgba(255, 255, 255, 0.35)' }}
              className="pt-2.5 mt-1.5 flex items-center justify-between"
            >
              <span style={{ color: '#ffffff' }} className="font-black uppercase tracking-wider text-xs">
                Grand Total:
              </span>
              <strong style={{ color: '#ffffff' }} className="font-mono font-black text-xl">
                ${grandTotal}
              </strong>
            </div>
          </div>
        </div>

      </div>

      {/* 5. SIGNATURE BLOCK (Bound Box Style: Right-Aligned Elegant Signature) */}
      <div className="flex justify-end my-6">
        <div className="text-center w-52 space-y-1">
          <div className="h-9 flex items-center justify-center">
            <span 
              style={{ 
                fontFamily: "'Brush Script MT', 'Lucida Handwriting', 'Segoe Script', cursive",
                fontSize: '28px',
                color: '#0e7490',
                fontWeight: 'bold'
              }} 
              className="select-none"
            >
              Micheal Johns
            </span>
          </div>
          <div style={{ borderTop: '1.5px solid #0f172a' }} className="pt-1.5">
            <h5 style={{ color: '#0f172a', margin: 0 }} className="text-xs font-black leading-tight">
              Micheal Johns
            </h5>
            <p style={{ color: '#64748b', margin: '2px 0 0 0' }} className="text-[10px] font-semibold">
              Marketing & Operations Officer
            </p>
          </div>
        </div>
      </div>

      {/* 6. FOOTER: COMPANY INFORMATION (Bound Box Style with Icons) */}
      <div 
        style={{ borderTop: '1px solid #e2e8f0' }}
        className="pt-4 mt-6 text-xs space-y-2"
      >
        <span 
          style={{ color: '#0891b2' }}
          className="font-bold uppercase tracking-wider text-[10px] block"
        >
          Company Information
        </span>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[10px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
            <span>+91 (800) 555-GOMART</span>
          </div>
          <div className="flex items-center gap-1.5 sm:justify-center truncate">
            <Mail className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
            <span>support@gomart.digital</span>
          </div>
          <div className="flex items-center gap-1.5 sm:justify-end">
            <MapPin className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
            <span>She Software Solutions Inc.</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default InvoiceDocument;
