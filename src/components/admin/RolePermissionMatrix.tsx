'use client';

import React, { useState } from 'react';
import { Check, X, Shield, Save } from 'lucide-react';
import { UserRole } from '@/types';

interface PermissionRow {
  permission: string;
  description: string;
  roles: Record<UserRole, boolean>;
}

export const RolePermissionMatrix: React.FC = () => {
  const [permissions, setPermissions] = useState<PermissionRow[]>([
    {
      permission: 'MANAGE_STORE_SETTINGS',
      description: 'Update Store Name, GST, Address, Payment Credentials',
      roles: { OWNER: true, ADMIN: true, MANAGER: false, STAFF: false, CUSTOMER: false },
    },
    {
      permission: 'CREATE_EDIT_PRODUCTS',
      description: 'Add, edit, bulk import/export CSV products',
      roles: { OWNER: true, ADMIN: true, MANAGER: true, STAFF: false, CUSTOMER: false },
    },
    {
      permission: 'MANAGE_ORDERS',
      description: 'Update order statuses, generate shipping labels & invoices',
      roles: { OWNER: true, ADMIN: true, MANAGER: true, STAFF: true, CUSTOMER: false },
    },
    {
      permission: 'MANAGE_BANNERS_COUPONS',
      description: 'Create hero sliders, promotional coupons, flash deals',
      roles: { OWNER: true, ADMIN: true, MANAGER: true, STAFF: false, CUSTOMER: false },
    },
    {
      permission: 'VIEW_ANALYTICS',
      description: 'Access revenue trends, gross profit charts & customer lists',
      roles: { OWNER: true, ADMIN: true, MANAGER: true, STAFF: false, CUSTOMER: false },
    },
  ]);

  const [saved, setSaved] = useState(false);

  const togglePermission = (index: number, role: UserRole) => {
    if (role === 'OWNER') return; // Owner cannot be restricted
    setPermissions((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              roles: {
                ...item.roles,
                [role]: !item.roles[role],
              },
            }
          : item
      )
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const rolesList: UserRole[] = ['OWNER', 'ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER'];

  return (
    <div className="bg-admin-card p-6 rounded-2xl border border-admin-border shadow-lg space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-amber-400">
            <Shield className="w-5 h-5" />
            <h3 className="font-serif text-lg font-bold text-white tracking-tight">
              Role-Based Access Control (RBAC)
            </h3>
          </div>
          <p className="text-xs text-admin-muted mt-1">
            Configure system permissions for Owner, Admin, Manager, Staff & Customers
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-amber-500 text-neutral-950 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-amber-400 transition"
        >
          <Save className="w-4 h-4" />
          <span>{saved ? 'PERMISSIONS SAVED' : 'SAVE MATRIX'}</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-admin-border uppercase font-bold text-admin-muted">
              <th className="py-3 px-3">Permission / Capability</th>
              {rolesList.map((r) => (
                <th key={r} className="py-3 px-3 text-center">
                  {r}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border text-admin-text">
            {permissions.map((p, idx) => (
              <tr key={p.permission} className="hover:bg-admin-hover transition">
                <td className="py-4 px-3">
                  <p className="font-bold text-white">{p.permission}</p>
                  <p className="text-[11px] text-admin-muted">{p.description}</p>
                </td>
                {rolesList.map((r) => (
                  <td key={r} className="py-4 px-3 text-center">
                    <button
                      onClick={() => togglePermission(idx, r)}
                      disabled={r === 'OWNER'}
                      aria-label={`Toggle permission ${p.permission} for role ${r}`}
                      className={`p-2 rounded-xl transition ${
                        p.roles[r]
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-admin-bg text-admin-muted border border-admin-border hover:border-amber-500/40'
                      }`}
                    >
                      {p.roles[r] ? <Check className="w-4 h-4 mx-auto" /> : <X className="w-4 h-4 mx-auto stroke-1" />}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
