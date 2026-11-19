'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, UtensilsCrossed, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function OrderLookupPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const cleanNum = orderNumber.trim().toUpperCase();
      const res = await fetch(`/api/v1/public/orders/${cleanNum}?phone=${encodeURIComponent(phone.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.order) {
        throw new Error('Order not found with the provided details. Please verify the order number.');
      }

      router.push(`/c/${data.order.cafe.slug}/orders/${data.order.orderNumber}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-2">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">
            Nord<span className="text-blue-600">Cafe</span>
          </span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Track Your Cafe Order
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Check live preparation progress or reprint your dining receipt.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm rounded-3xl border border-slate-200">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLookup} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 uppercase">Order Number</label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. NC-9101"
                className="mt-1 w-full p-2.5 font-mono text-sm border border-slate-300 rounded-xl uppercase"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 uppercase">Registered Mobile Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210 (Optional)"
                className="mt-1 w-full p-2.5 text-sm border border-slate-300 rounded-xl"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Looking up order...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  Track Order <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
