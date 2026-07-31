'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Trash2, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import {
  getAdminContactMessagesAction,
  updateContactMessageStatusAction,
  deleteContactMessageAction,
} from '@/actions/contact-admin';

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMessages() {
      setLoading(true);
      try {
        const liveMessages = await getAdminContactMessagesAction();
        setMessages(liveMessages);
      } catch (e) {
        console.error('Failed to load contact messages:', e);
      } finally {
        setLoading(false);
      }
    }
    loadMessages();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'NEW' | 'READ' | 'REPLIED') => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m)));
    await updateContactMessageStatusAction(id, newStatus);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this message?')) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      await deleteContactMessageAction(id);
    }
  };

  return (
    <div className="space-y-8 font-sans text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-admin-border">
        <div>
          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block font-bold">
            CLIENT INQUIRIES
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white mt-1">Contact Messages</h1>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/30">
          POSTGRESQL MESSAGES
        </span>
      </div>

      <div className="bg-admin-card rounded-2xl border border-admin-border shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-admin-muted text-xs gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span>Fetching live database messages...</span>
          </div>
        ) : messages.length > 0 ? (
          <div className="divide-y divide-admin-border">
            {messages.map((msg) => (
              <div key={msg.id} className="p-6 hover:bg-admin-hover transition space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-admin-bg border border-admin-border flex items-center justify-center text-amber-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{msg.name}</h3>
                      <p className="text-[11px] text-admin-muted">{msg.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-[10px] text-admin-muted font-mono">{formatDate(msg.createdAt)}</span>
                    <select
                      value={msg.status}
                      onChange={(e) => handleUpdateStatus(msg.id, e.target.value as any)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border cursor-pointer ${
                        msg.status === 'NEW'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : msg.status === 'REPLIED'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30'
                      }`}
                    >
                      <option value="NEW" className="bg-admin-card text-white">NEW</option>
                      <option value="READ" className="bg-admin-card text-white">READ</option>
                      <option value="REPLIED" className="bg-admin-card text-white">REPLIED</option>
                    </select>

                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="p-1.5 rounded-lg bg-admin-bg text-admin-muted hover:text-rose-400 border border-admin-border cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="bg-admin-bg p-4 rounded-xl border border-admin-border space-y-1">
                  <p className="font-bold text-amber-400 text-xs">Subject: {msg.subject}</p>
                  <p className="text-neutral-300 leading-relaxed whitespace-pre-line">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-12 text-admin-muted text-xs">No contact messages in database.</p>
        )}
      </div>
    </div>
  );
}
