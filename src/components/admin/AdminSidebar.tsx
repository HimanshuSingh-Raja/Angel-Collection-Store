'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FolderTree,
  Image as ImageIcon,
  Ticket,
  Users,
  Settings,
  BookOpen,
  MessageSquare,
  Store,
  ChevronRight,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AdminSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isMobileOpen, onMobileClose }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { role, setRole, logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Categories', href: '/admin/categories', icon: FolderTree },
    { name: 'Banners', href: '/admin/banners', icon: ImageIcon },
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
    if (onMobileClose) onMobileClose();
    router.push('/admin/login');
  };

  const SidebarContent = (
    <div className="flex flex-col justify-between h-full p-4 overflow-y-auto font-sans">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-admin-border px-2">
          <Link href="/admin" onClick={onMobileClose} className="flex items-center space-x-2">
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

          {/* Close button on mobile drawer */}
          <button
            onClick={onMobileClose}
            className="md:hidden p-2 text-neutral-400 hover:text-white rounded-lg"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
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
                onClick={onMobileClose}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition min-h-[44px] ${
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
            className="w-full bg-admin-bg text-amber-300 text-xs font-bold py-2 px-2 rounded-lg border border-admin-border focus:outline-none focus:border-amber-500 min-h-[40px]"
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
          onClick={onMobileClose}
          className="w-full flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-neutral-900 text-neutral-300 text-xs font-semibold hover:bg-neutral-800 hover:text-white transition border border-neutral-800 min-h-[44px]"
        >
          <Store className="w-4 h-4 text-amber-400" />
          <span>View Customer Store</span>
        </Link>

        <button
          onClick={handleAdminLogout}
          className="w-full flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition border border-rose-500/20 min-h-[44px] cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout Admin Session</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex w-64 bg-admin-bg text-admin-text border-r border-admin-border sticky top-0 h-screen overflow-y-auto flex-col justify-between">
        {SidebarContent}
      </aside>

      {/* Mobile Slide Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onMobileClose}
          />
          {/* Drawer Content */}
          <div className="relative w-72 max-w-[85vw] bg-admin-bg border-r border-admin-border h-full shadow-2xl z-50 animate-slide-right">
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
