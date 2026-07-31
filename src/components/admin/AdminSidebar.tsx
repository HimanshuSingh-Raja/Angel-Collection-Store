'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FolderTree,
  Image,
  Ticket,
  Users,
  Settings,
  BookOpen,
  MessageSquare,
  Store,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { role, setRole, logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Categories', href: '/admin/categories', icon: FolderTree },
    { name: 'Banners', href: '/admin/banners', icon: Image },
    { name: 'Coupons', href: '/admin/coupons', icon: Ticket },
    { name: 'Blogs & CMS', href: '/admin/blogs', icon: BookOpen },
    { name: 'Review Moderation', href: '/admin/reviews', icon: MessageSquare },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/auth/admin-logout', { method: 'POST' });
    } catch (e) {
      console.warn('Admin logout call error:', e);
    }
    logout();
    router.push('/admin/login');
  };

  return (
    <aside className="w-64 bg-admin-bg text-admin-text border-r border-admin-border min-h-screen flex flex-col justify-between p-4 sticky top-0 h-screen overflow-y-auto">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-admin-border px-2">
          <Link href="/admin" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-neutral-950 flex items-center justify-center font-serif font-bold text-lg">
              A
            </div>
            <div>
              <span className="font-serif text-lg font-bold tracking-tight text-white block">
                ANGEL <span className="text-amber-400 font-light">ADMIN</span>
              </span>
              <span className="text-[10px] text-admin-muted font-mono block">Enterprise v1.0</span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'text-admin-muted hover:text-white hover:bg-admin-card'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-admin-muted'}`} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-3 h-3 text-amber-400" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Role Switcher & Store Back Button & Logout */}
      <div className="pt-6 border-t border-admin-border space-y-3">
        {/* Role Selector Badge */}
        <div className="bg-admin-card p-3 rounded-xl border border-admin-border">
          <label className="text-[10px] uppercase font-bold text-admin-muted block mb-1">Active Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="w-full bg-admin-bg text-amber-300 text-xs font-bold py-1.5 px-2 rounded-lg border border-admin-border focus:outline-none focus:border-amber-500"
          >
            <option value="OWNER">Owner (Full Permissions)</option>
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="STAFF">Staff (Restricted)</option>
            <option value="CUSTOMER">Customer View</option>
          </select>
        </div>

        <Link
          href="/"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-neutral-900 text-neutral-300 text-xs font-semibold hover:bg-neutral-800 hover:text-white transition border border-neutral-800"
        >
          <Store className="w-4 h-4 text-amber-400" />
          <span>View Customer Store</span>
        </Link>

        <button
          onClick={handleAdminLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition border border-rose-500/20"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout Admin Session</span>
        </button>
      </div>
    </aside>
  );
};
