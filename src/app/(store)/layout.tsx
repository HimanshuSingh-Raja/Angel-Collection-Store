'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/store/Header';
import { Footer } from '@/components/store/Footer';

const CartDrawer = dynamic(() => import('@/components/store/CartDrawer').then((m) => m.CartDrawer), { ssr: false });
const LiveChatWidget = dynamic(() => import('@/components/store/LiveChatWidget').then((m) => m.LiveChatWidget), { ssr: false });

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
