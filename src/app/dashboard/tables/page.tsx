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
  Sparkles,
} from 'lucide-react';
import { generateQRCodeDataUrl } from '@/lib/qr';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

export default function DashboardTablesPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewQr, setPreviewQr] = useState<any>(null);
  const { success, error: toastError, info } = useToast();

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/v1/tables');
      const data = await res.json();
      if (data.success) {
        setTables(data.tables);
      }
    } catch {
      toastError('Error', 'Could not load tables.');
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

      success('Table Created', `Table ${tableNumber} is ready with QR code.`);
      setShowAddModal(false);
      setTableNumber('');
      setCapacity(4);
      fetchTables();
    } catch (err: any) {
      setError(err.message);
      toastError('Table Creation Failed', err.message);
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

  const handleDeleteTable = async (tableId: string, tblNum: string) => {
    if (!confirm(`Are you sure you want to delete Table ${tblNum}?`)) return;
    try {
      await fetch(`/api/v1/tables/${tableId}`, { method: 'DELETE' });
      setTables(tables.filter((t) => t.id !== tableId));
      success('Table Deleted', `Table ${tblNum} was removed.`);
    } catch {
      toastError('Delete Failed', 'Could not delete table.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Dining Room & QR Table Management
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dining Tables</h1>
          <p className="text-sm text-slate-500 mt-0.5">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 h-44 animate-pulse" />
          ))}
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
                className={`bg-white rounded-2xl border p-5 shadow-sm transition flex flex-col justify-between hover:shadow-md ${
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
                        <Clock className="w-3 h-3" /> {activeOrderCount} Active Order
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
                    onClick={() => handleDeleteTable(table.id, table.tableNumber)}
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
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New Dining Table"
          subtitle="Generates a unique QR token linked directly to this table."
          maxWidth="max-w-sm"
        >
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mb-3">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateTable} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 uppercase">
                Table Identifier *
              </label>
              <input
                type="text"
                required
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="e.g. T-07 or Rooftop-01"
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 uppercase">
                Seating Capacity (Guests) *
              </label>
              <input
                type="number"
                min={1}
                max={50}
                required
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition flex items-center gap-1.5 shadow-sm"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Create Table'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* QR Code Preview Modal */}
      {previewQr && (
        <Modal
          isOpen={!!previewQr}
          onClose={() => setPreviewQr(null)}
          title={`Table ${previewQr.tableNumber} QR Code`}
          subtitle="Scan to test live table ordering routing."
          maxWidth="max-w-sm"
          footer={
            <div className="flex items-center justify-center gap-2 w-full">
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
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="text-center space-y-3">
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
          </div>
        </Modal>
      )}
    </div>
  );
}
