"use client";

import { useState, useEffect } from "react";
import { Plus, CheckCircle2, XCircle, ShoppingBag, X, Check, Trash2 } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Supplier {
  id: string;
  nama: string;
}

interface Ingredient {
  id: string;
  nama: string;
  satuan: string;
}

interface POItem {
  id: string;
  qty: number;
  harga_satuan: number;
  ingredient: { nama: string; satuan: string };
}

interface PurchaseOrder {
  id: string;
  nomor_po: string;
  status: string;
  total: number;
  supplier: { nama: string };
  items: POItem[];
}

export default function PurchaseOrdersPage() {
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [catatan, setCatatan] = useState("");
  const [items, setItems] = useState<{ ingredientId: string; qty: number; harga_satuan: number }[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resPo, resSup, resIng] = await Promise.all([
        api.get("/purchase-orders"),
        api.get("/suppliers"),
        api.get("/ingredients"),
      ]);
      setPos(resPo.data);
      setSuppliers(resSup.data);
      setIngredients(resIng.data);
    } catch {
      toast.error("Gagal memuat data purchase order");
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = () => setItems([...items, { ingredientId: "", qty: 1, harga_satuan: 0 }]);

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || items.length === 0) {
      toast.error("Pemasok dan minimal satu item wajib diisi");
      return;
    }

    try {
      await api.post("/purchase-orders", { supplierId: selectedSupplier, catatan, items });
      toast.success("Purchase order berhasil dibuat!");
      setIsModalOpen(false);
      setItems([]);
      setSelectedSupplier("");
      setCatatan("");
      fetchData();
    } catch {
      toast.error("Gagal membuat purchase order");
    }
  };

  const updateStatus = async (id: string, status: string) => {
    if (!confirm(`Yakin mengubah status PO menjadi ${status}? (Jika SELESAI, stok otomatis bertambah)`)) return;
    try {
      await api.patch(`/purchase-orders/${id}/status`, { status });
      toast.success(`Status PO diperbarui: ${status}`);
      fetchData();
    } catch {
      toast.error("Gagal mengubah status PO");
    }
  };

  const formatRp = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

  return (
    <div className="mx-auto max-w-6xl font-sans text-brand-ink">
      {/* Header Halaman */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-ink-dark sm:text-3xl">
            Purchase Order
          </h1>
          <p className="mt-1 text-sm text-brand-ink-muted">
            Catat belanja bahan baku ke supplier dan perbarui stok gudang secara otomatis.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="gap-2 self-start sm:self-auto"
        >
          <Plus size={16} aria-hidden="true" />
          <span>Buat PO Baru</span>
        </Button>
      </div>

      {/* Daftar Purchase Order */}
      {isLoading ? (
        <div className="flex h-56 items-center justify-center text-xs text-brand-ink-muted">
          Memuat data purchase order…
        </div>
      ) : pos.length === 0 ? (
        <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-brand-line bg-brand-surface p-6 text-center text-xs text-brand-ink-muted">
          <ShoppingBag size={32} className="mb-2 text-brand-line-strong" aria-hidden="true" />
          <p className="font-semibold text-brand-ink-dark">Belum ada riwayat PO</p>
          <p className="mt-1 text-brand-ink-muted">Buat purchase order pertama untuk mencatat pesanan belanja bahan.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pos.map((po) => {
            const isCompleted = po.status === "SELESAI";
            const isCancelled = po.status === "BATAL";
            return (
              <div
                key={po.id}
                className="flex flex-col justify-between gap-4 rounded-xl border border-brand-line bg-brand-surface p-5 shadow-xs transition-colors duration-150 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="mb-2 flex items-center gap-2.5">
                    <span className="font-mono text-sm font-bold text-brand-ink-dark">
                      {po.nomor_po}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        isCompleted
                          ? "bg-success-soft text-success"
                          : isCancelled
                          ? "bg-danger-soft text-danger"
                          : "bg-warning-soft text-warning"
                      }`}
                    >
                      {po.status}
                    </span>
                  </div>

                  <p className="text-xs text-brand-ink-muted">
                    Supplier:{" "}
                    <strong className="font-semibold text-brand-ink-dark">
                      {po.supplier?.nama || "Pemasok"}
                    </strong>
                  </p>
                  <p className="mt-0.5 text-xs text-brand-primary font-bold tabular-nums">
                    Total: {formatRp(po.total)} · {po.items?.length || 0} Item
                  </p>
                </div>

                {po.status === "PENDING" && (
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => updateStatus(po.id, "BATAL")}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-danger/30 bg-danger-soft px-3 text-xs font-semibold text-danger-dark transition-colors duration-150 hover:bg-danger/15 focus-visible:ring-2 focus-visible:ring-danger"
                    >
                      <XCircle size={14} aria-hidden="true" />
                      <span>Batal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatus(po.id, "SELESAI")}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-success px-3 text-xs font-semibold text-white shadow-xs transition-colors duration-150 hover:bg-success/90 focus-visible:ring-2 focus-visible:ring-success"
                    >
                      <CheckCircle2 size={14} aria-hidden="true" />
                      <span>Terima Barang</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Buat PO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-overlay/50 backdrop-blur-xs p-4">
          <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-brand-line bg-brand-surface shadow-md">
            <div className="flex items-center justify-between border-b border-brand-line px-5 py-4">
              <div>
                <h3 className="text-base font-bold text-brand-ink-dark">Buat Purchase Order</h3>
                <p className="text-xs text-brand-ink-muted">Pilih supplier dan rincian belanja bahan baku.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-md p-1.5 text-brand-ink-muted hover:bg-brand-surface-alt hover:text-brand-ink-dark"
                aria-label="Tutup modal"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label
                  htmlFor="poSupplier"
                  className="mb-1.5 block text-xs font-semibold text-brand-ink-dark"
                >
                  Pilih Supplier
                </label>
                <select
                  id="poSupplier"
                  required
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="h-10 w-full rounded-md border border-brand-line-strong bg-brand-surface px-3 text-xs text-brand-ink-dark outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <option value="">-- Pilih Supplier --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rincian Belanja Items */}
              <div className="rounded-xl border border-brand-line bg-brand-surface-alt p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand-ink-dark">Daftar Bahan Belanja</span>
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline"
                  >
                    <Plus size={14} aria-hidden="true" />
                    <span>Tambah Item</span>
                  </button>
                </div>

                {items.length === 0 ? (
                  <p className="py-2 text-center text-xs text-brand-ink-muted">
                    Belum ada item belanja. Klik Tambah Item.
                  </p>
                ) : (
                  items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        required
                        value={item.ingredientId}
                        onChange={(e) => updateItem(idx, "ingredientId", e.target.value)}
                        className="h-9 flex-1 rounded-md border border-brand-line-strong bg-brand-surface px-2.5 text-xs text-brand-ink-dark outline-none"
                        aria-label={`Pilih Bahan ${idx + 1}`}
                      >
                        <option value="">Pilih Bahan</option>
                        {ingredients.map((ing) => (
                          <option key={ing.id} value={ing.id}>
                            {ing.nama} ({ing.satuan})
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        step="0.01"
                        required
                        min="0.01"
                        placeholder="Qty"
                        value={item.qty || ""}
                        onChange={(e) => updateItem(idx, "qty", parseFloat(e.target.value) || 0)}
                        className="h-9 w-20 rounded-md border border-brand-line-strong bg-brand-surface px-2 text-xs tabular-nums outline-none"
                        aria-label="Jumlah Qty"
                      />

                      <input
                        type="number"
                        required
                        min="0"
                        placeholder="Harga (Rp)"
                        value={item.harga_satuan || ""}
                        onChange={(e) => updateItem(idx, "harga_satuan", parseInt(e.target.value, 10) || 0)}
                        className="h-9 w-28 rounded-md border border-brand-line-strong bg-brand-surface px-2 text-xs tabular-nums outline-none"
                        aria-label="Harga Satuan"
                      />

                      <button
                        type="button"
                        onClick={() => setItems(items.filter((_, i) => i !== idx))}
                        className="inline-flex size-8 items-center justify-center rounded text-danger hover:bg-danger-soft"
                        aria-label="Hapus item baris ini"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div>
                <label
                  htmlFor="poCatatan"
                  className="mb-1.5 block text-xs font-semibold text-brand-ink-dark"
                >
                  Catatan (Opsional)
                </label>
                <Input
                  id="poCatatan"
                  type="text"
                  placeholder="Catatan belanja atau nomor referensi faktur"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="h-10 text-xs"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2.5 border-t border-brand-line pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="gap-1.5"
                >
                  <Check size={16} aria-hidden="true" />
                  <span>Simpan PO</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
