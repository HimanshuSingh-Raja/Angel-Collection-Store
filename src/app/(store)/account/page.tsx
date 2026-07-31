'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import {
  User,
  Package,
  MapPin,
  Heart,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  Trash2,
  Lock,
  Mail,
  Chrome,
  ArrowRight,
  ShieldCheck,
  Edit3,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AccountPage() {
  const { user, role, logout, addresses, deleteAddress } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'payments' | 'notifications' | 'settings'>('profile');

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', { callbackUrl: '/account' });
    } catch (e) {
      console.error('Google Sign In Error:', e);
    }
  };

  // If User is NOT logged in (Guest View)
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 sm:p-12 border border-neutral-200 shadow-2xl space-y-8 animate-slide-up relative overflow-hidden">
          {/* Subtle Ambient Background Gradient */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center max-w-lg mx-auto space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-neutral-950 text-amber-300 flex items-center justify-center mx-auto mb-2 shadow-lg">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-800 font-bold block">
              MEMBERS PRIVILEGE PORTAL
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
              Welcome to Angel Collection
            </h1>
            <p className="text-xs text-neutral-600 font-light leading-relaxed">
              Sign in with your Google (Gmail) account or email credentials to manage your bespoke orders, wishlist items, and VIP concierge profile.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="max-w-md mx-auto space-y-4 text-xs">
            <button
              onClick={handleGoogleSignIn}
              className="w-full py-4 bg-neutral-950 text-amber-300 rounded-2xl font-bold uppercase tracking-[0.15em] hover:bg-neutral-800 transition flex items-center justify-center gap-3 shadow-xl"
            >
              <Chrome className="w-4 h-4 text-amber-400" />
              <span>CONTINUE WITH GOOGLE (GMAIL)</span>
            </button>

            <Link
              href="/login"
              className="w-full py-3.5 bg-neutral-50 border border-neutral-200 text-neutral-800 rounded-2xl font-bold hover:bg-neutral-100 transition flex items-center justify-center gap-2"
            >
              <span>SIGN IN WITH EMAIL</span>
              <ArrowRight className="w-4 h-4 text-amber-700" />
            </Link>

            <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 font-medium">
              <Link href="/forgot-password" className="hover:text-amber-800 transition">
                Forgot Password?
              </Link>
              <Link href="/register" className="text-neutral-900 font-bold hover:text-amber-800 transition">
                Create An Account →
              </Link>
            </div>
          </div>

          <div className="border-t border-neutral-100 pt-6 text-center text-[11px] text-neutral-400 font-mono">
            Protected by 256-bit Enterprise SSL Encryption • Angel Collection Privé
          </div>
        </div>
      </div>
    );
  }

  // If User IS logged in (Member Profile View)
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Top Banner Header */}
      <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center space-x-5">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-amber-500/30 shadow-md"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
                {user.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-mono text-[10px] font-bold uppercase">
                {role}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1 font-mono">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/account/orders"
            className="px-5 py-2.5 bg-neutral-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-amber-700 transition"
          >
            <Package className="w-4 h-4 text-amber-300" />
            <span>My Orders</span>
          </Link>
          <button
            onClick={logout}
            className="px-4 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold flex items-center gap-2 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition flex items-center gap-3 ${
              activeTab === 'profile' ? 'bg-neutral-950 text-amber-300' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Details</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition flex items-center gap-3 ${
              activeTab === 'addresses' ? 'bg-neutral-950 text-amber-300' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses ({addresses.length})</span>
          </button>

          <Link
            href="/account/orders"
            className="w-full text-left px-4 py-3 rounded-2xl text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition flex items-center gap-3 block"
          >
            <Package className="w-4 h-4" />
            <span>Order History</span>
          </Link>

          <Link
            href="/wishlist"
            className="w-full text-left px-4 py-3 rounded-2xl text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition flex items-center gap-3 block"
          >
            <Heart className="w-4 h-4" />
            <span>My Wishlist</span>
          </Link>

          <button
            onClick={() => setActiveTab('payments')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition flex items-center gap-3 ${
              activeTab === 'payments' ? 'bg-neutral-950 text-amber-300' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payment Methods</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition flex items-center gap-3 ${
              activeTab === 'notifications' ? 'bg-neutral-950 text-amber-300' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition flex items-center gap-3 ${
              activeTab === 'settings' ? 'bg-neutral-950 text-amber-300' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Account Settings</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold text-neutral-900">Personal Information</h3>
                <button
                  onClick={() => alert('Profile edit mode enabled.')}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div>
                  <label className="font-bold text-neutral-500 uppercase block mb-1">Full Name</label>
                  <input
                    type="text"
                    readOnly
                    value={user.name}
                    className="w-full px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 text-neutral-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-500 uppercase block mb-1">Email Address</label>
                  <input
                    type="email"
                    readOnly
                    value={user.email}
                    className="w-full px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 text-neutral-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-500 uppercase block mb-1">Phone Number</label>
                  <input
                    type="text"
                    readOnly
                    value={user.phone || '+91 98765 43210'}
                    className="w-full px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 text-neutral-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-500 uppercase block mb-1">Account Privilege</label>
                  <span className="inline-block px-4 py-3 bg-amber-50 text-amber-800 border border-amber-200 font-bold rounded-xl w-full">
                    {role} MEMBER PRIVILEGE
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm space-y-6">
              <h3 className="font-serif text-xl font-bold text-neutral-900">Saved Address Book</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {addresses.map((addr) => (
                  <div key={addr.id} className="p-6 rounded-2xl border border-neutral-200 bg-neutral-50 text-xs space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase text-amber-800">{addr.type} ADDRESS</span>
                      <button onClick={() => deleteAddress(addr.id)} className="text-neutral-400 hover:text-rose-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="font-bold text-neutral-900 text-sm">{addr.name}</p>
                    <p className="text-neutral-600">{addr.street}</p>
                    <p className="text-neutral-600">{addr.city}, {addr.state} - {addr.postalCode}</p>
                    <p className="text-neutral-500">Phone: {addr.phone}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm space-y-6 text-xs">
              <h3 className="font-serif text-xl font-bold text-neutral-900">Saved Payment Methods</h3>
              <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <CreditCard className="w-8 h-8 text-amber-700" />
                  <div>
                    <p className="font-bold text-neutral-900">Razorpay Auto-Pay & UPI</p>
                    <p className="text-neutral-500 text-[11px]">Primary payment option for instant checkouts</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                  DEFAULT
                </span>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm space-y-4 text-xs">
              <h3 className="font-serif text-xl font-bold text-neutral-900">Notifications & Order Alerts</h3>
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900">
                <p className="font-bold">Autumn Haute Couture Collection Early Access</p>
                <p className="text-[11px] text-amber-800 mt-1">You are subscribed to exclusive invitations and runway releases.</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm space-y-6 text-xs">
              <h3 className="font-serif text-xl font-bold text-neutral-900">Account Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
                  <div>
                    <p className="font-bold text-neutral-900">Two-Factor Security Authentication</p>
                    <p className="text-neutral-500 text-[11px]">Add an extra layer of protection to your account</p>
                  </div>
                  <button className="px-4 py-2 bg-neutral-950 text-white rounded-xl font-bold text-[11px]">Enable</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
