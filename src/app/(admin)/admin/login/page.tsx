'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, ArrowRight, KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setRole } = useAuth();

  // Always start with empty manual inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setRole(data.role || 'OWNER');
        router.push('/admin');
      } else {
        setError(data.message || 'Invalid Master Admin credentials');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-white flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-[#121620] border border-[#202736] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 relative z-10 animate-slide-up">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-amber-400 block font-bold">
            EXECUTIVE CONCIERGE
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
            ANGEL <span className="text-amber-400 font-light">ADMIN</span>
          </h1>
          <p className="text-xs text-neutral-400 font-light">
            Master Admin Authentication Portal
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs" autoComplete="off">
          <div>
            <label className="font-bold text-neutral-400 uppercase block mb-1.5">Master Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-500" />
              <input
                type="email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Master Email"
                className="w-full pl-10 pr-4 py-3 bg-[#0B0E14] text-white rounded-xl border border-[#202736] focus:outline-none focus:border-amber-500 font-sans min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-neutral-400 uppercase block mb-1.5">Master Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-500" />
              <input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-[#0B0E14] text-white rounded-xl border border-[#202736] focus:outline-none focus:border-amber-500 font-sans min-h-[44px]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 min-h-[44px] bg-amber-500 text-neutral-950 rounded-2xl font-bold uppercase tracking-[0.15em] hover:bg-amber-400 transition flex items-center justify-center gap-2 shadow-xl disabled:opacity-50 cursor-pointer font-bold"
            >
              {loading ? (
                <span>VERIFYING CREDENTIALS...</span>
              ) : (
                <>
                  <span>ACCESS OWNER DASHBOARD</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-[10px] text-neutral-500 font-mono pt-4 border-t border-[#202736]">
          Protected by Angel Security Protocol v1.0 • Manual Master Credential Verification
        </div>
      </div>
    </div>
  );
}
