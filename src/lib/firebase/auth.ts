import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const googleProvider = new GoogleAuthProvider();

export function formatFirebaseErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please log in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password credentials.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again in a few minutes.';
    default:
      return 'Authentication failed. Please try again.';
  }
}

export async function loginWithEmail(email: string, pass: string) {
  try {
    console.log('🔥 [Firebase Auth] loginWithEmail started for:', email);
    const credential = await signInWithEmailAndPassword(auth, email, pass);
    console.log('🔥 [Firebase Auth] loginWithEmail completed, UID:', credential.user.uid);
    return credential.user;
  } catch (err: any) {
    console.error('❌ [Firebase Auth] loginWithEmail error:', err);
    throw new Error(formatFirebaseErrorMessage(err?.code));
  }
}

export async function signupWithEmail(email: string, pass: string, name: string) {
  try {
    console.log('🔥 [Firebase Auth] signupWithEmail started for:', email);
    const credential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = credential.user;

    await updateProfile(user, { displayName: name });
    console.log('🔥 [Firebase Auth] signupWithEmail completed, UID:', user.uid);

    // Optional background Firestore write (non-blocking so it never hangs user signup)
    setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      firstName: name.split(' ')[0] || name,
      lastName: name.split(' ').slice(1).join(' ') || '',
      email: user.email,
      photoURL: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role: 'CUSTOMER',
      isVerified: user.emailVerified,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }).catch((fsErr) => {
      console.warn('⚠️ [Firestore] Optional user save note:', fsErr?.message || fsErr);
    });

    return user;
  } catch (err: any) {
    console.error('❌ [Firebase Auth] signupWithEmail error:', err?.code || err?.message);
    throw new Error(formatFirebaseErrorMessage(err?.code));
  }
}

export async function loginWithGooglePopup() {
  try {
    console.log('🔥 [Firebase Auth] loginWithGooglePopup started');
    const credential = await signInWithPopup(auth, googleProvider);
    const user = credential.user;
    console.log('🔥 [Firebase Auth] loginWithGooglePopup completed, UID:', user.uid);

    // Optional background Firestore write
    getDoc(doc(db, 'users', user.uid)).then((snap) => {
      if (!snap.exists()) {
        setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          firstName: user.displayName?.split(' ')[0] || 'Google',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || 'User',
          email: user.email,
          photoURL: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          role: 'CUSTOMER',
          isVerified: true,
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }).catch((e) => console.warn('⚠️ Firestore Google save note:', e));
      }
    }).catch((e) => console.warn('⚠️ Firestore Google fetch note:', e));

    return user;
  } catch (err: any) {
    console.error('❌ [Firebase Auth] loginWithGooglePopup error:', err);
    throw new Error(formatFirebaseErrorMessage(err?.code));
  }
}

export async function logoutFirebase() {
  return signOut(auth);
}

export async function sendResetPassword(email: string) {
  try {
    return await sendPasswordResetEmail(auth, email);
  } catch (err: any) {
    throw new Error(formatFirebaseErrorMessage(err?.code));
  }
}

export async function sendEmailVerificationLink(user: FirebaseUser) {
  return sendEmailVerification(user);
}

export function subscribeAuthState(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
