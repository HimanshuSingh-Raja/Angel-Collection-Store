'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Do not render admin sidebar/header on the login screen
  if (pathname === '/admin/login') {
    return <main className="min-h-screen bg-[#0A0C10] text-white">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-admin-bg text-admin-text flex font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="p-6 sm:p-8 space-y-8 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
