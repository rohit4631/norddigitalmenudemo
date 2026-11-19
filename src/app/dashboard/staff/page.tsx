'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  ChefHat,
  Store,
  Loader2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';

export default function DashboardStaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('Rahul Verma');
  const [email, setEmail] = useState('rahul.kitchen@nordicroast.com');
  const [phone, setPhone] = useState('9876543210');
  const [password, setPassword] = useState('Staff123!');
  const [roleName, setRoleName] = useState('KITCHEN_STAFF');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: toastError } = useToast();

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/v1/staff');
      const data = await res.json();
      if (data.success) {
        setStaff(data.staff);
      }
    } catch {
      toastError('Error', 'Could not load staff list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/v1/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, roleName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add staff member');

      success('Staff Member Added', `${name} invited as ${roleName}.`);
      setShowAddModal(false);
      setName('');
      setEmail('');
      setPhone('');
      fetchStaff();
    } catch (err: any) {
      setError(err.message);
      toastError('Invite Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Staff Member',
      accessorKey: 'user',
      sortable: true,
      cell: (s) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs shrink-0">
            {s.user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-slate-900">{s.user?.name}</div>
            <div className="text-xs text-slate-500 font-mono">{s.user?.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Role Assignment',
      cell: (s) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          {s.role?.name === 'KITCHEN_STAFF' ? (
            <ChefHat className="w-3.5 h-3.5 text-amber-600" />
          ) : (
            <Store className="w-3.5 h-3.5 text-blue-600" />
          )}
          {s.role?.name}
        </span>
      ),
    },
    {
      header: 'Assigned Branch',
      cell: (s) => (
        <span className="text-xs text-slate-700 font-medium">
          {s.branch?.name || 'All Branches'}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (s) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {s.user?.status || 'ACTIVE'}
        </span>
      ),
    },
    {
      header: 'Joined Date',
      className: 'text-right',
      cell: (s) => (
        <span className="text-xs text-slate-400">{formatDate(s.user?.createdAt)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Team Members & Operational Access
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Staff & Roles</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your kitchen chefs, branch managers, and team member permissions.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-blue-700 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" /> Invite Staff Member
        </button>
      </div>

      {loading ? (
        <SkeletonTable rows={4} cols={5} />
      ) : (
        <DataTable
          data={staff}
          columns={columns}
          searchPlaceholder="Search staff by name or email..."
          searchKey={(s) => `${s.user?.name || ''} ${s.user?.email || ''} ${s.role?.name || ''}`}
          pageSize={10}
          exportFileName="cafe-staff-roster"
          emptyState={{
            title: 'No staff members found',
            description: 'Click "Invite Staff Member" to add kitchen staff or branch managers.',
          }}
        />
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Invite Staff Member"
          subtitle="Provisions login access to assigned cafe dashboards."
          maxWidth="max-w-md"
        >
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mb-3">
              {error}
            </div>
          )}

          <form onSubmit={handleAddStaff} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 uppercase">Staff Member Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jaspreet Kaur"
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 uppercase">Work Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="chef@cafe.com"
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 uppercase">Role *</label>
              <select
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
              >
                <option value="KITCHEN_STAFF">Kitchen Staff (KDS Preparation Tablet)</option>
                <option value="CAFE_MANAGER">Cafe Manager (Orders & Dining Tables)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 uppercase">Initial Password *</label>
              <input
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full px-3 py-2 font-mono border border-slate-200 rounded-xl text-sm"
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
                {submitting ? 'Saving...' : 'Add Team Member'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
