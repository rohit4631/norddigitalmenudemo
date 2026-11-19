'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Shield, ShieldCheck, Store, ChefHat, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('NordStaff2026!');
  const [roleName, setRoleName] = useState('ADMIN_STAFF');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/v1/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/v1/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, roleName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');

      setShowAddModal(false);
      setName('');
      setEmail('');
      fetchUsers();
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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Platform Users & Staff</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage super administrators, operations staff, and cafe personnel across the system.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-purple-700 transition flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Add Platform Staff
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Name & Email</th>
                  <th className="px-6 py-4">Assigned Role</th>
                  <th className="px-6 py-4">Associated Cafe</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const role = u.userRoles?.[0]?.role?.name || 'CUSTOMER';
                  const cafeName = u.userRoles?.[0]?.cafe?.name || 'Platform Level';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-xs text-slate-400">{u.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                          {role === 'SUPER_ADMIN' ? (
                            <ShieldCheck className="w-3.5 h-3.5" />
                          ) : role === 'CAFE_OWNER' ? (
                            <Store className="w-3.5 h-3.5" />
                          ) : role === 'KITCHEN_STAFF' ? (
                            <ChefHat className="w-3.5 h-3.5" />
                          ) : (
                            <Shield className="w-3.5 h-3.5" />
                          )}
                          {role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-800">
                        {cafeName}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-slate-400">
                        {formatDate(u.createdAt)}
                      </td>
                    </tr>
                  );
                })}
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
              Add Platform Admin / Staff
            </h3>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikram Joshi"
                  className="mt-1 w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 uppercase">Work Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@nordcafe.com"
                  className="mt-1 w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 uppercase">Platform Role</label>
                <select
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="mt-1 w-full p-2.5 border border-slate-300 rounded-xl text-sm bg-white"
                >
                  <option value="ADMIN_STAFF">Admin Staff (Support & Onboarding)</option>
                  <option value="SUPER_ADMIN">Super Admin (Unrestricted Access)</option>
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
                  className="px-5 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-700"
                >
                  {submitting ? 'Creating...' : 'Create Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
