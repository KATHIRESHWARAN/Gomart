import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import EmptyState from '../components/EmptyState';
import BackButton from '../components/BackButton';
import { 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Truck,
  Heart,
  Plus,
  Minus,
  Tag,
  CheckCircle2,
  Lock,
  RotateCcw
} from 'lucide-react';
import { toast } from 'react-toastify';

const AVAILABLE_COUPONS = [
  { code: 'GOMART10', desc: '10% instant discount on digital products', minOrder: 0, percent: 10 },
  { code: 'WELCOME20', desc: '20% discount on orders above $25', minOrder: 25, percent: 20 },
  { code: 'DEVPROMO', desc: 'Flat $5 discount on your order', minOrder: 15, discount: 5 }
];

const Cart = () => {
  const { items, subtotal, totalQuantity, removeFromCart, updateQuantity, clearCart } = useCart();
  const { toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = sessionStorage.getItem('gomart_applied_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <EmptyState
          icon={ShoppingBag}
          title="Your Shopping Cart is Empty"
          description="Explore our curated collection of digital products, e-books, templates, and learning guides."
          actionText="Start Shopping Now"
          actionLink="/products"
        />
      </div>
    );
  }

  // Calculate calculations
  const totalMRP = items.reduce((sum, item) => {
    const orig = item.originalPrice || Math.round(Number(item.price) * 1.35);
    return sum + (orig * (item.quantity || 1));
  }, 0);

  const discountOnMRP = totalMRP - subtotal;

  // Coupon discount calculation
  let couponDiscount = 0;
  const deliveryFee = 0; // Digital products have instant zero-cost delivery

  if (appliedCoupon) {
    if (appliedCoupon.percent) {
      couponDiscount = (subtotal * appliedCoupon.percent) / 100;
    } else if (appliedCoupon.discount) {
      couponDiscount = Math.min(subtotal, appliedCoupon.discount);
    }
  }

  const finalPayable = Math.max(0, subtotal - couponDiscount + deliveryFee);
  const totalSavings = discountOnMRP + couponDiscount;

  const handleApplyCoupon = (codeToApply) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) return;

    const matched = AVAILABLE_COUPONS.find(c => c.code === code);
    if (!matched) {
      toast.error('Invalid coupon code. Try GOMART10 or WELCOME20.');
      return;
    }

    if (matched.minOrder && subtotal < matched.minOrder) {
      toast.warning(`This coupon requires a minimum cart value of $${matched.minOrder}.`);
      return;
    }

    setAppliedCoupon(matched);
    sessionStorage.setItem('gomart_applied_coupon', JSON.stringify(matched));
    toast.success(`Coupon "${matched.code}" applied successfully!`);
    setCouponInput('');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    sessionStorage.removeItem('gomart_applied_coupon');
    toast.info('Coupon removed.');
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout', {
      state: {
        coupon: appliedCoupon ? { code: appliedCoupon.code, discountAmount: couponDiscount } : null,
        deliveryFee
      }
    });
  };

  const handleMoveToWishlist = (item) => {
    toggleWishlist(item);
    removeFromCart(item.productId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back Button */}
      <div className="flex justify-start">
        <BackButton fallback="/products" label="Continue Shopping" />
      </div>

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Shopping Cart</span>
            <span className="text-sm font-bold px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 border border-brand-200 dark:border-brand-800">
              {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Digital deliverables with verified licenses and instant download access
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Trash2 className="w-4 h-4" /> Clear All Items
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const origPrice = item.originalPrice || Math.round(Number(item.price) * 1.35);
            const discountPct = Math.max(10, Math.round(((origPrice - Number(item.price)) / origPrice) * 100));
            const itemQty = item.quantity || 1;

            return (
              <div
                key={item.productId}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row gap-5 transition-all hover:border-brand-200 dark:hover:border-slate-700"
              >
                {/* Product Thumbnail */}
                <Link to={`/products/${item.productId}`} className="w-full sm:w-28 sm:h-28 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center p-2">
                  <img
                    src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'}
                    alt={item.name || item.title}
                    className="w-full h-full object-contain hover:scale-105 transition-transform"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                        {item.brand || item.category || 'GoMart Retail'}
                      </span>
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> In Stock
                      </span>
                    </div>

                    <Link to={`/products/${item.productId}`} className="font-bold text-sm sm:text-base text-navy-900 dark:text-white hover:text-brand-600 transition-colors line-clamp-2">
                      {item.name || item.title}
                    </Link>

                    {/* Variant selections if any */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 pt-0.5">
                      {item.selectedSize && (
                        <span>Size: <strong className="text-navy-900 dark:text-white">{item.selectedSize}</strong></span>
                      )}
                      {item.selectedColor && (
                        <span>Color: <strong className="text-navy-900 dark:text-white">{item.selectedColor}</strong></span>
                      )}
                    </div>
                  </div>

                  {/* Price & Quantity Controls Row */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                    
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.productId, itemQty - 1)}
                        className="px-2.5 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                        title="Decrease Quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3.5 py-1 text-xs font-black text-navy-900 dark:text-white">
                        {itemQty}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, itemQty + 1)}
                        className="px-2.5 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                        title="Increase Quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-navy-900 dark:text-white">
                        ₹{(Number(item.price) * itemQty).toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-400 line-through">
                        ₹{(origPrice * itemQty).toFixed(2)}
                      </span>
                      <span className="text-xs font-bold text-emerald-600">
                        {discountPct}% off
                      </span>
                    </div>

                    {/* Item Actions */}
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                      <button
                        onClick={() => handleMoveToWishlist(item)}
                        className="hover:text-rose-500 transition-colors flex items-center gap-1"
                      >
                        <Heart className="w-3.5 h-3.5" /> Save for Later
                      </button>
                      <span>•</span>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}

          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Price Details Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Coupon Box */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-extrabold text-navy-900 dark:text-white uppercase tracking-wider">
              <Tag className="w-4 h-4 text-brand-600" />
              <span>Apply Promo Coupons</span>
            </div>

            {appliedCoupon ? (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                <div>
                  <strong className="text-emerald-700 dark:text-emerald-300 block font-mono font-black">
                    {appliedCoupon.code}
                  </strong>
                  <span className="text-[11px] text-emerald-600">
                    Saved ₹{couponDiscount.toFixed(2)} on this order
                  </span>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-rose-600 font-bold text-xs hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter Coupon (e.g. GOMART50)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold uppercase"
                />
                <button
                  onClick={() => handleApplyCoupon()}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold"
                >
                  Apply
                </button>
              </div>
            )}

            {/* Quick apply chips */}
            {!appliedCoupon && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Available Coupons:</span>
                {AVAILABLE_COUPONS.map(c => (
                  <button
                    key={c.code}
                    onClick={() => handleApplyCoupon(c.code)}
                    className="w-full text-left p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-[11px] flex items-center justify-between hover:border-brand-500 transition-colors"
                  >
                    <div>
                      <strong className="text-brand-600 font-mono block">{c.code}</strong>
                      <span className="text-slate-500 text-[10px]">{c.desc}</span>
                    </div>
                    <span className="text-brand-600 font-bold text-[10px] uppercase">Apply</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Price Breakdown Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3">
              Price Details ({totalQuantity} Items)
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Total Value</span>
                <span className="font-semibold text-navy-900 dark:text-white">${totalMRP.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Discount Savings</span>
                <span>- ${discountOnMRP.toFixed(2)}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span>- ${couponDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Digital Delivery</span>
                <span className="font-bold text-emerald-600">FREE (Instant)</span>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between text-sm sm:text-base font-black text-navy-900 dark:text-white">
                <span>Total Payable</span>
                <span>${finalPayable.toFixed(2)}</span>
              </div>

              {totalSavings > 0 && (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center">
                  You save ${totalSavings.toFixed(2)} on this order
                </div>
              )}
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="w-full py-4 px-6 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-brand-500/25 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center pt-2">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Safe and Secure Payments with 256-bit Encryption</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Cart;