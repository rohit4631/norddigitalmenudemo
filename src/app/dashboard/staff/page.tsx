'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, ChefHat, Store, Loader2, ShieldCheck } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function DashboardStaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('Staff123!');
  const [roleName, setRoleName] = useState('KITCHEN_STAFF');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/v1/staff');
      const data = await res.json();
      if (data.success) {
        setStaff(data.staff);
      }
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

      setShowAddModal(false);
      setName('');
      setEmail('');
      setPhone('');
      fetchStaff();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Staff & Roles</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your kitchen chefs, branch managers, and team member permissions.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-blue-700 transition flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Invite Staff Member
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Name & Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Assigned Branch</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Added On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staff.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{s.user.name}</div>
                      <div className="text-xs text-slate-400">{s.user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {s.role.name === 'KITCHEN_STAFF' ? (
                          <ChefHat className="w-3.5 h-3.5" />
                        ) : (
                          <Store className="w-3.5 h-3.5" />
                        )}
                        {s.role.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-700 font-medium">
                      {s.branch?.name || 'All Branches'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        {s.user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-slate-400">
                      {formatDate(s.user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-slate-900 border-b border-slate-100 pb-3">
              Invite Staff Member
            </h3>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleAddStaff} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 uppercase">Staff Member Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jaspreet Kaur"
                  className="mt-1 w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 uppercase">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="chef@cafe.com"
                  className="mt-1 w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 uppercase">Role</label>
                <select
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="mt-1 w-full p-2.5 border border-slate-300 rounded-xl text-sm bg-white"
                >
                  <option value="KITCHEN_STAFF">Kitchen Staff (KDS preparation)</option>
                  <option value="CAFE_MANAGER">Cafe Manager (Orders & Tables)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 uppercase">Password</label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full p-2.5 font-mono border border-slate-300 rounded-xl text-sm"
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
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700"
                >
                  {submitting ? 'Saving...' : 'Add Team Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
