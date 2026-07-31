'use client';

import React, { useState, useEffect } from 'react';
import { Ban, Trash2, Loader2 } from 'lucide-react';
import { getAdminCustomersAction, toggleCustomerActiveAction, deleteCustomerAction } from '@/actions/customer-admin';

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomers() {
      setLoading(true);
      try {
        const liveUsers = await getAdminCustomersAction();
        setUsers(liveUsers);
      } catch (e) {
        console.error('Failed to load customers from database:', e);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, []);

  const toggleBlockUser = async (id: string, currentStatus: boolean) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isActive: !currentStatus } : u)));
    await toggleCustomerActiveAction(id, currentStatus);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this customer account from PostgreSQL DB?')) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      await deleteCustomerAction(id);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-admin-border">
        <div>
          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">CLIENT DIRECTORY</span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white mt-1">Customer Management</h1>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/30">
          REAL POSTGRESQL USERS
        </span>
      </div>

      <div className="bg-admin-card rounded-2xl border border-admin-border shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-admin-muted text-xs gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span>Fetching live database customers...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-admin-border uppercase font-bold text-admin-muted bg-admin-bg">
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Orders</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border text-admin-text">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-admin-hover transition">
                    <td className="py-4 px-4 flex items-center space-x-3">
                      <img src={u.avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-amber-500/30" />
                      <span className="font-bold text-white text-sm">{u.name}</span>
                    </td>
                    <td className="py-4 px-4 text-admin-muted">{u.email}</td>
                    <td className="py-4 px-4 font-mono font-bold text-amber-400">{u.role}</td>
                    <td className="py-4 px-4 text-white font-bold">{u.orderCount} orders</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${u.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {u.isActive ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => toggleBlockUser(u.id, u.isActive)}
                        className="p-2 rounded-lg bg-admin-bg text-admin-muted hover:text-amber-400 border border-admin-border cursor-pointer"
                        title={u.isActive ? "Block User" : "Unblock User"}
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="p-2 rounded-lg bg-admin-bg text-admin-muted hover:text-rose-400 border border-admin-border cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
