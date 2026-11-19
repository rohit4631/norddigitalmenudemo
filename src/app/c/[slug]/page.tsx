'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  ShoppingBag,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Plus,
  Minus,
  Check,
  X,
  Sparkles,
  ArrowRight,
  Loader2,
  TableProperties,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CartItem, FoodType } from '@/types';
import { getStoredCart, saveStoredCart } from '@/lib/cartStore';

export default function CustomerMenuPage({ params }: { params: { slug: string } }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tableParam = searchParams.get('table');

  const [cafe, setCafe] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<'ALL' | 'VEG' | 'NON_VEG' | 'BESTSELLER'>('ALL');

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);

  // Selected Item Modal for customization
  const [customizingItem, setCustomizingItem] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');

  useEffect(() => {
    // Load stored cart
    setCart(getStoredCart(params.slug));

    Promise.all([
      fetch(`/api/v1/public/c/${params.slug}`).then((r) => r.json()),
      fetch(`/api/v1/public/c/${params.slug}/menu`).then((r) => r.json()),
    ])
      .then(([cData, mData]) => {
        if (cData.success) setCafe(cData.cafe);
        if (mData.success) setCategories(mData.categories);
      })
      .finally(() => setLoading(false));
  }, [params.slug]);

  // Sync cart to localStorage whenever updated
  useEffect(() => {
    saveStoredCart(params.slug, cart);
  }, [cart, params.slug]);

  // Open customization modal
  const handleOpenItem = (item: any) => {
    setCustomizingItem(item);
    const defaultVar = item.variants?.find((v: any) => v.isDefault) || item.variants?.[0] || null;
    setSelectedVariant(defaultVar);
    setSelectedAddons([]);
    setQuantity(1);
    setSpecialInstructions('');
  };

  const toggleAddon = (addon: any) => {
    if (selectedAddons.some((a) => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  // Add customized item to cart
  const handleAddToCart = () => {
    if (!customizingItem) return;

    const baseP = selectedVariant ? selectedVariant.price : customizingItem.basePrice;
    const addonsP = selectedAddons.reduce((acc, a) => acc + a.price, 0);
    const unitP = baseP + addonsP;
    const totalP = unitP * quantity;

    const cartLineItem: CartItem = {
      id: `${customizingItem.id}_${selectedVariant?.id || 'none'}_${Date.now()}`,
      menuItemId: customizingItem.id,
      name: customizingItem.name,
      image: customizingItem.image,
      foodType: customizingItem.foodType,
      basePrice: customizingItem.basePrice,
      variant: selectedVariant ? { id: selectedVariant.id, name: selectedVariant.name, price: selectedVariant.price } : null,
      addons: selectedAddons.map((a) => ({ id: a.id, name: a.name, price: a.price })),
      quantity,
      specialInstructions: specialInstructions.trim() || undefined,
      itemTotalPrice: totalP,
    };

    setCart([...cart, cartLineItem]);
    setCustomizingItem(null);
  };

  const updateCartItemQuantity = (cartItemId: string, delta: number) => {
    const updated = cart
      .map((item) => {
        if (item.id === cartItemId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          const unitPrice = item.itemTotalPrice / item.quantity;
          return {
            ...item,
            quantity: newQty,
            itemTotalPrice: unitPrice * newQty,
          };
        }
        return item;
      })
      .filter(Boolean) as CartItem[];

    setCart(updated);
  };

  const totalCartCount = cart.reduce((acc, it) => acc + it.quantity, 0);
  const totalCartSubtotal = cart.reduce((acc, it) => acc + it.itemTotalPrice, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!cafe) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-slate-900">Cafe Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">
          This digital menu link is invalid or the restaurant is temporarily offline.
        </p>
        <Link href="/" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold">
          Return Home
        </Link>
      </div>
    );
  }

  const primaryColor = cafe.themeColor || '#2563EB';

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Table Detected Notification Banner */}
      {tableParam && (
        <div className="sticky top-0 z-40 bg-blue-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <TableProperties className="w-4 h-4" />
            <span>Ordering at Table: <strong className="underline uppercase tracking-wide">{tableParam}</strong></span>
          </div>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">QR Verified</span>
        </div>
      )}

      {/* Hero Cover Banner */}
      <div className="relative h-48 sm:h-64 w-full bg-slate-900 overflow-hidden">
        {cafe.coverImage ? (
          <img
            src={cafe.coverImage}
            alt={cafe.name}
            className="w-full h-full object-cover opacity-85"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-700 to-indigo-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />
      </div>

      {/* Cafe Profile Header */}
      <div className="max-w-3xl mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200/80 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {cafe.logo ? (
                <img
                  src={cafe.logo}
                  alt={cafe.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white shadow-md bg-white shrink-0"
                />
              ) : (
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-md shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  {cafe.name.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                  {cafe.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      cafe.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {cafe.isOpen ? '● Open Now' : 'Closed'}
                  </span>
                  <span className="text-xs text-slate-500">• {cafe.todayHours}</span>
                </div>
              </div>
            </div>
          </div>

          {cafe.description && (
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {cafe.description}
            </p>
          )}

          {/* Location & Social Quick Links */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate max-w-xs">{cafe.branches?.[0]?.address || 'Main Branch'}</span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/lookup`}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                Track Order
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Dietary Filters */}
      <div className="max-w-3xl mx-auto px-4 mt-6 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search cappuccino, pizza, desserts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
          <button
            onClick={() => setDietaryFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-full transition whitespace-nowrap ${
              dietaryFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setDietaryFilter('VEG')}
            className={`px-3.5 py-1.5 rounded-full transition whitespace-nowrap flex items-center gap-1.5 ${
              dietaryFilter === 'VEG'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Veg Only
          </button>
          <button
            onClick={() => setDietaryFilter('NON_VEG')}
            className={`px-3.5 py-1.5 rounded-full transition whitespace-nowrap flex items-center gap-1.5 ${
              dietaryFilter === 'NON_VEG'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-rose-700 hover:bg-rose-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Non-Veg
          </button>
          <button
            onClick={() => setDietaryFilter('BESTSELLER')}
            className={`px-3.5 py-1.5 rounded-full transition whitespace-nowrap flex items-center gap-1.5 ${
              dietaryFilter === 'BESTSELLER'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-white border border-slate-200 text-amber-700 hover:bg-amber-50'
            }`}
          >
            ★ Bestsellers
          </button>
        </div>
      </div>

      {/* Sticky Category Tabs */}
      <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md border-b border-slate-200 py-3 mt-4">
        <div className="max-w-3xl mx-auto px-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map((c) => (
            <a
              key={c.id}
              href={`#cat-${c.id}`}
              className="px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-400 shadow-sm transition"
            >
              {c.name}
            </a>
          ))}
        </div>
      </div>

      {/* Menu Categories & Items List */}
      <div className="max-w-3xl mx-auto px-4 mt-6 space-y-10">
        {categories.map((cat) => {
          let visibleItems = cat.menuItems.filter((item: any) => {
            const matchesSearch =
              !search ||
              item.name.toLowerCase().includes(search.toLowerCase()) ||
              (item.description && item.description.toLowerCase().includes(search.toLowerCase()));

            if (!matchesSearch) return false;

            if (dietaryFilter === 'VEG') return item.foodType === 'VEG' || item.foodType === 'VEGAN';
            if (dietaryFilter === 'NON_VEG') return item.foodType === 'NON_VEG';
            if (dietaryFilter === 'BESTSELLER') return item.isBestseller;

            return true;
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-20 space-y-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {cat.name}
                </h2>
                {cat.description && (
                  <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>
                )}
              </div>

              <div className="space-y-4">
                {visibleItems.map((item: any) => (
                  <div
                    key={item.id}
                    onClick={() => handleOpenItem(item)}
                    className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm hover:border-slate-300 transition cursor-pointer flex justify-between gap-4 group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {/* Veg / Non-Veg Indicator */}
                        <div
                          className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 ${
                            item.foodType === 'NON_VEG'
                              ? 'border-rose-600 text-rose-600'
                              : 'border-emerald-600 text-emerald-600'
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.foodType === 'NON_VEG' ? 'bg-rose-600' : 'bg-emerald-600'
                            }`}
                          />
                        </div>

                        <span className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition truncate">
                          {item.name}
                        </span>

                        {item.isBestseller && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 shrink-0">
                            ★ Bestseller
                          </span>
                        )}
                      </div>

                      <div className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {item.description}
                      </div>

                      <div className="mt-3 flex items-center gap-3">
                        <span className="font-extrabold text-base text-slate-900">
                          {formatCurrency(item.basePrice)}
                        </span>
                        {item.variants && item.variants.length > 0 && (
                          <span className="text-[10px] font-medium text-slate-400">
                            Customizable
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Image & Add Button */}
                    <div className="relative shrink-0 flex flex-col items-center">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover bg-slate-100"
                        />
                      ) : (
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                          Nord Cafe
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenItem(item);
                        }}
                        className="mt-[-16px] px-5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-extrabold text-blue-600 shadow-md hover:bg-blue-50 transition"
                      >
                        ADD
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Product Detail Customization Modal */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div className="relative">
              {customizingItem.image && (
                <img
                  src={customizingItem.image}
                  alt={customizingItem.name}
                  className="w-full h-48 sm:h-56 object-cover"
                />
              )}
              <button
                onClick={() => setCustomizingItem(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      customizingItem.foodType === 'NON_VEG' ? 'bg-rose-600' : 'bg-emerald-600'
                    }`}
                  />
                  <h3 className="text-xl font-extrabold text-slate-900">
                    {customizingItem.name}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {customizingItem.description}
                </p>
              </div>

              {/* Variants / Sizes Selection */}
              {customizingItem.variants && customizingItem.variants.length > 0 && (
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <div className="text-xs font-bold uppercase text-slate-700">Select Size</div>
                  <div className="grid grid-cols-2 gap-2">
                    {customizingItem.variants.map((v: any) => {
                      const isSel = selectedVariant?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariant(v)}
                          className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                            isSel
                              ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-500'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span className="text-xs font-bold text-slate-800">{v.name}</span>
                          <span className="text-xs font-extrabold text-slate-900">{formatCurrency(v.price)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Addons Selection */}
              {customizingItem.menuItemAddonGroups && customizingItem.menuItemAddonGroups.length > 0 && (
                <div className="space-y-4 border-t border-slate-100 pt-4">
                  {customizingItem.menuItemAddonGroups.map((ag: any) => (
                    <div key={ag.addonGroup.id} className="space-y-2">
                      <div className="text-xs font-bold uppercase text-slate-700">
                        {ag.addonGroup.name}
                      </div>
                      <div className="space-y-2">
                        {ag.addonGroup.options.map((opt: any) => {
                          const isChecked = selectedAddons.some((a) => a.id === opt.id);
                          return (
                            <label
                              key={opt.id}
                              onClick={() => toggleAddon(opt)}
                              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition text-xs ${
                                isChecked
                                  ? 'border-blue-600 bg-blue-50/40 text-blue-900'
                                  : 'border-slate-200 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                                    isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                                  }`}
                                >
                                  {isChecked && <Check className="w-3 h-3" />}
                                </div>
                                <span className="font-medium">{opt.name}</span>
                              </div>
                              <span className="font-bold">+{formatCurrency(opt.price)}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Special Instructions */}
              <div className="border-t border-slate-100 pt-4">
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Special Kitchen Note
                </label>
                <input
                  type="text"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Extra hot, less sugar, no ice..."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Modal Bottom Bar with Quantity & Add Button */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center border border-slate-300 rounded-xl bg-white p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-sm px-3 text-slate-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Total Price & Add to Cart */}
              {(() => {
                const base = selectedVariant ? selectedVariant.price : customizingItem.basePrice;
                const addonsTot = selectedAddons.reduce((acc, a) => acc + a.price, 0);
                const finalTot = (base + addonsTot) * quantity;
                return (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-extrabold shadow-md flex items-center justify-between transition"
                  >
                    <span>Add to Order</span>
                    <span>{formatCurrency(finalTot)}</span>
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Cart Bar */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-4 left-0 right-0 z-40 px-4">
          <div className="max-w-md mx-auto bg-slate-950 text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between border border-slate-800 animate-in slide-in-from-bottom">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-sm">
                {totalCartCount}
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400">Total Bill (excl. tax)</div>
                <div className="text-base font-extrabold text-white">
                  {formatCurrency(totalCartSubtotal)}
                </div>
              </div>
            </div>

            <Link
              href={`/c/${params.slug}/checkout${tableParam ? `?table=${tableParam}` : ''}`}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              View Cart & Pay <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
