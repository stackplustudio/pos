"use client";

import { useState, useEffect } from "react";
import { ReceiptText, Search, Eye, Ban, X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface OrderItem {
  id: string;
  qty: number;
  harga: number;
  catatan?: string | null;
  menuItem: { nama: string };
}

interface Table {
  id: string;
  nomor_meja: string;
  area?: string | null;
}

interface Order {
  id: string;
  tipe: string;
  status: string; // NEW, PROCESSING, READY, COMPLETED, CANCELLED
  subtotal: number;
  diskon: number;
  pajak: number;
  total: number;
  metode_bayar: string;
  createdAt: string;
  kasir: { name: string };
  table?: Table | null;
  orderItems: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Modal Detail State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Modal Void State (FR-POS-09)
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);
  const [orderToVoid, setOrderToVoid] = useState<Order | null>(null);
  const [voidReason, setVoidReason] = useState("");
  const [isSubmittingVoid, setIsSubmittingVoid] = useState(false);

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

  const openVoidModal = (order: Order) => {
    setOrderToVoid(order);
    setVoidReason("");
    setIsVoidModalOpen(true);
  };

  const handleConfirmVoid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderToVoid || !voidReason.trim()) {
      toast.error("Alasan pembatalan (void) wajib diisi");
      return;
    }

    setIsSubmittingVoid(true);
    try {
      await api.post(`/orders/${orderToVoid.id}/void`, {
        alasan: voidReason.trim(),
      });

      toast.success(`Transaksi #${orderToVoid.id.slice(-6).toUpperCase()} berhasil dibatalkan (void). Stok bahan baku telah dikembalikan.`);
      setIsVoidModalOpen(false);
      if (selectedOrder?.id === orderToVoid.id) {
        setSelectedOrder(null);
      }
      fetchOrders();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Gagal membatalkan transaksi");
    } finally {
      setIsSubmittingVoid(false);
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

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.kasir?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.table?.nomor_meja?.toLowerCase().includes(searchTerm.toLowerCase())
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
            Pantau seluruh catatan pesanan masuk dari layar POS kasir dan kelola pembatalan (void).
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
            placeholder="Cari ID, kasir, atau meja…"
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
              {searchTerm ? "Tidak ditemukan transaksi yang cocok." : "Pesanan dari POS kasir akan otomatis tercatat di sini."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-brand-line bg-brand-surface-alt text-brand-ink-dark font-semibold">
                  <th className="px-5 py-3">Waktu</th>
                  <th className="px-5 py-3">ID &amp; Layanan</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Kasir</th>
                  <th className="px-5 py-3">Metode Bayar</th>
                  <th className="px-5 py-3">Total Tagihan</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-line">
                {filteredOrders.map((order) => {
                  const isCancelled = order.status === "CANCELLED";
                  return (
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
                          {order.tipe === "DINE_IN"
                            ? `Dine-In · Meja ${order.table?.nomor_meja || "-"}`
                            : "Takeaway"}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            isCancelled
                              ? "bg-danger-soft text-danger"
                              : "bg-success-soft text-success"
                          }`}
                        >
                          {isCancelled ? (
                            <>
                              <Ban size={10} aria-hidden="true" />
                              <span>Dibatalkan (Void)</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={10} aria-hidden="true" />
                              <span>Selesai</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-brand-ink-dark font-medium">
                        {order.kasir?.name || "Staff Kasir"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-md border border-brand-line bg-brand-surface-alt px-2 py-0.5 text-[11px] font-semibold text-brand-ink-dark">
                          {order.metode_bayar || "TUNAI"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-brand-primary tabular-nums">
                        <span className={isCancelled ? "line-through opacity-50" : ""}>
                          {formatRp(order.total)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex size-7 items-center justify-center rounded-md text-brand-ink-muted transition-colors hover:bg-brand-surface-alt hover:text-brand-primary"
                            aria-label={`Lihat detail pesanan #${order.id.slice(-6)}`}
                            title="Lihat detail pesanan"
                          >
                            <Eye size={15} aria-hidden="true" />
                          </button>

                          {!isCancelled && (
                            <button
                              type="button"
                              onClick={() => openVoidModal(order)}
                              className="inline-flex items-center gap-1 rounded-md border border-danger/30 bg-danger-soft px-2 py-1 text-[11px] font-semibold text-danger transition-colors hover:bg-danger hover:text-white"
                              title="Batalkan transaksi ini dan kembalikan stok bahan"
                            >
                              <Ban size={12} aria-hidden="true" />
                              <span>Void</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail Transaksi */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-overlay/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-brand-line bg-brand-surface shadow-md overflow-hidden">
            <div className="flex items-center justify-between border-b border-brand-line px-5 py-4">
              <div>
                <h3 className="text-base font-bold text-brand-ink-dark">
                  Detail Transaksi #{selectedOrder.id.slice(-6).toUpperCase()}
                </h3>
                <p className="text-xs text-brand-ink-muted">
                  {formatDate(selectedOrder.createdAt)} · Kasir: {selectedOrder.kasir?.name || "Staff"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-md p-1.5 text-brand-ink-muted hover:bg-brand-surface-alt hover:text-brand-ink-dark"
                aria-label="Tutup detail"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-brand-ink-muted">Layanan:</span>
                <span className="font-semibold text-brand-ink-dark">
                  {selectedOrder.tipe === "DINE_IN"
                    ? `Dine-In (Meja ${selectedOrder.table?.nomor_meja || "-"})`
                    : "Takeaway"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-brand-ink-muted">Status:</span>
                <span
                  className={`font-semibold ${
                    selectedOrder.status === "CANCELLED" ? "text-danger" : "text-success"
                  }`}
                >
                  {selectedOrder.status === "CANCELLED" ? "Dibatalkan (Void)" : "Selesai (Completed)"}
                </span>
              </div>

              <div className="border-t border-brand-line pt-3">
                <p className="mb-2 text-xs font-semibold text-brand-ink-dark">Item Pesanan:</p>
                <div className="space-y-2">
                  {selectedOrder.orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs">
                      <div>
                        <span className="font-medium text-brand-ink-dark">
                          {item.qty}x {item.menuItem.nama}
                        </span>
                        {item.catatan && (
                          <p className="text-[11px] text-brand-ink-muted italic">
                            Catatan: {item.catatan}
                          </p>
                        )}
                      </div>
                      <span className="font-semibold tabular-nums text-brand-ink-dark">
                        {formatRp(item.harga * item.qty)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-brand-line pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-brand-ink-muted">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatRp(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.diskon > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Diskon</span>
                    <span className="tabular-nums">-{formatRp(selectedOrder.diskon)}</span>
                  </div>
                )}
                <div className="flex justify-between text-brand-ink-muted">
                  <span>Pajak (PB1/PPN)</span>
                  <span className="tabular-nums">{formatRp(selectedOrder.pajak)}</span>
                </div>
                <div className="flex justify-between border-t border-brand-line pt-2 text-sm font-bold text-brand-ink-dark">
                  <span>Total Tagihan</span>
                  <span className="text-brand-primary tabular-nums">
                    {formatRp(selectedOrder.total)}
                  </span>
                </div>
              </div>

              {selectedOrder.status !== "CANCELLED" && (
                <div className="border-t border-brand-line pt-4 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => openVoidModal(selectedOrder)}
                    className="gap-1.5 text-danger border-danger/30 hover:bg-danger hover:text-white"
                  >
                    <Ban size={14} aria-hidden="true" />
                    <span>Void Transaksi Ini</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Void (FR-POS-09) */}
      {isVoidModalOpen && orderToVoid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-overlay/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl border border-brand-line bg-brand-surface shadow-md overflow-hidden">
            <div className="flex items-center justify-between border-b border-brand-line px-5 py-4 bg-danger-soft/40">
              <div className="flex items-center gap-2 text-danger">
                <AlertTriangle size={18} aria-hidden="true" />
                <h3 className="text-base font-bold text-danger">
                  Konfirmasi Void Transaksi
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsVoidModalOpen(false)}
                className="rounded-md p-1.5 text-brand-ink-muted hover:bg-brand-surface-alt hover:text-brand-ink-dark"
                aria-label="Tutup modal"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleConfirmVoid} className="p-5 space-y-4">
              <p className="text-xs text-brand-ink-muted leading-relaxed">
                Anda akan membatalkan pesanan <strong className="text-brand-ink-dark font-semibold">#{orderToVoid.id.slice(-6).toUpperCase()}</strong> senilai <strong className="text-brand-primary">{formatRp(orderToVoid.total)}</strong>.
                Seluruh stok bahan baku akan otomatis dikembalikan ke gudang.
              </p>

              <div>
                <label
                  htmlFor="voidReason"
                  className="mb-1.5 block text-xs font-semibold text-brand-ink-dark"
                >
                  Alasan Pembatalan (Wajib Diisi)
                </label>
                <Input
                  id="voidReason"
                  type="text"
                  required
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="Contoh: Salah input pesanan / Pelanggan batalkan"
                  className="h-10 text-sm"
                  autoFocus
                />
              </div>

              <div className="mt-6 flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsVoidModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingVoid}
                  className="bg-danger text-white hover:bg-danger/90"
                >
                  {isSubmittingVoid ? "Memproses Void…" : "Batalkan Transaksi"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
