import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Upload, 
  Receipt, 
  User, 
  LogOut,
  ShieldCheck,
  ChevronRight,
  Heart,
  BarChart3,
  MapPin
} from 'lucide-react';

import BackButton from '../components/BackButton';
import OverviewTab from './OverviewTab';
import PurchasesTab from './PurchasesTab';
import ProductsTab from './ProductsTab';
import UploadProductTab from './UploadProductTab';
import OrdersTab from './OrdersTab';
import ProfileTab from './ProfileTab';

const UserDashboard = () => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getInitialTab = () => {
    const path = location.pathname;
    if (path.includes('/dashboard/purchases')) return 'purchases';
    if (path.includes('/dashboard/products')) return 'products';
    if (path.includes('/dashboard/upload')) return 'upload';
    if (path.includes('/dashboard/orders')) return 'orders';
    if (path.includes('/dashboard/profile')) return 'profile';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'overview') navigate('/dashboard');
    else navigate(`/dashboard/${tab}`);
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'purchases', label: 'My Purchases', icon: ShoppingBag, badge: 'Downloads' },
    { id: 'products', label: 'My Uploaded Products', icon: Package, badge: 'Seller' },
    { id: 'upload', label: 'Upload Product', icon: Upload },
    { id: 'orders', label: 'Order History', icon: Receipt },
    { id: 'profile', label: 'Profile Settings', icon: User },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back Button */}
      <div className="flex justify-start">
        <BackButton fallback="/" label="Back to Marketplace" />
      </div>

      {/* Dashboard Top Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-accent-purple text-white font-black text-xl flex items-center justify-center uppercase shadow-lg shadow-brand-500/25 shrink-0">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-navy-900 dark:text-white tracking-tight">{user?.name}</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                Buyer & Creator Hub
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/wishlist"
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" /> Wishlist
          </Link>
          <button
            onClick={() => handleTabChange('upload')}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" /> Upload Product
          </button>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar Navigation */}
        <aside className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-2 sticky top-28">
          <div className="px-3 py-2 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Dashboard Menu
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-navy-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && !isActive && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {isAdmin && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
              <Link
                to="/admin"
                className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-2xl text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Admin Control Center</span>
              </Link>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
            <button
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Right Main Content Pane */}
        <main className="lg:col-span-9 min-h-[500px]">
          {activeTab === 'overview' && <OverviewTab setActiveTab={handleTabChange} />}
          {activeTab === 'purchases' && <PurchasesTab />}
          {activeTab === 'products' && <ProductsTab setActiveTab={handleTabChange} />}
          {activeTab === 'upload' && <UploadProductTab onComplete={() => handleTabChange('products')} />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'profile' && <ProfileTab />}
        </main>

      </div>

    </div>
  );
};

export default UserDashboard;
