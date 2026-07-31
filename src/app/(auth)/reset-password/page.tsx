'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';
import { resetPasswordSchema, ResetPasswordInput } from '@/lib/validations/auth';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const watchPassword = watch('password', '');

  const onSubmit = async (data: ResetPasswordInput) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCompleted(true);
      setTimeout(() => router.push('/login'), 2500);
    }, 1200);
  };

  if (completed) {
    return (
      <div className="max-w-md w-full bg-[#121620] border border-[#202736] rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-slide-up">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold text-white">Password Reset Complete!</h2>
          <p className="text-xs text-neutral-400 font-light">
            Your security password has been updated successfully. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full bg-[#121620] border border-[#202736] rounded-3xl p-8 shadow-2xl space-y-8 animate-slide-up">
      <div className="text-center space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400 font-bold block">
          NEW SECURITY KEY
        </span>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-white">Reset Password</h1>
        <p className="text-xs text-neutral-400 font-light">
          Set a new high-security password for your Angel Collection account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-xs">
        <div>
          <label className="font-bold text-neutral-400 uppercase block mb-1.5">New Password *</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-3 bg-[#0B0E14] text-white rounded-xl border border-[#202736] focus:outline-none focus:border-amber-500 font-sans"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-neutral-500 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-rose-400 text-[11px] mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="font-bold text-neutral-400 uppercase block mb-1.5">Confirm New Password *</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-500" />
            <input
              type="password"
              {...register('confirmPassword')}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 bg-[#0B0E14] text-white rounded-xl border border-[#202736] focus:outline-none focus:border-amber-500 font-sans"
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-rose-400 text-[11px] mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <PasswordStrengthMeter password={watchPassword} />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-amber-500 text-neutral-950 rounded-2xl font-bold uppercase tracking-[0.15em] hover:bg-amber-400 transition flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
        >
          {loading ? (
            <span>UPDATING PASSWORD...</span>
          ) : (
            <>
              <span>SAVE NEW PASSWORD</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
