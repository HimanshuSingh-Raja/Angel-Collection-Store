'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MailCheck, CheckCircle2, RefreshCw, ArrowRight, KeyRound } from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [code, setCode] = useState(['8', '4', '9', '2', '0', '1']);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleChange = (index: number, val: string) => {
    if (val.length > 1) val = val[val.length - 1];
    const updated = [...code];
    updated[index] = val;
    setCode(updated);

    if (val && index < 5) {
      const nextInput = document.getElementById(`digit-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
      setTimeout(() => router.push('/login'), 2000);
    }, 1000);
  };

  if (verified) {
    return (
      <div className="max-w-md w-full bg-[#121620] border border-[#202736] rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-slide-up">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold text-white">Email Verified!</h2>
          <p className="text-xs text-neutral-400 font-light">
            Your account email has been verified successfully. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full bg-[#121620] border border-[#202736] rounded-3xl p-8 shadow-2xl space-y-8 animate-slide-up">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-3">
          <MailCheck className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400 font-bold block">
          ACCOUNT ACTIVATION
        </span>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-white">Verify Your Email</h1>
        <p className="text-xs text-neutral-400 font-light">
          Enter the 6-digit verification security PIN to activate your account
        </p>
      </div>

      {/* Dev OTP Helper Badge */}
      <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <KeyRound className="w-4 h-4 text-amber-400" />
          <span className="font-mono text-[11px]">Security Demo OTP: <strong>849201</strong></span>
        </div>
        <button
          type="button"
          onClick={() => setCode(['8', '4', '9', '2', '0', '1'])}
          className="text-[10px] uppercase font-bold text-amber-400 hover:underline"
        >
          Auto Fill
        </button>
      </div>

      <form onSubmit={handleVerify} className="space-y-6 text-xs">
        <div className="flex justify-between gap-2">
          {code.map((digit, idx) => (
            <input
              key={idx}
              id={`digit-${idx}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              className="w-12 h-14 bg-[#0B0E14] text-center text-xl font-mono font-bold text-amber-400 rounded-xl border border-[#202736] focus:outline-none focus:border-amber-500"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={verifying || code.some((d) => !d)}
          className="w-full py-4 bg-amber-500 text-neutral-950 rounded-2xl font-bold uppercase tracking-[0.15em] hover:bg-amber-400 transition flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
        >
          {verifying ? (
            <span>VERIFYING CODE...</span>
          ) : (
            <>
              <span>VERIFY EMAIL & CONTINUE</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="flex items-center justify-between text-xs text-neutral-400 border-t border-[#202736] pt-4">
        <button
          type="button"
          onClick={() => alert('New OTP Code generated: 849201')}
          className="flex items-center gap-1.5 hover:text-amber-400 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Resend Code</span>
        </button>

        <Link href="/login" className="hover:text-white transition">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
