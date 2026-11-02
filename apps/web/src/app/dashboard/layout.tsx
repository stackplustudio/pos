"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { Menu, ShoppingCart } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-brand-background text-brand-ink overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Workspace Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-brand-line bg-brand-surface px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex size-9 items-center justify-center rounded-md border border-brand-line bg-brand-surface text-brand-ink-dark hover:bg-brand-surface-alt focus-visible:ring-2 focus-visible:ring-brand-primary lg:hidden"
              aria-label="Buka menu navigasi"
            >
              <Menu size={18} aria-hidden="true" />
            </button>
            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-semibold text-brand-ink-dark">Backoffice NusaKasir</span>
              <span className="text-[11px] text-brand-ink-muted">Sistem POS &amp; Inventory UMKM F&amp;B</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/pos"
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand-primary px-3.5 text-xs font-medium text-white shadow-xs transition-colors duration-150 hover:bg-brand-primary-dark focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 active:scale-95"
            >
              <ShoppingCart size={15} aria-hidden="true" />
              <span>Buka Layar Kasir</span>
            </Link>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
