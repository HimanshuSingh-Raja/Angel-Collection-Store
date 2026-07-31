'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Address, UserRole } from '@/types';
import { useFirebaseAuth } from '@/hooks/useAuth';
import { logoutFirebase } from '@/lib/firebase/auth';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  setRole: (role: UserRole) => void;
  login: (user: User) => void;
  logout: () => void;
  addresses: Address[];
  addAddress: (address: Omit<Address, 'id'>) => void;
  deleteAddress: (id: string) => void;
  loading: boolean;
}

const INITIAL_ADDRESSES: Address[] = [
  {
    id: 'addr-1',
    userId: 'usr-1',
    type: 'SHIPPING',
    name: 'Victoria Sterling',
    phone: '+91 98765 43210',
    street: '742 Park Avenue, Penthouse 4B',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400001',
    country: 'India',
    isDefault: true,
  },
  {
    id: 'addr-2',
    userId: 'usr-1',
    type: 'BILLING',
    name: 'Victoria Sterling',
    phone: '+91 98765 43210',
    street: '12 Golf Links Estate',
    city: 'New Delhi',
    state: 'Delhi',
    postalCode: '110003',
    country: 'India',
    isDefault: false,
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, loading } = useFirebaseAuth();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);

  useEffect(() => {
    if (userProfile) {
      setUser(userProfile);
      setRole(userProfile.role || 'CUSTOMER');
    }
  }, [userProfile]);

  const login = (newUser: User) => {
    setUser(newUser);
    setRole(newUser.role);
  };

  const logout = async () => {
    await logoutFirebase();
    setUser(null);
    setRole('CUSTOMER');
  };

  const addAddress = (newAddr: Omit<Address, 'id'>) => {
    const created: Address = {
      ...newAddr,
      id: `addr-${Date.now()}`,
    };
    setAddresses((prev) => [...prev, created]);
  };

  const deleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        setRole,
        login,
        logout,
        addresses,
        addAddress,
        deleteAddress,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
