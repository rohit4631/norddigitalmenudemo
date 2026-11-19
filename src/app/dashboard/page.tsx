'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Receipt,
  TrendingUp,
  Clock,
  ChefHat,
  UtensilsCrossed,
  QrCode,
  ArrowRight,
  CheckCircle2,
  TableProperties,
  Plus,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function DashboardOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/analytics/overview')
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
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentOrders = data?.recentOrders || [];
  const popularItems = data?.popularItems || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Today's Cafe Operations</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time incoming orders, preparation status, and daily sales metrics.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/menu"
            className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Add Food Item
          </Link>
          <Link
            href="/dashboard/orders"
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-blue-700 transition flex items-center gap-1.5"
          >
            <Receipt className="w-3.5 h-3.5" /> Live Orders View
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">
              {formatCurrency(stats.todayRevenue || 0)}
            </span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              Paid
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">Gross sales for today</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Orders</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">
              {(stats.pendingOrders || 0) + (stats.preparingOrders || 0)}
            </span>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              {stats.pendingOrders || 0} New
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {stats.preparingOrders || 0} currently preparing in kitchen
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Orders</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{stats.completedOrders || 0}</span>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
              Served
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">Total customer orders fulfilled</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Menu & QR Scans</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{stats.totalQrScans || 0}</span>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
              Scans
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {stats.totalMenuItems || 0} active menu dishes • {stats.totalTables || 0} tables
          </div>
        </div>
      </div>

      {/* Main Grid: Live Orders & Popular Dishes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Incoming Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="font-bold text-base text-slate-900">Recent Customer Orders</div>
            <Link
              href="/dashboard/orders"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Open live Kanban <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {recentOrders.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">No orders received yet today.</div>
            ) : (
              recentOrders.map((ord: any) => {
                const itemCount = ord.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
                return (
                  <div key={ord.id} className="p-4 hover:bg-slate-50/70 transition flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">{ord.orderNumber}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {ord.orderType === 'DINE_IN' ? `Table ${ord.tableNumber || '-'}` : ord.orderType}
                        </span>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                            ord.status === 'PENDING'
                              ? 'bg-blue-50 text-blue-700'
                              : ord.status === 'PREPARING'
                              ? 'bg-amber-50 text-amber-700'
                              : ord.status === 'READY'
                              ? 'bg-purple-50 text-purple-700'
                              : ord.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 truncate">
                        {ord.customerName} ({ord.customerPhone}) • {itemCount} {itemCount === 1 ? 'item' : 'items'}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold text-slate-900 text-sm">
                        {formatCurrency(ord.totalAmount)}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {formatDateTime(ord.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Popular Dishes */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="font-bold text-base text-slate-900 mb-4">Top Selling Dishes</div>
            <div className="space-y-3">
              {popularItems.length === 0 ? (
                <div className="text-xs text-slate-400 py-6 text-center">No sales history yet.</div>
              ) : (
                popularItems.map((item: any, i: number) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="font-medium text-slate-800 truncate">{item.name}</span>
                    </div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded shrink-0">
                      {item.totalSold} sold
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              href="/kitchen"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <ChefHat className="w-4 h-4 text-amber-400" /> Open Kitchen Tablet KDS
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
