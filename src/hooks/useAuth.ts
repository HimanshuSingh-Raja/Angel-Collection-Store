'use client';

import { useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { subscribeAuthState, logoutFirebase } from '@/lib/firebase/auth';
import { syncFirebaseUserAction } from '@/actions/user';
import { User } from '@/types';

export function useFirebaseAuth() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeAuthState(async (user) => {
      setFirebaseUser(user);
      if (user && user.email) {
        try {
          // Sync Firebase User with Prisma DB via Server Action
          const syncedUser = await syncFirebaseUserAction({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          });
          setUserProfile(syncedUser);
        } catch (e) {
          console.error('Failed to sync Firebase user with Prisma DB:', e);
          setUserProfile({
            id: user.uid,
            name: user.displayName || 'Angel Client',
            email: user.email,
            role: 'CUSTOMER',
            avatar: user.photoURL || undefined,
            isActive: true,
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    firebaseUser,
    userProfile,
    loading,
    logout: logoutFirebase,
  };
}
