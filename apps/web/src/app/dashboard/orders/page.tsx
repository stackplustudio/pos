"use client";

import { useState, useEffect } from "react";
import { ReceiptText, Search, Eye } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";

interface OrderItem {
  id: string;
  qty: number;
  harga: number;
  menuItem: { nama: string };
}

interface Order {
  id: string;
  tipe: string;
  status: string;
  total: number;
  metode_bayar: string;
  createdAt: string;
  kasir: { name: string };
  orderItems: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders");
      setOrders(response.data);
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 403) {
        toast.error("Anda tidak memiliki akses ke halaman transaksi.");
      } else {
        toast.error("Gagal mengambil data riwayat transaksi");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatRp = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const filteredOrders = orders.filter((order) =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl font-sans text-brand-ink">
      {/* Header Halaman & Search */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-ink-dark sm:text-3xl">
            Riwayat Transaksi
          </h1>
          <p className="mt-1 text-sm text-brand-ink-muted">
            Pantau seluruh catatan pesanan masuk dari layar POS kasir.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-ink-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari ID transaksi..."
            className="h-10 w-full rounded-md border border-brand-line-strong bg-brand-surface pl-9 pr-3 text-xs text-brand-ink-dark placeholder:text-brand-ink-muted outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            aria-label="Cari transaksi"
          />
        </div>
      </div>

      {/* Tabel Transaksi */}
      <div className="overflow-hidden rounded-xl border border-brand-line bg-brand-surface shadow-xs">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-xs text-brand-ink-muted">
            Memuat transaksi…
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center p-6 text-center text-xs text-brand-ink-muted">
            <ReceiptText size={32} className="mb-2 text-brand-line-strong" aria-hidden="true" />
            <p className="font-semibold text-brand-ink-dark">Belum ada transaksi</p>
            <p className="mt-1 text-brand-ink-muted">
              {searchTerm ? "Tidak ditemukan transaksi dengan ID tersebut." : "Pesanan dari POS kasir akan otomatis tercatat di sini."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-brand-line bg-brand-surface-alt text-brand-ink-dark font-semibold">
                  <th className="px-5 py-3">Waktu</th>
                  <th className="px-5 py-3">ID &amp; Tipe</th>
                  <th className="px-5 py-3">Kasir Bertugas</th>
                  <th className="px-5 py-3">Metode Bayar</th>
                  <th className="px-5 py-3">Total Tagihan</th>
                  <th className="px-5 py-3 text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-line">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="transition-colors duration-150 hover:bg-brand-surface-alt/50"
                  >
                    <td className="px-5 py-3.5 text-brand-ink-muted tabular-nums">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-mono text-xs font-semibold text-brand-primary">
                        #{order.id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-[11px] font-medium text-brand-ink-muted mt-0.5">
                        {order.tipe}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-brand-ink-dark font-medium">
                      {order.kasir?.name || "Staff"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-md border border-brand-line bg-brand-surface-alt px-2 py-0.5 text-[11px] font-semibold text-brand-ink-dark">
                        {order.metode_bayar || "TUNAI"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-brand-primary tabular-nums">
                      {formatRp(order.total)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        className="inline-flex size-8 items-center justify-center rounded-lg text-brand-ink-muted transition-colors duration-150 hover:bg-brand-surface-alt hover:text-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary"
                        aria-label={`Lihat detail pesanan #${order.id.slice(-6)}`}
                      >
                        <Eye size={15} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
