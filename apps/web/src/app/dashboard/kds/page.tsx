"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChefHat,
  Clock,
  CheckCircle2,
  UtensilsCrossed,
  ShoppingBag,
  RefreshCw,
  Bell,
  BellOff,
  User,
  ArrowRight,
  Flame,
  CheckCheck,
  AlertTriangle,
} from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";

interface OrderItem {
  id: string;
  qty: number;
  catatan?: string | null;
  menuItem: {
    id: string;
    nama: string;
  };
}

interface Table {
  id: string;
  nomor_meja: string;
}

interface KDSOrder {
  id: string;
  tipe: "DINE_IN" | "TAKEAWAY";
  status: "NEW" | "PROCESSING" | "READY" | "COMPLETED" | "CANCELLED";
  total: number;
  nama_pelanggan?: string | null;
  no_hp_pelanggan?: string | null;
  createdAt: string;
  table?: Table | null;
  orderItems: OrderItem[];
}

export default function KitchenDisplayPage() {
  const [orders, setOrders] = useState<KDSOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "READY" | "COMPLETED">("ACTIVE");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const prevOrderCountRef = useRef(0);

  // Perbarui timer elapsed setiap 15 detik
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  // Polling data otomatis setiap 6 detik
  useEffect(() => {
    fetchOrders(true);
    const interval = setInterval(() => {
      fetchOrders(false);
    }, 6000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playNotificationSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {
      // AudioContext fallback ignored
    }
  }, []);

  const fetchOrders = async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await api.get("/orders");
      const fetched: KDSOrder[] = res.data;
      setOrders(fetched);

      // Notifikasi suara jika ada pesanan baru bertambah
      const activeCount = fetched.filter(
        (o) => o.status === "NEW" || o.status === "PROCESSING"
      ).length;

      if (!isInitial && soundEnabled && activeCount > prevOrderCountRef.current) {
        playNotificationSound();
        toast.success("Pesanan dapur baru masuk!");
      }
      prevOrderCountRef.current = activeCount;
    } catch {
      if (isInitial) toast.error("Gagal memuat antrean dapur");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleUpdateStatus = async (
    orderId: string,
    newStatus: "PROCESSING" | "READY" | "COMPLETED"
  ) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(
        newStatus === "READY"
          ? "Pesanan ditandai Siap Disajikan!"
          : "Pesanan selesai disajikan."
      );
      fetchOrders(false);
    } catch {
      toast.error("Gagal memperbarui status pesanan");
    }
  };

  // Kalkulasi durasi menit sejak pesanan masuk
  const getElapsedMinutes = (dateStr: string) => {
    const diffMs = currentTime - new Date(dateStr).getTime();
    return Math.max(0, Math.floor(diffMs / 60000));
  };

  // Filter pesanan sesuai tab
  const activeOrders = orders.filter(
    (o) => o.status === "NEW" || o.status === "PROCESSING"
  );
  const readyOrders = orders.filter((o) => o.status === "READY");
  const completedOrders = orders.filter((o) => o.status === "COMPLETED");

  const displayedOrders =
    activeTab === "ACTIVE"
      ? activeOrders
      : activeTab === "READY"
      ? readyOrders
      : completedOrders;

  return (
    <div className="mx-auto max-w-7xl font-sans text-brand-ink">
      {/* Top Header KDS */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-brand-primary-soft text-brand-primary">
              <ChefHat size={20} aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-brand-ink-dark sm:text-3xl">
              Kitchen Display (KDS)
            </h1>
          </div>
          <p className="mt-1 text-xs text-brand-ink-muted">
            Monitor antrean pesanan dapur secara real-time untuk koki & barista.
          </p>
        </div>

        {/* Action Bar (Audio toggle & Manual refresh) */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="gap-1.5 text-xs font-medium"
            title={soundEnabled ? "Nonaktifkan suara bel" : "Aktifkan suara bel"}
          >
            {soundEnabled ? (
              <>
                <Bell size={14} className="text-brand-primary" aria-hidden="true" />
                <span>Bel Aktif</span>
              </>
            ) : (
              <>
                <BellOff size={14} className="text-brand-ink-muted" aria-hidden="true" />
                <span>Bel Hening</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            onClick={() => fetchOrders(false)}
            className="gap-1.5 text-xs font-medium"
          >
            <RefreshCw
              size={14}
              className={isRefreshing ? "animate-spin text-brand-primary" : ""}
              aria-hidden="true"
            />
            <span>{isRefreshing ? "Menyinkronkan…" : "Refresh"}</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs Antrean */}
      <div className="mb-6 flex border-b border-brand-line">
        <button
          type="button"
          onClick={() => setActiveTab("ACTIVE")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === "ACTIVE"
              ? "border-brand-primary text-brand-primary"
              : "border-transparent text-brand-ink-muted hover:text-brand-ink-dark"
          }`}
        >
          <Flame size={15} aria-hidden="true" />
          <span>Antrean Masak</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              activeTab === "ACTIVE"
                ? "bg-brand-primary text-white"
                : "bg-brand-surface-alt text-brand-ink-muted"
            }`}
          >
            {activeOrders.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("READY")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === "READY"
              ? "border-brand-primary text-brand-primary"
              : "border-transparent text-brand-ink-muted hover:text-brand-ink-dark"
          }`}
        >
          <CheckCircle2 size={15} aria-hidden="true" />
          <span>Siap Disajikan</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              activeTab === "READY"
                ? "bg-brand-primary text-white"
                : "bg-brand-surface-alt text-brand-ink-muted"
            }`}
          >
            {readyOrders.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("COMPLETED")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === "COMPLETED"
              ? "border-brand-primary text-brand-primary"
              : "border-transparent text-brand-ink-muted hover:text-brand-ink-dark"
          }`}
        >
          <CheckCheck size={15} aria-hidden="true" />
          <span>Riwayat Selesai</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              activeTab === "COMPLETED"
                ? "bg-brand-primary text-white"
                : "bg-brand-surface-alt text-brand-ink-muted"
            }`}
          >
            {completedOrders.length}
          </span>
        </button>
      </div>

      {/* Grid Tiket Pesanan Dapur */}
      {isLoading ? (
        <div className="flex h-56 items-center justify-center text-xs text-brand-ink-muted">
          Memuat antrean tiket dapur…
        </div>
      ) : displayedOrders.length === 0 ? (
        <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-brand-line bg-brand-surface p-8 text-center text-brand-ink-muted">
          <ChefHat size={36} className="mb-2 text-brand-line-strong" aria-hidden="true" />
          <p className="text-sm font-semibold text-brand-ink-dark">
            Tidak ada tiket pada antrean ini
          </p>
          <p className="mt-1 text-xs">
            {activeTab === "ACTIVE"
              ? "Semua pesanan pelanggan telah selesai diproses oleh dapur."
              : activeTab === "READY"
              ? "Belum ada pesanan yang berstatus siap disajikan."
              : "Belum ada riwayat pesanan yang diselesaikan."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayedOrders.map((order) => {
            const elapsed = getElapsedMinutes(order.createdAt);
            const isLate = elapsed >= 20;
            const isWarning = elapsed >= 10 && elapsed < 20;

            return (
              <div
                key={order.id}
                className={`flex flex-col justify-between rounded-xl border bg-brand-surface shadow-xs transition-shadow duration-150 hover:shadow-sm ${
                  order.status === "READY"
                    ? "border-success/40"
                    : isLate
                    ? "border-danger/60 ring-1 ring-danger/30"
                    : isWarning
                    ? "border-warning/50"
                    : "border-brand-line"
                }`}
              >
                {/* Header Tiket */}
                <div
                  className={`border-b p-3.5 ${
                    order.status === "READY"
                      ? "bg-success-soft/50 border-success/20"
                      : isLate
                      ? "bg-danger-soft/50 border-danger/20"
                      : "bg-brand-surface-alt/70 border-brand-line"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-brand-ink-dark">
                      #{order.id.slice(-6).toUpperCase()}
                    </span>

                    {/* Timer Durasi Tunggu */}
                    <div
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
                        isLate
                          ? "bg-danger text-white animate-pulse"
                          : isWarning
                          ? "bg-warning text-white"
                          : "bg-brand-surface text-brand-ink-muted border border-brand-line"
                      }`}
                      title={`Pesanan dibuat pukul ${new Intl.DateTimeFormat("id-ID", {
                        timeStyle: "short",
                      }).format(new Date(order.createdAt))}`}
                    >
                      <Clock size={11} aria-hidden="true" />
                      <span>{elapsed} mnt</span>
                    </div>
                  </div>

                  {/* Mode Layanan & Meja */}
                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        order.tipe === "DINE_IN"
                          ? "bg-brand-primary-soft text-brand-primary"
                          : "bg-warning-soft text-warning"
                      }`}
                    >
                      {order.tipe === "DINE_IN" ? (
                        <>
                          <UtensilsCrossed size={12} aria-hidden="true" />
                          <span>Dine-In {order.table ? `· Meja ${order.table.nomor_meja}` : ""}</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={12} aria-hidden="true" />
                          <span>Takeaway</span>
                        </>
                      )}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        order.status === "READY"
                          ? "text-success"
                          : order.status === "PROCESSING" || order.status === "NEW"
                          ? "text-brand-primary"
                          : "text-brand-ink-muted"
                      }`}
                    >
                      {order.status === "READY"
                        ? "Siap Disajikan"
                        : order.status === "PROCESSING" || order.status === "NEW"
                        ? "Dimasak"
                        : "Selesai"}
                    </span>
                  </div>

                  {/* Nama Pelanggan (Jika Diisi) */}
                  {order.nama_pelanggan && (
                    <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-brand-ink-dark">
                      <User size={12} className="text-brand-primary shrink-0" aria-hidden="true" />
                      <span className="truncate">
                        {order.nama_pelanggan}
                        {order.no_hp_pelanggan ? ` (${order.no_hp_pelanggan})` : ""}
                      </span>
                    </div>
                  )}
                </div>

                {/* Daftar Item Menu */}
                <div className="flex-1 divide-y divide-brand-line/60 p-3.5 space-y-2.5">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="pt-2 first:pt-0">
                      <div className="flex items-start gap-2.5">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-brand-surface-alt font-mono text-xs font-bold text-brand-primary border border-brand-line">
                          {item.qty}
                        </span>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-brand-ink-dark leading-snug">
                            {item.menuItem?.nama || "Menu Dapur"}
                          </p>

                          {/* Catatan Kustomisasi Khusus */}
                          {item.catatan && (
                            <div className="mt-1 flex items-center gap-1 rounded-md border border-warning/30 bg-warning-soft px-2 py-0.5 text-[11px] font-semibold text-warning">
                              <AlertTriangle size={12} className="shrink-0" aria-hidden="true" />
                              <span>{item.catatan}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tombol Aksi Koki */}
                <div className="border-t border-brand-line p-3">
                  {order.status === "NEW" || order.status === "PROCESSING" ? (
                    <Button
                      type="button"
                      onClick={() => handleUpdateStatus(order.id, "READY")}
                      className="w-full h-9 gap-1.5 text-xs font-semibold bg-success hover:bg-success/90 text-white"
                    >
                      <CheckCircle2 size={14} aria-hidden="true" />
                      <span>Tandai Siap Disajikan</span>
                    </Button>
                  ) : order.status === "READY" ? (
                    <Button
                      type="button"
                      onClick={() => handleUpdateStatus(order.id, "COMPLETED")}
                      className="w-full h-9 gap-1.5 text-xs font-semibold bg-brand-primary hover:bg-brand-primary/90 text-white"
                    >
                      <ArrowRight size={14} aria-hidden="true" />
                      <span>Selesaikan & Sajikan</span>
                    </Button>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-success py-1">
                      <CheckCheck size={16} aria-hidden="true" />
                      <span>Pesanan Sudah Disajikan</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
