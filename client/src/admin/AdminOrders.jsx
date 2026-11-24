import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import BackButton from '../components/BackButton';
import InvoiceModal from '../components/InvoiceModal';
import { 
  Receipt, 
  Calendar, 
  CreditCard, 
  ShieldCheck, 
  Truck, 
  MapPin, 
  Search, 
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  FileText
} from 'lucide-react';
import { toast } from 'react-toastify';

const STATUS_OPTIONS = [
  'Order Placed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled'
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await adminService.getOrders();
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await adminService.updateOrderStatus(orderId, newStatus);
      if (res.data.success) {
        toast.success(`Order status updated to "${newStatus}".`);
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
      }
    } catch (err) {
      toast.error('Failed to update order status: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = !searchTerm || 
      (o.orderId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.buyerEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.buyerName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || (o.orderStatus || 'Order Placed') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <LoadingSpinner text="Fetching all platform orders..." />;
  }

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6">
      
      <div className="flex justify-start">
        <BackButton fallback="/admin" label="Back to Overview" />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white">Platform Orders & Fulfillment Hub</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit transactions, verify customer licensing, and track order fulfillment.
          </p>
        </div>
        <span className="text-xs font-bold bg-slate-800 text-slate-300 px-3 py-1.5 rounded-xl self-start">
          {orders.length} Total Orders
        </span>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search by Order ID, Buyer name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="All">All Statuses</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4 font-bold">Order ID</th>
              <th className="py-3.5 px-4 font-bold">Customer & Account</th>
              <th className="py-3.5 px-4 font-bold">Products</th>
              <th className="py-3.5 px-4 font-bold">Amount</th>
              <th className="py-3.5 px-4 font-bold">Payment</th>
              <th className="py-3.5 px-4 font-bold">Fulfillment Status</th>
              <th className="py-3.5 px-4 font-bold">Date</th>
              <th className="py-3.5 px-4 font-bold text-right">Invoice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredOrders.map((ord) => {
              const currentStatus = ord.orderStatus || 'Order Placed';
              const isCancelled = currentStatus === 'Cancelled';

              return (
                <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                  
                  {/* Order ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-purple-400 align-top">
                    {ord.orderId}
                  </td>

                  {/* Customer & Shipping */}
                  <td className="py-3.5 px-4 align-top max-w-xs">
                    <p className="font-semibold text-white">{ord.buyerName || 'Customer'}</p>
                    <p className="text-[11px] text-slate-400">{ord.buyerEmail}</p>
                    {ord.shippingAddress && (
                      <p className="text-[10px] text-slate-500 mt-1 flex items-start gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                        <span>{ord.shippingAddress.street}, {ord.shippingAddress.city} - {ord.shippingAddress.pincode}</span>
                      </p>
                    )}
                  </td>

                  {/* Products */}
                  <td className="py-3.5 px-4 align-top max-w-xs text-slate-300">
                    <div className="space-y-1">
                      {ord.items?.map((i, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                          <span className="font-medium line-clamp-1">{i.name || i.title}</span>
                          <span className="text-slate-500 font-mono">x{i.quantity || 1}</span>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 align-top font-bold text-white font-mono">
                    ${Number(ord.totalAmount).toFixed(2)}
                  </td>

                  {/* Payment Method */}
                  <td className="py-3.5 px-4 align-top text-slate-400">
                    <span className="block font-medium text-slate-300">{ord.paymentMethod || 'Online Payment'}</span>
                    <span className="text-[10px] text-emerald-400">{ord.paymentStatus || 'Completed'}</span>
                  </td>

                  {/* Fulfillment Status Dropdown */}
                  <td className="py-3.5 px-4 align-top">
                    <select
                      value={currentStatus}
                      disabled={updatingId === ord.id}
                      onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${
                        isCancelled
                          ? 'bg-rose-950/80 border-rose-800 text-rose-300'
                          : currentStatus === 'Delivered'
                          ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                          : 'bg-slate-800 border-slate-700 text-white'
                      }`}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4 align-top text-slate-500 text-[11px]">
                    {new Date(ord.createdAt).toLocaleDateString()}
                  </td>

                  {/* Invoice Action */}
                  <td className="py-3.5 px-4 align-top text-right">
                    <button
                      onClick={() => setSelectedInvoiceOrder(ord)}
                      className="px-2.5 py-1 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-800 text-purple-300 text-[11px] font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                      title="View & Print Official Invoice"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Invoice</span>
                    </button>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Official Tax Invoice Modal */}
      <InvoiceModal
        order={selectedInvoiceOrder}
        isOpen={Boolean(selectedInvoiceOrder)}
        onClose={() => setSelectedInvoiceOrder(null)}
      />

    </div>
  );
};

export default AdminOrders;
