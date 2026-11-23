import React, { useState, useEffect } from 'react';
import { orderService, downloadService, getFileUrl } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { 
  DownloadCloud, 
  ShoppingBag, 
  Calendar, 
  Receipt, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { toast } from 'react-toastify';

const PurchasesTab = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const res = await orderService.getMyPurchases();
      if (res.data.success) {
        setPurchases(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load purchases:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (productId, productName) => {
    try {
      setDownloadingId(productId);
      toast.info(`Verifying backend authorization for "${productName}"...`);
      
      const res = await downloadService.download(productId);
      
      if (res.data.downloadUrl) {
        window.open(getFileUrl(res.data.downloadUrl), '_blank');
        toast.success(`Download verified and initiated.`);
      }
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Download forbidden: ' + (err.response?.data?.message || err.message));
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your purchased digital items..." />;
  }

  if (purchases.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="No digital purchases yet"
        description="Browse our collection of e-books, templates, and courses to add your first digital asset."
        actionText="Browse Marketplace"
        actionLink="/products"
      />
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-navy-900 dark:text-white tracking-tight">My Purchases</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verified ownership with instant lifetime download access.
          </p>
        </div>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
          {purchases.length} Items Purchased
        </span>
      </div>

      <div className="space-y-4">
        {purchases.map((item) => (
          <div
            key={item.productId}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            <div className="flex items-center gap-4">
              <img
                src={getFileUrl(item.thumbnailUrl) || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80'}
                alt={item.name || item.title}
                className="w-20 h-16 sm:w-24 sm:h-20 rounded-2xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-100 dark:border-slate-800"
              />
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded">
                  {item.category || 'Digital'}
                </span>
                <h3 className="font-bold text-navy-900 dark:text-white text-base sm:text-lg line-clamp-1">
                  {item.name || item.title}
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(item.purchaseDate).toLocaleDateString()}
                  </span>
                  <span>
                    Order: <strong className="font-mono text-slate-700 dark:text-slate-300">{item.orderId}</strong>
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Licensed
                  </span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
              <span className="text-xl font-black text-navy-900 dark:text-white">
                ${Number(item.price).toFixed(2)}
              </span>
              <button
                onClick={() => handleDownload(item.productId, item.name || item.title)}
                disabled={downloadingId === item.productId}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-2 shrink-0"
              >
                <DownloadCloud className="w-4 h-4" />
                {downloadingId === item.productId ? 'Authorizing...' : 'Download File'}
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default PurchasesTab;
