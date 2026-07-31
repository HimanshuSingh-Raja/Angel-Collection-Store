'use server';

import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { RegisterInput, LoginInput } from '@/lib/validations/auth';

export async function registerUserAction(data: RegisterInput) {
  try {
    const existingEmail = await db.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingEmail) {
      return { success: false, message: 'An account with this email address already exists.' };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = await db.user.create({
      data: {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        phone: data.phone,
        avatar: data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        role: 'CUSTOMER',
        isActive: true,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set('angel_user_session', newUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return {
      success: true,
      message: `Registration successful! Verification code: ${otpCode}`,
      userId: newUser.id,
      otpCode,
    };
  } catch (error) {
    console.error('Registration Error:', error);
    return { success: false, message: 'Failed to create user account. Please try again.' };
  }
}

export async function loginUserAction(data: LoginInput) {
  try {
    const user = await db.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user || !user.password) {
      return { success: false, message: 'Invalid email or password credentials.' };
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      return { success: false, message: 'Invalid email or password credentials.' };
    }

    if (!user.isActive) {
      return { success: false, message: 'Your account has been deactivated. Please contact support.' };
    }

    const cookieStore = await cookies();
    cookieStore.set('angel_user_session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    };
  } catch (error) {
    console.error('Login Error:', error);
    return { success: false, message: 'Authentication failed. Internal server error.' };
  }
}

export async function logoutUserAction() {
  const cookieStore = await cookies();
  cookieStore.delete('angel_user_session');
  return { success: true };
}

export async function forgotPasswordAction(email: string) {
  try {
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (!user) {
      return { success: true, message: 'If an account exists, a password reset link has been sent.', otpCode };
    }

    return {
      success: true,
      message: `Password reset link dispatched. Security OTP: ${otpCode}`,
      otpCode,
    };
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return { success: false, message: 'Failed to process request.' };
  }
}
