'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  UtensilsCrossed,
  LayoutDashboard,
  Receipt,
  BookOpen,
  QrCode,
  TableProperties,
  BarChart3,
  CreditCard,
  Settings,
  LogOut,
  ExternalLink,
  ChefHat,
  Bell,
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [cafe, setCafe] = useState<any>(null);

  useEffect(() => {
    fetch('/api/v1/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push('/login');
        } else {
          setUser(data.user);
          // If kitchen staff, route directly to kitchen
          if (data.user.role === 'KITCHEN_STAFF' && !pathname.startsWith('/kitchen')) {
            router.push('/kitchen');
          }
        }
      })
      .catch(() => router.push('/login'));

    fetch('/api/v1/cafes/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCafe(data.cafe);
        }
      });
  }, [router, pathname]);

  const handleLogout = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Live Orders', href: '/dashboard/orders', icon: Receipt },
    { label: 'Menu Catalog', href: '/dashboard/menu', icon: BookOpen },
    { label: 'Dining Tables', href: '/dashboard/tables', icon: TableProperties },
    { label: 'QR Code Studio', href: '/dashboard/qr-codes', icon: QrCode },
    { label: 'Kitchen KDS', href: '/kitchen', icon: ChefHat },
    { label: 'Sales Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Subscription Plan', href: '/dashboard/subscription', icon: CreditCard },
    { label: 'Cafe Settings', href: '/dashboard/settings', icon: Settings },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const cafeSlug = cafe?.slug || 'nordic-roast';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-base text-slate-900 tracking-tight truncate">
                {cafe?.name || 'Nord Cafe'}
              </div>
              <div className="text-[11px] font-semibold text-blue-600">
                Cafe Owner Portal
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
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Public Menu link */}
        <div className="p-3 border-t border-slate-200">
          <Link
            href={`/c/${cafeSlug}`}
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 transition"
          >
            <span>Customer Menu Preview</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* User profile bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="truncate pr-2">
            <div className="text-xs font-bold text-slate-900 truncate">{user.name}</div>
            <div className="text-[11px] text-slate-500 truncate">{user.role}</div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
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
