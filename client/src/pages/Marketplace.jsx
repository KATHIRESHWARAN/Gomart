import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productService } from '../services/api';
import ProductCard from '../components/ProductCard';
import BackButton from '../components/BackButton';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { DIGITAL_CATEGORIES } from '../components/Navbar';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  ArrowUpDown, 
  RotateCcw,
  Sparkles,
  Star,
  Check,
  X,
  ChevronDown,
  Tag,
  DollarSign,
  Grid,
  List
} from 'lucide-react';

const CREATORS = [
  'DevCraft Studio',
  'CodeVerse',
  'ScholarDev',
  'ViteForge',
  'CloudArchitects',
  'PixelCraft',
  'ByteSize Books'
];

const PRICE_RANGES = [
  { label: 'All Prices', min: '', max: '' },
  { label: 'Under $15', min: '0', max: '15' },
  { label: '$15 to $30', min: '15', max: '30' },
  { label: '$30 to $50', min: '30', max: '50' },
  { label: '$50 to $100', min: '50', max: '100' },
  { label: 'Above $100', min: '100', max: '' }
];

const DISCOUNT_OPTIONS = [
  { label: '10% or more', value: '10' },
  { label: '20% or more', value: '20' },
  { label: '30% or more', value: '30' },
  { label: '40% or more', value: '40' },
  { label: '50% or more', value: '50' }
];

const RATING_OPTIONS = [
  { label: '4★ & above', value: '4' },
  { label: '3★ & above', value: '3' },
  { label: '2★ & above', value: '2' }
];

const Marketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter States from URL Params
  const currentCategory = searchParams.get('category') || 'All';
  const currentSearch = searchParams.get('search') || '';
  const currentBrand = searchParams.get('brand') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentRating = searchParams.get('minRating') || '';
  const currentDiscount = searchParams.get('minDiscount') || '';
  const currentSort = searchParams.get('sort') || 'latest';

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [customMin, setCustomMin] = useState(currentMinPrice);
  const [customMax, setCustomMax] = useState(currentMaxPrice);

  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        category: currentCategory !== 'All' ? currentCategory : undefined,
        search: currentSearch || undefined,
        brand: currentBrand || undefined,
        minPrice: currentMinPrice || undefined,
        maxPrice: currentMaxPrice || undefined,
        minRating: currentRating || undefined,
        minDiscount: currentDiscount || undefined,
        sort: currentSort,
        status: 'approved'
      };

      const res = await productService.getAll(params);
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch marketplace products:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateParam = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value === null || value === '' || value === 'All') {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
    setSearchParams(nextParams);
  };

  const handleCategorySelect = (cat) => {
    updateParam('category', cat);
  };

  const handleBrandToggle = (brand) => {
    const selected = currentBrand ? currentBrand.split(',') : [];
    let updated;
    if (selected.includes(brand)) {
      updated = selected.filter(b => b !== brand);
    } else {
      updated = [...selected, brand];
    }
    updateParam('brand', updated.length > 0 ? updated.join(',') : '');
  };

  const handlePricePreset = (min, max) => {
    const nextParams = new URLSearchParams(searchParams);
    if (min) nextParams.set('minPrice', min);
    else nextParams.delete('minPrice');

    if (max) nextParams.set('maxPrice', max);
    else nextParams.delete('maxPrice');

    setSearchParams(nextParams);
  };

  const handleCustomPriceSubmit = (e) => {
    e.preventDefault();
    handlePricePreset(customMin, customMax);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setCustomMin('');
    setCustomMax('');
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(
    currentCategory !== 'All' || 
    currentSearch || 
    currentBrand || 
    currentMinPrice || 
    currentMaxPrice || 
    currentRating || 
    currentDiscount
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* 1. TOP HEADER & BREADCRUMBS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          {/* Breadcrumbs & Back Button */}
          <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
            <BackButton fallback="/" label="Back to Home" />
            <div className="flex items-center gap-1.5">
              <Link to="/" className="hover:text-brand-600">Home</Link>
              <span>/</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {currentCategory === 'All' ? 'All Products' : currentCategory}
              </span>
              {currentBrand && (
                <>
                  <span>/</span>
                  <span className="text-brand-600 font-semibold">{currentBrand}</span>
                </>
              )}
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-navy-900 dark:text-white tracking-tight">
            {currentCategory === 'All' ? 'Browse All Marketplace Products' : currentCategory}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing {products.length} verified products with instant download access
          </p>
        </div>

        {/* Mobile Filter Toggle & Sort Dropdown */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-navy-900 dark:text-white bg-white dark:bg-slate-900"
          >
            <Filter className="w-4 h-4 text-brand-600" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs font-bold shadow-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 hidden sm:inline">Sort:</span>
            <select
              value={currentSort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="bg-transparent text-navy-900 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="latest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Customer Ratings</option>
              <option value="popular">Popularity</option>
              <option value="top_selling">Best Sellers</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE FILTER TAGS ROW */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
          <span className="text-xs font-bold text-slate-400">Active Filters:</span>

          {currentCategory !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-bold border border-brand-200 dark:border-brand-800">
              Category: {currentCategory}
              <button onClick={() => updateParam('category', 'All')}><X className="w-3 h-3 hover:text-red-500" /></button>
            </span>
          )}

          {currentSearch && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
              Keyword: "{currentSearch}"
              <button onClick={() => updateParam('search', '')}><X className="w-3 h-3 hover:text-red-500" /></button>
            </span>
          )}

          {currentBrand && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
              Brand: {currentBrand}
              <button onClick={() => updateParam('brand', '')}><X className="w-3 h-3 hover:text-red-500" /></button>
            </span>
          )}

          {(currentMinPrice || currentMaxPrice) && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
              Price: ${currentMinPrice || '0'} - ${currentMaxPrice || 'Max'}
              <button onClick={() => handlePricePreset('', '')}><X className="w-3 h-3 hover:text-red-500" /></button>
            </span>
          )}

          {currentRating && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              {currentRating}★ & above
              <button onClick={() => updateParam('minRating', '')}><X className="w-3 h-3 hover:text-red-500" /></button>
            </span>
          )}

          {currentDiscount && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-bold">
              {currentDiscount}%+ Discount
              <button onClick={() => updateParam('minDiscount', '')}><X className="w-3 h-3 hover:text-red-500" /></button>
            </span>
          )}

          <button
            onClick={handleResetFilters}
            className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 ml-2"
          >
            <RotateCcw className="w-3 h-3" /> Clear All
          </button>
        </div>
      )}

      {/* 3. MAIN CONTENT: SIDEBAR FILTERS + PRODUCT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar Filter Column */}
        <aside className={`lg:col-span-3 space-y-6 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="font-black text-sm text-navy-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-600" /> Filters
              </span>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-brand-600 hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            {/* A. Categories Filter */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Categories
              </h4>
              <div className="space-y-1">
                <button
                  onClick={() => handleCategorySelect('All')}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    currentCategory === 'All'
                      ? 'bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  All Categories
                </button>
                {DIGITAL_CATEGORIES.map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => handleCategorySelect(cat.name)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                      currentCategory === cat.name
                        ? 'bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {currentCategory === cat.name && <Check className="w-3.5 h-3.5 text-brand-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* B. Price Range Filter */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Price (USD)
              </h4>
              <div className="space-y-1">
                {PRICE_RANGES.map(range => {
                  const isSelected = currentMinPrice === range.min && currentMaxPrice === range.max;
                  return (
                    <button
                      key={range.label}
                      onClick={() => handlePricePreset(range.min, range.max)}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                        isSelected
                          ? 'bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{range.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-brand-600" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom price inputs */}
              <form onSubmit={handleCustomPriceSubmit} className="pt-2 flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={customMin}
                  onChange={(e) => setCustomMin(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-navy-900 dark:text-white"
                />
                <span className="text-slate-400 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={customMax}
                  onChange={(e) => setCustomMax(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-navy-900 dark:text-white"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-bold hover:bg-brand-700"
                >
                  Go
                </button>
              </form>
            </div>

            {/* C. Creators Filter */}
            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Creators
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar pr-1">
                {CREATORS.map(brand => {
                  const isChecked = currentBrand && currentBrand.split(',').includes(brand);
                  return (
                    <label
                      key={brand}
                      className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-brand-600"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(isChecked)}
                        onChange={() => handleBrandToggle(brand)}
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span>{brand}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* D. Customer Ratings Filter */}
            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Customer Ratings
              </h4>
              <div className="space-y-1">
                {RATING_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateParam('minRating', currentRating === opt.value ? '' : opt.value)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                      currentRating === opt.value
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                      {opt.label}
                    </span>
                    {currentRating === opt.value && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* E. Discount Percentage Filter */}
            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Discount
              </h4>
              <div className="space-y-1">
                {DISCOUNT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateParam('minDiscount', currentDiscount === opt.value ? '' : opt.value)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                      currentDiscount === opt.value
                        ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {currentDiscount === opt.value && <Check className="w-3.5 h-3.5 text-rose-600" />}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* Right Main Product Listing Grid */}
        <main className="lg:col-span-9 space-y-6">
          
          {loading ? (
            <div className="py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <LoadingSpinner text="Searching marketplace inventory..." />
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-navy-900 dark:text-white">No products match your criteria</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try adjusting your keyword, resetting filters, or choosing another category from the sidebar.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20"
              >
                Clear All Filters & Reset
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

        </main>

      </div>

    </div>
  );
};

export default Marketplace;