'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Check, Edit2, Loader2, Save } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/v1/admin/plans');
      const data = await res.json();
      if (data.success) {
        setPlans(data.plans);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const startEdit = (plan: any) => {
    setEditingId(plan.id);
    setEditForm({
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
      itemLimit: plan.itemLimit,
      tableLimit: plan.tableLimit,
      branchLimit: plan.branchLimit,
      hasOnlineOrdering: plan.hasOnlineOrdering,
      hasCustomBranding: plan.hasCustomBranding,
    });
  };

  const handleSave = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/v1/admin/plans', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editForm }),
      });
      if (res.ok) {
        setEditingId(null);
        fetchPlans();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">SaaS Subscription Plans</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure tiers, pricing, and feature entitlement limits enforced by the backend.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const isEditing = editingId === p.id;
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">{p.name}</h2>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700">
                      {p._count?.subscriptions || 0} active cafes
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{p.description}</p>

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    {isEditing ? (
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="font-semibold text-slate-600">Monthly Price (₹)</label>
                          <input
                            type="number"
                            value={editForm.monthlyPrice}
                            onChange={(e) => setEditForm({ ...editForm, monthlyPrice: e.target.value })}
                            className="mt-1 w-full p-2 border border-slate-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-slate-600">Yearly Price (₹)</label>
                          <input
                            type="number"
                            value={editForm.yearlyPrice}
                            onChange={(e) => setEditForm({ ...editForm, yearlyPrice: e.target.value })}
                            className="mt-1 w-full p-2 border border-slate-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-slate-600">Max Food Items</label>
                          <input
                            type="number"
                            value={editForm.itemLimit}
                            onChange={(e) => setEditForm({ ...editForm, itemLimit: e.target.value })}
                            className="mt-1 w-full p-2 border border-slate-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-slate-600">Max Tables</label>
                          <input
                            type="number"
                            value={editForm.tableLimit}
                            onChange={(e) => setEditForm({ ...editForm, tableLimit: e.target.value })}
                            className="mt-1 w-full p-2 border border-slate-300 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-extrabold text-slate-900">
                            {formatCurrency(p.monthlyPrice)}
                          </span>
                          <span className="text-xs text-slate-500">/month</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          or {formatCurrency(p.yearlyPrice)} billed annually
                        </div>

                        <ul className="mt-6 space-y-2.5 text-xs text-slate-600">
                          <li className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Up to <strong>{p.itemLimit}</strong> food items</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Up to <strong>{p.tableLimit}</strong> tables & QRs</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{p.branchLimit} branch location</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Online ordering: {p.hasOnlineOrdering ? 'Enabled' : 'Disabled'}</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Custom branding: {p.hasCustomBranding ? 'Enabled' : 'Standard'}</span>
                          </li>
                        </ul>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSave(p.id)}
                        disabled={saving}
                        className="px-4 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 flex items-center gap-1.5"
                      >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(p)}
                      className="px-3.5 py-1.5 border border-slate-200 hover:border-purple-300 rounded-xl text-xs font-semibold text-slate-700 hover:text-purple-600 flex items-center gap-1.5 transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit Limits
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
