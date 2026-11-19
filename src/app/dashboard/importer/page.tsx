'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCw,
  Trash2,
  Eye,
  FileSpreadsheet,
  FileImage,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

interface ImportRecord {
  id: string;
  menuName: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PUBLISHED' | 'ARCHIVED';
  processingProgress: number;
  totalCategories: number;
  totalItems: number;
  currency: string;
  createdAt: string;
  publishedAt?: string | null;
  errorMessage?: string | null;
  user: {
    name: string;
    email: string;
  };
  files: Array<{
    id: string;
    originalFilename: string;
    fileSize: number;
    mimeType: string;
    processingStatus: string;
  }>;
}

export default function MenuImporterHistoryPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [imports, setImports] = useState<ImportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ImportRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const fetchImports = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/menu-imports?status=${statusFilter}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setImports(data.data);
      }
    } catch (err) {
      console.error('Failed to load imports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImports();
  }, [statusFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/v1/menu-imports/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Import session deleted successfully', 'success');
        setImports((prev) => prev.filter((i) => i.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to delete import session', 'error');
      }
    } catch (err) {
      showToast('Network error while deleting import', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleRetry = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setRetryingId(id);
      const res = await fetch(`/api/v1/menu-imports/${id}/retry`, { method: 'POST' });
      if (res.ok) {
        showToast('Extraction restarted in background', 'success');
        fetchImports();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to retry extraction', 'error');
      }
    } catch (err) {
      showToast('Network error while retrying', 'error');
    } finally {
      setRetryingId(null);
    }
  };

  const filteredImports = imports.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.menuName.toLowerCase().includes(q) ||
      item.files.some((f) => f.originalFilename.toLowerCase().includes(q)) ||
      item.user.name.toLowerCase().includes(q)
    );
  });

  const stats = {
    total: imports.length,
    completed: imports.filter((i) => i.status === 'COMPLETED' || i.status === 'PUBLISHED').length,
    published: imports.filter((i) => i.status === 'PUBLISHED').length,
    processing: imports.filter((i) => i.status === 'PROCESSING').length,
    failed: imports.filter((i) => i.status === 'FAILED').length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge variant="success">Published to Live Menu</Badge>;
      case 'COMPLETED':
        return <Badge variant="primary">Ready for Review</Badge>;
      case 'PROCESSING':
        return <Badge variant="warning">AI Extracting...</Badge>;
      case 'FAILED':
        return <Badge variant="danger">Extraction Failed</Badge>;
      default:
        return <Badge variant="neutral">Draft Pending</Badge>;
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText className="w-4 h-4 text-rose-500" />;
    if (['xlsx', 'xls', 'csv'].includes(ext || '')) return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) return <FileImage className="w-4 h-4 text-blue-500" />;
    return <FileText className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">AI Menu Importer</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Automatically convert existing paper menus, PDFs, Excel sheets, and photos into a digital menu.
          </p>
        </div>

        <Link href="/dashboard/importer/new">
          <Button variant="primary" className="gap-2 shadow-sm">
            <Plus className="w-4 h-4" />
            New Menu Import
          </Button>
        </Link>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Imports</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{stats.total}</p>
          <p className="mt-1 text-xs text-slate-400">All uploaded sessions</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Published Menus</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{stats.published}</p>
          <p className="mt-1 text-xs text-slate-400">Live in digital catalog</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Ready for Review</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">{stats.completed - stats.published}</p>
          <p className="mt-1 text-xs text-slate-400">Awaiting owner approval</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Processing / Failed</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {stats.processing + stats.failed}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {stats.processing} active, {stats.failed} failed
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {[
                { label: 'All Sessions', value: 'ALL' },
                { label: 'Completed', value: 'COMPLETED' },
                { label: 'Published', value: 'PUBLISHED' },
                { label: 'Processing', value: 'PROCESSING' },
                { label: 'Failed', value: 'FAILED' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors ${
                    statusFilter === tab.value
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by menu or file..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import Sessions List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-700">Loading import sessions...</p>
        </div>
      ) : filteredImports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">No menu imports found</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            {searchQuery
              ? 'No imports match your search criteria. Try a different query.'
              : 'Upload your restaurant menu in PDF, Word, Excel, CSV, or photo format to automatically create a structured digital menu.'}
          </p>
          <div className="mt-6">
            <Link href="/dashboard/importer/new">
              <Button variant="primary" className="gap-2">
                <Plus className="w-4 h-4" />
                Upload Your First Menu
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden divide-y divide-slate-100">
          {filteredImports.map((item) => (
            <div
              key={item.id}
              onClick={() => router.push(`/dashboard/importer/${item.id}`)}
              className="p-5 hover:bg-slate-50/70 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h4 className="text-base font-semibold text-slate-900 truncate">
                    {item.menuName}
                  </h4>
                  {getStatusBadge(item.status)}
                </div>

                <div className="mt-2 flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span>•</span>
                  <span>
                    Uploaded by: <strong className="text-slate-700">{item.user.name}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    <strong>{item.totalCategories}</strong> Categories
                  </span>
                  <span>•</span>
                  <span>
                    <strong>{item.totalItems}</strong> Products
                  </span>
                </div>

                {/* Files List Pills */}
                {item.files.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    {item.files.map((file) => (
                      <span
                        key={file.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium"
                      >
                        {getFileIcon(file.originalFilename)}
                        <span className="truncate max-w-[200px]">{file.originalFilename}</span>
                        <span className="text-slate-400 text-[10px]">
                          ({(file.fileSize / 1024).toFixed(0)} KB)
                        </span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Progress bar if processing */}
                {item.status === 'PROCESSING' && (
                  <div className="mt-3 max-w-md">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span className="font-medium text-amber-600">Extracting menu contents...</span>
                      <span>{item.processingProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.processingProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Error message if failed */}
                {item.status === 'FAILED' && item.errorMessage && (
                  <p className="mt-2 text-xs text-rose-600 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    {item.errorMessage}
                  </p>
                )}
              </div>

              {/* Right Actions */}
              <div
                className="flex items-center gap-2 shrink-0 self-end md:self-center"
                onClick={(e) => e.stopPropagation()}
              >
                {item.status === 'FAILED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    loading={retryingId === item.id}
                    onClick={(e) => handleRetry(item.id, e)}
                    className="gap-1.5 text-xs text-amber-700 hover:text-amber-800"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    Retry
                  </Button>
                )}

                <Link href={`/dashboard/importer/${item.id}`}>
                  <Button variant={item.status === 'COMPLETED' ? 'primary' : 'outline'} size="sm" className="gap-1 text-xs">
                    {item.status === 'PUBLISHED' ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        View Extraction
                      </>
                    ) : item.status === 'COMPLETED' ? (
                      <>
                        Review & Edit
                        <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                      </>
                    ) : (
                      <>
                        Details
                        <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                      </>
                    )}
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteTarget(item)}
                  className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title={`Delete "${deleteTarget.menuName}"?`}
          description="Are you sure you want to delete this import session and its uploaded source files? This action cannot be undone."
          confirmText="Delete Import Session"
          variant="danger"
          loading={deleting}
        />
      )}
    </div>
  );
}
