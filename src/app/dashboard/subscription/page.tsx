'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function DashboardSubscriptionPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const [interval, setInterval] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/v1/subscriptions');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const handleUpgrade = async (planId: string) => {
    setUpgradingPlan(planId);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/v1/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          billingInterval: interval,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg(json.message);
        fetchSubscription();
      }
    } finally {
      setUpgradingPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const currentSub = data?.currentSubscription;
  const currentPlan = currentSub?.plan || { name: 'Free', itemLimit: 20, tableLimit: 5 };
  const usage = data?.usage || { items: 0, tables: 0, qrCodes: 0 };
  const availablePlans = data?.availablePlans || [];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Subscription & Limits</h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor your active feature entitlements, catalog limits, and subscription billing.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Active Plan Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{currentPlan.name} Plan</h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  {currentSub?.status || 'ACTIVE'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Billed {currentSub?.billingInterval?.toLowerCase() || 'monthly'} • Renews on{' '}
                {currentSub?.endDate ? formatDate(currentSub.endDate) : 'Lifetime Free'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-extrabold text-slate-900">
              {formatCurrency(
                currentSub?.billingInterval === 'YEARLY'
                  ? currentPlan.yearlyPrice || 0
                  : currentPlan.monthlyPrice || 0
              )}
            </div>
            <div className="text-xs text-slate-400">Current subscription fee</div>
          </div>
        </div>

        {/* Feature Usage Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-600">Food Items Used</span>
              <span className="text-slate-900">
                {usage.items} / {currentPlan.itemLimit}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (usage.items / currentPlan.itemLimit) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-600">Tables Configured</span>
              <span className="text-slate-900">
                {usage.tables} / {currentPlan.tableLimit}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (usage.tables / currentPlan.tableLimit) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-600">QR Codes Generated</span>
              <span className="text-slate-900">{usage.qrCodes} active</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-purple-600 h-full rounded-full w-2/3" />
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Options */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Upgrade or Change Plan</h2>
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setInterval('MONTHLY')}
              className={`px-3 py-1 rounded-lg transition ${
                interval === 'MONTHLY' ? 'bg-white shadow text-slate-900' : 'text-slate-600'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setInterval('YEARLY')}
              className={`px-3 py-1 rounded-lg transition ${
                interval === 'YEARLY' ? 'bg-white shadow text-slate-900' : 'text-slate-600'
              }`}
            >
              Yearly (Save 17%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {availablePlans.map((plan: any) => {
            const isCurrent = currentPlan.name === plan.name;
            const price = interval === 'YEARLY' ? plan.yearlyPrice : plan.monthlyPrice;

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl border p-6 shadow-sm flex flex-col justify-between transition ${
                  isCurrent ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-900">{plan.name}</h3>
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{plan.description}</p>

                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {formatCurrency(price)}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">
                      /{interval === 'YEARLY' ? 'yr' : 'mo'}
                    </span>
                  </div>

                  <ul className="mt-6 space-y-2.5 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Up to {plan.itemLimit} Food Items</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Up to {plan.tableLimit} Dining Tables</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{plan.hasOnlineOrdering ? 'Live Online Ordering' : 'Digital Menu Only'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{plan.hasCustomBranding ? 'Custom Theme Branding' : 'Default Theme'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Kitchen Display KDS ({plan.hasKds ? 'Included' : 'No'})</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrent || upgradingPlan === plan.id}
                  className={`mt-6 w-full py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                  }`}
                >
                  {upgradingPlan === plan.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : isCurrent ? (
                    'Active Plan'
                  ) : (
                    'Switch to this Plan'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
