'use client';

import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8 font-sans text-neutral-800">
      <div className="border-b border-neutral-200 pb-6">
        <span className="text-xs uppercase tracking-[0.25em] text-amber-700 font-bold">CLIENT PRIVACY</span>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-900 mt-1">
          Privacy Policy & Data Security
        </h1>
        <p className="text-xs text-neutral-500 mt-1">Last Updated: July 2026</p>
      </div>

      <div className="space-y-6 text-xs leading-relaxed font-light">
        <p>
          Angel Collection (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) respects the privacy of our global clientele. This Privacy Policy outlines how your personal data is collected, protected, and processed in accordance with international data privacy laws (GDPR, IT Act 2000).
        </p>

        <h3 className="font-serif text-lg font-bold text-neutral-900">1. Information We Collect</h3>
        <p>
          We collect personal identification details (Name, Shipping Address, Phone Number, Email) when you place an order or subscribe to the Angel Privilege Club. Payment transactions are processed directly through 256-bit PCI-DSS compliant Razorpay servers; no credit card or UPI details are stored on our servers.
        </p>

        <h3 className="font-serif text-lg font-bold text-neutral-900">2. How We Use Your Data</h3>
        <p>
          Your data is used solely to fulfill orders, issue tax invoices, provide live DHL/BlueDart logistics updates, and deliver concierge support.
        </p>
      </div>
    </div>
  );
}
