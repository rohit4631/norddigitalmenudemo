'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  Bell,
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Command,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface AppTopNavProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
  cafe?: {
    name: string;
    slug: string;
  } | null;
  onToggleSidebar?: () => void;
  breadcrumbs?: { label: string; href?: string }[];
  accentColor?: string; // 'blue' | 'purple'
}

export function AppTopNav({
  user,
  cafe,
  onToggleSidebar,
  breadcrumbs,
  accentColor = 'blue',
}: AppTopNavProps) {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Auto-generate breadcrumbs if not provided
  const segments = pathname.split('/').filter(Boolean);
  const derivedCrumbs = breadcrumbs || [
    { label: segments[0] === 'admin' ? 'Super Admin' : 'Cafe Dashboard', href: `/${segments[0]}` },
    ...segments.slice(1).map((seg, idx) => ({
      label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
      href: `/${segments.slice(0, idx + 2).join('/')}`,
    })),
  ];

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        {/* Left: Mobile hamburger & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumbs */}
          <nav className="hidden sm:flex items-center text-xs font-medium text-slate-500 gap-1.5">
            {derivedCrumbs.map((crumb, idx) => {
              const isLast = idx === derivedCrumbs.length - 1;
              return (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="hover:text-slate-800 transition py-1"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-semibold text-slate-900 py-1">
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Right side: Quick Search trigger, Notifications, Live Public Link & Role badge */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search Trigger */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl border border-slate-200 text-xs transition"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search or jump to...</span>
            <span className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono text-slate-400">
              ⌘K
            </span>
          </button>

          {/* Customer preview link */}
          {cafe && (
            <Link
              href={`/c/${cafe.slug}`}
              target="_blank"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100/70 text-blue-700 text-xs font-semibold rounded-xl border border-blue-200/60 transition"
            >
              <span>Customer View</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}

          {/* Live System Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[11px] font-medium text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Operational</span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-600">
                    Notifications & Alerts
                  </span>
                  <span className="text-[11px] text-blue-600 font-semibold cursor-pointer">
                    Mark all read
                  </span>
                </div>
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  <div className="p-3.5 hover:bg-slate-50 transition flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-slate-800">
                        Prisma Engine & DB Connected
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        PostgreSQL instance synced on port 5432.
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">Just now</span>
                    </div>
                  </div>
                  <div className="p-3.5 hover:bg-slate-50 transition flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-slate-800">
                        Interactive Menu QR Live
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Table tent cards and takeaway stickers ready to print.
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">10 mins ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User role pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight">{user.name}</div>
              <div className="text-[10px] font-medium text-slate-500 leading-tight">{user.role}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Search Modal */}
      {showSearchModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
          onClick={() => setShowSearchModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                autoFocus
                placeholder="Search orders, dishes, cafes, or settings..."
                className="w-full text-sm outline-none text-slate-800 placeholder:text-slate-400"
              />
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-xs text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded"
              >
                ESC
              </button>
            </div>
            <div className="p-3 text-xs text-slate-500 space-y-1">
              <div className="px-2 py-1 font-semibold text-[11px] uppercase tracking-wider text-slate-400">
                Quick Navigation
              </div>
              <Link
                href="/dashboard/orders"
                onClick={() => setShowSearchModal(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 transition"
              >
                <span>Live Orders Kanban</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                href="/dashboard/menu"
                onClick={() => setShowSearchModal(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 transition"
              >
                <span>Menu Catalog & Dishes</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                href="/kitchen"
                onClick={() => setShowSearchModal(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 transition"
              >
                <span>Kitchen Display System (KDS)</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                href="/c/nordic-roast"
                target="_blank"
                onClick={() => setShowSearchModal(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 transition"
              >
                <span>Customer Digital Menu (Dine-in)</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
