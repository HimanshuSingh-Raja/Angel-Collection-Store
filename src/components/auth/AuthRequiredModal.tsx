'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, LogIn, UserPlus, X, ShieldCheck } from 'lucide-react';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectPath?: string;
}

export const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({
  isOpen,
  onClose,
  redirectPath = '/checkout',
}) => {
  if (!isOpen) return null;

  const loginUrl = `/login?redirect=${encodeURIComponent(redirectPath)}`;
  const registerUrl = `/register?redirect=${encodeURIComponent(redirectPath)}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-sans">
      <div className="bg-white border border-neutral-200 p-8 rounded-3xl max-w-md w-full text-center space-y-6 shadow-2xl relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-900 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 bg-amber-50 text-amber-800 rounded-full flex items-center justify-center mx-auto border border-amber-200 shadow-sm">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-800">
            SECURITY PROTOCOL
          </span>
          <h3 className="font-serif text-2xl font-bold text-neutral-900">
            Sign In Required to Purchase
          </h3>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
            Please log in or create an Angel Collection account to complete your checkout and manage order tracking.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Link
            href={loginUrl}
            onClick={onClose}
            className="w-full py-3.5 bg-neutral-950 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-amber-700 transition flex items-center justify-center gap-2 shadow-lg"
          >
            <LogIn className="w-4 h-4 text-amber-300" />
            <span>Sign In to Continue</span>
          </Link>

          <Link
            href={registerUrl}
            onClick={onClose}
            className="w-full py-3.5 bg-neutral-100 text-neutral-900 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-neutral-200 transition flex items-center justify-center gap-2 border border-neutral-200"
          >
            <UserPlus className="w-4 h-4 text-neutral-600" />
            <span>Create New Account</span>
          </Link>

          <button
            onClick={onClose}
            className="text-xs font-bold text-neutral-400 hover:text-neutral-800 transition cursor-pointer pt-1 block mx-auto"
          >
            Cancel & Return to Shopping
          </button>
        </div>

        <div className="pt-4 border-t border-neutral-100 flex items-center justify-center gap-2 text-[10px] text-neutral-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Protected by 256-Bit SSL Encrypted Authentication</span>
        </div>
      </div>
    </div>
  );
};
