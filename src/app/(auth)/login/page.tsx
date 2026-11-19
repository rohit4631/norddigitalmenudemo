'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UtensilsCrossed, ShieldCheck, Store, ChefHat, UserCheck, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('owner@nordicroast.com');
  const [password, setPassword] = useState('owner123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPassword?: string) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    const loginEmail = customEmail || email;
    const loginPass = customPassword || password;

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Route based on role
      const role = data.user.role;
      if (role === 'SUPER_ADMIN' || role === 'ADMIN_STAFF') {
        router.push('/admin');
      } else if (role === 'KITCHEN_STAFF') {
        router.push('/kitchen');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (demEmail: string, demPass: string) => {
    setEmail(demEmail);
    setPassword(demPass);
    handleLogin(undefined, demEmail, demPass);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-2">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">
            Nord<span className="text-blue-600">Cafe</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Sign in to your account
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Or{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            register a new cafe
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-slate-200">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Testing Mode Preset Selector */}
          <div className="mb-5 p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-900 mb-2">
              <span>⚡ Testing Mode: Quick Fill Persona</span>
              <span className="text-[10px] text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded font-mono">PRE-FILLED</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  setEmail('owner@nordicroast.com');
                  setPassword('owner123');
                }}
                className={`px-2 py-1.5 rounded-lg border text-left font-medium transition ${
                  email === 'owner@nordicroast.com'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                ☕ Cafe Owner
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@nordcafe.com');
                  setPassword('admin123');
                }}
                className={`px-2 py-1.5 rounded-lg border text-left font-medium transition ${
                  email === 'admin@nordcafe.com'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                👑 Super Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('kitchen@nordicroast.com');
                  setPassword('kitchen123');
                }}
                className={`px-2 py-1.5 rounded-lg border text-left font-medium transition ${
                  email === 'kitchen@nordicroast.com'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                🍳 Kitchen KDS
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('manager@nordicroast.com');
                  setPassword('manager123');
                }}
                className={`px-2 py-1.5 rounded-lg border text-left font-medium transition ${
                  email === 'manager@nordicroast.com'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                👔 Cafe Manager
              </button>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mb-3">
              One-Click Demo Personas
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin@nordcafe.com', 'admin123')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 text-left transition group"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 group-hover:text-purple-700">
                  <ShieldCheck className="w-4 h-4 text-purple-600" /> Super Admin
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 truncate">admin@nordcafe.com</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('owner@nordicroast.com', 'owner123')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-left transition group"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 group-hover:text-blue-700">
                  <Store className="w-4 h-4 text-blue-600" /> Cafe Owner
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 truncate">owner@nordicroast.com</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('manager@nordicroast.com', 'manager123')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 text-left transition group"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 group-hover:text-indigo-700">
                  <UserCheck className="w-4 h-4 text-indigo-600" /> Cafe Manager
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 truncate">manager@nordicroast.com</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('kitchen@nordicroast.com', 'kitchen123')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 text-left transition group"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 group-hover:text-amber-700">
                  <ChefHat className="w-4 h-4 text-amber-600" /> Kitchen KDS
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 truncate">kitchen@nordicroast.com</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
