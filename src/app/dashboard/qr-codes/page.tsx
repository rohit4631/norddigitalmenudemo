'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Loader2,
  Layers,
} from 'lucide-react';
import { generateQRCodeDataUrl } from '@/lib/qr';

export default function DashboardQrCodesPage() {
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQr, setSelectedQr] = useState<any>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [qrColor, setQrColor] = useState('#2563EB'); // Blueprint primary accent

  const fetchQrs = async () => {
    try {
      const res = await fetch('/api/v1/qr-codes');
      const data = await res.json();
      if (data.success) {
        setQrCodes(data.qrCodes);
        if (data.qrCodes.length > 0 && !selectedQr) {
          setSelectedQr(data.qrCodes[0]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQrs();
  }, []);

  const handleCopyLink = (fullUrl: string, token: string) => {
    navigator.clipboard.writeText(fullUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">QR Code Studio</h1>
          <p className="text-sm text-slate-500 mt-1">
            Permanent high-resolution QR codes with redirect tracking and print-ready table tent cards.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-blue-700 transition flex items-center gap-1.5 self-start sm:self-auto no-print"
        >
          <Printer className="w-3.5 h-3.5" /> Print Table Tent Cards
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* QR List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
              {qrCodes.map((qr) => {
                const isSelected = selectedQr?.id === qr.id;
                const label =
                  qr.type === 'CAFE_GENERAL'
                    ? 'Main Entrance / General Cafe QR'
                    : `Table ${qr.table?.tableNumber || '-'}`;

                return (
                  <div
                    key={qr.id}
                    onClick={() => setSelectedQr(qr)}
                    className={`p-4 transition cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <img
                        src={qr.dataUrl}
                        alt="QR Code"
                        className="w-14 h-14 rounded-xl border border-slate-200 bg-white p-1 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                          {label}
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                            {qr.type}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                          {qr.fullUrl}
                        </div>
                        <div className="text-xs text-blue-600 font-semibold mt-1">
                          {qr.scanCount} total customer scans
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyLink(qr.fullUrl, qr.token);
                        }}
                        className="p-2 border border-slate-200 hover:bg-white rounded-xl text-slate-600 transition"
                        title="Copy QR Destination URL"
                      >
                        {copiedToken === qr.token ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <a
                        href={qr.dataUrl}
                        download={`${qr.token}.png`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition"
                        title="Download High-Res PNG"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Print-ready Tent Card Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-6 h-fit text-center">
            {selectedQr ? (
              <div id="printable-receipt" className="space-y-4">
                <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  Print-Ready Table Card
                </div>

                {/* Printable Tent Card */}
                <div className="p-6 rounded-2xl border-2 border-slate-900 bg-slate-50 space-y-3 shadow-md max-w-xs mx-auto">
                  <div className="font-extrabold text-base tracking-tight text-slate-900">
                    SCAN FOR DIGITAL MENU
                  </div>
                  <div className="text-xs text-slate-500">
                    {selectedQr.type === 'TABLE' ? `Table ${selectedQr.table?.tableNumber}` : 'Contactless Ordering'}
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 inline-block shadow-sm">
                    <img
                      src={selectedQr.dataUrl}
                      alt="Selected QR"
                      className="w-44 h-44 mx-auto"
                    />
                  </div>

                  <div className="text-[11px] text-slate-600 font-medium">
                    Point your phone camera to browse dishes, customize, and order instantly.
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono">
                    Powered by Nord Cafe
                  </div>
                </div>

                <div className="pt-2 flex justify-center gap-2 no-print">
                  <a
                    href={selectedQr.dataUrl}
                    download={`${selectedQr.token}.png`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow hover:bg-blue-700 transition flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Download PNG
                  </a>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print Card
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-slate-400 text-sm">Select a QR code to view and print.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
