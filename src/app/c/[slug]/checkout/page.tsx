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
  MapPin,
  Phone,
  User,
  Sparkles,
  Info,
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
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'>(
    tableParam ? 'DINE_IN' : 'DINE_IN'
  );
  const [tableNumber, setTableNumber] = useState(tableParam || 'T-01');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
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

  // Calculations reconciling cafe's actual tax rules
  const subtotal = cart.reduce((acc, it) => acc + it.itemTotalPrice, 0);

  let discount = 0;
  if (appliedCoupon === 'NORD10') {
    discount = Math.min(100, Math.round(subtotal * 0.1));
  }

  // Use actual cafe configured tax rate (e.g. 5.0% GST)
  const taxRate = cafe?.settings?.taxRatePercent ?? 5.0;
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * (taxRate / 100) * 100) / 100;
  const packagingFee =
    orderType === 'TAKEAWAY' || orderType === 'DELIVERY'
      ? cafe?.settings?.packagingFee || 20
      : 0;
  const totalAmount = Math.round((taxable + tax + packagingFee) * 100) / 100;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase().trim() === 'NORD10') {
      setAppliedCoupon('NORD10');
      setCouponSuccess('Promo code NORD10 applied! 10% discount included.');
      setError(null);
    } else {
      setError('Invalid promo code. Try NORD10 for 10% off.');
      setCouponSuccess(null);
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
      setError('Your cart is empty. Please select food items from the menu.');
      return;
    }

    if (!customerName.trim()) {
      setError('Please provide your full name for order pickup / dining.');
      return;
    }

    // Phone validation: at least 10 digits
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    if (orderType === 'DELIVERY' && !deliveryAddress.trim()) {
      setError('Please enter your complete street delivery address.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const idempotencyKey = `ord_${params.slug}_${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}`;

      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        orderType,
        tableNumber: orderType === 'DINE_IN' ? tableNumber : null,
        deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress.trim() : null,
        notes: notes.trim() || undefined,
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

      // If Razorpay simulated payment mode
      if (paymentMethod === 'RAZORPAY' && data.razorpay) {
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
      setError(err.message || 'Something went wrong while placing your order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <span className="text-xs font-semibold text-slate-500">Preparing checkout...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Checkout Top Bar */}
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-30 px-4 py-3.5 shadow-xs">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href={`/c/${params.slug}${tableParam ? `?table=${tableParam}` : ''}`}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Menu
          </Link>
          <span className="font-extrabold text-sm text-slate-900">
            {cafe?.name || 'Nord Cafe'} • Checkout
          </span>
          <div className="w-12" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 mt-6 space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* SECTION 1: ORDER SUMMARY */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
                1
              </span>
              Order Items ({cart.length})
            </h2>
            <Link
              href={`/c/${params.slug}${tableParam ? `?table=${tableParam}` : ''}`}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              + Add more
            </Link>
          </div>

          {cart.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Your cart is empty.{' '}
              <Link
                href={`/c/${params.slug}`}
                className="text-blue-600 font-bold underline ml-1"
              >
                Browse Menu
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {cart.map((item) => (
                <div key={item.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      {item.variant && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {item.variant.name}
                        </span>
                      )}
                    </div>

                    {item.addons && item.addons.length > 0 && (
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {item.addons.map((a) => `+ ${a.name}`).join(', ')}
                      </div>
                    )}

                    {item.specialInstructions && (
                      <div className="text-[11px] text-amber-700 italic mt-0.5">
                        Note: {item.specialInstructions}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold text-slate-900">
                      {formatCurrency(item.itemTotalPrice)}
                    </span>
                    <button
                      onClick={() => handleRemoveCartItem(item.id)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded transition"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 2: ORDERING MODE */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-3">
          <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
              2
            </span>
            Dining & Pickup Mode
          </h2>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setOrderType('DINE_IN')}
              className={`p-3 rounded-xl border text-center transition ${
                orderType === 'DINE_IN'
                  ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold ring-1 ring-blue-500'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4 mx-auto mb-1 text-blue-600" />
              <div className="text-xs font-bold">Table Dine-In</div>
            </button>

            <button
              type="button"
              onClick={() => setOrderType('TAKEAWAY')}
              className={`p-3 rounded-xl border text-center transition ${
                orderType === 'TAKEAWAY'
                  ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold ring-1 ring-blue-500'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <ShoppingBag className="w-4 h-4 mx-auto mb-1 text-amber-600" />
              <div className="text-xs font-bold">Takeaway Pickup</div>
            </button>

            <button
              type="button"
              onClick={() => setOrderType('DELIVERY')}
              className={`p-3 rounded-xl border text-center transition ${
                orderType === 'DELIVERY'
                  ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold ring-1 ring-blue-500'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <MapPin className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
              <div className="text-xs font-bold">Local Delivery</div>
            </button>
          </div>

          {orderType === 'DINE_IN' && (
            <div className="pt-2 text-xs">
              <label className="font-bold text-slate-700 block uppercase tracking-wider mb-1">
                Table Number / Location
              </label>
              <input
                type="text"
                required
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="e.g. T-02"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold font-mono focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          )}
        </div>

        {/* SECTION 3: CUSTOMER INFORMATION */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-3">
          <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
              3
            </span>
            Guest Contact Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block uppercase tracking-wider mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Ananya Sharma"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block uppercase tracking-wider mb-1">
                Mobile Number (For Status Updates) *
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block uppercase tracking-wider mb-1">
                Email Address (Optional receipt)
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="ananya@example.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: DELIVERY INFORMATION (Conditionally rendered) */}
        {orderType === 'DELIVERY' && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-3 animate-in fade-in">
            <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
                4
              </span>
              Delivery Address
            </h2>
            <div className="text-xs">
              <label className="font-bold text-slate-700 block uppercase tracking-wider mb-1">
                Complete Street Address *
              </label>
              <textarea
                rows={2}
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="House / Flat #, Street, Landmark, Sector..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        )}

        {/* SECTION 5: PROMO CODE */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-3">
          <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
              5
            </span>
            Promo Code / Voucher
          </h2>

          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter promo code (e.g. NORD10)"
              className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs uppercase font-bold focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Apply
            </button>
          </form>

          {couponSuccess && (
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {couponSuccess}
            </p>
          )}
        </div>

        {/* SECTION 6: PRICE BREAKDOWN (Reconciling subtotal, cafe GST rate, fees) */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-3">
          <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
              6
            </span>
            Price Breakdown & Taxes
          </h2>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Item Subtotal</span>
              <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Promo Discount ({appliedCoupon})</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Restaurant GST ({taxRate}%)</span>
              <span className="font-semibold text-slate-900">{formatCurrency(tax)}</span>
            </div>

            {packagingFee > 0 && (
              <div className="flex justify-between">
                <span>Takeaway Packaging Fee</span>
                <span className="font-semibold text-slate-900">{formatCurrency(packagingFee)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-black text-base text-slate-900">
              <span>Grand Total Payable</span>
              <span className="text-blue-600 text-lg">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* SECTION 7: PAYMENT METHOD */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-3">
          <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
              7
            </span>
            Payment Mode
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <label
              className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                paymentMethod === 'COUNTER'
                  ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'COUNTER'}
                onChange={() => setPaymentMethod('COUNTER')}
                className="text-blue-600"
              />
              <div>
                <div className="font-bold">Pay at Counter</div>
                <div className="text-[11px] text-slate-500 font-normal">
                  Pay via cash or card after dining
                </div>
              </div>
            </label>

            <label
              className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                paymentMethod === 'RAZORPAY'
                  ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'RAZORPAY'}
                onChange={() => setPaymentMethod('RAZORPAY')}
                className="text-blue-600"
              />
              <div>
                <div className="font-bold">UPI / Cards / Razorpay</div>
                <div className="text-[11px] text-slate-500 font-normal">
                  Instant online payment verification
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* SECTION 8: PLACE ORDER ACTION */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={submitting || cart.length === 0}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-500/25 transition flex items-center justify-between px-6 disabled:opacity-50"
          >
            <span>Confirm & Place Order</span>
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>{formatCurrency(totalAmount)}</span>
            )}
          </button>
          <p className="text-center text-[11px] text-slate-400 mt-2 font-medium">
            By placing your order, your ticket is sent straight to the kitchen dispatch.
          </p>
        </div>
      </main>
    </div>
  );
}
