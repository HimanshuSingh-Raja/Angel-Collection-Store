'use client';

import React, { useState } from 'react';
import { MessageSquare, X, Send, Sparkles, User, ShieldCheck } from 'lucide-react';

export const LiveChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'concierge', text: 'Welcome to Angel Concierge. How may I assist your luxury shopping experience today?' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');

    setTimeout(() => {
      let botReply = 'Our VIP concierge team is ready to assist you. A stylist will respond shortly.';
      if (userMsg.toLowerCase().includes('ship') || userMsg.toLowerCase().includes('delivery')) {
        botReply = 'We offer complimentary Express Worldwide Delivery on all orders above ₹5,000 via DHL & BlueDart.';
      } else if (userMsg.toLowerCase().includes('size') || userMsg.toLowerCase().includes('fit')) {
        botReply = 'Our gowns and tuxedos strictly follow standard Italian sizing. You can also view our interactive Size Guide on any product page.';
      } else if (userMsg.toLowerCase().includes('coupon') || userMsg.toLowerCase().includes('code')) {
        botReply = 'You can use privilege code ANGEL10 for 10% off or LUXURY20 for 20% off orders above ₹19,999.';
      }

      setMessages((prev) => [...prev, { sender: 'concierge', text: botReply }]);
    }, 800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 rounded-full bg-neutral-950 text-amber-300 shadow-2xl hover:bg-neutral-800 transition flex items-center justify-center border border-amber-500/30 group"
          aria-label="Open Concierge Live Chat"
        >
          <MessageSquare className="w-6 h-6 text-amber-400 group-hover:scale-110 transition" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 animate-ping" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400" />
        </button>
      )}

      {/* Chat Modal Window */}
      {isOpen && (
        <div className="bg-white rounded-3xl max-w-sm w-[90vw] h-[480px] shadow-2xl border border-neutral-200 flex flex-col justify-between overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="p-4 bg-neutral-950 text-white flex items-center justify-between border-b border-neutral-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-bold text-white leading-tight">Angel VIP Concierge</h4>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active Stylist Online
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 text-neutral-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs bg-neutral-50">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    m.sender === 'user'
                      ? 'bg-neutral-950 text-white rounded-br-none'
                      : 'bg-white text-neutral-800 border border-neutral-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p>{m.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-neutral-200 flex gap-2">
            <input
              type="text"
              placeholder="Ask concierge anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-neutral-50 rounded-xl border border-neutral-200 focus:outline-none focus:border-amber-600 font-sans"
            />
            <button
              type="submit"
              className="p-2.5 bg-neutral-950 text-amber-300 rounded-xl hover:bg-neutral-800 transition"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
