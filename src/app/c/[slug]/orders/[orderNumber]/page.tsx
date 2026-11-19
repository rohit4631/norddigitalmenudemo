'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  ChefHat,
  ShoppingBag,
  Printer,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Sparkles,
  Plus,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { soundFx } from '@/components/ui/AudioAlert';

export default function OrderTrackingPage({
  params,
}: {
  params: { slug: string; orderNumber: string };
}) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const previousStatusRef = useRef<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/v1/public/orders/${params.orderNumber}`);
      const data = await res.json();
      if (data.success) {
        const fetchedOrder = data.order;
        setOrder(fetchedOrder);

        // Chime when food is newly READY
        if (
          previousStatusRef.current &&
          previousStatusRef.current !== 'READY' &&
          fetchedOrder.status === 'READY'
        ) {
          soundFx.playOrderReadyChime();
        }
        previousStatusRef.current = fetchedOrder.status;
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000); // 3-second live tracker
    return () => clearInterval(interval);
  }, [params.orderNumber]);

  if (loading && !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-slate-900">Order Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">
          Could not locate order #{params.orderNumber}. Please check your order reference.
        </p>
        <Link
          href={`/c/${params.slug}`}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-sm"
        >
          Return to Menu
        </Link>
      </div>
    );
  }

  const steps = [
    { key: 'PENDING', label: 'Order Placed', desc: 'Sent to cafe kitchen' },
    { key: 'ACCEPTED', label: 'Order Accepted', desc: 'Confirmed by manager' },
    { key: 'PREPARING', label: 'Preparing', desc: 'Chef is cooking your meal' },
    {
      key: 'READY',
      label: 'Ready for Service',
      desc:
        order.orderType === 'DINE_IN'
          ? `Being served to Table ${order.tableNumber || '-'}`
          : 'Ready for counter pickup',
    },
    { key: 'COMPLETED', label: 'Fulfilled', desc: 'Bon appétit!' },
  ];

  const statusHierarchy: Record<string, number> = {
    PENDING: 1,
    ACCEPTED: 2,
    PREPARING: 3,
    READY: 4,
    COMPLETED: 5,
    REJECTED: 0,
    CANCELLED: 0,
  };

  const currentStepNum = statusHierarchy[order.status] || 1;
  const isRejected = order.status === 'REJECTED' || order.status === 'CANCELLED';

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-3.5 no-print">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href={`/c/${params.slug}`}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Menu
          </Link>
          <span className="font-extrabold text-sm text-slate-900">
            Order #{order.orderNumber}
          </span>
          <button
            onClick={() => window.print()}
            className="text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1"
          >
            <Printer className="w-3.5 h-3.5" /> Bill
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 mt-6 space-y-6">
        {/* Status Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Real-Time Live Status
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isRejected
              ? `Order ${order.status}`
              : order.status === 'COMPLETED'
              ? 'Order Fulfilled!'
              : order.status === 'READY'
              ? '🎉 Your Food is Ready!'
              : order.status === 'PREPARING'
              ? 'Chef is Preparing Your Food'
              : 'Order Placed & Awaiting Cafe'}
          </h1>

          <p className="text-xs text-slate-500">
            {order.orderType === 'DINE_IN'
              ? `Dine-in at Table ${order.tableNumber || '-'}`
              : order.orderType}{' '}
            • Placed at {formatDateTime(order.createdAt)}
          </p>

          {order.rejectionReason && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
              Cafe note: {order.rejectionReason}
            </div>
          )}
        </div>

        {/* Live Status Timeline */}
        {!isRejected && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 no-print">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Preparation Progress
            </h2>

            <div className="space-y-6">
              {steps.map((step, idx) => {
                const stepNum = idx + 1;
                const isPassed = currentStepNum >= stepNum;
                const isCurrent = currentStepNum === stepNum;

                return (
                  <div key={step.key} className="flex items-start gap-4 relative">
                    {idx < steps.length - 1 && (
                      <div
                        className={`absolute left-4 top-8 -bottom-4 w-0.5 ${
                          currentStepNum > stepNum ? 'bg-blue-600' : 'bg-slate-200'
                        }`}
                      />
                    )}

                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 font-bold text-xs transition ${
                        isCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md animate-pulse'
                          : isPassed
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div
                        className={`font-bold text-sm ${
                          isCurrent
                            ? 'text-blue-600 font-extrabold'
                            : isPassed
                            ? 'text-slate-900'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{step.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action button to order more */}
        <div className="flex justify-center no-print">
          <Link
            href={`/c/${params.slug}${order.tableNumber ? `?table=${order.tableNumber}` : ''}`}
            className="px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4 text-blue-600" /> Order Additional Items
          </Link>
        </div>

        {/* Itemized Receipt Details */}
        <div
          id="printable-receipt"
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="font-bold text-sm text-slate-900">Ordered Items</span>
            <span className="text-xs text-slate-500">Ref: {order.orderNumber}</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {order.items.map((it: any) => (
              <div key={it.id} className="py-2.5 flex justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-900">
                    {it.quantity}x {it.itemName} {it.variantName ? `(${it.variantName})` : ''}
                  </span>
                  {it.addons && it.addons.length > 0 && (
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      + {it.addons.map((a: any) => a.addonName).join(', ')}
                    </div>
                  )}
                </div>
                <span className="font-bold text-slate-900 shrink-0">
                  {formatCurrency(it.subtotalPrice)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount:</span>
                <span>-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>GST (5%):</span>
              <span className="font-semibold text-slate-900">{formatCurrency(order.taxAmount)}</span>
            </div>
            {order.packagingFee > 0 && (
              <div className="flex justify-between">
                <span>Packaging:</span>
                <span className="font-semibold text-slate-900">{formatCurrency(order.packagingFee)}</span>
              </div>
            )}
            <div className="flex justify-between font-extrabold text-sm text-slate-900 border-t border-slate-200 pt-2">
              <span>Total Paid / Payable:</span>
              <span className="text-blue-600">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
