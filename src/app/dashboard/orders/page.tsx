'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Receipt,
  Clock,
  CheckCircle2,
  XCircle,
  ChefHat,
  Printer,
  Search,
  Filter,
  AlertCircle,
  Loader2,
  RefreshCw,
  Bell,
  Eye,
  Volume2,
  VolumeX,
  LayoutGrid,
  List,
  Sparkles,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { soundFx } from '@/components/ui/AudioAlert';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

export default function DashboardOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [rejectModalOrder, setRejectModalOrder] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('Kitchen overwhelmed with peak rush');
  const previousPendingIdsRef = useRef<Set<string>>(new Set());
  const { success, error, info } = useToast();

  const fetchOrders = async (silent = false) => {
    try {
      const res = await fetch('/api/v1/orders');
      const data = await res.json();
      if (data.success) {
        const newOrders = data.orders || [];
        setOrders(newOrders);

        // Sound chime detection for newly arriving PENDING orders
        const currentPendingIds = new Set<string>(
          newOrders
            .filter((o: any) => o.status === 'PENDING')
            .map((o: any) => String(o.id))
        );

        if (!loading && previousPendingIdsRef.current.size > 0 && soundEnabled) {
          const hasNewPending = Array.from(currentPendingIds).some(
            (id) => !previousPendingIdsRef.current.has(id as string)
          );
          if (hasNewPending) {
            soundFx.playNewOrderChime();
            info('New Order Received', 'A new table order just arrived!');
          }
        }
        previousPendingIdsRef.current = currentPendingIds;
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(true), 4000);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  const updateOrderStatus = async (orderId: string, status: string, reason?: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/v1/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          rejectionReason: reason,
        }),
      });

      if (res.ok) {
        if (status === 'READY' || status === 'COMPLETED') {
          soundFx.playOrderReadyChime();
        } else {
          soundFx.playBlip();
        }
        success('Order Updated', `Order status changed to ${status}`);
        fetchOrders(true);
        if (selectedOrder?.id === orderId) {
          const updatedRes = await fetch(`/api/v1/orders/${orderId}`);
          const updatedData = await updatedRes.json();
          if (updatedData.success) setSelectedOrder(updatedData.order);
        }
      } else {
        error('Update Failed', 'Could not update order status.');
      }
    } catch {
      error('Network Error', 'Check your connection.');
    } finally {
      setUpdatingId(null);
      setRejectModalOrder(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'ALL') return true;
    return o.status === activeTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ACCEPTED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'PREPARING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'READY':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Real-time Table & Takeaway Orders
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Live Order Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Auto-refreshes every 4s with synthesized audio alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 border rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm ${
              soundEnabled
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-slate-300 text-slate-500'
            }`}
            title={soundEnabled ? 'Audio Alerts Enabled' : 'Audio Alerts Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Chime On' : 'Chime Off'}</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
              title="Kanban View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => fetchOrders()}
            className="p-2 border border-slate-300 rounded-xl bg-white hover:bg-slate-50 text-slate-600 transition shadow-sm"
            title="Refresh now"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Filter Tabs (List Mode) */}
      {viewMode === 'list' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-sm">
          {['ALL', 'PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'REJECTED'].map((tab) => {
            const count = tab === 'ALL' ? orders.length : orders.filter((o) => o.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition flex items-center gap-2 ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{tab === 'PENDING' ? 'New Orders' : tab}</span>
                <span
                  className={`text-xs px-1.5 py-0.2 rounded-full ${
                    activeTab === tab ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-4">
          {(
            [
              { status: 'PENDING', label: 'New / Incoming', color: 'border-blue-300 bg-blue-50/30' },
              { status: 'PREPARING', label: 'In Kitchen Prep', color: 'border-amber-300 bg-amber-50/30' },
              { status: 'READY', label: 'Ready for Service', color: 'border-purple-300 bg-purple-50/30' },
              { status: 'COMPLETED', label: 'Completed / Billed', color: 'border-emerald-300 bg-emerald-50/30' },
            ] as const
          ).map((col) => {
            const colOrders = orders.filter((o) =>
              col.status === 'PREPARING'
                ? o.status === 'PREPARING' || o.status === 'ACCEPTED'
                : o.status === col.status
            );
            return (
              <div key={col.status} className={`p-4 rounded-2xl border ${col.color} flex flex-col min-h-[500px]`}>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 mb-3">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                    {col.label}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-slate-800 border border-slate-200 shadow-sm">
                    {colOrders.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[650px] pr-1">
                  {colOrders.length === 0 ? (
                    <div className="text-xs text-slate-400 text-center py-12">No orders in this stage</div>
                  ) : (
                    colOrders.map((ord) => (
                      <div
                        key={ord.id}
                        onClick={() => setSelectedOrder(ord)}
                        className={`bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer space-y-2 ${
                          selectedOrder?.id === ord.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-900 text-xs">
                            {ord.orderNumber}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {ord.orderType === 'DINE_IN' ? `T-${ord.tableNumber || '?'}` : ord.orderType}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-800 truncate">
                          {ord.customerName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {ord.items.length} items • {formatCurrency(ord.totalAmount)}
                        </div>
                        {/* Quick action */}
                        <div className="pt-2 border-t border-slate-100 flex justify-end">
                          {ord.status === 'PENDING' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateOrderStatus(ord.id, 'PREPARING');
                              }}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-semibold"
                            >
                              Prep
                            </button>
                          )}
                          {(ord.status === 'PREPARING' || ord.status === 'ACCEPTED') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateOrderStatus(ord.id, 'READY');
                              }}
                              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-semibold"
                            >
                              Mark Ready
                            </button>
                          )}
                          {ord.status === 'READY' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateOrderStatus(ord.id, 'COMPLETED');
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {loading && orders.length === 0 ? (
              <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 text-sm">
                No orders found in {activeTab} status.
              </div>
            ) : (
              filteredOrders.map((ord) => {
                const itemCount = ord.items.reduce((acc: number, it: any) => acc + it.quantity, 0);
                return (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`bg-white p-5 rounded-2xl border transition cursor-pointer shadow-sm ${
                      selectedOrder?.id === ord.id
                        ? 'border-blue-600 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-base text-slate-900">
                          {ord.orderNumber}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {ord.orderType === 'DINE_IN' ? `Table ${ord.tableNumber || '-'}` : ord.orderType}
                        </span>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getStatusBadge(
                            ord.status
                          )}`}
                        >
                          {ord.status}
                        </span>
                      </div>

                      <div className="text-right">
                        <div className="font-extrabold text-base text-slate-900">
                          {formatCurrency(ord.totalAmount)}
                        </div>
                        <div className="text-[11px] text-slate-400">{formatDateTime(ord.createdAt)}</div>
                      </div>
                    </div>

                    {/* Customer info & items */}
                    <div className="mt-3 text-xs text-slate-600 flex items-center justify-between border-t border-slate-100 pt-2.5">
                      <div>
                        <span className="font-semibold text-slate-800">{ord.customerName}</span> (
                        {ord.customerPhone})
                      </div>
                      <div className="font-medium text-slate-500">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'} • Payment:{' '}
                        <span className="font-bold text-slate-800">{ord.paymentMethod}</span> (
                        {ord.paymentStatus})
                      </div>
                    </div>

                    {ord.notes && (
                      <div className="mt-2 text-xs bg-amber-50 border border-amber-200 text-amber-800 p-2 rounded-xl">
                        <strong>Customer note:</strong> {ord.notes}
                      </div>
                    )}

                    {/* Quick Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        {ord.status === 'PENDING' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateOrderStatus(ord.id, 'ACCEPTED');
                              }}
                              disabled={updatingId === ord.id}
                              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                            >
                              Accept Order
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setRejectModalOrder(ord);
                              }}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {ord.status === 'ACCEPTED' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(ord.id, 'PREPARING');
                            }}
                            disabled={updatingId === ord.id}
                            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                          >
                            <ChefHat className="w-3.5 h-3.5" /> Start Preparing
                          </button>
                        )}

                        {ord.status === 'PREPARING' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(ord.id, 'READY');
                            }}
                            disabled={updatingId === ord.id}
                            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                          >
                            Mark Ready for Serving
                          </button>
                        )}

                        {ord.status === 'READY' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(ord.id, 'COMPLETED');
                            }}
                            disabled={updatingId === ord.id}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Complete Order
                          </button>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(ord);
                        }}
                        className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Receipt
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Selected Order Receipt & Details Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-6 h-fit">
            {selectedOrder ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <div className="font-mono font-bold text-lg text-slate-900">
                      {selectedOrder.orderNumber}
                    </div>
                    <div className="text-xs text-slate-500">{formatDateTime(selectedOrder.createdAt)}</div>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition no-print"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print Bill
                  </button>
                </div>

                {/* Printable Receipt Container */}
                <div id="printable-receipt" className="space-y-4 text-xs text-slate-700 font-mono">
                  <div className="text-center pb-2 border-b border-dashed border-slate-300">
                    <div className="font-bold text-sm text-slate-900">NORD CAFE</div>
                    <div>Tax Invoice / Kitchen Receipt</div>
                    <div>Order #: {selectedOrder.orderNumber}</div>
                    <div>Type: {selectedOrder.orderType} {selectedOrder.tableNumber ? `(Table ${selectedOrder.tableNumber})` : ''}</div>
                  </div>

                  <div>
                    <div><strong>Customer:</strong> {selectedOrder.customerName}</div>
                    <div><strong>Phone:</strong> {selectedOrder.customerPhone}</div>
                    {selectedOrder.deliveryAddress && <div><strong>Address:</strong> {selectedOrder.deliveryAddress}</div>}
                  </div>

                  {/* Items */}
                  <div className="border-t border-b border-dashed border-slate-300 py-2 space-y-2">
                    {selectedOrder.items.map((it: any) => (
                      <div key={it.id}>
                        <div className="flex justify-between font-bold">
                          <span>{it.quantity}x {it.itemName} {it.variantName ? `(${it.variantName})` : ''}</span>
                          <span>{formatCurrency(it.subtotalPrice)}</span>
                        </div>
                        {it.addons && it.addons.length > 0 && (
                          <div className="pl-4 text-[11px] text-slate-500">
                            {it.addons.map((ad: any) => (
                              <div key={ad.id} className="flex justify-between">
                                <span>+ {ad.addonName}</span>
                                <span>+{formatCurrency(ad.price)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Total calculation */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(selectedOrder.subtotal)}</span>
                    </div>
                    {selectedOrder.taxAmount > 0 && (
                      <div className="flex justify-between">
                        <span>GST / Taxes:</span>
                        <span>{formatCurrency(selectedOrder.taxAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-dashed border-slate-300">
                      <span>TOTAL DUE:</span>
                      <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs">
                <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                Select any order on the left to inspect customer details or print KOT bill.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOrder && (
        <Modal
          isOpen={!!rejectModalOrder}
          onClose={() => setRejectModalOrder(null)}
          title={`Reject Order ${rejectModalOrder.orderNumber}`}
          subtitle="Customer will be notified of cancellation."
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Select reason for rejecting this order:
            </p>
            <div className="space-y-2">
              {[
                'Kitchen overwhelmed with peak rush',
                'Ingredients or dish out of stock',
                'Kitchen closed for the day',
                'Customer requested cancellation',
              ].map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                    rejectionReason === reason
                      ? 'border-rose-400 bg-rose-50 text-rose-900 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    checked={rejectionReason === reason}
                    onChange={() => setRejectionReason(reason)}
                    className="text-rose-600"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectModalOrder(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => updateOrderStatus(rejectModalOrder.id, 'REJECTED', rejectionReason)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
