'use client';

import React, { useState } from 'react';
import { X, MapPin, Building, Home, Briefcase, Tag, Search, CheckCircle2, Loader2 } from 'lucide-react';
import { AddressInput } from '@/actions/address-actions';

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AddressInput) => Promise<void>;
  initialData?: any;
}

export const AddressFormModal: React.FC<AddressFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    houseNo: initialData?.houseNo || '',
    street: initialData?.street || '',
    apartment: initialData?.apartment || '',
    landmark: initialData?.landmark || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    postalCode: initialData?.postalCode || '',
    country: initialData?.country || 'India',
    type: initialData?.type || 'HOME',
    isDefault: initialData?.isDefault || false,
  });

  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);

  if (!isOpen) return null;

  // Smart location lookup simulation for "Sector 62 Noida", "LPU Punjab", "MG Road Bangalore"
  const handleLocationSearch = (query: string) => {
    setSearchQuery(query);
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    const mockLocations = [
      {
        display: 'Sector 62, Noida, Uttar Pradesh, 201301',
        street: 'Sector 62, Commercial Hub',
        city: 'Noida',
        state: 'Uttar Pradesh',
        pincode: '201301',
      },
      {
        display: 'Lovely Professional University (LPU), Phagwara, Punjab, 144411',
        street: 'Jalandhar - Delhi G.T. Road, LPU Campus',
        city: 'Phagwara',
        state: 'Punjab',
        pincode: '144411',
      },
      {
        display: 'MG Road, Bengaluru, Karnataka, 560001',
        street: 'MG Road, Central Boulevard',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
      },
      {
        display: 'Connaught Place, New Delhi, Delhi, 110001',
        street: 'Inner Circle, Connaught Place',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
      },
      {
        display: 'Bandra West, Mumbai, Maharashtra, 400050',
        street: 'Linking Road, Bandra West',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400050',
      },
    ];

    const matches = mockLocations.filter((l) =>
      l.display.toLowerCase().includes(query.toLowerCase())
    );
    setSuggestions(matches.length > 0 ? matches : [
      {
        display: `${query}, India`,
        street: query,
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
      }
    ]);
  };

  const selectSuggestion = (loc: any) => {
    setForm((prev) => ({
      ...prev,
      street: loc.street,
      city: loc.city,
      state: loc.state,
      postalCode: loc.pincode,
    }));
    setSearchQuery('');
    setSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form as any);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-fade-in">
      <div className="bg-white text-neutral-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-950 text-white">
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif text-xl font-bold">
              {initialData ? 'Edit Delivery Address' : 'Add New Delivery Address'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Smart Location Search Box */}
          <div className="space-y-2 relative">
            <label className="font-bold text-neutral-900 uppercase block tracking-wider text-[11px]">
              🔍 Quick Google Location Autocomplete
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Type location e.g. Sector 62 Noida, LPU Punjab, MG Road Bangalore..."
                value={searchQuery}
                onChange={(e) => handleLocationSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-amber-50/40 rounded-xl border border-amber-300/80 focus:outline-none focus:border-amber-600 font-medium text-neutral-900"
              />
            </div>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-2xl shadow-2xl divide-y divide-neutral-100 overflow-hidden">
                {suggestions.map((loc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectSuggestion(loc)}
                    className="w-full text-left p-3 hover:bg-amber-50 transition flex items-center gap-2.5 cursor-pointer text-xs"
                  >
                    <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-medium text-neutral-800">{loc.display}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Personal Information */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-neutral-900 uppercase text-[11px] border-b border-neutral-100 pb-1">
              1. Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Victoria Sterling"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 focus:outline-none focus:border-amber-600"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Mobile Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>
          </div>

          {/* Address Details */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-neutral-900 uppercase text-[11px] border-b border-neutral-100 pb-1">
              2. Address Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold block mb-1">Flat / House No. / Building *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 402, Penthouse B"
                  value={form.houseNo}
                  onChange={(e) => setForm({ ...form, houseNo: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 focus:outline-none focus:border-amber-600"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Address Line 1 (Street/Area) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sector 62, MG Road"
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 focus:outline-none focus:border-amber-600"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  placeholder="Apartment or floor info"
                  value={form.apartment}
                  onChange={(e) => setForm({ ...form, apartment: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 focus:outline-none focus:border-amber-600"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Near Metro Station"
                  value={form.landmark}
                  onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>
          </div>

          {/* Location & Pincode */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-neutral-900 uppercase text-[11px] border-b border-neutral-100 pb-1">
              3. City, State & Pincode
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold block mb-1">City *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Noida"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 focus:outline-none focus:border-amber-600"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">State *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Uttar Pradesh"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 focus:outline-none focus:border-amber-600"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Pincode *</label>
                <input
                  type="text"
                  required
                  placeholder="201301"
                  value={form.postalCode}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>
          </div>

          {/* Address Type & Default */}
          <div className="pt-2 space-y-4">
            <div>
              <label className="font-bold block mb-2 uppercase text-[11px]">Save Address As</label>
              <div className="flex items-center gap-3">
                {[
                  { label: 'HOME', icon: Home },
                  { label: 'WORK', icon: Briefcase },
                  { label: 'OTHER', icon: Tag },
                ].map((typeObj) => {
                  const Icon = typeObj.icon;
                  const isSelected = form.type === typeObj.label;
                  return (
                    <button
                      key={typeObj.label}
                      type="button"
                      onClick={() => setForm({ ...form, type: typeObj.label })}
                      className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-2 cursor-pointer transition ${
                        isSelected
                          ? 'bg-neutral-950 text-white border-neutral-950 shadow-md'
                          : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-amber-400" />
                      <span>{typeObj.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
              />
              <span className="font-bold text-neutral-800">Make this my default delivery address</span>
            </label>
          </div>

          {/* Footer Save Actions */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-neutral-200 text-neutral-700 font-bold hover:bg-neutral-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-neutral-950 text-white rounded-xl font-bold uppercase tracking-wider hover:bg-amber-700 transition flex items-center gap-2 shadow-xl disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>SAVING...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>SAVE ADDRESS</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
