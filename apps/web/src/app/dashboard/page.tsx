"use client";

import { useState, useEffect } from "react";
import { TrendingUp, ReceiptText, Wallet, ArrowRight, Store, RefreshCw, Clock, Coffee, Package, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";

interface Metrics {
  omzet: number;
  transaksi: number;
  rataRata: number;
}

interface StoredUser {
  name: string;
  email: string;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<StoredUser | null>(null);
  const [metrics, setMetrics] = useState<Metrics>({ omzet: 0, transaksi: 0, rataRata: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);

        if (user.role === "SUPER_ADMIN") {
          router.push("/dashboard/superadmin");
          return;
        }

        setUserData(user);

        if (user.role !== "KASIR") {
          fetchAnalytics();
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Gagal membaca profil sesi", err);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/analytics/summary");
      setMetrics(res.data);
    } catch (error) {
      console.error("Gagal memuat data analitik", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatRp = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

  const todayFormatted = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  // Tampilan Khusus Kasir
  if (userData?.role === "KASIR") {
    return (
      <div className="mx-auto max-w-5xl font-sans">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-brand-ink-dark sm:text-3xl">
            Portal Pegawai
          </h1>
          <p className="mt-1 text-sm text-brand-ink-muted">{todayFormatted}</p>
        </div>

        <div className="mb-6 rounded-xl border border-brand-line bg-brand-surface p-8 text-center shadow-xs">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-brand-primary-soft text-brand-primary">
            <Store size={32} aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-brand-ink-dark sm:text-2xl">
            Halo, {userData.name}!
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-brand-ink-muted leading-relaxed">
            Selamat datang di sistem operasional NusaKasir. Pastikan Anda telah memeriksa kas laci
            awal sebelum membuka sesi transaksi hari ini.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/pos"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand-primary px-6 text-sm font-semibold text-white shadow-xs transition-colors duration-150 hover:bg-brand-primary-dark focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 active:scale-95"
            >
              <ShoppingCart size={18} aria-hidden="true" />
              <span>Buka Layar Kasir (POS)</span>
            </Link>
          </div>
        </div>

        {/* Informasi Shift & Katalog */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-4 rounded-xl border border-brand-line bg-brand-surface p-5 shadow-xs">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-info-soft text-info">
              <Clock size={20} aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-brand-ink-dark">Status Shift Aktif</h3>
              <p className="mt-1 text-xs text-brand-ink-muted leading-relaxed">
                Buka atau tutup shift serta lakukan rekonsiliasi kas langsung dari layar POS utama.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-xl border border-brand-line bg-brand-surface p-5 shadow-xs">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-success-soft text-success">
              <Coffee size={20} aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-brand-ink-dark">Katalog &amp; Ketersediaan</h3>
              <p className="mt-1 text-xs text-brand-ink-muted leading-relaxed">
                Periksa ketersediaan menu dan status stok bahan langsung dari navigasi Daftar Menu.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tampilan Owner & Manager
  return (
    <div className="mx-auto max-w-6xl font-sans">
      {/* Header & Refresh */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-ink-dark sm:text-3xl">
            Overview Bisnis
          </h1>
          <p className="mt-1 text-sm text-brand-ink-muted">
            Ringkasan performa penjualan outlet per {todayFormatted}.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAnalytics}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-brand-line bg-brand-surface px-3.5 text-xs font-medium text-brand-ink-dark shadow-xs transition-colors duration-150 hover:bg-brand-surface-alt focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <RefreshCw
            size={14}
            className={isLoading ? "animate-spin text-brand-primary" : "text-brand-ink-muted"}
            aria-hidden="true"
          />
          <span>Perbarui data</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Omzet */}
        <div className="rounded-xl border border-brand-line bg-brand-surface p-5 shadow-xs">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-brand-ink-muted">Total omzet hari ini</span>
            <span className="flex size-8 items-center justify-center rounded-md bg-brand-primary-soft text-brand-primary">
              <Wallet size={16} aria-hidden="true" />
            </span>
          </div>
          <p className="text-2xl font-bold tracking-tight text-brand-ink-dark tabular-nums">
            {isLoading ? (
              <span className="inline-block h-8 w-36 animate-pulse rounded bg-brand-surface-alt" />
            ) : (
              formatRp(metrics.omzet)
            )}
          </p>
        </div>

        {/* Transaksi */}
        <div className="rounded-xl border border-brand-line bg-brand-surface p-5 shadow-xs">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-brand-ink-muted">Jumlah transaksi</span>
            <span className="flex size-8 items-center justify-center rounded-md bg-success-soft text-success">
              <ReceiptText size={16} aria-hidden="true" />
            </span>
          </div>
          <p className="text-2xl font-bold tracking-tight text-brand-ink-dark tabular-nums">
            {isLoading ? (
              <span className="inline-block h-8 w-24 animate-pulse rounded bg-brand-surface-alt" />
            ) : (
              `${metrics.transaksi} pesanan`
            )}
          </p>
        </div>

        {/* Rata-rata */}
        <div className="rounded-xl border border-brand-line bg-brand-surface p-5 shadow-xs">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-brand-ink-muted">Rata-rata per order</span>
            <span className="flex size-8 items-center justify-center rounded-md bg-warning-soft text-warning">
              <TrendingUp size={16} aria-hidden="true" />
            </span>
          </div>
          <p className="text-2xl font-bold tracking-tight text-brand-ink-dark tabular-nums">
            {isLoading ? (
              <span className="inline-block h-8 w-28 animate-pulse rounded bg-brand-surface-alt" />
            ) : (
              formatRp(metrics.rataRata)
            )}
          </p>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-brand-ink-dark">Aksi Cepat Operasional</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            href="/pos"
            className="group flex flex-col justify-between rounded-xl border border-brand-primary bg-brand-primary p-5 text-white shadow-xs transition-colors duration-150 hover:bg-brand-primary-dark focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          >
            <div>
              <p className="text-base font-semibold">Layar Kasir (POS)</p>
              <p className="mt-1 text-xs text-white/80">Input transaksi dan kelola shift kasir aktif</p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-medium">
              <span>Buka kasir</span>
              <ArrowRight
                size={16}
                className="transition-transform duration-150 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </div>
          </Link>

          <Link
            href="/dashboard/menus"
            className="group flex flex-col justify-between rounded-xl border border-brand-line bg-brand-surface p-5 shadow-xs transition-colors duration-150 hover:border-brand-primary hover:bg-brand-surface-alt focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <div>
              <div className="mb-2 flex size-8 items-center justify-center rounded-md bg-brand-primary-soft text-brand-primary">
                <Coffee size={16} aria-hidden="true" />
              </div>
              <p className="text-base font-semibold text-brand-ink-dark">Menu &amp; Resep (BOM)</p>
              <p className="mt-1 text-xs text-brand-ink-muted">Atur harga produk dan takaran bahan baku</p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-medium text-brand-primary">
              <span>Kelola katalog</span>
              <ArrowRight
                size={16}
                className="transition-transform duration-150 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </div>
          </Link>

          <Link
            href="/dashboard/inventory"
            className="group flex flex-col justify-between rounded-xl border border-brand-line bg-brand-surface p-5 shadow-xs transition-colors duration-150 hover:border-brand-primary hover:bg-brand-surface-alt focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <div>
              <div className="mb-2 flex size-8 items-center justify-center rounded-md bg-warning-soft text-warning">
                <Package size={16} aria-hidden="true" />
              </div>
              <p className="text-base font-semibold text-brand-ink-dark">Manajemen Inventory</p>
              <p className="mt-1 text-xs text-brand-ink-muted">Pantau sisa bahan baku dan lakukan stok opname</p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-medium text-brand-primary">
              <span>Cek stok bahan</span>
              <ArrowRight
                size={16}
                className="transition-transform duration-150 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
