"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";
import {
  ShoppingCart,
  ArrowLeft,
  LockKeyhole,
  Tag,
  Printer,
  X,
  Plus,
  Minus,
  Trash2,
  Clock,
  Wallet,
  QrCode,
  Banknote,
  UtensilsCrossed,
  ShoppingBag,
  History,
  Ban,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MenuItem {
  id: string;
  nama: string;
  harga_jual: number;
  status: boolean;
}

interface CartItem extends MenuItem {
  qty: number;
  catatan: string;
}

interface Table {
  id: string;
  nomor_meja: string;
  area: string | null;
  status: string; // KOSONG, TERISI
}

interface Shift {
  id: string;
  modal_awal: number;
  kas_sistem: number;
  waktu_buka: string;
}

interface Discount {
  id: string;
  nama: string;
  tipe: string;
  nilai: number;
}

interface OrderReceipt {
  items: CartItem[];
  subtotal: number;
  diskonNama: string | null;
  diskonNominal: number;
  pajak: number;
  total: number;
  waktu: string;
  tipe: string;
  nomorMeja?: string | null;
  metodeBayar: string;
  uangDiterima: number;
  kembalian: number;
}

interface TodayOrder {
  id: string;
  tipe: string;
  status: string;
  total: number;
  metode_bayar: string;
  createdAt: string;
  table?: { nomor_meja: string } | null;
}

export default function POSPage() {
  const router = useRouter();

  // States Menu & Keranjang
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mode Layanan & Meja (Sprint 2)
  const [orderType, setOrderType] = useState<"TAKEAWAY" | "DINE_IN">("TAKEAWAY");
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTableId, setSelectedTableId] = useState("");

  // Metode Pembayaran & Kasir (Sprint 2)
  const [metodeBayar, setMetodeBayar] = useState<"TUNAI" | "QRIS">("TUNAI");
  const [uangDiterima, setUangDiterima] = useState("");
  const [isQrisModalOpen, setIsQrisModalOpen] = useState(false);

  // States Shift
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [isLoadingShift, setIsLoadingShift] = useState(true);
  const [modalAwal, setModalAwal] = useState("");
  const [kasFisik, setKasFisik] = useState("");
  const [isCloseShiftModalOpen, setIsCloseShiftModalOpen] = useState(false);

  // States Diskon
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

  // States Struk / Receipt
  const [lastOrder, setLastOrder] = useState<OrderReceipt | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // States Riwayat Hari Ini & Void (Sprint 2)
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [todayOrders, setTodayOrders] = useState<TodayOrder[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);
  const [orderToVoid, setOrderToVoid] = useState<TodayOrder | null>(null);
  const [voidReason, setVoidReason] = useState("");
  const [isSubmittingVoid, setIsSubmittingVoid] = useState(false);

  useEffect(() => {
    checkActiveShift();
    fetchMenus();
    fetchDiscounts();
    fetchTables();
  }, []);

  const checkActiveShift = async () => {
    try {
      const res = await api.get("/shifts/active");
      setActiveShift(res.data);
    } catch {
      console.error("Gagal mengecek shift");
    } finally {
      setIsLoadingShift(false);
    }
  };

  const fetchMenus = async () => {
    try {
      const response = await api.get("/menu-items");
      setMenus(response.data.filter((m: MenuItem) => m.status));
    } catch {
      toast.error("Gagal memuat katalog menu");
    }
  };

  const fetchDiscounts = async () => {
    try {
      const res = await api.get("/discounts?activeOnly=true");
      setDiscounts(res.data);
    } catch {
      console.error("Gagal memuat promo");
    }
  };

  const fetchTables = async () => {
    try {
      const res = await api.get("/tables");
      setTables(res.data);
    } catch {
      console.error("Gagal memuat data meja");
    }
  };

  const fetchTodayOrders = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await api.get("/orders");
      setTodayOrders(res.data);
    } catch {
      toast.error("Gagal memuat riwayat transaksi");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const openHistoryDrawer = () => {
    setIsHistoryDrawerOpen(true);
    fetchTodayOrders();
  };

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/shifts/open", {
        modal_awal: parseInt(modalAwal, 10) || 0,
      });
      setActiveShift(res.data);
      toast.success("Shift kasir berhasil dibuka.");
    } catch {
      toast.error("Gagal membuka shift kasir");
    }
  };

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;
    try {
      await api.patch(`/shifts/close/${activeShift.id}`, {
        kas_fisik: parseInt(kasFisik, 10) || 0,
      });
      toast.success("Shift kasir berhasil ditutup.");
      setActiveShift(null);
      setIsCloseShiftModalOpen(false);
      setModalAwal("");
      setKasFisik("");
    } catch {
      toast.error("Gagal menutup shift kasir");
    }
  };

  const addToCart = (menu: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === menu.id);
      if (existing) {
        return prev.map((item) =>
          item.id === menu.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...menu, qty: 1, catatan: "" }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : item;
        }
        return item;
      })
    );
  };

  const handleClearTable = async (tableId: string) => {
    try {
      await api.patch(`/tables/${tableId}`, { status: "KOSONG" });
      toast.success("Status meja berhasil diubah menjadi Kosong");
      fetchTables();
    } catch {
      toast.error("Gagal mengosongkan meja");
    }
  };

  // Kalkulasi Pembayaran
  const subtotal = cart.reduce((sum, item) => sum + item.harga_jual * item.qty, 0);

  let diskonNominal = 0;
  if (selectedDiscount) {
    if (selectedDiscount.tipe === "PERSENTASE") {
      diskonNominal = Math.round(subtotal * (selectedDiscount.nilai / 100));
    } else {
      diskonNominal = selectedDiscount.nilai;
    }
  }

  const subtotalSetelahDiskon = Math.max(0, subtotal - diskonNominal);
  const pajak = Math.round(subtotalSetelahDiskon * 0.11);
  const total = subtotalSetelahDiskon + pajak;

  // Kalkulasi Uang Diterima & Kembalian
  const nominalUangDiterima = parseInt(uangDiterima, 10) || 0;
  const kembalian = Math.max(0, nominalUangDiterima - total);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    if (orderType === "DINE_IN" && !selectedTableId) {
      toast.error("Pilih nomor meja terlebih dahulu untuk pesanan Dine-In");
      return;
    }

    if (metodeBayar === "TUNAI" && nominalUangDiterima < total) {
      toast.error("Jumlah uang tunai yang diterima kurang dari total tagihan");
      return;
    }

    setIsProcessing(true);
    try {
      await api.post("/orders", {
        tipe: orderType,
        tableId: orderType === "DINE_IN" ? selectedTableId : undefined,
        metode_bayar: metodeBayar,
        discountId: selectedDiscount?.id,
        diskon_nominal: diskonNominal,
        items: cart.map((item) => ({
          menuItemId: item.id,
          qty: item.qty,
          harga: item.harga_jual,
          catatan: item.catatan,
        })),
      });

      toast.success("Transaksi berhasil dicatat!");

      const selectedTable = tables.find((t) => t.id === selectedTableId);

      setLastOrder({
        items: [...cart],
        subtotal,
        diskonNama: selectedDiscount?.nama || null,
        diskonNominal,
        pajak,
        total,
        waktu: new Intl.DateTimeFormat("id-ID", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date()),
        tipe: orderType === "DINE_IN" ? "Dine-In" : "Takeaway",
        nomorMeja: orderType === "DINE_IN" ? selectedTable?.nomor_meja || null : null,
        metodeBayar,
        uangDiterima: metodeBayar === "TUNAI" ? nominalUangDiterima : total,
        kembalian: metodeBayar === "TUNAI" ? kembalian : 0,
      });

      setCart([]);
      setSelectedDiscount(null);
      setUangDiterima("");
      checkActiveShift();
      fetchTables();
      setIsReceiptModalOpen(true);
    } catch {
      toast.error("Transaksi gagal diproses.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Void Handler (FR-POS-09)
  const openVoidModal = (order: TodayOrder) => {
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

      toast.success(`Transaksi #${orderToVoid.id.slice(-6).toUpperCase()} dibatalkan. Stok dikembalikan.`);
      setIsVoidModalOpen(false);
      fetchTodayOrders();
      checkActiveShift();
      fetchTables();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Gagal membatalkan transaksi");
    } finally {
      setIsSubmittingVoid(false);
    }
  };

  const formatRp = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

  const handlePrint = () => {
    window.print();
  };

  if (isLoadingShift) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-background font-sans text-sm text-brand-ink-muted">
        Memuat sistem kasir…
      </div>
    );
  }

  // Layar Buka Shift Baru
  if (!activeShift) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-brand-background p-4 font-sans print:hidden">
        <div className="w-full max-w-sm rounded-xl border border-brand-line bg-brand-surface p-6 text-center shadow-xs sm:p-8">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-brand-primary-soft text-brand-primary">
            <LockKeyhole size={24} aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-brand-ink-dark">Buka Shift Kasir</h1>
          <p className="mt-1 text-xs text-brand-ink-muted leading-relaxed">
            Masukkan jumlah modal kas laci awal untuk memulai shift operasional.
          </p>

          <form onSubmit={handleOpenShift} className="mt-6 space-y-4 text-left">
            <div>
              <label
                htmlFor="modalAwal"
                className="mb-1.5 block text-xs font-semibold text-brand-ink-dark"
              >
                Modal Awal (Rp)
              </label>
              <Input
                id="modalAwal"
                type="number"
                required
                min="0"
                value={modalAwal}
                onChange={(e) => setModalAwal(e.target.value)}
                placeholder="Contoh: 200000"
                className="h-11 text-base tabular-nums"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className="h-11 w-full text-sm font-semibold"
            >
              Mulai Bertugas
            </Button>
          </form>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-brand-ink-muted hover:text-brand-primary transition-colors"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            <span>Kembali ke dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-brand-background font-sans text-brand-ink print:bg-white">
      {/* AREA KIRI: Katalog Menu & Navigasi Kasir */}
      <div className="flex flex-1 flex-col overflow-hidden border-r border-brand-line print:hidden">
        {/* Topbar Kasir */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-brand-line bg-brand-surface px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="inline-flex size-9 items-center justify-center rounded-lg border border-brand-line bg-brand-surface text-brand-ink-dark transition-colors duration-150 hover:bg-brand-surface-alt focus-visible:ring-2 focus-visible:ring-brand-primary"
              title="Kembali ke Dashboard"
              aria-label="Kembali ke Dashboard"
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
            <div>
              <h1 className="text-base font-bold text-brand-ink-dark leading-tight">Layar Kasir POS</h1>
              <p className="text-[11px] text-brand-ink-muted">
                Shift Aktif · Kas Laci: <strong className="text-brand-primary font-semibold tabular-nums">{formatRp(activeShift.kas_sistem)}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tombol Riwayat Transaksi Hari Ini */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openHistoryDrawer}
              className="gap-1.5 text-xs font-medium"
            >
              <History size={14} aria-hidden="true" />
              <span>Riwayat Hari Ini</span>
            </Button>

            {/* Tombol Tutup Shift */}
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setIsCloseShiftModalOpen(true)}
              className="gap-1.5 text-xs font-medium"
            >
              <LockKeyhole size={14} aria-hidden="true" />
              <span>Tutup Shift</span>
            </Button>
          </div>
        </header>

        {/* Katalog Menu Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-semibold text-brand-ink-muted">
              Pilih item menu untuk ditambahkan ke keranjang transaksi
            </p>
            <span className="text-xs text-brand-ink-muted">
              {menus.length} menu tersedia
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {menus.map((menu) => (
              <button
                key={menu.id}
                type="button"
                onClick={() => addToCart(menu)}
                className="group flex flex-col justify-between rounded-xl border border-brand-line bg-brand-surface p-3.5 text-left shadow-xs transition-colors duration-150 hover:border-brand-primary hover:shadow-sm focus-visible:ring-2 focus-visible:ring-brand-primary"
              >
                <div>
                  <h3 className="text-sm font-semibold text-brand-ink-dark line-clamp-2 leading-snug group-hover:text-brand-primary transition-colors">
                    {menu.nama}
                  </h3>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-brand-line/60 pt-2.5">
                  <p className="text-sm font-bold text-brand-primary tabular-nums">
                    {formatRp(menu.harga_jual)}
                  </p>
                  <span className="flex size-6 items-center justify-center rounded-md bg-brand-primary-soft text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors">
                    <Plus size={14} aria-hidden="true" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AREA KANAN: Keranjang & Panel Pembayaran (Sprint 2) */}
      <div className="flex w-full max-w-md shrink-0 flex-col bg-brand-surface border-l border-brand-line shadow-xs print:hidden">
        {/* Header Keranjang & Switch Layanan */}
        <div className="border-b border-brand-line p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-brand-primary-soft text-brand-primary">
                <ShoppingCart size={16} aria-hidden="true" />
              </span>
              <h2 className="text-sm font-bold text-brand-ink-dark">Pesanan Kasir</h2>
            </div>
            <span className="rounded-full bg-brand-surface-alt px-2.5 py-0.5 text-[11px] font-semibold text-brand-ink-muted">
              {cart.reduce((sum, item) => sum + item.qty, 0)} item
            </span>
          </div>

          {/* Toggle Layanan (Dine-In vs Takeaway) */}
          <div className="grid grid-cols-2 gap-1.5 rounded-lg border border-brand-line bg-brand-surface-alt p-1">
            <button
              type="button"
              onClick={() => {
                setOrderType("TAKEAWAY");
                setSelectedTableId("");
              }}
              className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-colors ${
                orderType === "TAKEAWAY"
                  ? "bg-brand-surface text-brand-primary shadow-xs"
                  : "text-brand-ink-muted hover:text-brand-ink-dark"
              }`}
            >
              <ShoppingBag size={14} aria-hidden="true" />
              <span>Bungkus (Takeaway)</span>
            </button>
            <button
              type="button"
              onClick={() => setOrderType("DINE_IN")}
              className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-colors ${
                orderType === "DINE_IN"
                  ? "bg-brand-surface text-brand-primary shadow-xs"
                  : "text-brand-ink-muted hover:text-brand-ink-dark"
              }`}
            >
              <UtensilsCrossed size={14} aria-hidden="true" />
              <span>Makan di Tempat</span>
            </button>
          </div>

          {/* Selector Nomor Meja jika Dine-In */}
          {orderType === "DINE_IN" && (
            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1">
                <label htmlFor="tableSelect" className="sr-only">
                  Pilih Meja
                </label>
                <select
                  id="tableSelect"
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className="h-9 w-full rounded-md border border-brand-line-strong bg-brand-surface px-2.5 text-xs text-brand-ink-dark outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <option value="" disabled>Pilih Nomor Meja…</option>
                  {tables.map((t) => (
                    <option key={t.id} value={t.id}>
                      Meja {t.nomor_meja} {t.area ? `(${t.area})` : ""} {t.status === "TERISI" ? "· (Terisi)" : "· (Kosong)"}
                    </option>
                  ))}
                </select>
              </div>

              {selectedTableId && (
                (() => {
                  const currTable = tables.find((t) => t.id === selectedTableId);
                  if (currTable?.status === "TERISI") {
                    return (
                      <button
                        type="button"
                        onClick={() => handleClearTable(selectedTableId)}
                        title="Kosongkan meja ini"
                        className="h-9 rounded-md border border-warning/40 bg-warning-soft px-2.5 text-[11px] font-semibold text-warning hover:bg-warning hover:text-white transition-colors"
                      >
                        Kosongkan
                      </button>
                    );
                  }
                  return null;
                })()
              )}
            </div>
          )}
        </div>

        {/* List Item Keranjang */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {cart.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center text-xs text-brand-ink-muted">
              <ShoppingCart size={32} className="mb-2 text-brand-line-strong" aria-hidden="true" />
              <p className="font-semibold text-brand-ink-dark">Keranjang masih kosong</p>
              <p className="mt-0.5">Sentuh menu di sebelah kiri untuk menambahkan pesanan.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex flex-col rounded-lg border border-brand-line bg-brand-surface p-3 shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-brand-ink-dark">{item.nama}</h4>
                    <p className="text-xs font-bold text-brand-primary tabular-nums mt-0.5">
                      {formatRp(item.harga_jual * item.qty)}
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, -1)}
                      className="inline-flex size-6 items-center justify-center rounded border border-brand-line bg-brand-surface text-brand-ink-muted hover:bg-brand-surface-alt transition-colors"
                      aria-label="Kurangi qty"
                    >
                      <Minus size={12} aria-hidden="true" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold tabular-nums">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, 1)}
                      className="inline-flex size-6 items-center justify-center rounded border border-brand-line bg-brand-surface text-brand-ink-muted hover:bg-brand-surface-alt transition-colors"
                      aria-label="Tambah qty"
                    >
                      <Plus size={12} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCart((prev) => prev.filter((i) => i.id !== item.id))}
                      className="ml-1 inline-flex size-6 items-center justify-center rounded text-danger hover:bg-danger-soft transition-colors"
                      aria-label="Hapus item"
                    >
                      <Trash2 size={13} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Input Catatan Pesanan */}
                <input
                  type="text"
                  placeholder="Catatan (cth: es sedikit, pedas)…"
                  value={item.catatan}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCart((prev) =>
                      prev.map((i) => (i.id === item.id ? { ...i, catatan: val } : i))
                    );
                  }}
                  className="mt-2 h-7 w-full rounded border border-brand-line-strong bg-brand-surface px-2 text-[11px] text-brand-ink-dark placeholder:text-brand-ink-muted outline-none focus-visible:ring-1 focus-visible:ring-brand-primary"
                />
              </div>
            ))
          )}
        </div>

        {/* Panel Kalkulasi & Checkout */}
        <div className="border-t border-brand-line bg-brand-surface p-4 space-y-3">
          {/* Tombol Pilih Promo */}
          <button
            type="button"
            onClick={() => setIsDiscountModalOpen(true)}
            className="flex w-full items-center justify-between rounded-lg border border-brand-line bg-brand-surface-alt px-3 py-2 text-xs font-medium text-brand-ink-dark hover:bg-brand-surface-alt/70 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Tag size={15} className="text-brand-primary" aria-hidden="true" />
              <span>{selectedDiscount ? selectedDiscount.nama : "Pilih Voucher / Promo"}</span>
            </div>
            {selectedDiscount ? (
              <span className="font-bold text-success">
                -{formatRp(diskonNominal)}
              </span>
            ) : (
              <span className="text-brand-ink-muted">Pilih</span>
            )}
          </button>

          {/* Rincian Harga */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-brand-ink-muted">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatRp(subtotal)}</span>
            </div>
            {diskonNominal > 0 && (
              <div className="flex justify-between text-success font-medium">
                <span>Diskon Promo</span>
                <span className="tabular-nums">-{formatRp(diskonNominal)}</span>
              </div>
            )}
            <div className="flex justify-between text-brand-ink-muted">
              <span>PB1 (11%)</span>
              <span className="tabular-nums">{formatRp(pajak)}</span>
            </div>
            <div className="flex justify-between border-t border-brand-line pt-2 text-sm font-bold text-brand-ink-dark">
              <span>Total Tagihan</span>
              <span className="text-brand-primary tabular-nums text-base">
                {formatRp(total)}
              </span>
            </div>
          </div>

          {/* Selector Metode Pembayaran (Sprint 2) */}
          <div className="space-y-2 border-t border-brand-line pt-2">
            <p className="text-[11px] font-semibold text-brand-ink-dark">Metode Pembayaran:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMetodeBayar("TUNAI")}
                className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition-colors ${
                  metodeBayar === "TUNAI"
                    ? "border-brand-primary bg-brand-primary-soft text-brand-primary"
                    : "border-brand-line bg-brand-surface text-brand-ink-dark hover:bg-brand-surface-alt"
                }`}
              >
                <Banknote size={15} aria-hidden="true" />
                <span>Uang Tunai (Cash)</span>
              </button>
              <button
                type="button"
                onClick={() => setMetodeBayar("QRIS")}
                className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition-colors ${
                  metodeBayar === "QRIS"
                    ? "border-brand-primary bg-brand-primary-soft text-brand-primary"
                    : "border-brand-line bg-brand-surface text-brand-ink-dark hover:bg-brand-surface-alt"
                }`}
              >
                <QrCode size={15} aria-hidden="true" />
                <span>QRIS / Dompet Digital</span>
              </button>
            </div>

            {/* Input Tunai & Kembalian jika Pembayaran Tunai */}
            {metodeBayar === "TUNAI" ? (
              <div className="space-y-2 rounded-lg border border-brand-line bg-brand-surface-alt p-3 text-xs">
                <div>
                  <label htmlFor="uangDiterimaInput" className="mb-1 block font-semibold text-brand-ink-dark">
                    Uang Diterima (Rp)
                  </label>
                  <Input
                    id="uangDiterimaInput"
                    type="number"
                    min="0"
                    step="1000"
                    value={uangDiterima}
                    onChange={(e) => setUangDiterima(e.target.value)}
                    placeholder="Contoh: 50000"
                    className="h-9 text-sm font-bold tabular-nums"
                  />
                </div>

                {/* Chips Nominal Uang Cepat */}
                <div className="flex flex-wrap gap-1 pt-1">
                  <button
                    type="button"
                    onClick={() => setUangDiterima(String(total))}
                    className="rounded bg-brand-surface px-2 py-0.5 text-[10px] font-semibold text-brand-primary border border-brand-line hover:bg-brand-primary-soft transition-colors"
                  >
                    Uang Pas
                  </button>
                  {[20000, 50000, 100000].map((nom) => (
                    <button
                      key={nom}
                      type="button"
                      onClick={() => setUangDiterima(String(nom))}
                      className="rounded bg-brand-surface px-2 py-0.5 text-[10px] font-medium text-brand-ink-dark border border-brand-line hover:bg-brand-surface-alt transition-colors"
                    >
                      {formatRp(nom)}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-brand-line pt-2">
                  <span className="font-semibold text-brand-ink-dark">Uang Kembalian:</span>
                  <span
                    className={`font-bold tabular-nums text-sm ${
                      nominalUangDiterima < total ? "text-danger" : "text-success"
                    }`}
                  >
                    {nominalUangDiterima >= total ? formatRp(kembalian) : "Uang Kurang"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg border border-brand-line bg-brand-surface-alt p-3 text-xs">
                <div className="flex items-center gap-2">
                  <QrCode size={18} className="text-brand-primary" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-brand-ink-dark">Pembayaran QRIS</p>
                    <p className="text-[11px] text-brand-ink-muted">Tampilkan QR code ke pelanggan</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQrisModalOpen(true)}
                  className="rounded-md border border-brand-primary bg-brand-primary-soft px-2.5 py-1 text-xs font-semibold text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
                >
                  Buka QR
                </button>
              </div>
            )}
          </div>

          {/* Tombol Final Eksekusi Transaksi */}
          <Button
            type="button"
            onClick={handleCheckout}
            disabled={
              cart.length === 0 ||
              isProcessing ||
              (metodeBayar === "TUNAI" && nominalUangDiterima < total) ||
              (orderType === "DINE_IN" && !selectedTableId)
            }
            className="h-11 w-full text-sm font-bold gap-2"
          >
            <Wallet size={16} aria-hidden="true" />
            <span>{isProcessing ? "Memproses Transaksi…" : `Bayar ${formatRp(total)}`}</span>
          </Button>
        </div>
      </div>

      {/* MODAL QRIS SIMULATOR (Sprint 2) */}
      {isQrisModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-overlay/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-xs rounded-xl border border-brand-line bg-brand-surface p-6 text-center shadow-md">
            <h3 className="text-base font-bold text-brand-ink-dark">Pindai QRIS</h3>
            <p className="mt-1 text-xs text-brand-ink-muted">
              Arahkan kamera e-wallet pelanggan ke kode QR di bawah ini.
            </p>

            <div className="my-5 mx-auto flex size-44 items-center justify-center rounded-xl border border-dashed border-brand-line bg-white p-3 shadow-inner">
              <QrCode size={130} className="text-brand-ink-dark" aria-hidden="true" />
            </div>

            <p className="text-base font-bold text-brand-primary tabular-nums">
              {formatRp(total)}
            </p>

            <div className="mt-5 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsQrisModalOpen(false)}
                className="flex-1 text-xs"
              >
                Tutup
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setIsQrisModalOpen(false);
                  handleCheckout();
                }}
                disabled={isProcessing}
                className="flex-1 text-xs font-semibold"
              >
                Sudah Bayar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PILIH DISKON */}
      {isDiscountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-overlay/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl border border-brand-line bg-brand-surface p-5 shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-brand-ink-dark">Pilih Diskon Promo</h3>
              <button
                type="button"
                onClick={() => setIsDiscountModalOpen(false)}
                className="rounded-md p-1.5 text-brand-ink-muted hover:bg-brand-surface-alt hover:text-brand-ink-dark"
                aria-label="Tutup modal diskon"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {discounts.length === 0 ? (
                <p className="text-center text-xs text-brand-ink-muted py-4">
                  Tidak ada promo aktif saat ini.
                </p>
              ) : (
                discounts.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setSelectedDiscount(d);
                      setIsDiscountModalOpen(false);
                    }}
                    className="flex w-full flex-col rounded-lg border border-brand-line p-3 text-left transition-colors hover:border-brand-primary hover:bg-brand-primary-soft focus-visible:ring-2 focus-visible:ring-brand-primary"
                  >
                    <p className="text-xs font-semibold text-brand-ink-dark">{d.nama}</p>
                    <p className="mt-0.5 text-xs font-bold text-brand-primary">
                      {d.tipe === "PERSENTASE" ? `${d.nilai}% OFF` : `Potongan ${formatRp(d.nilai)}`}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CETAK STRUK THERMAL (Sprint 2) */}
      {isReceiptModalOpen && lastOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-overlay/60 backdrop-blur-xs p-4 print:p-0 print:bg-white">
          <div className="w-full max-w-sm rounded-xl border border-brand-line bg-white p-6 shadow-md print:rounded-none print:border-none print:shadow-none print:p-0">
            {/* Template Struk Thermal */}
            <div className="mb-6 text-center font-mono text-xs text-brand-ink-dark print:mb-0">
              <h2 className="text-base font-bold">NusaKasir</h2>
              <p className="text-[11px] text-gray-500">Struk Transaksi Penjualan</p>
              <p className="mt-1 text-[11px] text-gray-500">{lastOrder.waktu}</p>
              <p className="mt-0.5 text-[11px] font-semibold text-gray-600">
                {lastOrder.tipe} {lastOrder.nomorMeja ? `· Meja ${lastOrder.nomorMeja}` : ""}
              </p>
              <div className="my-3 border-t border-dashed border-gray-300" />

              <div className="space-y-1.5 text-left">
                {lastOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="truncate pr-2">
                      {item.qty}x {item.nama}
                    </span>
                    <span className="shrink-0 tabular-nums">
                      {formatRp(item.harga_jual * item.qty)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="my-3 border-t border-dashed border-gray-300" />
              <div className="space-y-1 text-left text-xs font-medium">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatRp(lastOrder.subtotal)}</span>
                </div>
                {lastOrder.diskonNominal > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Diskon ({lastOrder.diskonNama})</span>
                    <span className="tabular-nums">-{formatRp(lastOrder.diskonNominal)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>PB1 (11%)</span>
                  <span className="tabular-nums">{formatRp(lastOrder.pajak)}</span>
                </div>
                <div className="mt-2 flex justify-between border-t border-gray-300 pt-1.5 text-sm font-bold">
                  <span>TOTAL</span>
                  <span className="tabular-nums">{formatRp(lastOrder.total)}</span>
                </div>
                <div className="flex justify-between pt-1 text-[11px] text-gray-600">
                  <span>Metode Bayar</span>
                  <span>{lastOrder.metodeBayar}</span>
                </div>
                {lastOrder.metodeBayar === "TUNAI" && (
                  <>
                    <div className="flex justify-between text-[11px] text-gray-600">
                      <span>Uang Diterima</span>
                      <span className="tabular-nums">{formatRp(lastOrder.uangDiterima)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-semibold text-gray-800">
                      <span>Kembalian</span>
                      <span className="tabular-nums">{formatRp(lastOrder.kembalian)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="my-3 border-t border-dashed border-gray-300" />
              <p className="text-[11px] font-semibold">Terima Kasih Atas Kunjungan Anda</p>
            </div>

            {/* Aksi Modal */}
            <div className="flex gap-2.5 print:hidden">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsReceiptModalOpen(false)}
                className="flex-1"
              >
                Tutup
              </Button>
              <Button
                type="button"
                onClick={handlePrint}
                className="flex-1 gap-2"
              >
                <Printer size={16} aria-hidden="true" />
                <span>Cetak Struk</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER RIWAYAT HARI INI & VOID (Sprint 2) */}
      {isHistoryDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-brand-overlay/50 backdrop-blur-xs">
          <div className="flex h-full w-full max-w-md flex-col bg-brand-surface shadow-xl">
            <div className="flex items-center justify-between border-b border-brand-line px-5 py-4">
              <div>
                <h3 className="text-base font-bold text-brand-ink-dark">Riwayat Shift Kasir Hari Ini</h3>
                <p className="text-xs text-brand-ink-muted">Pantau transaksi atau batalkan transaksi salah (void).</p>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryDrawerOpen(false)}
                className="rounded-md p-1.5 text-brand-ink-muted hover:bg-brand-surface-alt hover:text-brand-ink-dark"
                aria-label="Tutup riwayat"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {isLoadingHistory ? (
                <div className="flex h-40 items-center justify-center text-xs text-brand-ink-muted">
                  Memuat data riwayat…
                </div>
              ) : todayOrders.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center text-center text-xs text-brand-ink-muted">
                  <History size={28} className="mb-2 text-brand-line-strong" aria-hidden="true" />
                  <p className="font-semibold text-brand-ink-dark">Belum ada transaksi</p>
                  <p className="mt-0.5">Seluruh pesanan selesai pada shift ini akan muncul di sini.</p>
                </div>
              ) : (
                todayOrders.map((ord) => {
                  const isCancelled = ord.status === "CANCELLED";
                  return (
                    <div
                      key={ord.id}
                      className="flex items-center justify-between rounded-lg border border-brand-line bg-brand-surface p-3 text-xs shadow-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-brand-primary">
                            #{ord.id.slice(-6).toUpperCase()}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              isCancelled
                                ? "bg-danger-soft text-danger"
                                : "bg-success-soft text-success"
                            }`}
                          >
                            {isCancelled ? "Void" : "Selesai"}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-brand-ink-muted">
                          {ord.tipe} {ord.table ? `(Meja ${ord.table.nomor_meja})` : ""} · {ord.metode_bayar}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`font-bold tabular-nums ${isCancelled ? "line-through opacity-50" : "text-brand-ink-dark"}`}>
                          {formatRp(ord.total)}
                        </span>
                        {!isCancelled && (
                          <button
                            type="button"
                            onClick={() => openVoidModal(ord)}
                            className="rounded border border-danger/30 bg-danger-soft px-2 py-1 text-[11px] font-semibold text-danger hover:bg-danger hover:text-white transition-colors"
                            title="Batalkan pesanan ini"
                          >
                            Void
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI VOID POS (Sprint 2) */}
      {isVoidModalOpen && orderToVoid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-overlay/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl border border-brand-line bg-brand-surface shadow-md overflow-hidden">
            <div className="flex items-center justify-between border-b border-brand-line px-5 py-4 bg-danger-soft/40">
              <div className="flex items-center gap-2 text-danger">
                <AlertTriangle size={18} aria-hidden="true" />
                <h3 className="text-base font-bold text-danger">Void Pesanan POS</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsVoidModalOpen(false)}
                className="rounded-md p-1.5 text-brand-ink-muted hover:bg-brand-surface-alt hover:text-brand-ink-dark"
                aria-label="Tutup modal void"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleConfirmVoid} className="p-5 space-y-4">
              <p className="text-xs text-brand-ink-muted leading-relaxed">
                Batalkan pesanan <strong className="text-brand-ink-dark font-semibold">#{orderToVoid.id.slice(-6).toUpperCase()}</strong> ({formatRp(orderToVoid.total)}).
                Stok bahan baku akan dikembalikan dan kas laci shift akan disesuaikan.
              </p>

              <div>
                <label htmlFor="posVoidReason" className="mb-1.5 block text-xs font-semibold text-brand-ink-dark">
                  Alasan Pembatalan (Wajib)
                </label>
                <Input
                  id="posVoidReason"
                  type="text"
                  required
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="Contoh: Pelanggan ganti pesanan / salah menu"
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
                  {isSubmittingVoid ? "Memproses…" : "Konfirmasi Void"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TUTUP SHIFT */}
      {isCloseShiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-overlay/50 backdrop-blur-xs p-4 print:hidden">
          <div className="w-full max-w-sm rounded-xl border border-brand-line bg-brand-surface p-5 shadow-md sm:p-6">
            <h3 className="text-base font-bold text-brand-ink-dark">Tutup Shift Kasir</h3>
            <p className="mt-1 text-xs text-brand-ink-muted leading-relaxed">
              Hitung uang fisik di laci kasir untuk rekonsiliasi dengan kas sistem.
            </p>

            <form onSubmit={handleCloseShift} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="kasFisik"
                  className="mb-1.5 block text-xs font-semibold text-brand-ink-dark"
                >
                  Total Uang Fisik Laci (Rp)
                </label>
                <Input
                  id="kasFisik"
                  type="number"
                  required
                  min="0"
                  value={kasFisik}
                  onChange={(e) => setKasFisik(e.target.value)}
                  placeholder="Jumlah uang kas di laci"
                  className="h-10 text-sm tabular-nums"
                  autoFocus
                />
              </div>

              <div className="flex gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCloseShiftModalOpen(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  className="flex-1"
                >
                  Tutup Shift
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
