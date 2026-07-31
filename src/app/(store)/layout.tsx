'use client';

import React from 'react';
import { Header } from '@/components/store/Header';
import { Footer } from '@/components/store/Footer';
import { CartDrawer } from '@/components/store/CartDrawer';
import { LiveChatWidget } from '@/components/store/LiveChatWidget';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-neutral-50 text-neutral-900">
      <div>
        <Header />
        <main>{children}</main>
      </div>
      <CartDrawer />
      <LiveChatWidget />
      <Footer />
    </div>
  );
}
