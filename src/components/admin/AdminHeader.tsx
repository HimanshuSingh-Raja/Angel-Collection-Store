'use client';

import React, { useState } from 'react';
import { Search, Bell, ShieldCheck, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AdminHeaderProps {
  onMenuToggle?: () => void;
  isMobileOpen?: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuToggle, isMobileOpen }) => {
  const { user, role } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notifications = [
    { id: 1, title: 'New High Value Order #ANG-984212', time: '5 mins ago', read: false },
    { id: 2, title: 'Low Stock Alert: Tuxedo Suit (2 left)', time: '1 hour ago', read: false },
    { id: 3, title: 'New Product Review Verified', time: '3 hours ago', read: true },
  ];

  return (
    <header className="bg-admin-bg border-b border-admin-border px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 font-sans">
      {/* Mobile Hamburger & Logo Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 min-h-[44px] min-w-[44px] rounded-xl bg-admin-card text-admin-muted hover:text-white border border-admin-border flex items-center justify-center cursor-pointer"
          aria-label="Toggle Mobile Navigation Drawer"
        >
          {isMobileOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5 text-amber-400" />}
        </button>

        {/* Search Input (Hidden on tiny phones, full width on tablet/desktop) */}
        <div className="relative w-44 sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-admin-muted" />
          <input
            type="text"
            placeholder="Search dashboard..."
            className="w-full pl-10 pr-4 py-2 bg-admin-card text-xs text-white rounded-xl border border-admin-border focus:outline-none focus:border-amber-500 placeholder-admin-muted font-sans min-h-[40px]"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Role Badge */}
        <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/30 items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>ROLE: {role}</span>
        </span>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2.5 min-h-[44px] min-w-[44px] rounded-xl bg-admin-card text-admin-muted hover:text-white transition relative border border-admin-border flex items-center justify-center cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-admin-card border border-admin-border rounded-2xl shadow-2xl p-4 z-50 text-xs space-y-3">
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
          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/40">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="hidden lg:block">
            <p className="text-xs font-bold text-white leading-tight">{user?.name || 'Store Owner'}</p>
            <p className="text-[10px] text-admin-muted">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
