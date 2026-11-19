'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function DashboardOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [rejectModalOrder, setRejectModalOrder] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('Kitchen overwhelmed with peak rush');

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/v1/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 4000); // Live real-time polling
    return () => clearInterval(interval);
  }, []);

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
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          const updatedRes = await fetch(`/api/v1/orders/${orderId}`);
          const updatedData = await updatedRes.json();
          if (updatedData.success) setSelectedOrder(updatedData.order);
        }
      }
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
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ACCEPTED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'PREPARING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'READY':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Live Order Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time incoming orders from QR tables, takeaway, and counter. Auto-refreshes every 4 seconds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            className="p-2 border border-slate-300 rounded-xl bg-white hover:bg-slate-50 text-slate-600 transition shadow-sm"
            title="Refresh now"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
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

      {/* Orders Grid / List */}
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
                      <Eye className="w-3.5 h-3.5" /> View Details
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

                {/* Totals */}
                <div className="space-y-1 text-right">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount:</span>
                      <span>-{formatCurrency(selectedOrder.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>GST (5%):</span>
                    <span>{formatCurrency(selectedOrder.taxAmount)}</span>
                  </div>
                  {selectedOrder.packagingFee > 0 && (
                    <div className="flex justify-between">
                      <span>Packaging Fee:</span>
                      <span>{formatCurrency(selectedOrder.packagingFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-sm border-t border-slate-900 pt-1 text-slate-900">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 text-left pt-1">
                    Payment Method: {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})
                  </div>
                </div>
              </div>

              {/* Status History Timeline */}
              <div className="no-print pt-4 border-t border-slate-100">
                <div className="text-xs font-bold uppercase text-slate-500 mb-2">Audit History</div>
                <div className="space-y-2">
                  {selectedOrder.statusHistory?.map((h: any) => (
                    <div key={h.id} className="text-xs flex items-center justify-between text-slate-600">
                      <span>
                        <strong className="text-slate-800">{h.newStatus}</strong> by {h.changedBy}
                      </span>
                      <span className="text-[10px] text-slate-400">{formatDateTime(h.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 text-sm">
              <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              Select an order from the list to view full receipt and audit history.
            </div>
          )}
        </div>
      </div>

      {/* Reject Order Modal */}
      {rejectModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-slate-900">
              Reject Order {rejectModalOrder.orderNumber}?
            </h3>
            <p className="text-sm text-slate-600">
              Specify the reason for rejection. This will be recorded in the audit log and visible on the customer's order tracker.
            </p>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Rejection Reason
              </label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl p-2.5 bg-white"
              >
                <option value="Item ingredients out of stock">Item ingredients out of stock</option>
                <option value="Kitchen overwhelmed with peak rush">Kitchen overwhelmed with peak rush</option>
                <option value="Cafe closing soon">Cafe closing soon</option>
                <option value="Invalid delivery address / unreachable">Invalid delivery address / unreachable</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => updateOrderStatus(rejectModalOrder.id, 'REJECTED', rejectionReason)}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-xl hover:bg-rose-700"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
