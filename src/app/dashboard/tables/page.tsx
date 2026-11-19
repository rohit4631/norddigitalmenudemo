'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TableProperties,
  Plus,
  QrCode,
  Download,
  Users,
  CheckCircle2,
  Clock,
  Loader2,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { generateQRCodeDataUrl } from '@/lib/qr';

export default function DashboardTablesPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewQr, setPreviewQr] = useState<any>(null);

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/v1/tables');
      const data = await res.json();
      if (data.success) {
        setTables(data.tables);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/v1/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNumber, capacity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create table');

      setShowAddModal(false);
      setTableNumber('');
      setCapacity(4);
      fetchTables();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenQr = async (table: any) => {
    const fullUrl = `${window.location.origin}/qr/${table.qrCode?.token || ''}`;
    const dataUrl = await generateQRCodeDataUrl(fullUrl);
    setPreviewQr({
      tableNumber: table.tableNumber,
      fullUrl,
      dataUrl,
    });
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return;
    try {
      await fetch(`/api/v1/tables/${tableId}`, { method: 'DELETE' });
      setTables(tables.filter((t) => t.id !== tableId));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dining Tables</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your restaurant tables, seating capacity, real-time occupancy, and table QRs.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-blue-700 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" /> Add Table
        </button>
      </div>

      {/* Tables Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : tables.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 text-sm">
          No dining tables configured yet. Click "Add Table" to generate your first table QR code.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tables.map((table) => {
            const isOccupied = table.status === 'OCCUPIED';
            const activeOrderCount = table.orders?.length || 0;

            return (
              <div
                key={table.id}
                className={`bg-white rounded-2xl border p-5 shadow-sm transition flex flex-col justify-between ${
                  isOccupied
                    ? 'border-amber-300 ring-1 ring-amber-400/30'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-extrabold text-xl text-slate-900">
                      {table.tableNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isOccupied
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {table.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Capacity: {table.capacity} guests</span>
                  </div>

                  <div className="mt-2 text-xs text-slate-600">
                    {activeOrderCount > 0 ? (
                      <span className="text-blue-600 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {activeOrderCount} Active Dine-in Order
                      </span>
                    ) : (
                      <span className="text-slate-400">No active orders</span>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleOpenQr(table)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <QrCode className="w-3.5 h-3.5" /> Table QR
                  </button>

                  <button
                    onClick={() => handleDeleteTable(table.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete table"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Table Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-slate-900 border-b border-slate-100 pb-3">
              Add New Dining Table
            </h3>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateTable} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 uppercase">Table Number / Identifier</label>
                <input
                  type="text"
                  required
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="e.g. T-07 or Rooftop-01"
                  className="mt-1 w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 uppercase">Seating Capacity (Guests)</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="mt-1 w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Create Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Preview & Print Modal */}
      {previewQr && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <h3 className="font-bold text-lg text-slate-900">
              Table {previewQr.tableNumber} QR Code
            </h3>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block mx-auto">
              <img
                src={previewQr.dataUrl}
                alt="Table QR Code"
                className="w-48 h-48 mx-auto rounded-lg shadow-sm"
              />
            </div>

            <p className="text-xs text-slate-500 font-mono break-all px-2">
              {previewQr.fullUrl}
            </p>

            <div className="flex items-center justify-center gap-2 pt-2">
              <a
                href={previewQr.dataUrl}
                download={`Table-${previewQr.tableNumber}-QR.png`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
              >
                <Download className="w-3.5 h-3.5" /> Download PNG
              </a>
              <button
                type="button"
                onClick={() => setPreviewQr(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
