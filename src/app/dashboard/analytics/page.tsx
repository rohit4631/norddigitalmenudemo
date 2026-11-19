'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Receipt,
  QrCode,
  Calendar,
  Loader2,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function DashboardAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/analytics/overview')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const revenueTrend = data?.revenueTrend || [];
  const popularItems = data?.popularItems || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sales & Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">
          Detailed sales breakdown, item velocity, and QR code customer engagement.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Sales</span>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">
            {formatCurrency(stats.todayRevenue || 0)}
          </div>
          <p className="text-xs text-emerald-600 font-medium mt-1">Live from verified orders</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Order Value</span>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">
            {formatCurrency(
              stats.completedOrders > 0
                ? Math.round(stats.todayRevenue / stats.completedOrders)
                : 380
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">Per dining customer session</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Menu Scans</span>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">
            {stats.totalQrScans || 0}
          </div>
          <p className="text-xs text-blue-600 font-medium mt-1">Unique QR customer interactions</p>
        </div>
      </div>

      {/* 7-Day Revenue Trend Graph Representation */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base text-slate-900">Weekly Revenue Breakdown</h2>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Last 7 Days
          </span>
        </div>

        <div className="grid grid-cols-7 gap-3 pt-6 items-end h-48 border-b border-slate-100 pb-4">
          {revenueTrend.map((day: any) => {
            const heightPercent = Math.min(100, Math.max(20, (day.revenue / 3500) * 100));
            return (
              <div key={day.date} className="flex flex-col items-center gap-2 h-full justify-end group">
                <div className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition">
                  {formatCurrency(day.revenue)}
                </div>
                <div
                  className="w-full bg-blue-600 group-hover:bg-blue-700 rounded-t-xl transition-all"
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-[10px] font-semibold text-slate-500 truncate w-full text-center">
                  {day.date.split(',')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Dishes Performance */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="font-bold text-base text-slate-900">Best Performing Menu Items</h2>
        <div className="divide-y divide-slate-100 text-sm">
          {popularItems.map((it: any, i: number) => (
            <div key={it.name} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="font-semibold text-slate-800">{it.name}</span>
              </div>
              <div className="text-xs font-bold text-slate-700">
                {it.totalSold} portions prepared
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
