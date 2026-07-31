'use client';

import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const criteria = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'Contains uppercase letter (A-Z)', valid: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter (a-z)', valid: /[a-z]/.test(password) },
    { label: 'Contains number (0-9)', valid: /[0-9]/.test(password) },
    { label: 'Contains special character (!@#$%^&*)', valid: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = criteria.filter((c) => c.valid).length;

  const getStrengthColor = () => {
    if (score <= 2) return 'bg-rose-500';
    if (score <= 4) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getStrengthLabel = () => {
    if (score <= 2) return 'Weak Security';
    if (score <= 4) return 'Medium Strength';
    return 'Strong Haute Security';
  };

  if (!password) return null;

  return (
    <div className="space-y-3 pt-2 text-xs">
      <div className="flex items-center justify-between font-mono text-[10px] uppercase font-bold text-neutral-400">
        <span>Password Strength:</span>
        <span className={score === 5 ? 'text-emerald-400' : 'text-amber-400'}>{getStrengthLabel()}</span>
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i < score ? getStrengthColor() : 'bg-neutral-800'
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
        {criteria.map((c, i) => (
          <div key={i} className={`flex items-center gap-1.5 ${c.valid ? 'text-emerald-400' : 'text-neutral-500'}`}>
            {c.valid ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-neutral-600" />}
            <span>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
