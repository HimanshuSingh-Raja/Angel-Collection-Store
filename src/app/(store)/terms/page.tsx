'use client';

import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8 font-sans text-neutral-800">
      <div className="border-b border-neutral-200 pb-6">
        <span className="text-xs uppercase tracking-[0.25em] text-amber-700 font-bold">LEGAL TERMS</span>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-900 mt-1">
          Terms of Service & Sale
        </h1>
      </div>

      <div className="space-y-6 text-xs leading-relaxed font-light">
        <p>
          Welcome to Angel Collection. By accessing our platform or purchasing our haute couture garments and fine jewellery, you agree to bound by these terms.
        </p>

        <h3 className="font-serif text-lg font-bold text-neutral-900">1. Authenticity Guarantee</h3>
        <p>
          Every item sold on Angel Collection is 100% authentic and crafted in certified ateliers. Diamonds are accompanied by GIA certifications.
        </p>

        <h3 className="font-serif text-lg font-bold text-neutral-900">2. Pricing & Currency</h3>
        <p>
          All prices are displayed inclusive of 18% GST. Prices are subject to revision without prior notice.
        </p>
      </div>
    </div>
  );
}
