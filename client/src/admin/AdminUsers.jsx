import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Users, Shield, UserX, UserCheck, Calendar, Mail } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers();
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'suspended' ? 'active' : 'suspended';
    try {
      const res = await adminService.updateUserStatus(user.id || user.uid, nextStatus);
      if (res.data.success) {
        toast.success(`User ${user.name} is now ${nextStatus}.`);
        setUsers(prev => prev.map(u => (u.id === user.id || u.uid === user.uid) ? { ...u, status: nextStatus } : u));
      }
    } catch (err) {
      toast.error('Failed to update user status: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return <LoadingSpinner text="Fetching platform user directory..." />;
  }

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white">Manage Platform Users</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor registered members, roles, and administrative statuses.
          </p>
        </div>
        <span className="text-xs font-bold bg-slate-800 text-slate-300 px-3 py-1.5 rounded-xl">
          {users.length} Registered Accounts
        </span>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4 font-bold">User</th>
              <th className="py-3.5 px-4 font-bold">Email</th>
              <th className="py-3.5 px-4 font-bold">Role</th>
              <th className="py-3.5 px-4 font-bold">Registered</th>
              <th className="py-3.5 px-4 font-bold">Account Status</th>
              <th className="py-3.5 px-4 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {users.map((u) => {
              const isAdmin = u.role === 'admin' || u.email === 'admin@eproducts.com';
              const isSuspended = u.status === 'suspended';
              return (
                <tr key={u.id || u.uid} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-900/60 text-purple-300 flex items-center justify-center font-bold text-xs uppercase border border-purple-700/50">
                        {u.name ? u.name.charAt(0) : 'U'}
                      </div>
                      <span className="font-bold text-white">{u.name || 'Anonymous User'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {u.email}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      isAdmin
                        ? 'bg-purple-950 text-purple-300 border border-purple-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {u.role || 'User'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      isSuspended
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}>
                      {isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {!isAdmin && (
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ml-auto ${
                          isSuspended
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                            : 'bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900'
                        }`}
                      >
                        {isSuspended ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" /> Activate
                          </>
                        ) : (
                          <>
                            <UserX className="w-3.5 h-3.5" /> Suspend
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default AdminUsers;
