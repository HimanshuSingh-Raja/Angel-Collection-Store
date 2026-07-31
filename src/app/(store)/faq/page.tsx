'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQPage() {
  const faqs = [
    {
      q: 'How do I know what size evening gown or tuxedo to choose?',
      a: 'Please consult our interactive Size Guide available on every product page. If you are between sizes or desire bespoke tailoring, click "Size Guide" or contact our VIP Concierge.',
    },
    {
      q: 'Are your diamonds ethically sourced and GIA certified?',
      a: 'Yes, 100% of our solitaire diamonds are GIA certified conflict-free and set in solid 18K gold.',
    },
    {
      q: 'What shipping carriers do you use?',
      a: 'We ship exclusively via DHL Express and BlueDart Express with signature-required insured delivery.',
    },
    {
      q: 'How do promo coupons work?',
      a: 'Enter promo code ANGEL10 or LUXURY20 in your shopping bag or checkout page to apply instant discounts.',
    },
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8 font-sans text-neutral-800">
      <div className="border-b border-neutral-200 pb-6 text-center">
        <span className="text-xs uppercase tracking-[0.25em] text-amber-700 font-bold">CLIENT HELP</span>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-900 mt-1">
          Frequently Asked Questions
        </h1>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm transition"
          >
            <button
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              className="w-full p-5 text-left text-sm font-bold text-neutral-900 flex justify-between items-center"
            >
              <span>{faq.q}</span>
              <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${openIdx === idx ? 'rotate-180 text-amber-700' : ''}`} />
            </button>
            {openIdx === idx && (
              <div className="px-5 pb-5 text-xs text-neutral-600 font-light leading-relaxed border-t border-neutral-100 pt-3">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
