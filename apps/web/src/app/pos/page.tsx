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
}

export default function POSPage() {
  const router = useRouter();

  // States
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

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

  useEffect(() => {
    checkActiveShift();
    fetchMenus();
    fetchDiscounts();
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

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    try {
      await api.post("/orders", {
        tipe: "TAKEAWAY",
        metode_bayar: "TUNAI",
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
      });

      setCart([]);
      setSelectedDiscount(null);
      checkActiveShift();
      setIsReceiptModalOpen(true);
    } catch {
      toast.error("Transaksi gagal diproses.");
    } finally {
      setIsProcessing(false);
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
        <div className="w-full max-w-sm rounded-xl border border-brand-line bg-brand-surface p-6 text-center shadow-sm sm:p-8">
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
              <p className="text-[11px] text-brand-ink-muted">Pilih produk untuk menambah pesanan</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden sm:flex items-center gap-2 rounded-lg bg-brand-primary-soft px-3 py-1.5 text-xs text-brand-primary">
              <Wallet size={15} aria-hidden="true" />
              <span>Kas Sistem:</span>
              <strong className="font-semibold tabular-nums">{formatRp(activeShift.kas_sistem)}</strong>
            </div>
            <button
              type="button"
              onClick={() => setIsCloseShiftModalOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-danger/30 bg-danger-soft px-3 text-xs font-semibold text-danger-dark transition-colors duration-150 hover:bg-danger/15 focus-visible:ring-2 focus-visible:ring-danger"
            >
              <Clock size={14} aria-hidden="true" />
              <span>Tutup Shift</span>
            </button>
          </div>
        </header>

        {/* Grid Item Menu */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {menus.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-brand-line bg-brand-surface p-6 text-center text-xs text-brand-ink-muted">
              Belum ada menu yang aktif. Tambahkan menu di katalog dashboard.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {menus.map((menu) => (
                <button
                  key={menu.id}
                  type="button"
                  onClick={() => addToCart(menu)}
                  className="group flex h-28 flex-col justify-between rounded-xl border border-brand-line bg-brand-surface p-3.5 text-left shadow-xs transition-colors duration-150 hover:border-brand-primary hover:bg-brand-surface-alt focus-visible:ring-2 focus-visible:ring-brand-primary active:scale-[0.98]"
                >
                  <p className="text-sm font-semibold text-brand-ink-dark line-clamp-2 leading-tight">
                    {menu.nama}
                  </p>
                  <div className="mt-auto flex items-baseline justify-between">
                    <span className="text-xs font-bold text-brand-primary tabular-nums">
                      {formatRp(menu.harga_jual)}
                    </span>
                    <span className="inline-flex size-6 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus size={14} aria-hidden="true" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AREA KANAN: Keranjang & Pembayaran */}
      <aside className="flex h-full w-full max-w-[360px] sm:max-w-[400px] flex-col border-l border-brand-line bg-brand-surface shadow-xs print:hidden">
        {/* Header Keranjang */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-brand-line px-5">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-brand-primary-soft text-brand-primary">
              <ShoppingCart size={16} aria-hidden="true" />
            </span>
            <h2 className="text-sm font-bold text-brand-ink-dark">Pesanan Aktif</h2>
          </div>
          {cart.length > 0 && (
            <button
              type="button"
              onClick={() => setCart([])}
              className="text-xs font-medium text-danger hover:underline"
            >
              Kosongkan
            </button>
          )}
        </div>

        {/* Daftar Item Keranjang */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {cart.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center text-xs text-brand-ink-muted">
              <ShoppingCart size={32} className="mb-2 text-brand-line-strong" aria-hidden="true" />
              <span>Keranjang masih kosong</span>
              <span className="text-[11px] text-brand-ink-muted/80">Klik menu di sebelah kiri untuk memesan</span>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex flex-col rounded-lg border border-brand-line bg-brand-background p-3 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-brand-ink-dark line-clamp-1">
                    {item.nama}
                  </span>
                  <span className="text-xs font-bold text-brand-ink-dark tabular-nums shrink-0">
                    {formatRp(item.harga_jual * item.qty)}
                  </span>
                </div>

                <div className="mt-2.5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCart(cart.filter((c) => c.id !== item.id))}
                    className="inline-flex items-center gap-1 text-[11px] text-danger hover:underline"
                    aria-label={`Hapus ${item.nama}`}
                  >
                    <Trash2 size={13} aria-hidden="true" />
                    <span>Hapus</span>
                  </button>

                  <div className="flex items-center gap-1.5 rounded-md border border-brand-line bg-brand-surface p-0.5">
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, -1)}
                      className="flex size-6 items-center justify-center rounded text-brand-ink-dark hover:bg-brand-surface-alt focus-visible:ring-1 focus-visible:ring-brand-primary"
                      aria-label="Kurangi kuantitas"
                    >
                      <Minus size={12} aria-hidden="true" />
                    </button>
                    <span className="w-5 text-center text-xs font-bold tabular-nums">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, 1)}
                      className="flex size-6 items-center justify-center rounded bg-brand-primary text-white hover:bg-brand-primary-dark focus-visible:ring-1 focus-visible:ring-brand-primary"
                      aria-label="Tambah kuantitas"
                    >
                      <Plus size={12} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Ringkasan Subtotal, Pajak, dan Diskon */}
        <div className="border-t border-brand-line bg-brand-surface p-4 sm:p-5">
          {/* Pemilih Diskon */}
          <button
            type="button"
            onClick={() => setIsDiscountModalOpen(true)}
            className="mb-3 flex h-9 w-full items-center justify-between rounded-lg border border-dashed border-brand-primary/40 bg-brand-primary-soft px-3 text-xs font-medium text-brand-primary transition-colors duration-150 hover:bg-brand-primary/10"
          >
            <div className="flex items-center gap-1.5 truncate">
              <Tag size={14} aria-hidden="true" />
              <span className="truncate">
                {selectedDiscount ? `Promo: ${selectedDiscount.nama}` : "Pilih Diskon / Promo"}
              </span>
            </div>
            {selectedDiscount && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDiscount(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    setSelectedDiscount(null);
                  }
                }}
                className="text-danger hover:text-danger-dark"
                aria-label="Hapus diskon"
              >
                <X size={14} aria-hidden="true" />
              </span>
            )}
          </button>

          <div className="space-y-1.5 text-xs text-brand-ink">
            <div className="flex justify-between">
              <span className="text-brand-ink-muted">Subtotal</span>
              <span className="tabular-nums font-medium">{formatRp(subtotal)}</span>
            </div>
            {diskonNominal > 0 && (
              <div className="flex justify-between text-success">
                <span>Diskon</span>
                <span className="tabular-nums font-semibold">- {formatRp(diskonNominal)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-brand-ink-muted">Pajak PB1 (11%)</span>
              <span className="tabular-nums font-medium">{formatRp(pajak)}</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between border-t border-brand-line pt-2">
              <span className="text-sm font-bold text-brand-ink-dark">Total Tagihan</span>
              <span className="text-lg font-bold text-brand-primary tabular-nums">
                {formatRp(total)}
              </span>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleCheckout}
            disabled={cart.length === 0 || isProcessing}
            className="mt-4 h-11 w-full text-sm font-semibold"
          >
            {isProcessing ? "Memproses Transaksi..." : `Bayar Tunai (${formatRp(total)})`}
          </Button>
        </div>
      </aside>

      {/* MODAL PILIH DISKON */}
      {isDiscountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-overlay/50 backdrop-blur-xs p-4 print:hidden">
          <div className="w-full max-w-sm rounded-xl border border-brand-line bg-brand-surface p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-brand-ink-dark">Pilih Promo Aktif</h3>
              <button
                type="button"
                onClick={() => setIsDiscountModalOpen(false)}
                className="rounded-md p-1 text-brand-ink-muted hover:bg-brand-surface-alt hover:text-brand-ink-dark"
                aria-label="Tutup promo"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {discounts.length === 0 ? (
                <p className="py-4 text-center text-xs text-brand-ink-muted">
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

      {/* MODAL CETAK STRUK THERMAL */}
      {isReceiptModalOpen && lastOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-overlay/60 backdrop-blur-xs p-4 print:p-0 print:bg-white">
          <div className="w-full max-w-sm rounded-xl border border-brand-line bg-white p-6 shadow-md print:rounded-none print:border-none print:shadow-none print:p-0">
            {/* Template Struk Thermal */}
            <div className="mb-6 text-center font-mono text-xs text-brand-ink-dark print:mb-0">
              <h2 className="text-base font-bold">NusaKasir</h2>
              <p className="text-[11px] text-gray-500">Struk Transaksi Penjualan</p>
              <p className="mt-1 text-[11px] text-gray-500">{lastOrder.waktu}</p>
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

      {/* MODAL TUTUP SHIFT */}
      {isCloseShiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-overlay/50 backdrop-blur-xs p-4 print:hidden">
          <div className="w-full max-w-sm rounded-xl border border-brand-line bg-brand-surface p-5 shadow-lg sm:p-6">
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
