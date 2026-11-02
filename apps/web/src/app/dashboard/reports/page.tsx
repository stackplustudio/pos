"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";

interface ProfitLossReport {
  pemasukan: number;
  pengeluaran: number;
  labaBersih: number;
}

export default function ProfitLossPage() {
  const [report, setReport] = useState<ProfitLossReport>({
    pemasukan: 0,
    pengeluaran: 0,
    labaBersih: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filter Periode
  const currentDate = new Date();
  const [filterMonth, setFilterMonth] = useState(currentDate.getMonth());
  const [filterYear, setFilterYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMonth, filterYear]);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const start = new Date(filterYear, filterMonth, 1).toISOString();
      const end = new Date(filterYear, filterMonth + 1, 0, 23, 59, 59).toISOString();

      const res = await api.get(`/analytics/profit-loss?startDate=${start}&endDate=${end}`);
      setReport(res.data);
    } catch {
      toast.error("Gagal memuat laporan keuangan");
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

  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  return (
    <div className="mx-auto max-w-6xl font-sans text-brand-ink">
      {/* Header Halaman & Filter Periode */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-ink-dark sm:text-3xl">
            Laporan Laba Rugi
          </h1>
          <p className="mt-1 text-sm text-brand-ink-muted">
            Pantau arus kas pemasukan POS dan pengeluaran pembelian bahan baku (PO).
          </p>
        </div>

        {/* Filter Bulan & Tahun */}
        <div className="inline-flex items-center gap-2 rounded-lg border border-brand-line bg-brand-surface p-1.5 shadow-xs">
          <Calendar size={16} className="ml-1 text-brand-primary" aria-hidden="true" />
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(Number(e.target.value))}
            className="h-8 rounded bg-transparent px-2 text-xs font-semibold text-brand-ink-dark outline-none focus-visible:ring-1 focus-visible:ring-brand-primary"
            aria-label="Pilih Bulan"
          >
            {months.map((m, i) => (
              <option key={i} value={i}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(Number(e.target.value))}
            className="h-8 rounded bg-transparent px-2 text-xs font-semibold text-brand-ink-dark outline-none focus-visible:ring-1 focus-visible:ring-brand-primary"
            aria-label="Pilih Tahun"
          >
            {[currentDate.getFullYear() - 1, currentDate.getFullYear()].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-56 items-center justify-center text-xs text-brand-ink-muted">
          Menghitung rekapitulasi keuangan…
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Pemasukan */}
          <div className="rounded-xl border border-brand-line bg-brand-surface p-5 shadow-xs">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-brand-ink-muted">Total pemasukan (POS)</span>
              <span className="flex size-8 items-center justify-center rounded-md bg-success-soft text-success">
                <TrendingUp size={16} aria-hidden="true" />
              </span>
            </div>
            <p className="text-2xl font-bold tracking-tight text-brand-ink-dark tabular-nums">
              {formatRp(report.pemasukan)}
            </p>
          </div>

          {/* Pengeluaran */}
          <div className="rounded-xl border border-brand-line bg-brand-surface p-5 shadow-xs">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-brand-ink-muted">Total pengeluaran (PO)</span>
              <span className="flex size-8 items-center justify-center rounded-md bg-danger-soft text-danger">
                <TrendingDown size={16} aria-hidden="true" />
              </span>
            </div>
            <p className="text-2xl font-bold tracking-tight text-brand-ink-dark tabular-nums">
              {formatRp(report.pengeluaran)}
            </p>
          </div>

          {/* Laba Bersih */}
          <div
            className={`rounded-xl border p-5 shadow-xs text-white ${
              report.labaBersih >= 0
                ? "border-brand-primary bg-brand-primary"
                : "border-danger bg-danger"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-white/80">Laba bersih periode ini</span>
              <span className="flex size-8 items-center justify-center rounded-md bg-white/20 text-white">
                <DollarSign size={16} aria-hidden="true" />
              </span>
            </div>
            <p className="text-2xl font-bold tracking-tight tabular-nums">
              {formatRp(report.labaBersih)}
            </p>
            <p className="mt-2 text-xs text-white/80">
              {report.labaBersih >= 0
                ? "Operasional sehat dengan surplus keuntungan."
                : "Pengeluaran belanja melebihi omzet pemasukan."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
