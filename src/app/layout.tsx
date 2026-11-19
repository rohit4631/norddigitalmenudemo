import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nord Cafe — Digital Menus. Smarter Restaurants.',
  description:
    'Multi-tenant SaaS platform for cafes and restaurants: QR digital menus, live tables, kitchen display system, customer ordering, and billing.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased bg-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
