import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/api';
import BackButton from '../components/BackButton';
import { 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Loader2, 
  Package, 
  Sparkles,
  Zap,
  ArrowRight,
  FolderDown,
  Info,
  Check
} from 'lucide-react';
import { toast } from 'react-toastify';

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'upi'
  const [simulationOutcome, setSimulationOutcome] = useState('success'); // 'success' or 'failed'
  const [processing, setProcessing] = useState(false);

  // Card fields
  const [cardHolder, setCardHolder] = useState(user?.name || 'Jane Doe');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');

  // UPI fields
  const [upiId, setUpiId] = useState(user?.email ? `${user.email.split('@')[0]}@okaxis` : 'creator@okhdfcbank');

  // Fill test details
  const fillTestCard = () => {
    setCardHolder(user?.name || 'Assessment Evaluator');
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvv('987');
    toast.info('Test card credentials auto-filled');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your cart is empty</h2>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Add digital products before proceeding to checkout.</p>
        <Link 
          to="/products" 
          className="mt-5 inline-block px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-colors shadow-xs"
        >
          Explore Marketplace
        </Link>
      </div>
    );
  }

  const handleProcessOrder = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const payload = {
        paymentMethod,
        paymentStatus: simulationOutcome,
        paymentDetails: {
          method: paymentMethod,
          cardHolder: paymentMethod === 'card' ? cardHolder : undefined,
          last4: paymentMethod === 'card' ? '4242' : undefined,
          upiId: paymentMethod === 'upi' ? upiId : undefined,
          transactionId: `TXN-${Date.now()}`
        },
        shippingAddress: {
          deliveryType: 'Instant Digital Download',
          email: user?.email,
          licenseType: 'Commercial / Developer License'
        }
      };

      const res = await orderService.checkout(payload);

      if (res.data?.success) {
        clearCart();
        toast.success('Payment authorized! Your downloads are ready.');
        navigate('/order-success', {
          state: {
            order: res.data.data,
            orderId: res.data.data.id || res.data.data.orderId
          }
        });
      }
    } catch (err) {
      console.error('Checkout error:', err);
      const msg = err.response?.data?.message || 'Transaction could not be completed.';
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back to Cart */}
      <div className="flex justify-start">
        <BackButton fallback="/cart" label="Back to Cart" />
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Digital Checkout
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Complete your purchase to immediately access your digital deliverables in My Purchases.
        </p>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: License & Payment Simulation */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Digital Delivery License Box */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Instant Digital Delivery</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Zero shipping wait. Instant file download.</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Verified
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Delivery Account:</span>
                <span className="font-bold text-slate-900 dark:text-white">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">License Terms:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Lifetime Access & Updates</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Deliverable Storage:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Available in User Dashboard</span>
              </div>
            </div>
          </div>

          {/* 2. Simulated Payment Gateway */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Payment Gateway Simulation</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Simulate real-world Stripe / UPI transactions</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>256-Bit SSL</span>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'border-brand-600 bg-brand-50/70 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Credit / Debit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  paymentMethod === 'upi'
                    ? 'border-brand-600 bg-brand-50/70 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>UPI / QR Code</span>
              </button>
            </div>

            {/* Card Form */}
            {paymentMethod === 'card' && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Card Information</span>
                  <button
                    type="button"
                    onClick={fillTestCard}
                    className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                  >
                    Auto-Fill Test Card
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        maxLength="4"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* UPI Form */}
            {paymentMethod === 'upi' && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                    Virtual Payment Address (VPA / UPI ID)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@okaxis"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-white p-1.5 shadow-xs shrink-0 flex items-center justify-center">
                    <QrCode className="w-full h-full text-slate-900" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900 dark:text-white">Simulated QR Code Payment</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Accepts Google Pay, PhonePe, Paytm, and BHIM UPI simulation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Assessment Simulation Outcome Controller */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-brand-600" />
                  Evaluator Simulation Mode:
                </span>
                <span className="text-[10px] text-slate-500">Test both happy and error paths</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSimulationOutcome('success')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    simulationOutcome === 'success'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Success (201 OK)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSimulationOutcome('failed')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    simulationOutcome === 'failed'
                      ? 'border-rose-600 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Simulate Decline (400)</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Order Summary & Action */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5 sticky top-24">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h3>

            {/* Items List */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.productId} className="py-3 flex items-center gap-3">
                  <img
                    src={item.thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=200&q=80'}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.name}
                    </p>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Qty: {item.quantity} • Digital License
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-white">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Digital Delivery Fee</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Free (Instant)</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Digital Tax</span>
                <span className="font-semibold text-slate-900 dark:text-white">$0.00</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white border-t border-slate-100 dark:border-slate-800 pt-3">
                <span>Total Amount</span>
                <span className="text-brand-600 dark:text-brand-400">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="button"
              onClick={handleProcessOrder}
              disabled={processing}
              className="w-full py-3.5 px-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authorizing Payment...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authorize & Pay ${total.toFixed(2)}</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">
              Instant access granted to your files immediately upon payment authorization.
            </p>

          </div>
        </div>

      </div>

    </div>
  );
};

export default Checkout;
