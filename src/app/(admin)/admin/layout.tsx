'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Do not render admin sidebar/header on the login screen
  if (pathname === '/admin/login') {
    return <main className="min-h-screen bg-[#0A0C10] text-white">{children}</main>;
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
