'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Chrome } from 'lucide-react';
import { loginSchema, LoginInput } from '@/lib/validations/auth';
import { AuthService } from '@/services/auth.service';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login: setAuthUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setServerError('');

    try {
      // Authenticate & sync user session
      const user = await AuthService.login(data.email, data.password);
      if (user) {
        setAuthUser(user);
        if (['OWNER', 'ADMIN', 'MANAGER', 'STAFF'].includes(user.role)) {
          router.push('/admin');
        } else {
          router.push('/');
        }
      }
    } catch (err: any) {
      console.error('Login Error:', err);
      setServerError(err.message || 'Invalid email or password credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const user = await AuthService.loginWithGoogle();
      if (user) {
        setAuthUser(user);
        router.push('/');
      }
    } catch (e: any) {
      console.error('Google Sign In Error:', e);
      setServerError(e?.message || 'Google authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-[#121620] border border-[#202736] rounded-3xl p-8 shadow-2xl space-y-8 animate-slide-up font-sans">
      <div className="text-center space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400 font-bold block">
          WELCOME BACK
        </span>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-white">Client Portal Login</h1>
        <p className="text-xs text-neutral-400 font-light leading-relaxed">
          Sign in to access your orders, wishlist, and exclusive collections.
        </p>
      </div>

      {serverError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs text-center font-medium">
          {serverError}
        </div>
      )}

      {/* Google OAuth Login Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full py-3.5 bg-neutral-900 border border-neutral-800 text-white rounded-2xl text-xs font-bold hover:bg-neutral-800 hover:border-amber-500/50 transition flex items-center justify-center gap-3 shadow-lg cursor-pointer"
      >
        <Chrome className="w-4 h-4 text-amber-400" />
        <span>Continue with Google</span>
      </button>

      <div className="flex items-center space-x-4 my-4">
        <div className="flex-1 h-px bg-neutral-800" />
        <span className="text-[10px] font-mono uppercase text-neutral-500">OR SIGN IN WITH EMAIL</span>
        <div className="flex-1 h-px bg-neutral-800" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
        <div>
          <label className="font-bold text-neutral-400 uppercase block mb-1.5">Email Address</label>
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

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="font-bold text-neutral-400 uppercase block">Password</label>
            <Link href="/forgot-password" className="text-[11px] text-amber-400 hover:underline">
              Forgot password?
            </Link>
          </div>
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

        <div className="flex items-center space-x-2 pt-1">
          <input
            type="checkbox"
            id="rememberMe"
            {...register('rememberMe')}
            className="w-4 h-4 accent-amber-500 rounded"
          />
          <label htmlFor="rememberMe" className="text-neutral-400 text-xs cursor-pointer">
            Remember me on this device
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-amber-500 text-neutral-950 rounded-2xl font-bold uppercase tracking-[0.15em] hover:bg-amber-400 transition flex items-center justify-center gap-2 shadow-xl disabled:opacity-50 mt-4 cursor-pointer"
        >
          {loading ? (
            <span>AUTHENTICATING...</span>
          ) : (
            <>
              <span>SIGN IN TO ACCOUNT</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-neutral-400 font-light">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-amber-400 font-bold hover:underline">
          Create Account
        </Link>
      </p>
    </div>
  );
}
