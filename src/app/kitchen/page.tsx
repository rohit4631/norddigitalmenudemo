'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertCircle,
  Bell,
  RefreshCw,
  ArrowLeft,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function KitchenKDSPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const fetchKitchenOrders = async () => {
    try {
      const res = await fetch('/api/v1/orders');
      const data = await res.json();
      if (data.success) {
        // Filter to only kitchen-relevant orders: PENDING, ACCEPTED, PREPARING, READY
        const kitchenOrders = data.orders.filter((o: any) =>
          ['PENDING', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status)
        );
        setOrders(kitchenOrders);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchenOrders();
    const interval = setInterval(fetchKitchenOrders, 3000); // 3-second live kitchen refresh
    return () => clearInterval(interval);
  }, []);

  const handleAdvanceStatus = async (orderId: string, currentStatus: string) => {
    let nextStatus = 'PREPARING';
    if (currentStatus === 'PENDING') nextStatus = 'ACCEPTED';
    else if (currentStatus === 'ACCEPTED') nextStatus = 'PREPARING';
    else if (currentStatus === 'PREPARING') nextStatus = 'READY';
    else if (currentStatus === 'READY') nextStatus = 'COMPLETED';

    try {
      await fetch(`/api/v1/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchKitchenOrders();
    } catch (e) {
      console.error(e);
    }
  };

  const getElapsedMinutes = (dateStr: string) => {
    const elapsedMs = Date.now() - new Date(dateStr).getTime();
    return Math.floor(elapsedMs / 60000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* KDS Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white">
                KITCHEN DISPLAY SYSTEM
              </span>
              <span className="ml-2 text-xs font-mono text-amber-400">
                • {orders.length} ACTIVE DISPATCHES
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Alerts ON' : 'Muted'}</span>
          </button>

          <button
            onClick={fetchKitchenOrders}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Manual sync"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Orders Grid */}
      <main className="flex-1 p-6 overflow-y-auto">
        {loading && orders.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500">
            Connecting to live kitchen order stream...
          </div>
        ) : orders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 py-24 space-y-3">
            <ChefHat className="w-16 h-16 text-slate-800" />
            <div className="font-bold text-lg text-slate-400">All Kitchen Orders Cleared</div>
            <div className="text-xs text-slate-600">New table QR and takeaway orders will ding here immediately.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {orders.map((ord) => {
              const elapsedMins = getElapsedMinutes(ord.createdAt);
              const isUrgent = elapsedMins >= 15;

              return (
                <div
                  key={ord.id}
                  className={`rounded-2xl border flex flex-col justify-between overflow-hidden shadow-xl transition-all ${
                    ord.status === 'PREPARING'
                      ? 'bg-slate-900 border-amber-500/60 ring-1 ring-amber-500/40'
                      : ord.status === 'READY'
                      ? 'bg-slate-900 border-purple-500/60'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  {/* Card Header */}
                  <div>
                    <div className="p-4 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-lg text-white">
                          {ord.orderNumber}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-950 text-amber-400 font-mono">
                          {ord.orderType === 'DINE_IN' ? `TABLE ${ord.tableNumber || '-'}` : ord.orderType}
                        </span>
                      </div>

                      <div
                        className={`text-xs font-mono font-bold flex items-center gap-1 px-2 py-0.5 rounded ${
                          isUrgent ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-slate-950 text-slate-400'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{elapsedMins}m ago</span>
                      </div>
                    </div>

                    {/* Customer Notes */}
                    {ord.notes && (
                      <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-xs font-semibold">
                        ⚠️ NOTE: {ord.notes}
                      </div>
                    )}

                    {/* Dish Checklist */}
                    <div className="p-4 space-y-3">
                      {ord.items.map((it: any) => (
                        <div key={it.id} className="border-b border-slate-800/80 pb-2.5 last:border-0 last:pb-0">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-extrabold text-white text-base">
                              <span className="text-amber-400 font-mono text-lg mr-2 font-black">
                                {it.quantity}x
                              </span>
                              {it.itemName}
                            </span>
                            {it.variantName && (
                              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0 font-medium">
                                {it.variantName}
                              </span>
                            )}
                          </div>

                          {it.addons && it.addons.length > 0 && (
                            <div className="pl-6 mt-1 space-y-0.5">
                              {it.addons.map((ad: any) => (
                                <div key={ad.id} className="text-xs text-amber-400/90 font-medium">
                                  + {ad.addonName}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Advance Status Button */}
                  <div className="p-3 bg-slate-950 border-t border-slate-800">
                    {ord.status === 'PENDING' && (
                      <button
                        onClick={() => handleAdvanceStatus(ord.id, ord.status)}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold rounded-xl text-sm transition shadow-lg"
                      >
                        Accept & Start
                      </button>
                    )}

                    {ord.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleAdvanceStatus(ord.id, ord.status)}
                        className="w-full py-3 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2"
                      >
                        <ChefHat className="w-4 h-4" /> Start Cooking
                      </button>
                    )}

                    {ord.status === 'PREPARING' && (
                      <button
                        onClick={() => handleAdvanceStatus(ord.id, ord.status)}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Food Ready for Server
                      </button>
                    )}

                    {ord.status === 'READY' && (
                      <button
                        onClick={() => handleAdvanceStatus(ord.id, ord.status)}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Served / Done
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
