import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import BackButton from '../components/BackButton';
import { User, Mail, FileText, CheckCircle2, Shield } from 'lucide-react';
import { toast } from 'react-toastify';

const ProfileTab = () => {
  const { user, updateUserProfile } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setAvatar(user.avatar || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await updateUserProfile({ name, bio, avatar, phone });
    } catch (err) {
      // Toast handled in context
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 shadow-xs space-y-8">
      
      <div className="flex justify-start">
        <BackButton fallback="/dashboard" label="Back to Dashboard" />
      </div>

      {/* Header */}
      <div className="pb-6 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-xl font-black text-navy-900 dark:text-white tracking-tight">Profile & Account Settings</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your creator bio, display name, and contact information.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Avatar Preview */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center uppercase shadow-md shadow-brand-500/20 shrink-0">
            {name ? name.charAt(0) : 'U'}
          </div>
          <div>
            <h4 className="font-bold text-navy-900 dark:text-white text-sm">{name || 'Your Name'}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
            <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded border border-brand-200 dark:border-brand-800">
              Role: {user?.role || 'Member'}
            </span>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Email Address (read only) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
          <div className="relative">
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Email is managed by authentication provider.
          </span>
        </div>

        {/* Creator Bio */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Creator Biography</label>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Share your technical background or what kind of resources you create..."
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={updating}
            className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-all flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            {updating ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </div>

      </form>

    </div>
  );
};

export default ProfileTab;
