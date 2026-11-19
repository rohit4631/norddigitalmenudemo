'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Loader2, CheckCircle2, Store, CreditCard, Shield } from 'lucide-react';

export default function DashboardSettingsPage() {
  const [cafe, setCafe] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/cafes/me').then((r) => r.json()),
      fetch('/api/v1/cafes/me/settings').then((r) => r.json()),
    ]).then(([cData, sData]) => {
      if (cData.success) setCafe(cData.cafe);
      if (sData.success) setSettings(sData.settings);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      await Promise.all([
        fetch('/api/v1/cafes/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cafe),
        }),
        fetch('/api/v1/cafes/me/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings),
        }),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Cafe Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure your restaurant branding, ordering rules, GST taxation, and contact channels.
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Settings saved successfully! Changes are live on your customer menu.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Branding & Profile */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Restaurant Identity & Theme
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 uppercase">Cafe Name</label>
              <input
                type="text"
                required
                value={cafe.name || ''}
                onChange={(e) => setCafe({ ...cafe, name: e.target.value })}
                className="mt-1 w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 uppercase">Menu Slug</label>
              <input
                type="text"
                required
                value={cafe.slug || ''}
                onChange={(e) => setCafe({ ...cafe, slug: e.target.value })}
                className="mt-1 w-full p-2.5 font-mono border border-slate-300 rounded-xl text-sm text-blue-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-semibold text-slate-700 uppercase">Description / Bio</label>
              <textarea
                rows={2}
                value={cafe.description || ''}
                onChange={(e) => setCafe({ ...cafe, description: e.target.value })}
                className="mt-1 w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 uppercase">Logo Image URL</label>
              <input
                type="url"
                value={cafe.logo || ''}
                onChange={(e) => setCafe({ ...cafe, logo: e.target.value })}
                className="mt-1 w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 uppercase">Cover Banner Image URL</label>
              <input
                type="url"
                value={cafe.coverImage || ''}
                onChange={(e) => setCafe({ ...cafe, coverImage: e.target.value })}
                className="mt-1 w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 uppercase">Brand Primary Accent Color</label>
              <div className="mt-1 flex items-center gap-3">
                <input
                  type="color"
                  value={cafe.themeColor || '#2563EB'}
                  onChange={(e) => setCafe({ ...cafe, themeColor: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                />
                <span className="font-mono text-sm text-slate-700">{cafe.themeColor || '#2563EB'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Taxes & Ordering Rules */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Taxation, Fees & Ordering Controls
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 uppercase">Tax Rate (% GST)</label>
              <input
                type="number"
                step="0.1"
                value={settings?.taxRatePercent ?? 5.0}
                onChange={(e) => setSettings({ ...settings, taxRatePercent: e.target.value })}
                className="mt-1 w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 uppercase">Takeaway Packaging Fee (₹)</label>
              <input
                type="number"
                value={settings?.packagingFee ?? 0}
                onChange={(e) => setSettings({ ...settings, packagingFee: e.target.value })}
                className="mt-1 w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 uppercase">Min Order Value (₹)</label>
              <input
                type="number"
                value={settings?.minOrderValue ?? 0}
                onChange={(e) => setSettings({ ...settings, minOrderValue: e.target.value })}
                className="mt-1 w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-6 text-sm text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={settings?.orderingEnabled ?? true}
                onChange={(e) => setSettings({ ...settings, orderingEnabled: e.target.checked })}
                className="rounded text-blue-600"
              />
              Accept Online Orders
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={settings?.dineInEnabled ?? true}
                onChange={(e) => setSettings({ ...settings, dineInEnabled: e.target.checked })}
                className="rounded text-blue-600"
              />
              Table Dine-in
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={settings?.takeawayEnabled ?? true}
                onChange={(e) => setSettings({ ...settings, takeawayEnabled: e.target.checked })}
                className="rounded text-blue-600"
              />
              Takeaway Pickup
            </label>
          </div>
        </div>

        {/* Legal & Compliance */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Business Compliance & Licenses
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 uppercase">GSTIN (Optional)</label>
              <input
                type="text"
                value={cafe.gstin || ''}
                onChange={(e) => setCafe({ ...cafe, gstin: e.target.value })}
                placeholder="03AAAAA0000A1Z5"
                className="mt-1 w-full p-2.5 border border-slate-300 rounded-xl text-sm font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 uppercase">FSSAI License # (Where applicable)</label>
              <input
                type="text"
                value={cafe.fssai || ''}
                onChange={(e) => setCafe({ ...cafe, fssai: e.target.value })}
                placeholder="10020011000543"
                className="mt-1 w-full p-2.5 border border-slate-300 rounded-xl text-sm font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow flex items-center gap-2 transition"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
