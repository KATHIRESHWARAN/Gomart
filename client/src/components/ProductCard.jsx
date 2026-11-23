import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingBag, 
  Star, 
  Heart, 
  Maximize2,
  CheckCircle2,
  Truck,
  Sparkles
} from 'lucide-react';
import { toast } from 'react-toastify';
import QuickViewModal from './QuickViewModal';

const ProductCard = ({ product }) => {
  const { addToCart, items } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const prodId = product.id || product.productId;
  const isOwnProduct = user && product.sellerId === user.uid;
  const inWishlist = isInWishlist(prodId);
  const inCart = items.some(item => item.productId === prodId);

  const originalPrice = product.originalPrice 
    ? Number(product.originalPrice) 
    : Math.round(Number(product.price) * 1.35);

  const discountPercent = product.discountPercent 
    ? Number(product.discountPercent) 
    : Math.max(10, Math.round(((originalPrice - Number(product.price)) / originalPrice) * 100));

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickViewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-xl hover:border-brand-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col h-full relative"
      >
        {/* Product Image & Top Floating Badges */}
        <div className="relative block aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
          <Link to={`/products/${prodId}`}>
            <img
              src={product.thumbnailUrl || (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'}
              alt={product.name || product.title}
              className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
              loading="lazy"
            />
          </Link>

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <div className="absolute top-2.5 left-2.5 z-10 bg-emerald-600 text-white font-black text-[10px] tracking-wide px-2 py-0.5 rounded-md shadow-sm">
              {discountPercent}% OFF
            </div>
          )}

          {/* Top Right: Wishlist & Quick View */}
          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
            <button
              onClick={handleQuickViewClick}
              className="p-2 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:scale-110 backdrop-blur-md shadow-xs transition-all"
              title="Quick View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleWishlistClick}
              className={`p-2 rounded-full backdrop-blur-md shadow-xs transition-all hover:scale-110 ${
                inWishlist
                  ? 'bg-rose-500 text-white shadow-rose-500/30'
                  : 'bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 hover:text-rose-500'
              }`}
              title={inWishlist ? "Saved in Wishlist" : "Add to Wishlist"}
            >
              <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Assured Badge */}
          {product.isAssured !== false && (
            <div className="absolute bottom-2.5 left-2.5 bg-brand-900/80 backdrop-blur-xs text-white text-[9px] font-extrabold px-2 py-0.5 rounded flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-brand-300" />
              <span>Assured</span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            {/* Brand & Category */}
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                {product.brand || product.category || 'E-Products'}
              </span>
              <span className="text-slate-400 text-[10px] truncate max-w-[90px]">
                {product.category}
              </span>
            </div>

            {/* Product Title */}
            <Link to={`/products/${prodId}`} className="block group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2">
                {product.name || product.title}
              </h3>
            </Link>

            {/* Star Rating & Review Count */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-black">
                <span>{product.rating || '4.6'}</span>
                <Star className="w-3 h-3 fill-current" />
              </div>
              <span className="text-slate-400 text-[11px]">
                ({(product.reviewCount || (product.salesCount ? product.salesCount * 5 : 124)).toLocaleString()})
              </span>
            </div>
          </div>

          {/* Pricing & Delivery Info */}
          <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-slate-900 dark:text-white">
                ${Number(product.price).toFixed(2)}
              </span>
              <span className="text-xs text-slate-400 line-through">
                ${originalPrice.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {discountPercent}% off
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{product.fileType ? `${product.fileType} • Instant Access` : 'Instant Digital Download • Lifetime Access'}</span>
            </div>

            {/* Add to Cart CTA */}
            <button
              onClick={handleAddToCart}
              disabled={isOwnProduct}
              className={`w-full mt-2 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                isOwnProduct
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : inCart
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100'
                  : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:shadow-md'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{inCart ? 'Add More to Cart' : 'Add to Cart'}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Quick View Modal */}
      {quickViewOpen && (
        <QuickViewModal
          product={product}
          isOpen={quickViewOpen}
          onClose={() => setQuickViewOpen(false)}
        />
      )}
    </>
  );
};

export default ProductCard;