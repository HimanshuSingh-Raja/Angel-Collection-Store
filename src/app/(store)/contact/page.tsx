'use client';

import React, { useState } from 'react';
import { Mail, Phone, Instagram, Facebook, Send, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { submitContactMessageAction } from '@/actions/contact';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!form.name || !form.email || !form.subject || !form.message) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await submitContactMessageAction(form);
      if (res.success) {
        setSubmitted(true);
        setSuccessMessage(
          res.message ||
            'Thank you for contacting Angel Collection. Our team has received your message and will get back to you as soon as possible.'
        );
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setErrorMessage(res.error || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 font-sans">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] font-bold text-amber-700 block">
          PERSONAL CONCIERGE
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
          Contact Angel Concierge
        </h1>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Have a question about bespoke sizing, order status, or VIP appointments? Our concierge team is at your service.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Info Box */}
        <div className="bg-neutral-950 text-white p-8 rounded-3xl space-y-8 shadow-2xl border border-neutral-800">
          <h3 className="font-serif text-xl font-bold text-amber-400">Contact Information</h3>

          <div className="space-y-6 text-xs text-neutral-300">
            {/* Phone */}
            <div className="flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400 shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Direct Phone Line</p>
                <a href="tel:+917620994257" className="text-amber-400 font-mono font-bold hover:underline">
                  +91 7620994257
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Email Concierge</p>
                <a href="mailto:angelcollections.b4u@gmail.com" className="text-neutral-300 font-mono hover:text-amber-400 break-all">
                  angelcollections.b4u@gmail.com
                </a>
              </div>
            </div>

            {/* Social Channels */}
            <div className="pt-4 border-t border-neutral-900 space-y-3">
              <p className="font-bold text-white text-xs uppercase tracking-wider">Follow Us</p>
              <div className="flex items-center space-x-3">
                <a
                  href="https://www.instagram.com/angelcollections.b4u/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:text-amber-400 hover:border-amber-500/60 transition cursor-pointer"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4.5 h-4.5" />
                </a>
                <a
                  href="https://www.facebook.com/angelcollection.b4u"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:text-amber-400 hover:border-amber-500/60 transition cursor-pointer"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4.5 h-4.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
          <h3 className="font-serif text-xl font-bold text-neutral-900">Send A Direct Inquiry</h3>

          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {submitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <span className="leading-relaxed font-medium">{successMessage}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-neutral-800 uppercase block mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    disabled={loading}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 focus:outline-none focus:border-amber-600 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-800 uppercase block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    disabled={loading}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 focus:outline-none focus:border-amber-600 disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-800 uppercase block mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  disabled={loading}
                  placeholder="e.g. Bespoke Sizing Inquiry"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 focus:outline-none focus:border-amber-600 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-800 uppercase block mb-1">Message *</label>
                <textarea
                  rows={4}
                  required
                  disabled={loading}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 focus:outline-none focus:border-amber-600 font-sans disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-neutral-950 text-white font-bold uppercase tracking-widest rounded-2xl hover:bg-amber-700 transition flex items-center gap-2 shadow-xl disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                    <span>SENDING...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-amber-300" />
                    <span>SEND CONCIERGE MESSAGE</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
