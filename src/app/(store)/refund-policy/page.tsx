'use client';

import React from 'react';

export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8 font-sans text-neutral-800">
      <div className="border-b border-neutral-200 pb-6">
        <span className="text-xs uppercase tracking-[0.25em] text-amber-700 font-bold">RETURNS & REFUNDS</span>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-900 mt-1">
          Refund & Exchange Policy
        </h1>
      </div>

      <div className="space-y-6 text-xs leading-relaxed font-light">
        <p>
          We offer a complimentary 30-day return policy for unused, unworn items with security tags intact.
        </p>

        <h3 className="font-serif text-lg font-bold text-neutral-900">1. Return Process</h3>
        <p>
          Initiate a return request via your Client Dashboard or by contacting concierge@angelcollection.com. Our courier will collect the package from your doorstep.
        </p>

        <h3 className="font-serif text-lg font-bold text-neutral-900">2. Refund Timeline</h3>
        <p>
          Refunds are processed to your original payment method (Razorpay / Bank Account) within 3-5 business days following quality inspection.
        </p>
      </div>
    </div>
  );
}
