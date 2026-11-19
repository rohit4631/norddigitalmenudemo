'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  UtensilsCrossed,
  LayoutDashboard,
  Store,
  UserPlus,
  CreditCard,
  Users,
  LogOut,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/v1/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated || (data.user.role !== 'SUPER_ADMIN' && data.user.role !== 'ADMIN_STAFF')) {
          router.push('/login');
        } else {
          setUser(data.user);
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const navItems = [
    { label: 'Platform Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'All Cafes', href: '/admin/cafes', icon: Store },
    { label: 'Assisted Onboarding', href: '/admin/onboarding', icon: UserPlus },
    { label: 'Subscription Plans', href: '/admin/plans', icon: CreditCard },
    { label: 'Users & Staff', href: '/admin/users', icon: Users },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-base text-slate-900 tracking-tight">
                Nord<span className="text-purple-600">Admin</span>
              </div>
              <div className="text-[10px] font-semibold text-purple-700 uppercase tracking-wider">
                Super Admin Panel
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-purple-50 text-purple-700 font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Links */}
        <div className="p-3 border-t border-slate-200 space-y-1">
          <Link
            href="/c/nordic-roast"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            <span>Live Customer Menu</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
          >
            <span>Cafe Owner View</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* User bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="truncate pr-2">
            <div className="text-xs font-bold text-slate-900 truncate">{user.name}</div>
            <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
