import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  ShoppingBag, 
  ArrowRight, 
  Star, 
  Heart, 
  CheckCircle2, 
  Truck,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { toast } from 'react-toastify';

const QuickViewModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!isOpen || !product) return null;

  const prodId = product.id || product.productId;
  const isOwnProduct = user && product.sellerId === user.uid;
  const inWishlist = isInWishlist(prodId);

  const originalPrice = product.originalPrice 
    ? Number(product.originalPrice) 
    : Math.round(Number(product.price) * 1.35);

  const discountPercent = product.discountPercent 
    ? Number(product.discountPercent) 
    : Math.max(10, Math.round(((originalPrice - Number(product.price)) / originalPrice) * 100));

  const handleBuyNow = () => {
    if (isOwnProduct) {
      toast.error("You cannot purchase your own product.");
      return;
    }
    addToCart(product, 1);
    onClose();
    navigate('/checkout');
  };

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-navy-950/70 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-500 hover:text-slate-800 dark:hover:text-white backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* Image Preview Container */}
            <div className="relative aspect-square md:h-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
              <img
                src={product.thumbnailUrl || (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'}
                alt={product.name || product.title}
                className="w-full h-full object-cover"
              />
              
              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 bg-emerald-600 text-white font-black text-xs px-2.5 py-1 rounded-md shadow-md">
                  {discountPercent}% OFF
                </div>
              )}

              <button
                onClick={() => toggleWishlist(product)}
                className={`absolute bottom-4 left-4 p-2.5 rounded-full backdrop-blur-md border transition-all ${
                  inWishlist
                    ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/30'
                    : 'bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 border-white/40 hover:scale-110'
                }`}
                title={inWishlist ? "Remove from Wishlist" : "Save to Wishlist"}
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Product Details & Actions */}
            <div className="p-6 sm:p-8 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                
                {/* Brand & Category */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-brand-600 dark:text-brand-400">
                    {product.brand || product.category || 'GoMart Retail'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {product.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-extrabold text-lg text-navy-900 dark:text-white leading-snug">
                  {product.name || product.title}
                </h3>

                {/* Star Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-black">
                    <span>{product.rating || '4.7'}</span>
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    Verified Customer Reviews
                  </span>
                </div>

                {/* Pricing & Savings */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-2xl font-black text-navy-900 dark:text-white">
                      ₹{Number(product.price).toFixed(2)}
                    </span>
                    <span className="text-sm text-slate-400 line-through">
                      ₹{originalPrice.toFixed(2)}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Save ₹{(originalPrice - Number(product.price)).toFixed(2)} ({discountPercent}% off)
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Inclusive of all taxes</p>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                  {product.description}
                </p>

                {/* Delivery reassurance */}
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Truck className="w-4 h-4 text-brand-600" />
                  <span>Free Delivery • 7 Days Replacement</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOwnProduct}
                    className="py-3 px-4 rounded-xl border border-brand-500 text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={isOwnProduct}
                    className="py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Buy Now</span>
                  </button>
                </div>

                <Link
                  to={`/products/${prodId}`}
                  onClick={onClose}
                  className="w-full text-center block text-xs font-bold text-slate-500 hover:text-brand-600 py-1"
                >
                  View Full Product Details & Specs →
                </Link>
              </div>

            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuickViewModal;