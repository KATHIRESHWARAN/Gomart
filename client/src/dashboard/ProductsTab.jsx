import React, { useState, useEffect } from 'react';
import { productService, getFileUrl } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ProductAnalyticsModal from '../components/ProductAnalyticsModal';
import { 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  TrendingUp, 
  BarChart3,
  DollarSign,
  Award,
  Sparkles,
  ExternalLink,
  Percent
} from 'lucide-react';
import { toast } from 'react-toastify';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const ProductsTab = ({ setActiveTab }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSellerAnalytics, setShowSellerAnalytics] = useState(false);

  // Selected product for individual product analytics modal (Requirement 5.C)
  const [selectedAnalyticsProduct, setSelectedAnalyticsProduct] = useState(null);

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    thumbnailUrl: ''
  });
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchSellerProducts();
  }, []);

  const fetchSellerProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getSellerProducts();
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load seller products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const res = await productService.delete(id);
      if (res.data.success) {
        toast.success(`Product "${name}" deleted.`);
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete product: ' + (err.response?.data?.message || err.message));
    }
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setEditFormData({
      name: prod.name || prod.title,
      price: prod.price,
      category: prod.category,
      description: prod.description,
      thumbnailUrl: prod.thumbnailUrl
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);

    try {
      const payload = {
        name: editFormData.name.trim(),
        title: editFormData.name.trim(),
        price: Number(editFormData.price),
        category: editFormData.category.trim(),
        description: editFormData.description.trim(),
        thumbnailUrl: editFormData.thumbnailUrl.trim()
      };

      const res = await productService.update(editingProduct.id, payload);
      if (res.data.success) {
        toast.success('Product updated successfully.');
        setEditingProduct(null);
        fetchSellerProducts();
      }
    } catch (err) {
      toast.error('Failed to update product: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingEdit(false);
    }
  };

  // Compute Overall Seller Analytics metrics (Requirement 5.B)
  const totalProducts = products.length;
  const totalViews = products.reduce((acc, p) => acc + (Number(p.viewCount) || 0), 0);
  const totalSales = products.reduce((acc, p) => acc + (Number(p.salesCount) || 0), 0);
  const totalRevenue = products.reduce((acc, p) => acc + ((Number(p.salesCount) || 0) * (Number(p.price) || 0)), 0);

  // Best performing product by sales
  const sortedBySales = [...products].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
  const bestProduct = sortedBySales[0];

  // Performance chart per product
  const performanceChartData = products.slice(0, 5).map(p => ({
    name: (p.name || p.title || 'Product').slice(0, 16),
    views: Number(p.viewCount || 0),
    sales: Number(p.salesCount || 0)
  }));

  if (loading) {
    return <LoadingSpinner text="Loading your listed products..." />;
  }

  return (
    <div className="space-y-6">
      
      {/* Header with "Seller Analytics" Button (Requirement 5.B) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-navy-900 dark:text-white tracking-tight">
            Seller Studio & Catalog
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your digital product inventory, track view counts, and analyze conversions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* REQUIRED SELLER ANALYTICS BUTTON (Requirement 5.B) */}
          <button
            onClick={() => setShowSellerAnalytics(!showSellerAnalytics)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              showSellerAnalytics
                ? 'bg-purple-600 text-white shadow-purple-500/25'
                : 'bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-purple-500" />
            {showSellerAnalytics ? 'Hide Analytics' : 'Seller Analytics'}
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Toggled Comprehensive Seller Analytics Panel (Requirement 5.B) */}
      {showSellerAnalytics && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-purple-200 dark:border-purple-800/80 shadow-md space-y-6 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                Seller Performance Suite
              </span>
              <h3 className="text-lg font-black text-navy-900 dark:text-white mt-1">
                Storefront Insights & Product Performance
              </h3>
            </div>
            {bestProduct && (
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Top Seller: <strong className="text-navy-900 dark:text-white">{bestProduct.name || bestProduct.title}</strong></span>
              </div>
            )}
          </div>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Products</span>
              <p className="text-2xl font-black text-navy-900 dark:text-white mt-0.5">{totalProducts}</p>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Active Listings</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Views</span>
              <p className="text-2xl font-black text-navy-900 dark:text-white mt-0.5">{totalViews.toLocaleString()}</p>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">Customer Impressions</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Sales</span>
              <p className="text-2xl font-black text-navy-900 dark:text-white mt-0.5">{totalSales}</p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Copies Purchased</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Revenue</span>
              <p className="text-2xl font-black text-navy-900 dark:text-white mt-0.5">${totalRevenue.toFixed(2)}</p>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Gross Earned</span>
            </div>
          </div>

          {/* Recharts Product Performance Comparison */}
          {performanceChartData.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-navy-900 dark:text-white">Top 5 Products: Views vs Purchases</span>
                <span className="text-[10px] text-slate-400">Inventory Sampling</span>
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        borderColor: '#334155', 
                        borderRadius: '12px', 
                        color: '#fff',
                        fontSize: '12px' 
                      }} 
                    />
                    <Bar dataKey="views" name="Impressions" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="sales" name="Purchases" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products listed yet"
          description="Start selling by listing your first e-book, source code repository, or study guide."
          actionText="Upload Your First Product"
          onAction={() => setActiveTab('upload')}
        />
      ) : (
        <div className="space-y-4">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div className="flex items-center gap-4">
                <img
                  src={getFileUrl(prod.thumbnailUrl)}
                  alt={prod.name}
                  className="w-20 h-16 sm:w-24 sm:h-20 rounded-2xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-100 dark:border-slate-800"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded">
                      {prod.category}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      prod.status === 'approved' 
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : prod.status === 'pending'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    }`}>
                      {prod.status || 'Approved'}
                    </span>
                  </div>

                  <h3 className="font-bold text-navy-900 dark:text-white text-base sm:text-lg line-clamp-1">
                    {prod.name || prod.title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      {prod.viewCount || 0} views
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {prod.salesCount || 0} sales
                    </span>
                    <span className="text-purple-600 dark:text-purple-400 font-semibold">
                      Revenue: ${((Number(prod.salesCount) || 0) * (Number(prod.price) || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                <span className="text-xl font-black text-navy-900 dark:text-white">
                  ${Number(prod.price).toFixed(2)}
                </span>
                
                <div className="flex items-center gap-2">
                  {/* REQUIRED PER-PRODUCT "VIEW ANALYTICS" BUTTON (Requirement 5.C) */}
                  <button
                    onClick={() => setSelectedAnalyticsProduct(prod)}
                    className="px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-xs font-bold transition-colors flex items-center gap-1.5"
                    title="View Product Performance"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>View Performance</span>
                  </button>

                  <button
                    onClick={() => openEditModal(prod)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-slate-800 transition-colors"
                    title="Edit Product"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(prod.id, prod.name || prod.title)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Individual Product Performance Analytics Modal (Requirement 5.C) */}
      <ProductAnalyticsModal
        product={selectedAnalyticsProduct}
        isOpen={Boolean(selectedAnalyticsProduct)}
        onClose={() => setSelectedAnalyticsProduct(null)}
      />

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-navy-900 dark:text-white text-lg">Edit Product Details</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Product Title</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="E-books">E-books</option>
                    <option value="Tutorials">Tutorials</option>
                    <option value="Study Materials">Study Materials</option>
                    <option value="Templates">Templates</option>
                    <option value="PDFs">PDFs</option>
                    <option value="Design Resources">Design Resources</option>
                    <option value="Notes & Guides">Notes & Guides</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Thumbnail URL</label>
                <input
                  type="url"
                  value={editFormData.thumbnailUrl}
                  onChange={(e) => setEditFormData({ ...editFormData, thumbnailUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={4}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs"
                >
                  {savingEdit ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductsTab;
