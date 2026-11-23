import React, { useState } from 'react';
import BackButton from '../components/BackButton';
import { MapPin, Plus, Trash2, CheckCircle2, Home, Building2, Check } from 'lucide-react';
import { toast } from 'react-toastify';

const DEFAULT_ADDRESSES = [
  {
    id: 'addr_1',
    name: 'Alex Developer',
    phone: '9876543210',
    street: 'Flat 402, Royal Residency, Outer Ring Road, Bellandur',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560103',
    type: 'Home',
    isDefault: true
  },
  {
    id: 'addr_2',
    name: 'Alex Developer (Office)',
    phone: '9876543210',
    street: 'Tech Park, Tower B, 5th Floor, Whitefield',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560066',
    type: 'Work',
    isDefault: false
  }
];

const AddressesTab = () => {
  const [addresses, setAddresses] = useState(() => {
    try {
      const stored = localStorage.getItem('gomart_saved_addresses');
      return stored ? JSON.parse(stored) : DEFAULT_ADDRESSES;
    } catch {
      return DEFAULT_ADDRESSES;
    }
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddr, setNewAddr] = useState({
    name: '',
    phone: '',
    street: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560103',
    type: 'Home',
    isDefault: false
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!newAddr.name || !newAddr.phone || !newAddr.street || !newAddr.pincode) {
      toast.error('Please complete all address fields.');
      return;
    }

    const created = {
      ...newAddr,
      id: 'addr_' + Date.now()
    };

    let updated = [...addresses];
    if (created.isDefault) {
      updated = updated.map(a => ({ ...a, isDefault: false }));
    }
    updated.push(created);

    setAddresses(updated);
    localStorage.setItem('gomart_saved_addresses', JSON.stringify(updated));
    setShowAddForm(false);
    setNewAddr({
      name: '',
      phone: '',
      street: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560103',
      type: 'Home',
      isDefault: false
    });
    toast.success('Address saved successfully.');
  };

  const handleSetDefault = (id) => {
    const updated = addresses.map(a => ({
      ...a,
      isDefault: a.id === id
    }));
    setAddresses(updated);
    localStorage.setItem('gomart_saved_addresses', JSON.stringify(updated));
    toast.success('Default delivery address updated.');
  };

  const handleDelete = (id) => {
    if (addresses.length === 1) {
      toast.error('You must keep at least one saved address.');
      return;
    }
    const updated = addresses.filter(a => a.id !== id);
    setAddresses(updated);
    localStorage.setItem('gomart_saved_addresses', JSON.stringify(updated));
    toast.success('Address removed.');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 shadow-xs space-y-6">
      
      <div className="flex justify-start">
        <BackButton fallback="/dashboard" label="Back to Dashboard" />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-navy-900 dark:text-white tracking-tight">Saved Delivery Addresses</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal and work delivery locations for 1-click checkout.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors self-start shadow-sm"
        >
          <Plus className="w-4 h-4" /> {showAddForm ? 'Cancel' : 'Add New Address'}
        </button>
      </div>

      {/* Add New Address Form */}
      {showAddForm && (
        <form onSubmit={handleSave} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Add New Address
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={newAddr.name}
                onChange={(e) => setNewAddr({...newAddr, name: e.target.value})}
                placeholder="Receiver name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-navy-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Mobile Number *</label>
              <input
                type="tel"
                required
                maxLength={10}
                value={newAddr.phone}
                onChange={(e) => setNewAddr({...newAddr, phone: e.target.value})}
                placeholder="10-digit number"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-navy-900 dark:text-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Flat / Building / Street Address *</label>
              <input
                type="text"
                required
                value={newAddr.street}
                onChange={(e) => setNewAddr({...newAddr, street: e.target.value})}
                placeholder="Door / Flat / Street name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-navy-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">City *</label>
              <input
                type="text"
                required
                value={newAddr.city}
                onChange={(e) => setNewAddr({...newAddr, city: e.target.value})}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-navy-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Pincode *</label>
              <input
                type="text"
                required
                maxLength={6}
                value={newAddr.pincode}
                onChange={(e) => setNewAddr({...newAddr, pincode: e.target.value})}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-navy-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">State *</label>
              <input
                type="text"
                required
                value={newAddr.state}
                onChange={(e) => setNewAddr({...newAddr, state: e.target.value})}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-navy-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Type</label>
              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="type"
                    checked={newAddr.type === 'Home'}
                    onChange={() => setNewAddr({...newAddr, type: 'Home'})}
                  />
                  Home
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="type"
                    checked={newAddr.type === 'Work'}
                    onChange={() => setNewAddr({...newAddr, type: 'Work'})}
                  />
                  Work
                </label>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm"
            >
              Save Address
            </button>
          </div>
        </form>
      )}

      {/* Addresses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-3 relative hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-navy-900 dark:text-white">{addr.name}</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {addr.type}
                </span>
                {addr.isDefault && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                    Default
                  </span>
                )}
              </div>

              <button
                onClick={() => handleDelete(addr.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                title="Remove Address"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {addr.street}, {addr.city}, {addr.state} - <strong className="font-mono text-navy-900 dark:text-white">{addr.pincode}</strong>
            </p>

            <p className="text-xs text-slate-500">
              Phone: <strong className="text-navy-900 dark:text-white">{addr.phone}</strong>
            </p>

            {!addr.isDefault && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Set as Default Address
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};

export default AddressesTab;
