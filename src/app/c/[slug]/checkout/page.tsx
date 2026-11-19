'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  Banknote,
  UtensilsCrossed,
  Clock,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Trash2,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CartItem } from '@/types';
import { getStoredCart, saveStoredCart, clearStoredCart } from '@/lib/cartStore';

export default function CustomerCheckoutPage({ params }: { params: { slug: string } }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tableParam = searchParams.get('table');

  const [cafe, setCafe] = useState<any>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'>('DINE_IN');
  const [tableNumber, setTableNumber] = useState(tableParam || 'T-01');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'COUNTER' | 'CASH' | 'RAZORPAY' | 'UPI'>('COUNTER');

  useEffect(() => {
    const loadedCart = getStoredCart(params.slug);
    setCart(loadedCart);

    fetch(`/api/v1/public/c/${params.slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setCafe(data.cafe);
        }
      })
      .finally(() => setLoading(false));
  }, [params.slug]);

  // Calculations
  const subtotal = cart.reduce((acc, it) => acc + it.itemTotalPrice, 0);

  let discount = 0;
  if (appliedCoupon === 'NORD10') {
    discount = Math.min(100, Math.round(subtotal * 0.1));
  }

  const taxRate = cafe?.settings?.taxRatePercent || 5.0;
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * (taxRate / 100) * 100) / 100;
  const packagingFee = orderType === 'TAKEAWAY' || orderType === 'DELIVERY' ? cafe?.settings?.packagingFee || 20 : 0;
  const totalAmount = Math.round((taxable + tax + packagingFee) * 100) / 100;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase().trim() === 'NORD10') {
      setAppliedCoupon('NORD10');
      setError(null);
    } else {
      setError('Invalid coupon code. Try NORD10 for 10% off.');
    }
  };

  const handleRemoveCartItem = (id: string) => {
    const updated = cart.filter((it) => it.id !== id);
    setCart(updated);
    saveStoredCart(params.slug, updated);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    if (!customerName || !customerPhone) {
      setError('Please provide your name and mobile phone number');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const idempotencyKey = `ord_${params.slug}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const orderPayload = {
        customerName,
        customerPhone,
        customerEmail,
        orderType,
        tableNumber: orderType === 'DINE_IN' ? tableNumber : null,
        deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress : null,
        notes,
        couponCode: appliedCoupon,
        paymentMethod,
        idempotencyKey,
        items: cart.map((it) => ({
          menuItemId: it.menuItemId,
          name: it.name,
          quantity: it.quantity,
          variant: it.variant ? { id: it.variant.id, name: it.variant.name } : null,
          addons: it.addons.map((a) => ({ id: a.id, name: a.name })),
        })),
      };

      const res = await fetch(`/api/v1/public/c/${params.slug}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      // If Razorpay simulated payment
      if (paymentMethod === 'RAZORPAY' && data.razorpay) {
        // In demo mode or test key, verify signature
        await fetch('/api/v1/payments/razorpay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: data.order.id,
            razorpayOrderId: data.razorpay.orderId,
            razorpayPaymentId: `pay_mock_${Date.now()}`,
            razorpaySignature: 'mock_signature_valid',
          }),
        });
      }

      // Clear local cart
      clearStoredCart(params.slug);

      // Route to live order tracking page
      router.push(`/c/${params.slug}/orders/${data.order.orderNumber}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Checkout Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-3.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href={`/c/${params.slug}${tableParam ? `?table=${tableParam}` : ''}`}
            className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Menu
          </Link>
          <span className="font-extrabold text-sm text-slate-900">
            {cafe?.name || 'Nord Cafe'} • Checkout
          </span>
          <div className="w-12"></div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 mt-6 space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Cart Item Summary */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-600" /> Order Summary ({cart.length} items)
            </h2>
            <Link
              href={`/c/${params.slug}`}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              + Add More Items
            </Link>
          </div>

          {cart.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              Your cart is empty. Return to the menu to pick delicious dishes.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {cart.map((item) => (
                <div key={item.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900">
                      {item.quantity}x {item.name} {item.variant ? `(${item.variant.name})` : ''}
                    </div>
                    {item.addons && item.addons.length > 0 && (
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Addons: {item.addons.map((a) => a.name).join(', ')}
                      </div>
                    )}
                    {item.specialInstructions && (
                      <div className="text-[11px] text-amber-600 mt-0.5 italic">
                        "{item.specialInstructions}"
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-extrabold text-slate-900">
                      {formatCurrency(item.itemTotalPrice)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCartItem(item.id)}
                      className="p-1 text-slate-300 hover:text-red-600 transition"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Mode Selection */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
          <label className="block text-xs font-bold uppercase text-slate-700">Ordering Mode</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setOrderType('DINE_IN')}
              className={`p-3 rounded-2xl border text-center transition ${
                orderType === 'DINE_IN'
                  ? 'border-blue-600 bg-blue-50/60 font-bold text-blue-900 ring-1 ring-blue-500'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="text-sm font-bold">Dine-in</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Table service</div>
            </button>

            <button
              type="button"
              onClick={() => setOrderType('TAKEAWAY')}
              className={`p-3 rounded-2xl border text-center transition ${
                orderType === 'TAKEAWAY'
                  ? 'border-blue-600 bg-blue-50/60 font-bold text-blue-900 ring-1 ring-blue-500'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="text-sm font-bold">Takeaway</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Counter pickup</div>
            </button>

            <button
              type="button"
              onClick={() => setOrderType('DELIVERY')}
              className={`p-3 rounded-2xl border text-center transition ${
                orderType === 'DELIVERY'
                  ? 'border-blue-600 bg-blue-50/60 font-bold text-blue-900 ring-1 ring-blue-500'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="text-sm font-bold">Delivery</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Doorstep delivery</div>
            </button>
          </div>

          {orderType === 'DINE_IN' && (
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-600">Table Number</label>
              <input
                type="text"
                required
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="e.g. T-02"
                className="mt-1 w-full p-2.5 text-xs font-mono border border-slate-300 rounded-xl"
              />
            </div>
          )}

          {orderType === 'DELIVERY' && (
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-600">Delivery Address</label>
              <textarea
                rows={2}
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Apartment, Street, Landmark..."
                className="mt-1 w-full p-2.5 text-xs border border-slate-300 rounded-xl"
              />
            </div>
          )}
        </div>

        {/* Customer Details Form */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Your Contact Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 uppercase">Your Name</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="mt-1 w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 uppercase">Mobile Number (For order status)</label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="mt-1 w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 uppercase">Special Instructions for Kitchen</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Less spicy, keep beverages separate..."
                className="mt-1 w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        {/* Coupon Code Box */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm">
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Promo code (Try NORD10)"
                className="w-full pl-9 pr-3 py-2 text-xs uppercase font-mono border border-slate-300 rounded-xl"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
            >
              Apply
            </button>
          </form>
          {appliedCoupon && (
            <div className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Coupon {appliedCoupon} applied (10% off)!
            </div>
          )}
        </div>

        {/* Bill Breakdown */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-2 text-xs text-slate-600 font-medium">
          <div className="flex justify-between">
            <span>Item Subtotal</span>
            <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Promo Discount (NORD10)</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Restaurant GST ({taxRate}%)</span>
            <span className="font-bold text-slate-900">{formatCurrency(tax)}</span>
          </div>

          {packagingFee > 0 && (
            <div className="flex justify-between">
              <span>Packaging / Delivery Charges</span>
              <span className="font-bold text-slate-900">{formatCurrency(packagingFee)}</span>
            </div>
          )}

          <div className="border-t border-slate-200 pt-3 flex justify-between text-base font-extrabold text-slate-900">
            <span>Grand Total</span>
            <span className="text-blue-600">{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        {/* Payment Selection */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
          <label className="block text-xs font-bold uppercase text-slate-700">Payment Option</label>
          <div className="space-y-2 text-xs">
            <label
              onClick={() => setPaymentMethod('COUNTER')}
              className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                paymentMethod === 'COUNTER'
                  ? 'border-blue-600 bg-blue-50/50 text-blue-950 font-bold'
                  : 'border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <Banknote className="w-4 h-4 text-blue-600" />
                <span>Pay at Counter / Cash</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100">Recommended</span>
            </label>

            <label
              onClick={() => setPaymentMethod('RAZORPAY')}
              className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                paymentMethod === 'RAZORPAY'
                  ? 'border-blue-600 bg-blue-50/50 text-blue-950 font-bold'
                  : 'border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-purple-600" />
                <span>Online / UPI / Razorpay</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold">Instant</span>
            </label>
          </div>
        </div>

        {/* Submit Order Button */}
        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={submitting || cart.length === 0}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold rounded-2xl text-base shadow-xl shadow-blue-500/25 transition flex items-center justify-center gap-2"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Transmitting order to kitchen...
            </span>
          ) : (
            `Place Order • ${formatCurrency(totalAmount)}`
          )}
        </button>
      </main>
    </div>
  );
}
