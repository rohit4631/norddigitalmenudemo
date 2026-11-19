'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Store,
  CreditCard,
  Receipt,
  TrendingUp,
  UserPlus,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/admin/dashboard')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentCafes = data?.recentCafes || [];
  const recentOrders = data?.recentOrders || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Platform Operations</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time business telemetry and multi-tenant performance overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/onboarding"
            className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-purple-700 transition flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> Onboard Cafe Manually
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Cafes</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{stats.totalCafes || 0}</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              {stats.activeCafes || 0} active
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {stats.suspendedCafes || 0} suspended • {stats.pendingCafes || 0} pending
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Recurring Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">
              {formatCurrency(stats.mrr || 0)}
            </span>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
              {stats.totalSubscriptions || 0} subs
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">Active recurring subscriptions</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Customer Orders</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{stats.totalOrders || 0}</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Live
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">Across all tenant branches</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform GMV</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">
              {formatCurrency(stats.platformGmv || 0)}
            </span>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
              Processed
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">Total customer transaction volume</div>
        </div>
      </div>

      {/* Main Grids: Recent Cafes & Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cafes List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="font-bold text-base text-slate-900">Recently Registered Cafes</div>
            <Link
              href="/admin/cafes"
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              View all cafes <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentCafes.map((c: any) => {
              const activePlan = c.subscriptions?.[0]?.plan?.name || 'Free';
              return (
                <div key={c.id} className="p-4 hover:bg-slate-50/60 transition flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 shrink-0">
                      {c.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-slate-900 truncate flex items-center gap-2">
                        {c.name}
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                          {activePlan}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 truncate">
                        Owner: {c.owner?.name} ({c.owner?.email})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        c.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {c.status}
                    </span>
                    <Link
                      href={`/c/${c.slug}`}
                      target="_blank"
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Preview Digital Menu"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Orders Across Platform */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="font-bold text-base text-slate-900">Platform Activity</div>
            <span className="text-xs font-semibold text-slate-500">Live Orders</span>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[380px]">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">No orders recorded yet.</div>
            ) : (
              recentOrders.map((ord: any) => (
                <div key={ord.id} className="p-4 hover:bg-slate-50/60 transition text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900">{ord.orderNumber}</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(ord.totalAmount)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                    <span>{ord.cafe?.name}</span>
                    <span
                      className={`font-medium ${
                        ord.status === 'COMPLETED'
                          ? 'text-emerald-600'
                          : ord.status === 'PREPARING'
                          ? 'text-amber-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
