import {
  loginWithEmail,
  signupWithEmail,
  loginWithGooglePopup,
  logoutFirebase,
  sendResetPassword,
} from '@/lib/firebase/auth';
import { syncFirebaseUserAction } from '@/actions/user';
import { User } from '@/types';

export class AuthService {
  /**
   * Log in with Firebase Auth & sync/fetch User profile from PostgreSQL DB via Server Action.
   */
  static async login(email: string, pass: string): Promise<User> {
    console.log('🚀 [AuthService] Login flow started');
    const firebaseUser = await loginWithEmail(email, pass);
    const prismaUser = await syncFirebaseUserAction({
      uid: firebaseUser.uid,
      email: firebaseUser.email || email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
    });
    console.log('✅ [AuthService] Login flow completed');
    return prismaUser;
  }

  /**
   * Sign up with Firebase Auth & create User in PostgreSQL DB via Server Action.
   */
  static async signup(email: string, pass: string, name: string): Promise<User> {
    console.log('🚀 [AuthService] Signup flow started');
    const firebaseUser = await signupWithEmail(email, pass, name);
    const prismaUser = await syncFirebaseUserAction({
      uid: firebaseUser.uid,
      email: firebaseUser.email || email,
      displayName: name,
      photoURL: firebaseUser.photoURL,
    });
    console.log('✅ [AuthService] Signup flow completed');
    return prismaUser;
  }

  /**
   * Google OAuth Popup Login & sync with PostgreSQL DB via Server Action.
   */
  static async loginWithGoogle(): Promise<User> {
    console.log('🚀 [AuthService] Google login flow started');
    const firebaseUser = await loginWithGooglePopup();
    const prismaUser = await syncFirebaseUserAction({
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
    });
    console.log('✅ [AuthService] Google login flow completed');
    return prismaUser;
  }

  /**
   * Logout Firebase session.
   */
  static async logout(): Promise<void> {
    await logoutFirebase();
  }

  /**
   * Send Password Reset Email.
   */
  static async resetPassword(email: string): Promise<void> {
    await sendResetPassword(email);
  }
}
