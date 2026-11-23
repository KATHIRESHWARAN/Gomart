import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import BackButton from '../components/BackButton';
import { Heart, Trash2, ArrowLeft, Sparkles } from 'lucide-react';

const Wishlist = () => {
  const { wishlist, clearWishlist } = useWishlist();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Explore our curated collection of digital templates, e-books, and developer notes to save your favorite assets."
          actionText="Explore Marketplace"
          actionLink="/products"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back Button */}
      <div className="flex justify-start">
        <BackButton fallback="/products" label="Back to Products" />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider mb-2 border border-rose-200 dark:border-rose-800">
            <Heart className="w-3.5 h-3.5 fill-current" /> Saved Digital Assets
          </div>
          <h1 className="text-3xl font-black text-navy-900 dark:text-white tracking-tight">
            My Wishlist ({wishlist.length})
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Keep track of premium resources you want to purchase later.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/products"
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Continue Browsing
          </Link>
          <button
            onClick={clearWishlist}
            className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> Clear Wishlist
          </button>
        </div>
      </div>

      {/* Grid of Wishlist Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlist.map((prod) => (
          <ProductCard key={prod.id || prod.productId} product={prod} />
        ))}
      </div>

    </div>
  );
};

export default Wishlist;
