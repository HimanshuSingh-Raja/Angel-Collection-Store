'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setIsAuthorized(true);
      return;
    }

    const hasAdminSession = document.cookie.split(';').some((item) => item.trim().startsWith('angel_admin_session='));
    if (!hasAdminSession) {
      router.replace('/admin/login');
    } else {
      setIsAuthorized(true);
    }
  }, [pathname, router]);

  // Do not render admin sidebar/header on the login screen
  if (pathname === '/admin/login') {
    return <main className="min-h-screen bg-[#0A0C10] text-white">{children}</main>;
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center text-white">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-gray-400">Verifying Admin Authentication...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-admin-bg text-admin-text flex font-sans overflow-x-hidden">
      <AdminSidebar isMobileOpen={isMobileOpen} onMobileClose={() => setIsMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onMenuToggle={() => setIsMobileOpen((prev) => !prev)} isMobileOpen={isMobileOpen} />
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 flex-1 overflow-y-auto w-full max-w-full">{children}</main>
      </div>
    </div>
  );
}
