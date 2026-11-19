'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  BookOpen,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  Tag,
  Clock,
  Sparkles,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function DashboardMenuPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showItemModal, setShowItemModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);

  // Form State
  const [itemForm, setItemForm] = useState<any>({
    categoryId: '',
    name: '',
    description: '',
    basePrice: '',
    image: '',
    foodType: 'VEG',
    preparationMinutes: 12,
    isFeatured: false,
    isBestseller: false,
    variants: [
      { name: 'Regular', price: '', isDefault: true },
    ],
  });

  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [csvContent, setCsvContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchMenu = async () => {
    try {
      const [catRes, itemRes] = await Promise.all([
        fetch('/api/v1/categories'),
        fetch('/api/v1/menu-items'),
      ]);
      const catData = await catRes.json();
      const itemData = await itemRes.json();

      if (catData.success) setCategories(catData.categories);
      if (itemData.success) {
        setItems(itemData.items);
        if (catData.categories.length > 0 && !itemForm.categoryId) {
          setItemForm((prev: any) => ({ ...prev, categoryId: catData.categories[0].id }));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleToggleAvailability = async (itemId: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/v1/menu-items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !currentStatus }),
      });
      setItems(items.map((it) => (it.id === itemId ? { ...it, isAvailable: !currentStatus } : it)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: catName, description: catDesc }),
      });
      const data = await res.json();
      if (data.success) {
        setCatName('');
        setCatDesc('');
        setShowCatModal(false);
        fetchMenu();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const cleanVariants = itemForm.variants
        .filter((v: any) => v.name && v.price)
        .map((v: any) => ({ ...v, price: Number(v.price) }));

      const res = await fetch('/api/v1/menu-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...itemForm,
          basePrice: Number(itemForm.basePrice),
          variants: cleanVariants,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create item');

      setShowItemModal(false);
      setItemForm({
        categoryId: categories[0]?.id || '',
        name: '',
        description: '',
        basePrice: '',
        image: '',
        foodType: 'VEG',
        preparationMinutes: 12,
        isFeatured: false,
        isBestseller: false,
        variants: [{ name: 'Regular', price: '', isDefault: true }],
      });
      fetchMenu();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCsvImport = async () => {
    if (!csvContent.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/menus/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCsvModal(false);
        setCsvContent('');
        fetchMenu();
      } else {
        alert(data.error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = items.filter((it) => {
    if (selectedCatId === 'ALL') return true;
    return it.categoryId === selectedCatId;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Menu Catalog</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your categories, food items, variants, prices, and stock availability.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowCsvModal(true)}
            className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition flex items-center gap-1.5 shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Bulk CSV Import
          </button>
          <button
            onClick={() => setShowCatModal(true)}
            className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Add Category
          </button>
          <button
            onClick={() => setShowItemModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-blue-700 transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Food Item
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-sm">
        <button
          onClick={() => setSelectedCatId('ALL')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition ${
            selectedCatId === 'ALL'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Items ({items.length})
        </button>

        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCatId(c.id)}
            className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition ${
              selectedCatId === c.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {c.name} ({items.filter((it) => it.categoryId === c.id).length})
          </button>
        ))}
      </div>

      {/* Food Items Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 text-sm">
          No food items in this category yet. Click "Add Food Item" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div>
                <div className="flex gap-4">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded-xl object-cover shrink-0 bg-slate-100"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          item.foodType === 'VEG'
                            ? 'bg-emerald-500'
                            : item.foodType === 'NON_VEG'
                            ? 'bg-rose-500'
                            : 'bg-amber-500'
                        }`}
                        title={item.foodType}
                      />
                      <span className="font-bold text-sm text-slate-900 truncate">{item.name}</span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {item.description || 'No description provided.'}
                    </p>

                    <div className="mt-2 text-sm font-extrabold text-slate-900">
                      {formatCurrency(item.basePrice)}
                    </div>
                  </div>
                </div>

                {/* Badges & Variants */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    {item.isBestseller && (
                      <span className="bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded text-[10px]">
                        ★ Bestseller
                      </span>
                    )}
                    {item.variants && item.variants.length > 0 && (
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">
                        {item.variants.length} Sizes
                      </span>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3 text-slate-400" /> {item.preparationMinutes} min
                  </span>
                </div>
              </div>

              {/* Stock Toggle */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  {item.isAvailable ? (
                    <span className="text-emerald-600 font-bold">In Stock</span>
                  ) : (
                    <span className="text-rose-600 font-bold">Sold Out</span>
                  )}
                </span>

                <button
                  onClick={() => handleToggleAvailability(item.id, item.isAvailable)}
                  className={`text-xs px-3 py-1 rounded-lg font-semibold transition ${
                    item.isAvailable
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {item.isAvailable ? 'Mark Sold Out' : 'Mark Available'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="font-bold text-lg text-slate-900 border-b border-slate-100 pb-3">
              Add New Food Item
            </h3>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateItem} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 uppercase">Category</label>
                  <select
                    value={itemForm.categoryId}
                    onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                    className="mt-1 w-full p-2.5 border border-slate-300 rounded-xl bg-white text-sm"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 uppercase">Dietary Type</label>
                  <select
                    value={itemForm.foodType}
                    onChange={(e) => setItemForm({ ...itemForm, foodType: e.target.value })}
                    className="mt-1 w-full p-2.5 border border-slate-300 rounded-xl bg-white text-sm"
                  >
                    <option value="VEG">Vegetarian (Green)</option>
                    <option value="NON_VEG">Non-Vegetarian (Red)</option>
                    <option value="EGG">Egg (Yellow)</option>
                    <option value="VEGAN">Vegan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 uppercase">Item Name</label>
                <input
                  type="text"
                  required
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="e.g. Avocado Toast on Sourdough"
                  className="mt-1 w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 uppercase">Description</label>
                <textarea
                  rows={2}
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  placeholder="Ingredients, taste notes, and craftsmanship..."
                  className="mt-1 w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 uppercase">Base Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={itemForm.basePrice}
                    onChange={(e) => setItemForm({ ...itemForm, basePrice: e.target.value })}
                    placeholder="249"
                    className="mt-1 w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 uppercase">Prep Time (mins)</label>
                  <input
                    type="number"
                    value={itemForm.preparationMinutes}
                    onChange={(e) => setItemForm({ ...itemForm, preparationMinutes: e.target.value })}
                    className="mt-1 w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 uppercase">Image URL (Unsplash or Cloudinary)</label>
                <input
                  type="url"
                  value={itemForm.image}
                  onChange={(e) => setItemForm({ ...itemForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="mt-1 w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={itemForm.isFeatured}
                    onChange={(e) => setItemForm({ ...itemForm, isFeatured: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  Featured on Home
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={itemForm.isBestseller}
                    onChange={(e) => setItemForm({ ...itemForm, isBestseller: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  Bestseller Tag
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-slate-900 border-b border-slate-100 pb-3">
              Create New Category
            </h3>

            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 uppercase">Category Name</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Sourdough Bagels"
                  className="mt-1 w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 uppercase">Description (optional)</label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Brief note about this category..."
                  className="mt-1 w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-slate-900 border-b border-slate-100 pb-3">
              Bulk CSV Menu Importer
            </h3>
            <p className="text-xs text-slate-600">
              Columns: Category, Item Name, Description, Price, Food Type, Prep Time.
            </p>

            <textarea
              rows={8}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder="Category,Item Name,Description,Price,Food Type,Prep Time&#10;Cold Brews,Nitro Cold Brew,Creamy stout pour,199,VEG,3"
              className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl bg-slate-50"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCsvModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCsvImport}
                disabled={submitting}
                className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700"
              >
                {submitting ? 'Importing...' : 'Import CSV'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
