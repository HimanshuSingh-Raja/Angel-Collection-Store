import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { AuthProvider } from '@/context/AuthContext';
import { NextAuthProvider } from '@/components/providers/NextAuthProvider';

export const metadata: Metadata = {
  title: 'Angel Collection | Luxury Fashion & Haute Couture',
  description:
    'Enterprise fashion e-commerce platform offering bespoke gowns, tailored suits, 18K fine jewellery, and Tuscan calfskin leather accessories.',
  keywords: [
    'Fashion',
    'Haute Couture',
    'Luxury Dresses',
    'Silk Evening Gowns',
    'Diamond Jewellery',
    'Bespoke Tuxedo',
    'Tuscan Leather',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-neutral-50 text-neutral-900 selection:bg-amber-800 selection:text-white">
        <NextAuthProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>{children}</WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
