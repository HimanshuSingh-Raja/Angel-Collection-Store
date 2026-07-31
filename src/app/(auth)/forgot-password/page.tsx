'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { forgotPasswordSchema, ForgotPasswordInput } from '@/lib/validations/auth';
import { sendResetPassword } from '@/lib/firebase/auth';

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true);
    setServerError('');

    try {
      await sendResetPassword(data.email);
      setSubmitted(true);
    } catch (err: any) {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md w-full bg-[#121620] border border-[#202736] rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-slide-up">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold text-white">Reset Link Dispatched</h2>
          <p className="text-xs text-neutral-400 font-light">
            If an account exists for your email, Firebase has dispatched password reset instructions to your inbox.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest hover:underline pt-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return To Login</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full bg-[#121620] border border-[#202736] rounded-3xl p-8 shadow-2xl space-y-8 animate-slide-up">
      <div className="text-center space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400 font-bold block">
          SECURITY RECOVERY
        </span>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-white">Forgot Password</h1>
        <p className="text-xs text-neutral-400 font-light">
          Enter your registered email address to receive a secure Firebase password reset link
        </p>
      </div>

      {serverError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs text-center font-medium">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-xs">
        <div>
          <label className="font-bold text-neutral-400 uppercase block mb-1.5">Registered Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-500" />
            <input
              type="email"
              {...register('email')}
              placeholder="client@example.com"
              className="w-full pl-10 pr-4 py-3 bg-[#0B0E14] text-white rounded-xl border border-[#202736] focus:outline-none focus:border-amber-500 font-sans"
            />
          </div>
          {errors.email && <p className="text-rose-400 text-[11px] mt-1">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-amber-500 text-neutral-950 rounded-2xl font-bold uppercase tracking-[0.15em] hover:bg-amber-400 transition flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
        >
          {loading ? (
            <span>DISPATCHING LINK...</span>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>SEND FIREBASE RESET LINK</span>
            </>
          )}
        </button>
      </form>

      <div className="text-center">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </div>
  );
}
