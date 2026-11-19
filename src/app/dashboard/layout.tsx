'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  BookOpen,
  QrCode,
  TableProperties,
  BarChart3,
  CreditCard,
  Settings,
  ChefHat,
  Users,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { AppSidebar, NavItem } from '@/components/layout/AppSidebar';
import { AppTopNav } from '@/components/layout/AppTopNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [cafe, setCafe] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeOrdersCount, setActiveOrdersCount] = useState<number | undefined>(undefined);

  useEffect(() => {
    fetch('/api/v1/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push('/login');
        } else {
          setUser(data.user);
          if (data.user.role === 'KITCHEN_STAFF') {
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

    // Check active orders count for badge
    fetch('/api/v1/orders?status=ACTIVE')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.orders)) {
          const activeCount = data.orders.filter(
            (o: any) => o.status === 'PENDING' || o.status === 'PREPARING'
          ).length;
          setActiveOrdersCount(activeCount);
        }
      })
      .catch(() => {});
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const navItems: NavItem[] = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard, section: 'OPERATIONS' },
    {
      label: 'Live Orders',
      href: '/dashboard/orders',
      icon: Receipt,
      badge: activeOrdersCount && activeOrdersCount > 0 ? activeOrdersCount : undefined,
      section: 'OPERATIONS',
    },
    { label: 'Kitchen KDS', href: '/kitchen', icon: ChefHat, section: 'OPERATIONS' },
    { label: 'AI Menu Importer', href: '/dashboard/importer', icon: Sparkles, badge: 'AI', section: 'RESTAURANT SETUP' },
    { label: 'Menu Catalog', href: '/dashboard/menu', icon: BookOpen, section: 'RESTAURANT SETUP' },
    { label: 'Dining Tables', href: '/dashboard/tables', icon: TableProperties, section: 'RESTAURANT SETUP' },
    { label: 'QR Code Studio', href: '/dashboard/qr-codes', icon: QrCode, section: 'RESTAURANT SETUP' },
    { label: 'Sales Analytics', href: '/dashboard/analytics', icon: BarChart3, section: 'GROWTH & BILLING' },
    { label: 'Subscription Plan', href: '/dashboard/subscription', icon: CreditCard, section: 'GROWTH & BILLING' },
    { label: 'Team & Staff', href: '/dashboard/staff', icon: Users, section: 'GROWTH & BILLING' },
    { label: 'Cafe Settings', href: '/dashboard/settings', icon: Settings, section: 'CONFIGURATION' },
  ];

  const cafeSlug = cafe?.slug || 'nordic-roast';

  const quickLinks = [
    { label: 'Live Customer Menu', href: `/c/${cafeSlug}`, icon: ExternalLink, external: true },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <AppSidebar
        brandTitle={cafe?.name || 'Nord Cafe'}
        brandSubtitle="Cafe Owner Portal"
        brandColor="bg-blue-600"
        brandTextColor="text-blue-600"
        navItems={navItems}
        user={user}
        onLogout={handleLogout}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        quickLinks={quickLinks}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AppTopNav
          user={user}
          cafe={cafe}
          onToggleSidebar={() => setMobileMenuOpen(true)}
          accentColor="blue"
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
