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
  UtensilsCrossed,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CartItem, FoodType } from '@/types';
import { getStoredCart, saveStoredCart } from '@/lib/cartStore';
import { soundFx } from '@/components/ui/AudioAlert';

export default function CustomerMenuPage({ params }: { params: { slug: string } }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tableParam = searchParams.get('table');

  const [cafe, setCafe] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<'ALL' | 'VEG' | 'NON_VEG' | 'BESTSELLER'>('ALL');
  const [activeCategory, setActiveCategory] = useState<string>('');

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);

  // Selected Item Modal for customization
  const [customizingItem, setCustomizingItem] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');

  useEffect(() => {
    setCart(getStoredCart(params.slug));

    Promise.all([
      fetch(`/api/v1/public/c/${params.slug}`).then((r) => r.json()),
      fetch(`/api/v1/public/c/${params.slug}/menu`).then((r) => r.json()),
    ])
      .then(([cData, mData]) => {
        if (cData.success) setCafe(cData.cafe);
        if (mData.success) {
          setCategories(mData.categories);
          if (mData.categories.length > 0) {
            setActiveCategory(mData.categories[0].id);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [params.slug]);

  useEffect(() => {
    saveStoredCart(params.slug, cart);
  }, [cart, params.slug]);

  // Open customization modal
  const handleOpenItem = (item: any) => {
    if (!item.isAvailable) return;
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
      variant: selectedVariant
        ? { id: selectedVariant.id, name: selectedVariant.name, price: selectedVariant.price }
        : null,
      addons: selectedAddons.map((a) => ({ id: a.id, name: a.name, price: a.price })),
      quantity,
      specialInstructions: specialInstructions.trim() || undefined,
      itemTotalPrice: totalP,
    };

    setCart([...cart, cartLineItem]);
    soundFx.playBlip();
    setCustomizingItem(null);
  };

  const getItemCartQty = (itemId: string) => {
    return cart
      .filter((c) => c.menuItemId === itemId)
      .reduce((sum, c) => sum + c.quantity, 0);
  };

  const handleIncrementItem = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    if (!item.isAvailable) return;
    const hasCustomizations =
      (item.variants && item.variants.length > 0) ||
      (item.menuItemAddonGroups && item.menuItemAddonGroups.length > 0);

    if (hasCustomizations) {
      handleOpenItem(item);
    } else {
      const existingIdx = cart.findIndex(
        (c) => c.menuItemId === item.id && !c.variant && (!c.addons || c.addons.length === 0)
      );
      if (existingIdx > -1) {
        const updated = [...cart];
        updated[existingIdx].quantity += 1;
        updated[existingIdx].itemTotalPrice =
          updated[existingIdx].basePrice * updated[existingIdx].quantity;
        setCart(updated);
        soundFx.playBlip();
      } else {
        const cartLineItem: CartItem = {
          id: `${item.id}_direct_${Date.now()}`,
          menuItemId: item.id,
          name: item.name,
          image: item.image,
          foodType: item.foodType,
          basePrice: item.basePrice,
          variant: null,
          addons: [],
          quantity: 1,
          itemTotalPrice: item.basePrice,
        };
        setCart((prev) => [...prev, cartLineItem]);
        soundFx.playBlip();
      }
    }
  };

  const handleDecrementItem = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    const existingIdx = cart.findLastIndex((c) => c.menuItemId === item.id);
    if (existingIdx > -1) {
      const updated = [...cart];
      if (updated[existingIdx].quantity > 1) {
        updated[existingIdx].quantity -= 1;
        const unitP =
          updated[existingIdx].itemTotalPrice / (updated[existingIdx].quantity + 1);
        updated[existingIdx].itemTotalPrice =
          unitP * updated[existingIdx].quantity;
        setCart(updated);
      } else {
        updated.splice(existingIdx, 1);
        setCart(updated);
      }
      soundFx.playBlip();
    }
  };

  const totalCartCount = cart.reduce((acc, it) => acc + it.quantity, 0);
  const totalCartSubtotal = cart.reduce((acc, it) => acc + it.itemTotalPrice, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <span className="text-xs font-semibold text-slate-500">Loading menu catalog...</span>
      </div>
    );
  }

  if (!cafe) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 mb-3 shadow-sm">
          <UtensilsCrossed className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Cafe Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          This digital menu link is invalid or the restaurant is currently offline.
        </p>
        <Link
          href="/"
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-blue-700 transition"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const primaryColor = cafe.themeColor || '#2563EB';

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      {/* 1. TABLE BANNER (If scanning a dining table QR) */}
      {tableParam && (
        <div className="sticky top-0 z-40 bg-blue-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <TableProperties className="w-4 h-4" />
            <span>
              Dining at Table:{' '}
              <strong className="underline uppercase tracking-wider">{tableParam}</strong>
            </span>
          </div>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
            Contactless Dine-In
          </span>
        </div>
      )}

      {/* 2. REFINED CAFE HEADER & BRANDING (No awkward overlapping) */}
      <div className="max-w-4xl mx-auto px-4 pt-4 sm:pt-6">
        <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          {/* Banner cover */}
          <div className="relative h-40 sm:h-56 w-full bg-slate-900 overflow-hidden">
            {cafe.coverImage ? (
              <img
                src={cafe.coverImage}
                alt={cafe.name}
                className="w-full h-full object-cover opacity-90"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          {/* Profile Details Container */}
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {cafe.logo ? (
                  <img
                    src={cafe.logo}
                    alt={cafe.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white shadow-md bg-white shrink-0 -mt-10 sm:-mt-12 relative z-10"
                  />
                ) : (
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-md shrink-0 -mt-10 sm:-mt-12 relative z-10"
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
                        cafe.isOpen ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {cafe.isOpen ? '● Open Now' : 'Closed'}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">• {cafe.todayHours}</span>
                  </div>
                </div>
              </div>

              {/* Track Order CTA */}
              <Link
                href="/lookup"
                className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition self-start sm:self-auto flex items-center gap-1.5"
              >
                <span>Track Previous Order</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>

            {cafe.description && (
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                {cafe.description}
              </p>
            )}

            {/* Address bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5 truncate pr-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{cafe.branches?.[0]?.address || 'Sector 35-C, Chandigarh'}</span>
              </div>
              {cafe.branches?.[0]?.phone && (
                <div className="flex items-center gap-1.5 shrink-0 font-medium text-slate-600">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{cafe.branches[0].phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. SEARCH & DIETARY FILTER TOOLBAR */}
      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search coffee, pizza, burgers, or ingredients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-white rounded-2xl border border-slate-200 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-slate-400 transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dietary Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold no-scrollbar">
          <button
            onClick={() => setDietaryFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
              dietaryFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Dishes
          </button>
          <button
            onClick={() => setDietaryFilter('VEG')}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
              dietaryFilter === 'VEG'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Pure Veg
          </button>
          <button
            onClick={() => setDietaryFilter('NON_VEG')}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
              dietaryFilter === 'NON_VEG'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-rose-700 hover:bg-rose-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Non-Veg
          </button>
          <button
            onClick={() => setDietaryFilter('BESTSELLER')}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
              dietaryFilter === 'BESTSELLER'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-white border border-slate-200 text-amber-700 hover:bg-amber-50'
            }`}
          >
            ★ Chef Bestsellers
          </button>
        </div>
      </div>

      {/* 4. STICKY HORIZONTAL CATEGORY NAVIGATION */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 py-2.5 mt-4 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map((c) => (
            <a
              key={c.id}
              href={`#cat-${c.id}`}
              onClick={() => setActiveCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeCategory === c.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {c.name}
            </a>
          ))}
        </div>
      </div>

      {/* 5. BALANCED PRODUCT CATALOG (2-Column Grid on Desktop, Clean Compact Rows on Mobile) */}
      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-8">
        {categories.map((cat) => {
          const visibleItems = cat.menuItems.filter((item: any) => {
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
            <div key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-24 space-y-4">
              <div className="flex items-baseline justify-between border-b border-slate-200/80 pb-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  {cat.name}
                </h2>
                <span className="text-xs text-slate-400 font-medium">
                  {visibleItems.length} {visibleItems.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Balanced Food Cards Grid: 1 col on mobile, 2 cols on md+ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                {visibleItems.map((item: any) => {
                  const itemCartQty = getItemCartQty(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleOpenItem(item)}
                      className={`bg-white rounded-3xl border p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-all flex items-start justify-between gap-3 sm:gap-4 relative group cursor-pointer active:scale-[0.99] ${
                        item.isAvailable ? 'border-slate-200/90 hover:border-slate-300' : 'border-slate-200 opacity-60'
                      }`}
                    >
                      {/* Content Left */}
                      <div className="flex-1 min-w-0 pr-1">
                        {/* Title & Dietary Tag */}
                        <div className="flex items-start gap-2">
                          <div
                            className={`w-3.5 h-3.5 mt-0.5 rounded-sm border flex items-center justify-center shrink-0 ${
                              item.foodType === 'NON_VEG'
                                ? 'border-rose-600'
                                : item.foodType === 'EGG'
                                ? 'border-amber-600'
                                : 'border-emerald-600'
                            }`}
                            title={item.foodType}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.foodType === 'NON_VEG'
                                  ? 'bg-rose-600'
                                  : item.foodType === 'EGG'
                                  ? 'bg-amber-600'
                                  : 'bg-emerald-600'
                              }`}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition leading-snug line-clamp-2">
                                {item.name}
                              </h3>
                              {item.isBestseller && (
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                                  ★ Bestseller
                                </span>
                              )}
                            </div>

                            {/* Price & Variant Pill */}
                            <div className="mt-1 flex items-center gap-2">
                              <span className="font-extrabold text-sm sm:text-base text-slate-900">
                                {formatCurrency(item.basePrice)}
                              </span>
                              {item.variants && item.variants.length > 0 && (
                                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                  Customizable
                                </span>
                              )}
                            </div>

                            {/* Description */}
                            {item.description && (
                              <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Image & Interactive Stepper / Add Button Right */}
                      <div className="relative shrink-0 w-28 sm:w-32 flex flex-col items-center">
                        <div className="w-28 h-24 sm:w-32 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs relative">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center text-slate-400">
                              <UtensilsCrossed className="w-6 h-6 mb-1 text-slate-300" />
                              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">Fresh</span>
                            </div>
                          )}
                        </div>

                        {/* Stepper or ADD Button */}
                        {item.isAvailable ? (
                          <div className="mt-[-16px] z-10">
                            {itemCartQty > 0 ? (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center bg-white border-2 border-emerald-600 rounded-xl shadow-md overflow-hidden"
                              >
                                <button
                                  type="button"
                                  onClick={(e) => handleDecrementItem(e, item)}
                                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 font-extrabold text-sm transition"
                                >
                                  <Minus className="w-3.5 h-3.5 stroke-[3]" />
                                </button>
                                <span className="px-2 font-black text-xs sm:text-sm text-emerald-700 select-none">
                                  {itemCartQty}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => handleIncrementItem(e, item)}
                                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 font-extrabold text-sm transition"
                                >
                                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => handleIncrementItem(e, item)}
                                className="px-4 py-1.5 sm:px-5 sm:py-1.5 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition active:scale-95 flex items-center gap-1 uppercase tracking-wider"
                              >
                                <span>ADD</span>
                                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="mt-[-12px] z-10 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-400 rounded-lg text-[10px] font-bold shadow-xs">
                            SOLD OUT
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 6. PRODUCT CUSTOMIZATION MODAL */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col justify-between">
            {/* Modal Image & Header */}
            <div>
              <div className="relative">
                {customizingItem.image && (
                  <img
                    src={customizingItem.image}
                    alt={customizingItem.name}
                    className="w-full h-48 sm:h-52 object-cover"
                  />
                )}
                <button
                  onClick={() => setCustomizingItem(null)}
                  className="absolute top-3 right-3 p-1.5 bg-white/90 backdrop-blur-md text-slate-700 hover:text-slate-900 rounded-full shadow-md transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">
                      {customizingItem.name}
                    </h2>
                    <span className="text-base font-extrabold text-blue-600">
                      {formatCurrency(
                        selectedVariant ? selectedVariant.price : customizingItem.basePrice
                      )}
                    </span>
                  </div>
                  {customizingItem.description && (
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {customizingItem.description}
                    </p>
                  )}
                </div>

                {/* Variants Selection (if dish has multiple sizes/variants) */}
                {customizingItem.variants && customizingItem.variants.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Choose Size / Option *
                    </label>
                    <div className="space-y-1.5">
                      {customizingItem.variants.map((v: any) => (
                        <label
                          key={v.id}
                          className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer text-xs transition ${
                            selectedVariant?.id === v.id
                              ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="variant"
                              checked={selectedVariant?.id === v.id}
                              onChange={() => setSelectedVariant(v)}
                              className="text-blue-600"
                            />
                            <span>{v.name}</span>
                          </div>
                          <span>{formatCurrency(v.price)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add-ons Checklist */}
                {customizingItem.menuItemAddonGroups &&
                  customizingItem.menuItemAddonGroups.length > 0 && (
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      {customizingItem.menuItemAddonGroups.map((grp: any) => (
                        <div key={grp.addonGroup.id} className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                            {grp.addonGroup.name} (Optional)
                          </label>
                          <div className="space-y-1.5">
                            {grp.addonGroup.options.map((opt: any) => {
                              const isChecked = selectedAddons.some((a) => a.id === opt.id);
                              return (
                                <label
                                  key={opt.id}
                                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer text-xs transition ${
                                    isChecked
                                      ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-semibold'
                                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => toggleAddon(opt)}
                                      className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span>{opt.name}</span>
                                  </div>
                                  <span>+{formatCurrency(opt.price)}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                {/* Special Instructions */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Special Cooking Instructions
                  </label>
                  <input
                    type="text"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g. Less spicy, extra hot water on side"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Modal Bottom Stepper & Add Button */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-extrabold text-sm text-slate-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-between px-4 transition active:scale-98"
              >
                <span>Add to Cart</span>
                <span>
                  {formatCurrency(
                    ((selectedVariant ? selectedVariant.price : customizingItem.basePrice) +
                      selectedAddons.reduce((acc, a) => acc + a.price, 0)) *
                      quantity
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. ENHANCED FLOATING CART BAR (Safe-area compliant, slide-up animation) */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 inset-x-0 z-40 px-4 max-w-lg mx-auto animate-in slide-in-from-bottom-4 duration-200">
          <Link
            href={`/c/${params.slug}/checkout${tableParam ? `?table=${tableParam}` : ''}`}
            className="flex items-center justify-between p-3.5 bg-slate-900 text-white rounded-2xl shadow-xl hover:bg-slate-800 transition group border border-slate-800"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-extrabold text-xs">
                {totalCartCount}
              </div>
              <div>
                <div className="font-extrabold text-sm">
                  {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'} in cart
                </div>
                <div className="text-xs text-slate-400">
                  Subtotal: <strong className="text-white">{formatCurrency(totalCartSubtotal)}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400 group-hover:text-blue-300">
              <span>View Cart / Checkout</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
