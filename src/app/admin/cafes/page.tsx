'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Store,
  Search,
  Filter,
  ArrowUpRight,
  ShieldAlert,
  CheckCircle,
  MoreVertical,
  ExternalLink,
  UserPlus,
  Loader2,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminCafesPage() {
  const [cafes, setCafes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchCafes = async () => {
    try {
      const url = new URL('/api/v1/admin/cafes', window.location.origin);
      if (search) url.searchParams.set('search', search);
      if (statusFilter !== 'ALL') url.searchParams.set('status', statusFilter);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setCafes(data.cafes);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCafes();
  }, [search, statusFilter]);

  const toggleCafeStatus = async (cafeId: string, currentStatus: string) => {
    setUpdatingId(cafeId);
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch(`/api/v1/admin/cafes/${cafeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setCafes(
          cafes.map((c) => (c.id === cafeId ? { ...c, status: newStatus } : c))
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Cafe Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage all tenant cafes, subscriptions, status, and menu access.
          </p>
        </div>
        <Link
          href="/admin/onboarding"
          className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-purple-700 transition flex items-center gap-2 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" /> Assisted Onboarding
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search cafe by name, slug or owner email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border-none bg-transparent focus:outline-none focus:ring-0 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
          <Filter className="w-4 h-4 text-slate-400 ml-2" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50 text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
          </select>
        </div>
      </div>

      {/* Cafes Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          </div>
        ) : cafes.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No cafes found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Cafe & Slug</th>
                  <th className="px-6 py-4">Owner Contact</th>
                  <th className="px-6 py-4">Subscription</th>
                  <th className="px-6 py-4">Catalog & Tables</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cafes.map((c) => {
                  const sub = c.subscriptions?.[0]?.plan?.name || 'Free';
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{c.name}</div>
                        <div className="text-xs font-mono text-purple-600 mt-0.5">/c/{c.slug}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-900 font-medium">{c.owner?.name}</div>
                        <div className="text-xs text-slate-500">{c.owner?.email}</div>
                        {c.owner?.phone && <div className="text-xs text-slate-400">{c.owner.phone}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          {sub} Plan
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="text-slate-700 font-medium">
                          {c._count.menuItems} items • {c._count.categories} categories
                        </div>
                        <div className="text-slate-400 mt-0.5">
                          {c._count.diningTables} tables • {c._count.orders} orders
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            c.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              c.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          ></span>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/c/${c.slug}`}
                            target="_blank"
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Preview Public Menu"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => toggleCafeStatus(c.id, c.status)}
                            disabled={updatingId === c.id}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                              c.status === 'ACTIVE'
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {updatingId === c.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : c.status === 'ACTIVE' ? (
                              'Suspend'
                            ) : (
                              'Activate'
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
