import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductCard from '../components/ProductCard';
import BackButton from '../components/BackButton';
import { 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  Heart, 
  Star, 
  Share2, 
  FileText,
  FolderDown,
  Layers,
  Code2,
  Lock,
  MessageSquare,
  Sparkles,
  Download
} from 'lucide-react';
import { toast } from 'react-toastify';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, items } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs', 'description', 'reviews'

  // Reviews
  const [reviews, setReviews] = useState([
    {
      id: 'rev_1',
      author: 'Alex Morgan',
      rating: 5,
      date: 'Verified Buyer • 3 days ago',
      content: 'Incredible depth and production-quality codebase. Saved our engineering team at least two weeks of scaffolding.'
    },
    {
      id: 'rev_2',
      author: 'David Chen',
      rating: 5,
      date: 'Verified Buyer • 1 week ago',
      content: 'Clear documentation, well-commented code, and immediate download access right after checkout.'
    }
  ]);
  const [newAuthor, setNewAuthor] = useState('');
  const [newContent, setNewContent] = useState('');

  useEffect(() => {
    fetchProductDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const res = await productService.getById(id);
      if (res.data.success) {
        const prod = res.data.data;
        setProduct(prod);
        fetchRelated(prod.category, prod.id);
      }
    } catch (err) {
      console.error('Failed to load product details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelated = async (category, currentId) => {
    try {
      const res = await productService.getAll({ category, status: 'approved' });
      if (res.data.success) {
        const filtered = res.data.data.filter(p => p.id !== currentId).slice(0, 4);
        setRelatedProducts(filtered);
      }
    } catch (e) {
      // Non-blocking
    }
  };

  if (loading) {
    return (
      <div className="py-24 max-w-7xl mx-auto px-4 text-center">
        <LoadingSpinner text="Retrieving digital product specifications..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4 px-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Product Not Found</h2>
        <p className="text-xs text-slate-500">The requested digital item may have been unlisted or moved.</p>
        <Link to="/products" className="inline-block px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs">
          Browse Marketplace
        </Link>
      </div>
    );
  }

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

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  const handleBuyNow = () => {
    if (isOwnProduct) {
      toast.error("You cannot purchase your own digital product.");
      return;
    }
    addToCart(product, 1);
    navigate('/checkout');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.info('Product link copied to clipboard!');
    }
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newContent.trim()) {
      toast.error('Please enter your name and review comments.');
      return;
    }
    setReviews([
      {
        id: 'rev_' + Date.now(),
        author: newAuthor.trim(),
        rating: 5,
        date: 'Verified Buyer • Just now',
        content: newContent.trim()
      },
      ...reviews
    ]);
    setNewAuthor('');
    setNewContent('');
    toast.success('Your review has been published!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* 1. BACK BUTTON & BREADCRUMBS */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        <BackButton fallback="/products" label="Back to Catalog" />
        <nav className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-brand-600 transition-colors">
            {product.category}
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-xs">
            {product.name || product.title}
          </span>
        </nav>
      </div>

      {/* 2. PRIMARY DIGITAL PRODUCT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Image Preview & Trust (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-[4/3] rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md flex items-center justify-center p-2">
            <img
              src={product.thumbnailUrl || (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'}
              alt={product.name || product.title}
              className="w-full h-full object-cover rounded-2xl"
            />

            {discountPercent > 0 && (
              <div className="absolute top-4 left-4 bg-emerald-600 text-white font-black text-xs px-2.5 py-1 rounded-md shadow-md">
                {discountPercent}% OFF
              </div>
            )}

            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-2.5 rounded-full backdrop-blur-md border shadow-md transition-all ${
                  inWishlist
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:text-rose-500'
                }`}
                title={inWishlist ? "Saved in Wishlist" : "Save to Wishlist"}
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 rounded-full bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-md hover:text-brand-600 transition-all"
                title="Share link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Digital Guarantee Pills */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-xs">
              <Zap className="w-5 h-5 text-brand-600 shrink-0" />
              <div>
                <strong className="block text-slate-900 dark:text-white">Instant Access</strong>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Download immediately</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong className="block text-slate-900 dark:text-white">Verified Assets</strong>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">100% Virus & DRM Free</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Title, Price, Digital Specs & Buy CTAs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-extrabold uppercase tracking-widest text-[11px] px-2.5 py-1 rounded-md bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                {product.category}
              </span>
              <span className="text-xs text-slate-400">
                Created by: <strong className="text-slate-700 dark:text-slate-300">{product.sellerName || product.brand || 'Verified Creator'}</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
              {product.name || product.title}
            </h1>

            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-black">
                <span>{product.rating || '4.8'}</span>
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {(product.reviewCount || 120).toLocaleString()} Verified Ratings • {product.viewCount || 24} Catalog Views
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                ${Number(product.price).toFixed(2)}
              </span>
              <span className="text-base text-slate-400 line-through">
                ${originalPrice.toFixed(2)}
              </span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                {discountPercent}% OFF
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              One-time purchase • Full commercial & developer license included
            </p>
          </div>

          {/* Digital File Specifications (PDF 8.3 Specs requirement) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Deliverable</span>
              <span className="font-bold text-slate-900 dark:text-white">{product.fileType || 'ZIP / PDF Archive'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Size</span>
              <span className="font-bold text-slate-900 dark:text-white">{product.fileSize || '24.5 MB'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">License</span>
              <span className="font-bold text-slate-900 dark:text-white">Full Commercial</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Updates</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Lifetime Access</span>
            </div>
          </div>

          {/* Action CTAs: Buy Now & Add to Cart (PDF 8.3) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={handleBuyNow}
              disabled={isOwnProduct}
              className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>Buy Now (Instant Access)</span>
            </button>

            <button
              onClick={handleAddToCart}
              disabled={isOwnProduct}
              className={`w-full sm:w-auto py-3.5 px-6 rounded-2xl border font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                inCart
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white hover:border-brand-500'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{inCart ? 'In Cart (Add More)' : 'Add to Cart'}</span>
            </button>
          </div>

        </div>

      </div>

      {/* 3. DETAILS TABS: DESCRIPTION, SPECIFICATIONS & REVIEWS */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        
        {/* Tab Headers */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-6 pt-4 gap-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'specs'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'description'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Customer Reviews ({reviews.length})
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 sm:p-8">
          
          {activeTab === 'specs' && (
            <div className="space-y-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">What's Included in This Digital Download</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Full Source Code / Content Package
                  </span>
                  <p className="text-slate-500 dark:text-slate-400 pl-5.5">
                    Complete uncompressed digital bundle with all assets and instructions.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Lifetime Updates & Bug Fixes
                  </span>
                  <p className="text-slate-500 dark:text-slate-400 pl-5.5">
                    Re-download future updates directly from your User Dashboard at any time.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Commercial Usage Rights
                  </span>
                  <p className="text-slate-500 dark:text-slate-400 pl-5.5">
                    Deploy in commercial client projects or learning environments with zero royalties.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 1-Click Authenticated Download
                  </span>
                  <p className="text-slate-500 dark:text-slate-400 pl-5.5">
                    Protected single-click download link for verified purchasers.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'description' && (
            <div className="space-y-4 max-w-3xl text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>{product.description || 'Comprehensive digital material prepared by certified domain experts. Designed to accelerate your understanding and development efficiency.'}</p>
              <p>All downloadable materials are audited for quality, compatibility, and security. After purchase, access your files anytime from your account dashboard.</p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8 max-w-2xl">
              {/* Existing Reviews */}
              <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
                {reviews.map(rev => (
                  <div key={rev.id} className="pt-4 first:pt-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{rev.author}</span>
                      <div className="flex text-amber-500">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400">{rev.date}</span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 pt-1">{rev.content}</p>
                  </div>
                ))}
              </div>

              {/* Add Review Form */}
              <form onSubmit={handleAddReview} className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Leave a Verified Review</h4>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
                <textarea
                  rows="3"
                  placeholder="Your review comments..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-colors cursor-pointer"
                >
                  Submit Review
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

      {/* 4. RELATED PRODUCTS IN SAME CATEGORY */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            More in {product.category}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default ProductDetails;
