"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Layers,
  Award,
  Download,
  Percent,
} from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";

interface TopMenuItem {
  id: string;
  nama: string;
  kategori: string;
  qty: number;
  omzet: number;
  hpp: number;
  labaKotor: number;
  marginPersen: number;
}

interface CategoryItem {
  nama: string;
  qty: number;
  omzet: number;
}

interface ProfitLossReport {
  pemasukan: number;
  subtotal: number;
  diskon: number;
  pajak: number;
  totalHPP: number;
  labaKotor: number;
  marginLabaKotor: number;
  pengeluaran: number;
  labaBersih: number;
  transaksi: number;
  rataRataTransaksi: number;
  topMenus: TopMenuItem[];
  categories: CategoryItem[];
}

export default function ProfitLossPage() {
  const [report, setReport] = useState<ProfitLossReport>({
    pemasukan: 0,
    subtotal: 0,
    diskon: 0,
    pajak: 0,
    totalHPP: 0,
    labaKotor: 0,
    marginLabaKotor: 0,
    pengeluaran: 0,
    labaBersih: 0,
    transaksi: 0,
    rataRataTransaksi: 0,
    topMenus: [],
    categories: [],
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

  // FR-RPT-08: Ekspor CSV Laporan Keuangan
  const handleExportCSV = () => {
    const monthName = months[filterMonth];
    const header = [
      `LAPORAN KEUANGAN & LABA RUGI - NUSAKASIR`,
      `Periode: ${monthName} ${filterYear}`,
      "",
      "--- RINGKASAN FINANSIAL ---",
      `Total Omzet Pemasukan POS;${report.pemasukan}`,
      `Total Subtotal;${report.subtotal}`,
      `Total Diskon;${report.diskon}`,
      `Total Pajak;${report.pajak}`,
      `Total HPP Bahan Baku Riil (BOM);${report.totalHPP}`,
      `Laba Kotor POS;${report.labaKotor}`,
      `Margin Laba Kotor (%);${report.marginLabaKotor}%`,
      `Total Pengeluaran Belanja Supplier (PO);${report.pengeluaran}`,
      `Laba Bersih Operasional;${report.labaBersih}`,
      `Total Transaksi;${report.transaksi}`,
      `Rata-rata Transaksi (AOV);${report.rataRataTransaksi}`,
      "",
      "--- MENU TERLARIS & PROFITABILITAS ---",
      "Peringkat;Nama Menu;Kategori;Qty Terjual;Total Omzet;Total HPP;Laba Kotor;Margin (%)",
      ...report.topMenus.map(
        (m, idx) =>
          `${idx + 1};"${m.nama}";"${m.kategori}";${m.qty};${m.omzet};${m.hpp};${m.labaKotor};${m.marginPersen}%`
      ),
    ].join("\n");

    const blob = new Blob([header], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Laporan_Keuangan_${monthName}_${filterYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Laporan berhasil diekspor ke file CSV!");
  };

  return (
    <div className="mx-auto max-w-6xl font-sans text-brand-ink">
      {/* Header Halaman & Filter Periode */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-ink-dark sm:text-3xl">
            Laporan Finansial & HPP Riil
          </h1>
          <p className="mt-1 text-sm text-brand-ink-muted">
            Analisis profitabilitas POS berbasis Bill of Materials (BOM) & arus kas belanja supplier.
          </p>
        </div>

        {/* Filter Bulan & Tahun + Tombol CSV */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-brand-line bg-brand-surface p-1.5 shadow-xs">
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

          <Button
            type="button"
            variant="outline"
            onClick={handleExportCSV}
            className="gap-1.5 h-10 text-xs font-semibold"
          >
            <Download size={14} aria-hidden="true" />
            <span>Ekspor CSV</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-56 items-center justify-center text-xs text-brand-ink-muted">
          Menghitung rekapitulasi keuangan & HPP resep…
        </div>
      ) : (
        <div className="space-y-6">
          {/* Baris 1: Kartu Metrik Finansial Utama */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Omzet Pemasukan */}
            <div className="rounded-xl border border-brand-line bg-brand-surface p-5 shadow-xs">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-brand-ink-muted">Total Omzet (POS)</span>
                <span className="flex size-8 items-center justify-center rounded-md bg-success-soft text-success">
                  <TrendingUp size={16} aria-hidden="true" />
                </span>
              </div>
              <p className="text-2xl font-bold tracking-tight text-brand-ink-dark tabular-nums">
                {formatRp(report.pemasukan)}
              </p>
              <p className="mt-1 text-[11px] text-brand-ink-muted">
                {report.transaksi} transaksi tercatat
              </p>
            </div>

            {/* 2. Total HPP Bahan Baku */}
            <div className="rounded-xl border border-brand-line bg-brand-surface p-5 shadow-xs">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-brand-ink-muted">Total HPP Riil (BOM)</span>
                <span className="flex size-8 items-center justify-center rounded-md bg-warning-soft text-warning">
                  <Layers size={16} aria-hidden="true" />
                </span>
              </div>
              <p className="text-2xl font-bold tracking-tight text-brand-ink-dark tabular-nums">
                {formatRp(report.totalHPP)}
              </p>
              <p className="mt-1 text-[11px] text-brand-ink-muted">
                Biaya bahan baku resep menu
              </p>
            </div>

            {/* 3. Laba Kotor */}
            <div className="rounded-xl border border-brand-line bg-brand-surface p-5 shadow-xs">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-brand-ink-muted">Laba Kotor POS</span>
                <span className="flex size-8 items-center justify-center rounded-md bg-primary-soft text-brand-primary">
                  <Percent size={16} aria-hidden="true" />
                </span>
              </div>
              <p className="text-2xl font-bold tracking-tight text-brand-ink-dark tabular-nums">
                {formatRp(report.labaKotor)}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-brand-primary">
                Margin kotor {report.marginLabaKotor}%
              </p>
            </div>

            {/* 4. Pengeluaran Belanja PO */}
            <div className="rounded-xl border border-brand-line bg-brand-surface p-5 shadow-xs">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-brand-ink-muted">Belanja Supplier (PO)</span>
                <span className="flex size-8 items-center justify-center rounded-md bg-danger-soft text-danger">
                  <TrendingDown size={16} aria-hidden="true" />
                </span>
              </div>
              <p className="text-2xl font-bold tracking-tight text-brand-ink-dark tabular-nums">
                {formatRp(report.pengeluaran)}
              </p>
              <p className="mt-1 text-[11px] text-brand-ink-muted">
                Status PO Selesai diterima
              </p>
            </div>
          </div>

          {/* Baris 2: Kartu Laba Bersih */}
          <div
            className={`rounded-xl border p-5 shadow-xs text-white ${
              report.labaBersih >= 0
                ? "border-brand-primary bg-brand-primary"
                : "border-danger bg-danger"
            }`}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-white/80">Laba Bersih Operasional Periode Ini</span>
              <span className="flex size-8 items-center justify-center rounded-md bg-white/20 text-white">
                <DollarSign size={16} aria-hidden="true" />
              </span>
            </div>
            <p className="text-3xl font-bold tracking-tight tabular-nums">
              {formatRp(report.labaBersih)}
            </p>
            <p className="mt-2 text-xs text-white/85">
              {report.labaBersih >= 0
                ? "Arus kas surplus — total pendapatan penjualan melampaui seluruh belanja bahan baku."
                : "Arus kas defisit — belanja bahan baku melebihi pendapatan penjualan pada periode ini."}
            </p>
          </div>

          {/* Baris 3: Tabel Menu Terlaris & Margin Profitabilitas */}
          <div className="rounded-xl border border-brand-line bg-brand-surface p-5 shadow-xs">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-brand-primary" aria-hidden="true" />
                <h2 className="text-sm font-bold text-brand-ink-dark">
                  Menu Terlaris & Profitabilitas Produk
                </h2>
              </div>
              <span className="text-xs text-brand-ink-muted">
                {report.topMenus.length} produk terjual
              </span>
            </div>

            {report.topMenus.length === 0 ? (
              <p className="py-8 text-center text-xs text-brand-ink-muted">
                Belum ada transaksi menu yang tercatat pada periode ini.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-brand-line text-[11px] font-semibold text-brand-ink-muted uppercase">
                    <tr>
                      <th className="pb-2.5">#</th>
                      <th className="pb-2.5">Menu</th>
                      <th className="pb-2.5">Kategori</th>
                      <th className="pb-2.5 text-right">Terjual</th>
                      <th className="pb-2.5 text-right">Omzet</th>
                      <th className="pb-2.5 text-right">Total HPP</th>
                      <th className="pb-2.5 text-right">Laba Kotor</th>
                      <th className="pb-2.5 text-right">Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-line text-brand-ink">
                    {report.topMenus.map((menu, index) => (
                      <tr key={menu.id} className="hover:bg-brand-surface-alt transition-colors">
                        <td className="py-3 font-semibold text-brand-ink-muted">{index + 1}</td>
                        <td className="py-3 font-semibold text-brand-ink-dark">{menu.nama}</td>
                        <td className="py-3 text-brand-ink-muted">{menu.kategori}</td>
                        <td className="py-3 text-right font-medium tabular-nums">{menu.qty} porsi</td>
                        <td className="py-3 text-right font-medium tabular-nums">{formatRp(menu.omzet)}</td>
                        <td className="py-3 text-right font-medium tabular-nums text-brand-ink-muted">
                          {formatRp(menu.hpp)}
                        </td>
                        <td className="py-3 text-right font-semibold tabular-nums text-success">
                          {formatRp(menu.labaKotor)}
                        </td>
                        <td className="py-3 text-right font-semibold tabular-nums text-brand-primary">
                          {menu.marginPersen}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
