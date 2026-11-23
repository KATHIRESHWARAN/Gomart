import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productService } from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { DIGITAL_CATEGORIES } from '../components/Navbar';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  FolderDown, 
  Flame, 
  Star, 
  ShoppingBag, 
  Zap, 
  CheckCircle2,
  TrendingUp,
  Layers,
  Award,
  Search,
  BookOpen,
  Laptop,
  BookMarked,
  Receipt,
  Tag,
  Upload,
  Lock
} from 'lucide-react';

const Home = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroSearch, setHeroSearch] = useState('');
  const [heroCategory, setHeroCategory] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await productService.getAll({ status: 'approved' });
        if (res.data.success) {
          setAllProducts(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch home products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (heroSearch.trim()) params.set('search', heroSearch.trim());
    if (heroCategory !== 'All') params.set('category', heroCategory);
    navigate(`/products?${params.toString()}`);
  };

  // Section product subsets
  const featuredProducts = allProducts.filter(p => p.rating >= 4.7 || p.isFeatured).slice(0, 8);
  const trendingProducts = [...allProducts].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 8);
  const templatesProducts = allProducts.filter(p => p.category === 'Templates').slice(0, 4);
  const ebooksProducts = allProducts.filter(p => p.category === 'E-books' || p.category === 'Notes & Guides').slice(0, 4);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      
      {/* 1. HERO SECTION (PDF 8.1 - Clean, Modern SaaS Digital Marketplace) */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/10 dark:bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[300px] bg-accent-purple/10 dark:bg-accent-purple/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          
          {/* Assessment & Domain Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/70 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-bold tracking-wide shadow-xs animate-fade-in">
            <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>Digital Products Marketplace • Instant Downloads</span>
          </div>

          {/* Main Title */}
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
              Discover, Buy & Sell <br />
              <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-purple bg-clip-text text-transparent">
                Premium Digital Products
              </span>
            </h1>

            <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              The verified digital marketplace for developer e-books, full-stack boilerplates, coding masterclasses, study materials, and design assets with instant secure downloads.
            </p>
          </div>

          {/* Interactive Hero Search Bar (PDF 8.1 Requirement) */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleHeroSearch} className="flex flex-col sm:flex-row items-center gap-2 p-2 rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-xl focus-within:ring-2 focus-within:ring-brand-500 transition-all">
              
              <div className="flex items-center gap-2 flex-1 w-full px-3">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search e-books, templates, tutorials, notes..."
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  className="w-full py-2.5 text-sm text-slate-900 dark:text-white bg-transparent focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={heroCategory}
                  onChange={(e) => setHeroCategory(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold px-3 py-2.5 rounded-2xl border-none focus:outline-none cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  {DIGITAL_CATEGORIES.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span>Search</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </form>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/products"
              className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore All Products</span>
            </Link>

            <Link
              to="/dashboard/upload"
              className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-extrabold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2"
            >
              <Upload className="w-4 h-4 text-brand-600" />
              <span>Sell Your Digital Asset</span>
            </Link>
          </div>

          {/* Trust Value Props */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
              <Zap className="w-4 h-4 text-brand-600" />
              <span className="font-bold text-slate-900 dark:text-white">Instant Download</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-900 dark:text-white">Verified Deliverables</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
              <FolderDown className="w-4 h-4 text-accent-purple" />
              <span className="font-bold text-slate-900 dark:text-white">Lifetime Access</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
              <Award className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-slate-900 dark:text-white">Commercial License</span>
            </div>
          </div>

        </div>

      </section>

      {/* 2. CATEGORIES SECTION (PDF 8.1 & Module 2 - The 7 Official Categories) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Categories</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              Browse by Digital Category
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Curated developer guides, source codes, boilerplates, and learning resources
            </p>
          </div>

          <Link
            to="/products"
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 shrink-0"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 7 Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {DIGITAL_CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            const count = allProducts.filter(p => p.category === cat.name).length;

            return (
              <Link
                key={cat.name}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/70 border border-brand-200 dark:border-brand-800/80 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {cat.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">
                    {count > 0 ? `${count} products` : 'Available in catalog'}
                  </span>
                  <span className="text-brand-600 dark:text-brand-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Explore →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

      </section>

      {/* 3. FEATURED PRODUCTS (PDF 8.1) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold uppercase tracking-wider">
              <Star className="w-4 h-4 fill-amber-500" />
              <span>Handpicked Collection</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              Featured Digital Assets
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Highest rated e-books, architecture templates, and study materials
            </p>
          </div>

          <Link
            to="/products?sort=rating"
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 shrink-0"
          >
            <span>See Top Rated</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12"><LoadingSpinner text="Loading featured catalog..." /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </section>

      {/* 4. TRENDING PRODUCTS (PDF 8.1) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-rose-500 text-xs font-bold uppercase tracking-wider">
              <Flame className="w-4 h-4 fill-rose-500" />
              <span>High Demand</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              Trending Products This Week
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Most viewed developer guides and popular production boilerplates
            </p>
          </div>

          <Link
            to="/products?sort=views"
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 shrink-0"
          >
            <span>View All Trending</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12"><LoadingSpinner text="Loading trending items..." /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </section>

      {/* 5. 3-STEP DIGITAL WORKFLOW SECTION (PDF Module 3 & 4) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-8 sm:p-12 space-y-8">
          
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Simple & Transparent
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              How GoMart Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Designed for effortless digital acquisition and seamless creator selling
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-black text-sm flex items-center justify-center">
                1
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Discover & Preview</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Browse our curated catalog across 7 categories. Review file formats, author ratings, description, and preview samples.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-black text-sm flex items-center justify-center">
                2
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Secure Checkout</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Complete your purchase securely using card or instant payment options with immediate receipt generation.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-black text-sm flex items-center justify-center">
                3
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Instant Download</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Access your purchased products immediately in your User Dashboard with single-click authenticated download buttons.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 6. CREATOR / SELLER CALL TO ACTION (PDF Module 2) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-950 p-8 sm:p-14 text-white overflow-hidden shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="space-y-4 max-w-xl text-left">
            <span className="inline-block px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-xs font-bold text-brand-300">
              For Developers & Creators
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Publish & Monetize Your Digital Assets
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Upload your code templates, study guides, and e-books to reach buyers globally. Manage listings and track analytics in real time from your seller dashboard.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <Link
                to="/dashboard/upload"
                className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs sm:text-sm shadow-md transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4 text-brand-600" />
                <span>Upload Product Now</span>
              </Link>
              <Link
                to="/products"
                className="text-xs font-bold text-white hover:underline flex items-center gap-1"
              >
                <span>Browse Existing Listings →</span>
              </Link>
            </div>
          </div>

          <div className="w-full md:w-auto flex justify-center">
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-6 flex flex-col items-center justify-center text-center space-y-3 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-md">
                <Layers className="w-7 h-7" />
              </div>
              <p className="font-black text-xl text-white">GoMart</p>
              <p className="text-[11px] text-brand-200">Digital Marketplace</p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Home;
