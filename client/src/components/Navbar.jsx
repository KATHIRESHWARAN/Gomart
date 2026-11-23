import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import { 
  ShoppingBag, 
  Search, 
  User, 
  LogOut, 
  LayoutDashboard, 
  Package, 
  Upload, 
  ShieldCheck, 
  ChevronDown, 
  Menu, 
  X,
  Sparkles,
  Heart,
  Sun,
  Moon,
  Flame,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Laptop,
  BookMarked,
  Receipt,
  Tag,
  Zap,
  FolderDown,
  Layers
} from 'lucide-react';

export const DIGITAL_CATEGORIES = [
  { 
    name: 'E-books', 
    icon: BookOpen,
    desc: 'Programming, Architecture, AI & Engineering books',
    sub: ['Programming & DSA', 'System Design & Cloud', 'Web Architecture', 'AI & Machine Learning'] 
  },
  { 
    name: 'Tutorials', 
    icon: Laptop,
    desc: 'Full-stack masterclasses, Docker, K8s & Video guides',
    sub: ['Full-Stack MERN SaaS', 'Kubernetes & Docker', 'GraphQL & Node.js', 'Spring Boot 3 Microservices'] 
  },
  { 
    name: 'Study Materials', 
    icon: BookMarked,
    desc: 'GATE CS, university packs & exam prep sheets',
    sub: ['GATE CS & IT Packs', 'Computer Science Core', 'Algorithms Cheatsheets', 'OS & Networking'] 
  },
  { 
    name: 'Templates', 
    icon: Sparkles,
    desc: 'Next.js boilerplates, UI kits & full-stack starters',
    sub: ['Next.js SaaS Boilerplates', 'Admin Dashboard Kits', 'E-Commerce Starters', 'Mobile UI React Native'] 
  },
  { 
    name: 'PDFs', 
    icon: Receipt,
    desc: 'Blueprints, cheatsheets & technical whitepapers',
    sub: ['Architecture Blueprints', 'Developer Cheat Sheets', 'Interview Preparation Guides', 'Whitepapers & Specs'] 
  },
  { 
    name: 'Design Resources', 
    icon: Tag,
    desc: 'Figma kits, 3D icons, illustrations & design systems',
    sub: ['Figma Design Systems', '3D Icon Packs', 'Tailwind UI Components', 'Wireframe & Vector Kits'] 
  },
  { 
    name: 'Notes & Guides', 
    icon: CheckCircle2,
    desc: 'FAANG handbooks, DevOps blueprints & cheat notes',
    sub: ['FAANG Interview Handbook', 'AWS Cloud Architect Notes', 'DevOps & CI/CD Pipeline Guides', 'Security Best Practices'] 
  }
];

export const ECOM_CATEGORIES = DIGITAL_CATEGORIES;

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const { itemCount, subtotal } = useCart();
  const { wishlistCount } = useWishlist();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('All');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Refs for robust outside-click detection
  const dropdownRef = useRef(null);
  const categoryBarRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (categoryBarRef.current && !categoryBarRef.current.contains(event.target)) {
        setCategoryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  // Close menus on route navigation
  useEffect(() => {
    setDropdownOpen(false);
    setCategoryDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }
    if (searchCategory !== 'All') {
      params.set('category', searchCategory);
    }
    navigate(`/products?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      
      {/* MAIN NAVBAR ROW */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 lg:gap-6">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-accent-purple flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-black text-xl sm:text-2xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>E-Products</span>
                <span className="text-[10px] tracking-wider font-extrabold uppercase px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                  DIGITAL
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-tight -mt-0.5 hidden sm:block">
                Digital Marketplace
              </p>
            </div>
          </Link>

          {/* Central Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl relative flex items-center">
            <div className="flex w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/90 overflow-hidden focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent transition-all shadow-xs">
              
              {/* Category selector on left */}
              <select
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="hidden md:block bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold px-3 py-2.5 border-r border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer hover:bg-slate-200/70 dark:hover:bg-slate-700/70"
              >
                <option value="All">All Categories</option>
                {DIGITAL_CATEGORIES.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>

              {/* Search text input */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search digital products, e-books, templates, code, notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white bg-transparent focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              {/* Search button */}
              <button
                type="submit"
                className="bg-brand-600 hover:bg-brand-700 text-white px-4 sm:px-5 flex items-center justify-center transition-colors shadow-xs"
                title="Search Digital Products"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Action Links & Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Sell Digital Product CTA */}
            <Link
              to={user ? "/dashboard/upload" : "/login"}
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>Sell Product</span>
            </Link>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="relative p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
              title="Saved Wishlist"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-300" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-scale-in">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Link with Badge */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-xl bg-brand-50 dark:bg-brand-950/70 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900/60 transition-colors"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-brand-600 dark:text-brand-400" />
              <div className="hidden sm:block text-left text-xs leading-none">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Cart</span>
                <span className="font-extrabold text-slate-900 dark:text-white">${subtotal.toFixed(2)}</span>
              </div>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Account / Dropdown */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center uppercase shadow-xs">
                    {user.name ? user.name.charAt(0) : 'U'}
                  </div>
                  <div className="hidden md:block text-left text-xs leading-none max-w-[100px] truncate">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Account</span>
                    <span className="font-bold text-slate-900 dark:text-white truncate block">{user.name}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden md:block" />
                </button>

                {/* Profile Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          Administrator
                        </span>
                      )}
                    </div>

                    <div className="py-1 text-xs text-slate-700 dark:text-slate-300">
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-brand-600" />
                        <span>User Dashboard</span>
                      </Link>

                      <Link
                        to="/dashboard/purchases"
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
                      >
                        <FolderDown className="w-4 h-4 text-emerald-600" />
                        <span>My Purchases (Downloads)</span>
                      </Link>

                      <Link
                        to="/dashboard/products"
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
                      >
                        <Package className="w-4 h-4 text-indigo-600" />
                        <span>My Uploaded Products</span>
                      </Link>

                      <Link
                        to="/dashboard/upload"
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
                      >
                        <Upload className="w-4 h-4 text-accent-purple" />
                        <span>Upload New Product</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold transition-colors border-t border-b border-slate-100 dark:border-slate-800 my-1"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-500" />
                          <span>Admin Control Center</span>
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="hidden sm:inline-flex px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. CATEGORY NAVIGATION SUB-BAR (The 7 PDF Categories) */}
      <div className="hidden md:block bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-200/80 dark:border-slate-800 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/products"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-900 dark:text-white hover:bg-brand-50 dark:hover:bg-brand-950/50 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>All Products</span>
            </Link>
            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            {DIGITAL_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  to={`/products?category=${encodeURIComponent(cat.name)}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all shrink-0"
                >
                  <Icon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>{cat.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/products?sort=views"
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 hover:bg-amber-100 transition-colors"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Trending</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4. MOBILE DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-4 space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
            Digital Categories
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DIGITAL_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  to={`/products?category=${encodeURIComponent(cat.name)}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors"
                >
                  <Icon className="w-4 h-4 text-brand-600" />
                  <span className="truncate">{cat.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-xs"
            >
              Explore Full Marketplace
            </Link>
            <Link
              to={user ? "/dashboard/upload" : "/login"}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold"
            >
              Sell Your Digital Asset
            </Link>
          </div>
        </div>
      )}

    </header>
  );
};

export default Navbar;
