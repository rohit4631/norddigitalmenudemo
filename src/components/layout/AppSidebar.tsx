'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  UtensilsCrossed,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  section?: string;
}

interface AppSidebarProps {
  brandTitle: string;
  brandSubtitle: string;
  brandColor?: string; // e.g. 'bg-blue-600' | 'bg-purple-600'
  brandTextColor?: string;
  navItems: NavItem[];
  user: {
    name: string;
    email: string;
    role: string;
  };
  onLogout: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  quickLinks?: { label: string; href: string; icon?: LucideIcon; external?: boolean }[];
}

export function AppSidebar({
  brandTitle,
  brandSubtitle,
  brandColor = 'bg-blue-600',
  brandTextColor = 'text-blue-600',
  navItems,
  user,
  onLogout,
  mobileOpen,
  onMobileClose,
  quickLinks = [],
}: AppSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Group items by section if needed
  const sections: { title?: string; items: NavItem[] }[] = [];
  let currentSection: { title?: string; items: NavItem[] } = { items: [] };

  navItems.forEach((item) => {
    if (item.section && item.section !== currentSection.title) {
      if (currentSection.items.length > 0) {
        sections.push(currentSection);
      }
      currentSection = { title: item.section, items: [item] };
    } else {
      currentSection.items.push(item);
    }
  });
  if (currentSection.items.length > 0) {
    sections.push(currentSection);
  }

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white select-none">
      {/* Top Header */}
      <div>
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <Link
            href={navItems[0]?.href || '/'}
            className="flex items-center gap-3 overflow-hidden"
          >
            <div
              className={`h-10 w-10 rounded-xl ${brandColor} text-white flex items-center justify-center shrink-0 shadow-md`}
            >
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="font-extrabold text-base text-slate-900 tracking-tight truncate">
                  {brandTitle}
                </div>
                <div
                  className={`text-[10px] font-bold uppercase tracking-wider ${brandTextColor} truncate`}
                >
                  {brandSubtitle}
                </div>
              </div>
            )}
          </Link>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-180px)]">
          {sections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {sec.title && !collapsed && (
                <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {sec.title}
                </div>
              )}
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onMobileClose}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? `${brandColor} text-white font-semibold shadow-sm`
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 shrink-0 ${
                        isActive ? 'text-white' : 'text-slate-400'
                      }`}
                    />
                    {!collapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}
                    {!collapsed && item.badge !== undefined && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Area: Quick Links + User Card */}
      <div className="border-t border-slate-200">
        {quickLinks.length > 0 && !collapsed && (
          <div className="p-3 border-b border-slate-100 space-y-1">
            {quickLinks.map((link, idx) => {
              const LinkIcon = link.icon;
              return (
                <Link
                  key={idx}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50/70 rounded-xl transition"
                >
                  <span className="truncate">{link.label}</span>
                  {LinkIcon && <LinkIcon className="w-3.5 h-3.5 shrink-0 text-slate-400" />}
                </Link>
              );
            })}
          </div>
        )}

        {/* User Card */}
        <div className="p-3 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="min-w-0 pr-2">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {user.name}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {user.email}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={onLogout}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block shrink-0 border-r border-slate-200 bg-white transition-all duration-200 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Slide-out Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
