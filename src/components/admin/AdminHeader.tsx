'use client';

import React, { useState } from 'react';
import { Search, Bell, ShieldCheck, User as UserIcon, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const AdminHeader: React.FC = () => {
  const { user, role } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notifications = [
    { id: 1, title: 'New High Value Order #ANG-984212', time: '5 mins ago', read: false },
    { id: 2, title: 'Low Stock Alert: Tuxedo Suit (2 left)', time: '1 hour ago', read: false },
    { id: 3, title: 'New Product Review Verified', time: '3 hours ago', read: true },
  ];

  return (
    <header className="bg-admin-bg border-b border-admin-border px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      {/* Search Input */}
      <div className="relative w-72">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-admin-muted" />
        <input
          type="text"
          placeholder="Search orders, products, customers..."
          className="w-full pl-10 pr-4 py-2 bg-admin-card text-xs text-white rounded-xl border border-admin-border focus:outline-none focus:border-amber-500 placeholder-admin-muted font-sans"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        {/* Role Badge */}
        <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/30 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>ROLE: {role}</span>
        </span>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2.5 rounded-xl bg-admin-card text-admin-muted hover:text-white transition relative border border-admin-border"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-admin-card border border-admin-border rounded-2xl shadow-2xl p-4 z-50 text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-admin-border">
                <span className="font-bold text-white uppercase tracking-wider">Notifications</span>
                <span className="text-[10px] text-amber-400">2 Unread</span>
              </div>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl border transition ${
                      !n.read ? 'bg-amber-500/5 border-amber-500/20 text-white' : 'bg-admin-bg border-admin-border text-admin-muted'
                    }`}
                  >
                    <p className="font-semibold">{n.title}</p>
                    <span className="text-[10px] text-admin-muted">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center space-x-3 pl-2 border-l border-admin-border">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={user?.name || 'User'}
            className="w-8 h-8 rounded-full object-cover border border-amber-500/40"
          />
          <div className="hidden md:block">
            <p className="text-xs font-bold text-white leading-tight">{user?.name || 'Store Owner'}</p>
            <p className="text-[10px] text-admin-muted">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
