"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, PackageSearch, ArrowDownToLine, X, AlertTriangle } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Ingredient {
  id: string;
  nama: string;
  satuan: string;
  stok_saat_ini: number;
  stok_minimum: number;
  harga_beli_terakhir: number;
}

export default function InventoryPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States untuk Modal Restock
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [jumlahMasuk, setJumlahMasuk] = useState("");
  const [catatanMasuk, setCatatanMasuk] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const response = await api.get("/ingredients");
      setIngredients(response.data);
    } catch {
      toast.error("Gagal mengambil data inventory");
    } finally {
      setIsLoading(false);
    }
  };

  const openRestockModal = (item: Ingredient) => {
    setSelectedIngredient(item);
    setJumlahMasuk("");
    setCatatanMasuk("");
    setIsRestockModalOpen(true);
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredient || !jumlahMasuk) return;

    setIsSubmitting(true);
    try {
      await api.post("/stock-movements", {
        ingredientId: selectedIngredient.id,
        tipe: "IN",
        jumlah: parseFloat(jumlahMasuk),
        catatan: catatanMasuk || "Restock manual dari Dashboard",
      });

      toast.success(`Stok ${selectedIngredient.nama} berhasil ditambahkan!`);
      setIsRestockModalOpen(false);
      fetchIngredients();
    } catch {
      toast.error("Gagal menambahkan stok");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  return (
    <div className="mx-auto max-w-6xl font-sans text-brand-ink">
      {/* Header Halaman */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-ink-dark sm:text-3xl">
            Inventory Bahan Baku
          </h1>
          <p className="mt-1 text-sm text-brand-ink-muted">
            Kelola stok bahan baku, batas minimum peringatan, dan riwayat harga beli.
          </p>
        </div>

        <Button
          type="button"
          className="gap-2 self-start sm:self-auto"
        >
          <Plus size={16} aria-hidden="true" />
          <span>Tambah Bahan Baru</span>
        </Button>
      </div>

      {/* Tabel Data Inventory */}
      <div className="overflow-hidden rounded-xl border border-brand-line bg-brand-surface shadow-xs">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-xs text-brand-ink-muted">
            Memuat data inventory…
          </div>
        ) : ingredients.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center p-6 text-center text-xs text-brand-ink-muted">
            <PackageSearch size={32} className="mb-2 text-brand-line-strong" aria-hidden="true" />
            <p className="font-semibold text-brand-ink-dark">Belum ada bahan baku</p>
            <p className="mt-1 text-brand-ink-muted">Daftarkan bahan baku awal untuk mulai melacak stok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-brand-line bg-brand-surface-alt text-brand-ink-dark font-semibold">
                  <th className="px-5 py-3">Nama Bahan</th>
                  <th className="px-5 py-3">Stok Saat Ini</th>
                  <th className="px-5 py-3">Stok Minimum</th>
                  <th className="px-5 py-3">Harga Beli Terakhir</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-line">
                {ingredients.map((item) => {
                  const isLow = item.stok_saat_ini <= item.stok_minimum;
                  return (
                    <tr
                      key={item.id}
                      className="transition-colors duration-150 hover:bg-brand-surface-alt/50"
                    >
                      <td className="px-5 py-3.5 font-medium text-brand-ink-dark">
                        {item.nama}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                            isLow
                              ? "bg-warning-soft text-warning"
                              : "bg-success-soft text-success"
                          }`}
                        >
                          {isLow && <AlertTriangle size={12} aria-hidden="true" />}
                          <span>
                            {item.stok_saat_ini} {item.satuan}
                          </span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-brand-ink-muted tabular-nums">
                        {item.stok_minimum} {item.satuan}
                      </td>
                      <td className="px-5 py-3.5 text-brand-ink-dark tabular-nums font-medium">
                        {formatRupiah(item.harga_beli_terakhir)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openRestockModal(item)}
                            className="inline-flex items-center gap-1 rounded-md border border-brand-line bg-brand-surface px-2.5 py-1 text-[11px] font-semibold text-brand-primary transition-colors duration-150 hover:bg-brand-primary-soft focus-visible:ring-2 focus-visible:ring-brand-primary"
                          >
                            <ArrowDownToLine size={13} aria-hidden="true" />
                            <span>Restock</span>
                          </button>
                          <button
                            type="button"
                            className="inline-flex size-7 items-center justify-center rounded-md text-brand-ink-muted transition-colors duration-150 hover:bg-brand-surface-alt hover:text-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary"
                            aria-label={`Ubah bahan ${item.nama}`}
                          >
                            <Edit2 size={14} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="inline-flex size-7 items-center justify-center rounded-md text-brand-ink-muted transition-colors duration-150 hover:bg-danger-soft hover:text-danger focus-visible:ring-2 focus-visible:ring-danger"
                            aria-label={`Hapus bahan ${item.nama}`}
                          >
                            <Trash2 size={14} aria-hidden="true" />
                          </button>
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

      {/* Modal Restock Stok Masuk */}
      {isRestockModalOpen && selectedIngredient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-overlay/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl border border-brand-line bg-brand-surface shadow-lg overflow-hidden">
            <div className="flex items-center justify-between border-b border-brand-line px-5 py-4">
              <div>
                <h3 className="text-base font-bold text-brand-ink-dark">Stok Masuk</h3>
                <p className="text-xs text-brand-ink-muted">
                  Tambah stok untuk <strong className="text-brand-primary font-semibold">{selectedIngredient.nama}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRestockModalOpen(false)}
                className="rounded-md p-1.5 text-brand-ink-muted hover:bg-brand-surface-alt hover:text-brand-ink-dark"
                aria-label="Tutup modal"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleRestock} className="p-5 space-y-4">
              <div>
                <label
                  htmlFor="jumlahMasuk"
                  className="mb-1.5 block text-xs font-semibold text-brand-ink-dark"
                >
                  Jumlah Masuk ({selectedIngredient.satuan})
                </label>
                <Input
                  id="jumlahMasuk"
                  type="number"
                  step="0.01"
                  required
                  min="0.01"
                  value={jumlahMasuk}
                  onChange={(e) => setJumlahMasuk(e.target.value)}
                  placeholder="Contoh: 10"
                  className="h-10 text-sm tabular-nums"
                />
              </div>

              <div>
                <label
                  htmlFor="catatanMasuk"
                  className="mb-1.5 block text-xs font-semibold text-brand-ink-dark"
                >
                  Catatan (Opsional)
                </label>
                <Input
                  id="catatanMasuk"
                  type="text"
                  value={catatanMasuk}
                  onChange={(e) => setCatatanMasuk(e.target.value)}
                  placeholder="Contoh: Belanja di Pasar Senen"
                  className="h-10 text-sm"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRestockModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Menyimpan…" : "Simpan Stok"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
