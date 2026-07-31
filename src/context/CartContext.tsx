'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, Coupon } from '@/types';
import { INITIAL_COUPONS } from '@/lib/mock-data';

interface CartContextType {
  cart: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addToCart: (product: Product, size?: string, color?: string, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  freeShippingThreshold: number;
  amountNeededForFreeShipping: number;
  totalItemsCount: number;
}

const FREE_SHIPPING_THRESHOLD = 5000;

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('angel_cart');
      if (saved) {
        setCart(JSON.parse(saved));
      }
      const savedCoupon = localStorage.getItem('angel_coupon');
      if (savedCoupon) {
        setAppliedCoupon(JSON.parse(savedCoupon));
      }
    } catch (e) {
      console.error('Failed to load cart state', e);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    try {
      localStorage.setItem('angel_cart', JSON.stringify(cart));
      if (appliedCoupon) {
        localStorage.setItem('angel_coupon', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('angel_coupon');
      }
    } catch (e) {
      console.error('Failed to save cart state', e);
    }
  }, [cart, appliedCoupon]);

  const addToCart = (product: Product, size?: string, color?: string, quantity: number = 1) => {
    const selectedSize = size || product.sizes?.[0] || 'Standard';
    const selectedColor = color || product.colors?.[0] || 'Original';
    const itemId = `${product.id}-${selectedSize}-${selectedColor}`;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === itemId);
      if (existing) {
        return prevCart.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prevCart,
        {
          id: itemId,
          productId: product.id,
          product,
          size: selectedSize,
          color: selectedColor,
          quantity,
        },
      ];
    });

    setIsOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (code: string) => {
    const found = INITIAL_COUPONS.find(
      (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive
    );

    if (!found) {
      return { success: false, message: 'Invalid promo code' };
    }

    const currentSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

    if (currentSubtotal < found.minPurchase) {
      return {
        success: false,
        message: `Minimum order of ₹${found.minPurchase} required for this coupon`,
      };
    }

    setAppliedCoupon(found);
    return { success: true, message: `Coupon '${found.code}' applied successfully!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  let discount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minPurchase) {
    if (appliedCoupon.type === 'PERCENTAGE') {
      discount = (subtotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
        discount = appliedCoupon.maxDiscount;
      }
    } else {
      discount = appliedCoupon.discountValue;
    }
  }

  const shippingFee = subtotal > 0 && subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : subtotal > 0 ? 350 : 0;
  const tax = Math.round((subtotal - discount) * 0.18); // 18% GST standard
  const total = Math.max(0, subtotal - discount + shippingFee + tax);

  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const totalItemsCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        setIsOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        discount,
        shippingFee,
        tax,
        total,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        amountNeededForFreeShipping,
        totalItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
