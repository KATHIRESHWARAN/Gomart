import React, { useState, useEffect } from 'react';
import { adminService, productService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import BackButton from '../components/BackButton';
import { 
  Package, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Eye, 
  ExternalLink,
  Search,
  Filter,
  Plus,
  Tag,
  DollarSign,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'react-toastify';

const DIGITAL_CATEGORIES = [
  'E-books',
  'Tutorials',
  'Study Materials',
  'Templates',
  'PDFs',
  'Design Resources',
  'Notes & Guides'
];

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  // Add product modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    brand: '',
    category: 'E-books',
    price: '',
    originalPrice: '',
    stockQuantity: '50',
    thumbnailUrl: '',
    description: '',
    isAssured: true
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await adminService.getProducts();
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status, title) => {
    try {
      const res = await adminService.updateProductStatus(id, status);
      if (res.data.success) {
        toast.success(`Product "${title}" is now ${status}.`);
        setProducts(prev => prev.map(p => p.id === id ? { ...p, status } : p));
      }
    } catch (err) {
      toast.error('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Permanently delete "${title}" from the marketplace?`)) {
      return;
    }

    try {
      const res = await adminService.deleteProduct(id);
      if (res.data.success) {
        toast.success(`Product "${title}" deleted.`);
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete product: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.title?.trim() || !newProduct.price) {
      toast.error('Please enter product title and price.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: newProduct.title.trim(),
        name: newProduct.title.trim(),
        brand: newProduct.brand?.trim() || 'E-Products Official',
        category: newProduct.category || 'Templates',
        price: parseFloat(newProduct.price),
        originalPrice: newProduct.originalPrice ? parseFloat(newProduct.originalPrice) : parseFloat(newProduct.price) * 1.35,
        stockQuantity: parseInt(newProduct.stockQuantity) || 50,
        thumbnailUrl: newProduct.thumbnailUrl?.trim() || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
        images: [newProduct.thumbnailUrl?.trim() || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'],
        digitalFileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileType: 'Digital Package / PDF',
        fileSize: '15.0 MB',
        description: newProduct.description?.trim() || 'Verified digital product package with instant download access and license.',
        isAssured: true,
        inStock: true
      };

      const res = await productService.create(payload);
      if (res.data.success) {
        toast.success(`Product "${newProduct.title}" created successfully!`);
        setShowAddModal(false);
        setNewProduct({
          title: '',
          brand: '',
          category: 'E-books',
          price: '',
          originalPrice: '',
          stockQuantity: '50',
          thumbnailUrl: '',
          description: '',
          isAssured: true
        });
        fetchProducts();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create product.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = products.filter(p => {
    const matchesSearch = !searchTerm || 
      (p.name || p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sellerName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCategory === 'All' || p.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  if (loading) {
    return <LoadingSpinner text="Loading all marketplace products..." />;
  }

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6">
      
      <div className="flex justify-start">
        <BackButton fallback="/admin" label="Back to Overview" />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white">Manage Marketplace Products</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit catalog listings, stock counts, pricing, and approve submissions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Retail Product
          </button>
          <span className="text-xs font-bold bg-slate-800 text-slate-300 px-3 py-1.5 rounded-xl">
            {products.length} Items
          </span>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search by title, brand, or creator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="All">All Categories ({products.length})</option>
          {RETAIL_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4 font-bold">Product & Brand</th>
              <th className="py-3.5 px-4 font-bold">Category</th>
              <th className="py-3.5 px-4 font-bold">Price / MRP</th>
              <th className="py-3.5 px-4 font-bold">Stock</th>
              <th className="py-3.5 px-4 font-bold">Status</th>
              <th className="py-3.5 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((prod) => (
              <tr key={prod.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={prod.thumbnailUrl}
                      alt={prod.name}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0 border border-slate-700"
                    />
                    <div className="max-w-xs">
                      {prod.brand && (
                        <span className="text-[10px] font-bold uppercase text-purple-400 block">{prod.brand}</span>
                      )}
                      <p className="font-bold text-white line-clamp-1">{prod.name || prod.title}</p>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {prod.viewCount || 0} views • ★ {prod.rating || 4.5}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-slate-300 font-medium">
                  {prod.category}
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-bold text-white font-mono">${Number(prod.price).toFixed(2)}</span>
                  {prod.originalPrice && Number(prod.originalPrice) > Number(prod.price) && (
                    <span className="block text-[10px] text-slate-500 line-through font-mono">
                      ${Number(prod.originalPrice).toFixed(2)}
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-slate-300">
                  <span className="font-mono">{prod.stockQuantity ?? 100}</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    prod.status === 'approved'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : prod.status === 'pending'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}>
                    {prod.status || 'Approved'}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {prod.status !== 'approved' && (
                      <button
                        onClick={() => handleStatusUpdate(prod.id, 'approved', prod.name || prod.title)}
                        className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-800"
                        title="Approve Listing"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    {prod.status !== 'rejected' && (
                      <button
                        onClick={() => handleStatusUpdate(prod.id, 'rejected', prod.name || prod.title)}
                        className="p-1.5 rounded-lg bg-amber-950 text-amber-400 hover:bg-amber-900 border border-amber-800"
                        title="Reject Listing"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(prod.id, prod.name || prod.title)}
                      className="p-1.5 rounded-lg bg-rose-950 text-rose-400 hover:bg-rose-900 border border-rose-800"
                      title="Permanently Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Retail Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-black text-white">Add New Retail Product</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
                  placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Brand</label>
                  <input
                    type="text"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
                    placeholder="e.g. Sony, Nike, Apple"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Category *</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white"
                  >
                    {DIGITAL_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Selling Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    placeholder="99.99"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Original MRP ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.originalPrice}
                    onChange={(e) => setNewProduct({...newProduct, originalPrice: e.target.value})}
                    placeholder="149.99"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Stock Qty</label>
                  <input
                    type="number"
                    value={newProduct.stockQuantity}
                    onChange={(e) => setNewProduct({...newProduct, stockQuantity: e.target.value})}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Image URL</label>
                <input
                  type="url"
                  value={newProduct.thumbnailUrl}
                  onChange={(e) => setNewProduct({...newProduct, thumbnailUrl: e.target.value})}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  placeholder="Key features, specifications, and warranty information..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  {submitting ? 'Creating...' : 'Create & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminProducts;
