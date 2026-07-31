'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, User, Mail, Phone, Lock, ArrowRight, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { registerSchema, RegisterInput } from '@/lib/validations/auth';
import { AuthService } from '@/services/auth.service';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';
import confetti from 'canvas-confetti';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [countdown, setCountdown] = useState(2);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      country: 'India',
      state: 'Maharashtra',
      city: 'Mumbai',
      acceptTerms: false,
    },
  });

  const watchPassword = watch('password', '');

  // Handle countdown & auto-redirect to /login
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (registered) {
      console.log('🚀 Redirecting to login in 2 seconds...');
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#10B981', '#F43F5E', '#3B82F6'],
        });
      } catch (e) {
        // Confetti optional
      }

      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [registered]);

  useEffect(() => {
    if (registered && countdown === 0) {
      console.log('🚀 Redirecting to /login now');
      router.push('/login');
    }
  }, [registered, countdown, router]);

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    setServerError('');

    try {
      console.log('1️⃣ Firebase signup started...');
      // 1. Create Firebase Auth user & synchronize with PostgreSQL via Prisma
      await AuthService.signup(data.email, data.password, `${data.firstName} ${data.lastName}`);
      console.log('2️⃣ Firebase signup completed & PostgreSQL insert completed!');

      setRegistered(true);
    } catch (err: any) {
      console.error('❌ Registration Error:', err);
      const msg = err.message || 'An error occurred during registration. Please try again.';
      setServerError(msg.startsWith('❌') ? msg : `❌ ${msg}`);
    } finally {
      // ALWAYS reset loading state so the button is never stuck loading!
      setLoading(false);
      console.log('🏁 Form submission complete, loading state reset to false');
    }
  };

  const handleManualLoginRedirect = () => {
    console.log('🚀 Manual button click: Redirecting to /login');
    router.push('/login');
  };

  return (
    <div className="max-w-2xl w-full relative font-sans">
      {/* SUCCESS MODAL POPUP */}
      {registered && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="max-w-md w-full bg-[#121620] border border-emerald-500/30 rounded-3xl p-8 shadow-2xl text-center space-y-6 transform animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-emerald-400 font-bold block">
                REGISTRATION COMPLETE
              </span>
              <h2 className="font-serif text-2xl font-bold text-white flex items-center justify-center gap-2">
                <span>Account created successfully</span>
              </h2>
              <p className="text-xs text-neutral-300 font-light leading-relaxed pt-1">
                Your account has been created successfully. Please login to continue.
              </p>
            </div>

            <div className="pt-2 space-y-3">
              <button
                onClick={handleManualLoginRedirect}
                className="w-full py-3.5 bg-emerald-500 text-neutral-950 rounded-2xl font-bold uppercase tracking-[0.15em] hover:bg-emerald-400 transition flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 text-xs cursor-pointer"
              >
                <span>LOGIN NOW</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-neutral-400 font-mono">
                Auto redirecting in <span className="text-amber-400 font-bold">{countdown}s</span>...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MAIN REGISTER CARD FORM */}
      <div className="bg-[#121620] border border-[#202736] rounded-3xl p-8 sm:p-10 shadow-2xl space-y-8 animate-slide-up">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400 font-bold block">
            MEMBERSHIP PRIVILEGE
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white">Create Account</h1>
          <p className="text-xs text-neutral-400 font-light leading-relaxed">
            Join the Angel Privilege Club to unlock exclusive haute couture access.
          </p>
        </div>

        {/* ERROR POPUP / TOAST */}
        {serverError && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs flex items-center gap-3 animate-slide-down">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span className="font-medium leading-relaxed">{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-xs">
          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-neutral-400 uppercase block mb-1.5">First Name *</label>
              <input
                type="text"
                disabled={loading}
                {...register('firstName')}
                placeholder="Victoria"
                className="w-full px-4 py-3 bg-[#0B0E14] text-white rounded-xl border border-[#202736] focus:outline-none focus:border-amber-500 disabled:opacity-50"
              />
              {errors.firstName && <p className="text-rose-400 text-[11px] mt-1">{errors.firstName.message}</p>}
            </div>

            <div>
              <label className="font-bold text-neutral-400 uppercase block mb-1.5">Last Name *</label>
              <input
                type="text"
                disabled={loading}
                {...register('lastName')}
                placeholder="Sterling"
                className="w-full px-4 py-3 bg-[#0B0E14] text-white rounded-xl border border-[#202736] focus:outline-none focus:border-amber-500 disabled:opacity-50"
              />
              {errors.lastName && <p className="text-rose-400 text-[11px] mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          {/* Username & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-neutral-400 uppercase block mb-1.5">Username *</label>
              <input
                type="text"
                disabled={loading}
                {...register('username')}
                placeholder="victoria_sterling"
                className="w-full px-4 py-3 bg-[#0B0E14] text-white rounded-xl border border-[#202736] focus:outline-none focus:border-amber-500 disabled:opacity-50"
              />
              {errors.username && <p className="text-rose-400 text-[11px] mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="font-bold text-neutral-400 uppercase block mb-1.5">Email Address *</label>
              <input
                type="email"
                disabled={loading}
                {...register('email')}
                placeholder="victoria@example.com"
                className="w-full px-4 py-3 bg-[#0B0E14] text-white rounded-xl border border-[#202736] focus:outline-none focus:border-amber-500 disabled:opacity-50"
              />
              {errors.email && <p className="text-rose-400 text-[11px] mt-1">{errors.email.message}</p>}
            </div>
          </div>

          {/* Phone & Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-neutral-400 uppercase block mb-1.5">Phone Number *</label>
              <input
                type="text"
                disabled={loading}
                {...register('phone')}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3 bg-[#0B0E14] text-white rounded-xl border border-[#202736] focus:outline-none focus:border-amber-500 disabled:opacity-50"
              />
              {errors.phone && <p className="text-rose-400 text-[11px] mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="font-bold text-neutral-400 uppercase block mb-1.5">Country *</label>
              <select
                disabled={loading}
                {...register('country')}
                className="w-full px-4 py-3 bg-[#0B0E14] text-white rounded-xl border border-[#202736] focus:outline-none focus:border-amber-500 disabled:opacity-50"
              >
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
              </select>
              {errors.country && <p className="text-rose-400 text-[11px] mt-1">{errors.country.message}</p>}
            </div>
          </div>

          {/* Password & Confirm */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-neutral-400 uppercase block mb-1.5">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    disabled={loading}
                    {...register('password')}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-10 py-3 bg-[#0B0E14] text-white rounded-xl border border-[#202736] focus:outline-none focus:border-amber-500 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-neutral-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-rose-400 text-[11px] mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="font-bold text-neutral-400 uppercase block mb-1.5">Confirm Password *</label>
                <input
                  type="password"
                  disabled={loading}
                  {...register('confirmPassword')}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-[#0B0E14] text-white rounded-xl border border-[#202736] focus:outline-none focus:border-amber-500 disabled:opacity-50"
                />
                {errors.confirmPassword && (
                  <p className="text-rose-400 text-[11px] mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <PasswordStrengthMeter password={watchPassword} />
          </div>

          {/* Terms Acceptance */}
          <div className="pt-2">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="acceptTerms"
                disabled={loading}
                {...register('acceptTerms')}
                className="w-4 h-4 accent-amber-500 rounded mt-0.5"
              />
              <label htmlFor="acceptTerms" className="text-neutral-400 text-xs cursor-pointer leading-relaxed">
                I agree to the{' '}
                <Link href="/terms" className="text-amber-400 underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy-policy" className="text-amber-400 underline">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>
            {errors.acceptTerms && <p className="text-rose-400 text-[11px] mt-1">{errors.acceptTerms.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-amber-500 text-neutral-950 rounded-2xl font-bold uppercase tracking-[0.15em] hover:bg-amber-400 transition flex items-center justify-center gap-2 shadow-xl disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                <span>Creating Account...</span>
              </div>
            ) : (
              <>
                <span>CREATE LUXURY ACCOUNT</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-400 font-light">
          Already have an account?{' '}
          <Link href="/login" className="text-amber-400 font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
