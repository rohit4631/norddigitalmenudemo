'use client';

import Link from 'next/link';
import {
  QrCode,
  Smartphone,
  ChefHat,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  UtensilsCrossed,
  Store,
  Receipt,
  Users,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                Nord<span className="text-blue-600">Cafe</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                SaaS v1.0
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition">Features</a>
            <a href="#demos" className="hover:text-blue-600 transition">Live Demos</a>
            <a href="#pricing" className="hover:text-blue-600 transition">Pricing</a>
            <a href="#onboarding" className="hover:text-blue-600 transition">Assisted Setup</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition flex items-center gap-1.5"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Next-Generation Restaurant & Cafe SaaS Platform
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Digital Menus. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">
              Smarter Restaurants.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Move seamlessly from printed paper menus to an interactive digital restaurant experience. Generate QR codes, accept live table orders, streamline kitchen preparation, and scale your business.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/c/nordic-roast"
              className="px-6 py-3.5 bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Smartphone className="w-5 h-5" /> View Public Customer Menu
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3.5 bg-white border border-slate-300 text-slate-800 font-semibold rounded-xl hover:bg-slate-50 transition flex items-center gap-2 shadow-sm"
            >
              <Store className="w-5 h-5 text-blue-600" /> Cafe Owner Portal
            </Link>
            <Link
              href="/kitchen"
              className="px-6 py-3.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition flex items-center gap-2 shadow-sm"
            >
              <ChefHat className="w-5 h-5 text-amber-400" /> Kitchen KDS
            </Link>
          </div>
        </div>
      </section>

      {/* Live Demos Switcher Section */}
      <section id="demos" className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Four Interconnected Panels in One Platform
            </h2>
            <p className="mt-3 text-slate-600">
              Test every persona in real-time with live Postgres data and zero mocks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Customer Digital Menu */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-400 hover:shadow-md transition group">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Customer Digital Menu</h3>
              <p className="mt-2 text-sm text-slate-600">
                Fast mobile menu with variants, add-ons, cart, table dine-in, takeaway, and live order tracking.
              </p>
              <Link
                href="/c/nordic-roast"
                className="mt-4 inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 gap-1"
              >
                Launch Menu <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Cafe Owner Dashboard */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-400 hover:shadow-md transition group">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Cafe Owner Dashboard</h3>
              <p className="mt-2 text-sm text-slate-600">
                Manage menu items, categories, pricing, table layouts, live orders, sales analytics, and staff.
              </p>
              <Link
                href="/dashboard"
                className="mt-4 inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 gap-1"
              >
                Open Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Kitchen Display System */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-amber-400 hover:shadow-md transition group">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <ChefHat className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Kitchen Display (KDS)</h3>
              <p className="mt-2 text-sm text-slate-600">
                Tablet-optimized interface for chefs with elapsed prep timers, dish notes, and one-tap status updates.
              </p>
              <Link
                href="/kitchen"
                className="mt-4 inline-flex items-center text-sm font-semibold text-amber-600 hover:text-amber-700 gap-1"
              >
                Launch KDS <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Super Admin Panel */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-purple-400 hover:shadow-md transition group">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Super Admin Panel</h3>
              <p className="mt-2 text-sm text-slate-600">
                Multi-tenant control, platform MRR, cafe approvals, subscription plans, and admin-assisted onboarding.
              </p>
              <Link
                href="/admin"
                className="mt-4 inline-flex items-center text-sm font-semibold text-purple-600 hover:text-purple-700 gap-1"
              >
                Super Admin <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Engineered for Modern Hospitality
            </h2>
            <p className="mt-4 text-slate-600 text-base sm:text-lg">
              Everything your cafe needs to speed up table turns, eliminate printed menu reprinting costs, and boost average order value.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl text-slate-900">Dynamic Table QR Codes</h3>
              <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                Generate permanent QR codes with customizable cafe logos. Table numbers are automatically detected without requiring customer app downloads.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl text-slate-900">Server-Recalculated Checkout</h3>
              <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                100% price integrity. All item prices, variant adjustments, add-ons, GST taxes (5%), and packaging charges are computed securely on the backend.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl text-slate-900">Real-Time Kitchen KDS</h3>
              <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                Orders immediately appear on the kitchen display system with sound alerts, preparation timers, and dish-specific customer instructions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Admin-Assisted Onboarding Showcase */}
      <section id="onboarding" className="py-16 bg-blue-50/60 border-y border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-4">
                Dual Business Model
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Self-Service & Admin-Assisted Onboarding
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Not all cafe owners are tech-savvy. With Nord Cafe, your support team can manually onboard restaurants, upload their menu via CSV, generate QR codes, and hand over access with one click.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>Bulk CSV & Excel Menu Importer for rapid digitization</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>Automated table & general QR token generation</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>Instant credential generation and owner invitation</span>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/admin/onboarding"
                  className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm shadow hover:bg-blue-700 transition inline-flex items-center gap-2"
                >
                  Explore Onboarding Wizard <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-900">Admin Onboarding Pipeline</span>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Ready</span>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <span className="font-medium text-slate-800">1. Create Cafe Account & Owner</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <span className="font-medium text-slate-800">2. Upload Menu via CSV/Manual</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <span className="font-medium text-slate-800">3. Generate Permanent Table QRs</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <span className="font-medium text-slate-800">4. Send Credentials & Go Live</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SaaS Pricing Plans */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Transparent, Scalable SaaS Pricing
            </h2>
            <p className="mt-3 text-slate-600">
              Start with our Free tier and upgrade as your restaurant grows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free */}
            <div className="rounded-2xl border border-slate-200 p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Free</h3>
                <p className="mt-2 text-sm text-slate-500">Perfect for pop-ups and test setups.</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-extrabold text-slate-900">₹0</span>
                  <span className="ml-1 text-slate-500 text-sm">/month</span>
                </div>
                <ul className="mt-8 space-y-4 text-sm text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> Up to 20 Food Items</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> 1 General Cafe QR Code</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> 5 Tables</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> Basic Digital Menu</li>
                </ul>
              </div>
              <Link
                href="/register"
                className="mt-8 w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-center text-sm transition"
              >
                Start Free
              </Link>
            </div>

            {/* Pro */}
            <div className="rounded-2xl border-2 border-blue-600 p-8 flex flex-col justify-between relative shadow-xl shadow-blue-500/10 bg-white">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Pro</h3>
                <p className="mt-2 text-sm text-slate-500">For established cafes wanting live order management.</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-extrabold text-slate-900">₹499</span>
                  <span className="ml-1 text-slate-500 text-sm">/month</span>
                </div>
                <ul className="mt-8 space-y-4 text-sm text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> Up to 150 Food Items</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> 25 Table QR Codes</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> Live Order Management & Sound Alerts</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> Kitchen Display System (KDS)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> Custom Branding & Color Theme</li>
                </ul>
              </div>
              <Link
                href="/register"
                className="mt-8 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-center text-sm transition shadow-md shadow-blue-500/20"
              >
                Get Started with Pro
              </Link>
            </div>

            {/* Business */}
            <div className="rounded-2xl border border-slate-200 p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Business</h3>
                <p className="mt-2 text-sm text-slate-500">For multi-branch restaurants & busy chains.</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-extrabold text-slate-900">₹999</span>
                  <span className="ml-1 text-slate-500 text-sm">/month</span>
                </div>
                <ul className="mt-8 space-y-4 text-sm text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> Unlimited Food Items</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> Unlimited QR Codes & Tables</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> Multi-branch Management (Up to 10)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> Up to 20 Staff & Kitchen Accounts</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> Online Payments & Razorpay Integration</li>
                </ul>
              </div>
              <Link
                href="/register"
                className="mt-8 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-center text-sm transition"
              >
                Go Business
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <span className="text-white font-bold text-lg">Nord Cafe</span>
            <span className="text-xs text-slate-500">Digital Menus. Smarter Restaurants.</span>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <Link href="/c/nordic-roast" className="hover:text-white transition">Public Menu</Link>
            <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
            <Link href="/kitchen" className="hover:text-white transition">Kitchen KDS</Link>
            <Link href="/admin" className="hover:text-white transition">Super Admin</Link>
          </div>

          <div className="text-xs text-slate-500">
            © {new Date().getFullYear()} Nord Cafe SaaS. Built for pilot cafes in Chandigarh & Mohali.
          </div>
        </div>
      </footer>
    </div>
  );
}
