import React from 'react';

export default function AdminLoading() {
  return (
    <div className="p-8 space-y-8 animate-pulse bg-admin-bg min-h-screen">
      <div className="h-8 bg-admin-card rounded-xl w-64" />
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-admin-card rounded-2xl border border-admin-border" />
        ))}
      </div>
      <div className="h-72 bg-admin-card rounded-2xl border border-admin-border" />
    </div>
  );
}
