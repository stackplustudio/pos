"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  PackageSearch,
  ArrowDownToLine,
  X,
  AlertTriangle,
  ClipboardCheck,
  History,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from "lucide-react";
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

interface StockMovement {
  id: string;
  tipe: "IN" | "OUT" | "OPNAME" | "SALE";
  jumlah: number;
  catatan: string | null;
  tanggal: string;
}

export default function InventoryPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States untuk Modal Tambah/Edit Bahan
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [isEditingIngredient, setIsEditingIngredient] = useState(false);
  const [editingIngredientId, setEditingIngredientId] = useState<string | null>(null);
  const [ingredientForm, setIngredientForm] = useState({
    nama: "",
    satuan: "gr",
    stok_minimum: "0",
    harga_beli_terakhir: "0",
  });
  const [isSubmittingIngredient, setIsSubmittingIngredient] = useState(false);

  // States untuk Modal Restock
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [jumlahMasuk, setJumlahMasuk] = useState("");
  const [catatanMasuk, setCatatanMasuk] = useState("");
  const [isSubmittingRestock, setIsSubmittingRestock] = useState(false);

  // States untuk Modal Stok Opname (FR-INV-05)
  const [isOpnameModalOpen, setIsOpnameModalOpen] = useState(false);
  const [opnameIngredient, setOpnameIngredient] = useState<Ingredient | null>(null);
  const [stokFisik, setStokFisik] = useState("");
  const [catatanOpname, setCatatanOpname] = useState("");
  const [isSubmittingOpname, setIsSubmittingOpname] = useState(false);

  // States untuk Modal Kartu Stok (FR-INV-06)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyIngredient, setHistoryIngredient] = useState<Ingredient | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

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

  // Handler Bahan Baku (Tambah / Edit / Hapus)
  const openAddIngredientModal = () => {
    setIsEditingIngredient(false);
    setEditingIngredientId(null);
    setIngredientForm({
      nama: "",
      satuan: "gr",
      stok_minimum: "100",
      harga_beli_terakhir: "0",
    });
    setIsIngredientModalOpen(true);
  };

  const openEditIngredientModal = (item: Ingredient) => {
    setIsEditingIngredient(true);
    setEditingIngredientId(item.id);
    setIngredientForm({
      nama: item.nama,
      satuan: item.satuan,
      stok_minimum: String(item.stok_minimum),
      harga_beli_terakhir: String(item.harga_beli_terakhir),
    });
    setIsIngredientModalOpen(true);
  };

  const handleSubmitIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredientForm.nama.trim()) return;

    setIsSubmittingIngredient(true);
    try {
      if (isEditingIngredient && editingIngredientId) {
        await api.patch(`/ingredients/${editingIngredientId}`, {
          nama: ingredientForm.nama.trim(),
          satuan: ingredientForm.satuan.trim(),
          stok_minimum: parseFloat(ingredientForm.stok_minimum) || 0,
          harga_beli_terakhir: parseInt(ingredientForm.harga_beli_terakhir, 10) || 0,
        });
        toast.success("Data bahan baku berhasil diperbarui!");
      } else {
        await api.post("/ingredients", {
          nama: ingredientForm.nama.trim(),
          satuan: ingredientForm.satuan.trim(),
          stok_minimum: parseFloat(ingredientForm.stok_minimum) || 0,
          harga_beli_terakhir: parseInt(ingredientForm.harga_beli_terakhir, 10) || 0,
        });
        toast.success("Bahan baku baru berhasil ditambahkan!");
      }
      setIsIngredientModalOpen(false);
      fetchIngredients();
    } catch {
      toast.error(isEditingIngredient ? "Gagal memperbarui bahan baku" : "Gagal menambahkan bahan baku");
    } finally {
      setIsSubmittingIngredient(false);
    }
  };

  const handleDeleteIngredient = async (id: string, nama: string) => {
    if (!confirm(`Hapus bahan baku "${nama}"? Seluruh resep menu terkait juga akan terhapus.`)) return;

    try {
      await api.delete(`/ingredients/${id}`);
      toast.success("Bahan baku berhasil dihapus");
      fetchIngredients();
    } catch {
      toast.error("Gagal menghapus bahan baku");
    }
  };

  // Handler Restock
  const openRestockModal = (item: Ingredient) => {
    setSelectedIngredient(item);
    setJumlahMasuk("");
    setCatatanMasuk("");
    setIsRestockModalOpen(true);
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredient || !jumlahMasuk) return;

    setIsSubmittingRestock(true);
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
      setIsSubmittingRestock(false);
    }
  };

  // Handler Stok Opname (FR-INV-05)
  const openOpnameModal = (item: Ingredient) => {
    setOpnameIngredient(item);
    setStokFisik(String(item.stok_saat_ini));
    setCatatanOpname("");
    setIsOpnameModalOpen(true);
  };

  const handleOpnameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opnameIngredient || stokFisik === "") return;

    setIsSubmittingOpname(true);
    try {
      await api.post("/stock-movements/opname", {
        ingredientId: opnameIngredient.id,
        stok_fisik: parseFloat(stokFisik),
        catatan: catatanOpname || "Penyesuaian Stok Opname Fisik",
      });

      toast.success(`Stok Opname ${opnameIngredient.nama} berhasil disimpan!`);
      setIsOpnameModalOpen(false);
      fetchIngredients();
    } catch {
      toast.error("Gagal menyimpan stok opname");
    } finally {
      setIsSubmittingOpname(false);
    }
  };

  // Handler Kartu Stok (FR-INV-06)
  const openHistoryModal = async (item: Ingredient) => {
    setHistoryIngredient(item);
    setIsHistoryModalOpen(true);
    setIsLoadingHistory(true);

    try {
      const res = await api.get(`/stock-movements?ingredientId=${item.id}`);
      setMovements(res.data);
    } catch {
      toast.error("Gagal memuat kartu stok");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const formatRupiah = (angka: number) => {
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

  return (
    <div className="mx-auto max-w-6xl font-sans text-brand-ink">
      {/* Header Halaman */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-ink-dark sm:text-3xl">
            Inventory Bahan Baku
          </h1>
          <p className="mt-1 text-sm text-brand-ink-muted">
            Kelola stok bahan baku, batas minimum peringatan, stok opname, dan riwayat kartu stok.
          </p>
        </div>

        <Button
          type="button"
          onClick={openAddIngredientModal}
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
                  <th className="px-5 py-3 text-right">Aksi &amp; Log</th>
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
                          {/* Tombol Restock */}
                          <button
                            type="button"
                            onClick={() => openRestockModal(item)}
                            title="Restock stok masuk manual"
                            className="inline-flex items-center gap-1 rounded-md border border-brand-line bg-brand-surface px-2.5 py-1 text-[11px] font-semibold text-brand-primary transition-colors duration-150 hover:bg-brand-primary-soft focus-visible:ring-2 focus-visible:ring-brand-primary"
                          >
                            <ArrowDownToLine size={13} aria-hidden="true" />
                            <span>Restock</span>
                          </button>

                          {/* Tombol Stok Opname */}
                          <button
                            type="button"
                            onClick={() => openOpnameModal(item)}
                            title="Lakukan Stok Opname fisik"
                            className="inline-flex items-center gap-1 rounded-md border border-brand-line bg-brand-surface px-2.5 py-1 text-[11px] font-semibold text-brand-ink-dark transition-colors duration-150 hover:bg-brand-surface-alt focus-visible:ring-2 focus-visible:ring-brand-primary"
                          >
                            <ClipboardCheck size={13} aria-hidden="true" />
                            <span>Opname</span>
                          </button>

                          {/* Tombol Kartu Stok */}
                          <button
                            type="button"
                            onClick={() => openHistoryModal(item)}
                            title="Lihat histori kartu stok"
                            className="inline-flex size-7 items-center justify-center rounded-md text-brand-ink-muted transition-colors duration-150 hover:bg-brand-surface-alt hover:text-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary"
                            aria-label={`Kartu stok ${item.nama}`}
                          >
                            <History size={14} aria-hidden="true" />
                          </button>

                          {/* Tombol Edit */}
                          <button
                            type="button"
                            onClick={() => openEditIngredientModal(item)}
                            className="inline-flex size-7 items-center justify-center rounded-md text-brand-ink-muted transition-colors duration-150 hover:bg-brand-surface-alt hover:text-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary"
                            aria-label={`Ubah bahan ${item.nama}`}
                          >
                            <Edit2 size={14} aria-hidden="true" />
                          </button>

                          {/* Tombol Hapus */}
                          <button
                            type="button"
                            onClick={() => handleDeleteIngredient(item.id, item.nama)}
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

      {/* Modal Tambah / Edit Bahan Baku */}
      {isIngredientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-overlay/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-brand-line bg-brand-surface shadow-md overflow-hidden">
            <div className="flex items-center justify-between border-b border-brand-line px-5 py-4">
              <div>
                <h3 className="text-base font-bold text-brand-ink-dark">
                  {isEditingIngredient ? "Ubah Bahan Baku" : "Tambah Bahan Baku Baru"}
                </h3>
                <p className="text-xs text-brand-ink-muted">
                  {isEditingIngredient ? "Perbarui informasi takaran dan ambang batas stok." : "Daftarkan bahan baku baru untuk dihubungkan ke resep menu."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsIngredientModalOpen(false)}
                className="rounded-md p-1.5 text-brand-ink-muted hover:bg-brand-surface-alt hover:text-brand-ink-dark"
                aria-label="Tutup modal"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmitIngredient} className="p-5 space-y-4">
              <div>
                <label htmlFor="ingNama" className="mb-1.5 block text-xs font-semibold text-brand-ink-dark">
                  Nama Bahan Baku
                </label>
                <Input
                  id="ingNama"
                  type="text"
                  required
                  value={ingredientForm.nama}
                  onChange={(e) => setIngredientForm({ ...ingredientForm, nama: e.target.value })}
                  placeholder="Contoh: Biji Kopi Arabica, Susu Full Cream"
                  className="h-10 text-sm font-medium"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="ingSatuan" className="mb-1.5 block text-xs font-semibold text-brand-ink-dark">
                    Satuan
                  </label>
                  <select
                    id="ingSatuan"
                    required
                    value={ingredientForm.satuan}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, satuan: e.target.value })}
                    className="h-10 w-full rounded-md border border-brand-line-strong bg-brand-surface px-3 text-xs text-brand-ink-dark outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                  >
                    <option value="gr">Gram (gr)</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="ml">Mililiter (ml)</option>
                    <option value="liter">Liter (l)</option>
                    <option value="pcs">Pcs / Butir</option>
                    <option value="lembar">Lembar</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="ingStokMin" className="mb-1.5 block text-xs font-semibold text-brand-ink-dark">
                    Stok Minimum
                  </label>
                  <Input
                    id="ingStokMin"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={ingredientForm.stok_minimum}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, stok_minimum: e.target.value })}
                    placeholder="100"
                    className="h-10 text-sm tabular-nums"
                  />
                </div>

                <div>
                  <label htmlFor="ingHargaBeli" className="mb-1.5 block text-xs font-semibold text-brand-ink-dark">
                    Harga Beli Terakhir
                  </label>
                  <Input
                    id="ingHargaBeli"
                    type="number"
                    min="0"
                    step="10"
                    required
                    value={ingredientForm.harga_beli_terakhir}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, harga_beli_terakhir: e.target.value })}
                    placeholder="Rp"
                    className="h-10 text-sm tabular-nums"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsIngredientModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingIngredient}
                >
                  {isSubmittingIngredient ? "Menyimpan…" : isEditingIngredient ? "Simpan Perubahan" : "Tambah Bahan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Restock Stok Masuk */}
      {isRestockModalOpen && selectedIngredient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-overlay/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl border border-brand-line bg-brand-surface shadow-md overflow-hidden">
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
                  autoFocus
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
                  disabled={isSubmittingRestock}
                >
                  {isSubmittingRestock ? "Menyimpan…" : "Simpan Stok"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Stok Opname (FR-INV-05) */}
      {isOpnameModalOpen && opnameIngredient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-overlay/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl border border-brand-line bg-brand-surface shadow-md overflow-hidden">
            <div className="flex items-center justify-between border-b border-brand-line px-5 py-4">
              <div>
                <h3 className="text-base font-bold text-brand-ink-dark">Stok Opname Fisik</h3>
                <p className="text-xs text-brand-ink-muted">
                  Sinkronkan stok fisik aktual dengan data sistem untuk <strong className="text-brand-primary">{opnameIngredient.nama}</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpnameModalOpen(false)}
                className="rounded-md p-1.5 text-brand-ink-muted hover:bg-brand-surface-alt hover:text-brand-ink-dark"
                aria-label="Tutup modal"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleOpnameSubmit} className="p-5 space-y-4">
              <div className="rounded-lg border border-brand-line bg-brand-surface-alt p-3 text-xs">
                <div className="flex justify-between text-brand-ink-muted">
                  <span>Stok Sistem Saat Ini:</span>
                  <span className="font-semibold text-brand-ink-dark tabular-nums">
                    {opnameIngredient.stok_saat_ini} {opnameIngredient.satuan}
                  </span>
                </div>
                <div className="mt-2 flex justify-between border-t border-brand-line pt-2 text-brand-ink-muted">
                  <span>Selisih Penyesuaian:</span>
                  <span
                    className={`font-bold tabular-nums ${
                      parseFloat(stokFisik || "0") - opnameIngredient.stok_saat_ini < 0
                        ? "text-danger"
                        : "text-success"
                    }`}
                  >
                    {stokFisik !== ""
                      ? `${(parseFloat(stokFisik) - opnameIngredient.stok_saat_ini).toFixed(2)} ${opnameIngredient.satuan}`
                      : "0"}
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="stokFisik"
                  className="mb-1.5 block text-xs font-semibold text-brand-ink-dark"
                >
                  Hitungan Fisik Aktual ({opnameIngredient.satuan})
                </label>
                <Input
                  id="stokFisik"
                  type="number"
                  step="0.01"
                  required
                  min="0"
                  value={stokFisik}
                  onChange={(e) => setStokFisik(e.target.value)}
                  placeholder="Masukkan jumlah fisik nyata"
                  className="h-10 text-sm font-bold tabular-nums"
                  autoFocus
                />
              </div>

              <div>
                <label
                  htmlFor="catatanOpname"
                  className="mb-1.5 block text-xs font-semibold text-brand-ink-dark"
                >
                  Alasan Penyesuaian / Catatan
                </label>
                <Input
                  id="catatanOpname"
                  type="text"
                  value={catatanOpname}
                  onChange={(e) => setCatatanOpname(e.target.value)}
                  placeholder="Contoh: Selisih tumpah saat operasional"
                  className="h-10 text-sm"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpnameModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingOpname}
                >
                  {isSubmittingOpname ? "Menyimpan…" : "Konfirmasi Opname"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kartu Stok (FR-INV-06) */}
      {isHistoryModalOpen && historyIngredient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-overlay/50 backdrop-blur-xs p-4">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-brand-line bg-brand-surface shadow-md">
            <div className="flex items-center justify-between border-b border-brand-line px-5 py-4">
              <div>
                <h3 className="text-base font-bold text-brand-ink-dark">
                  Kartu Stok: {historyIngredient.nama}
                </h3>
                <p className="text-xs text-brand-ink-muted">
                  Log kronologis seluruh mutasi stok (pembelian PO, penjualan kasir, restock, dan opname).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="rounded-md p-1.5 text-brand-ink-muted hover:bg-brand-surface-alt hover:text-brand-ink-dark"
                aria-label="Tutup kartu stok"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {isLoadingHistory ? (
                <div className="flex h-40 items-center justify-center text-xs text-brand-ink-muted">
                  Memuat riwayat kartu stok…
                </div>
              ) : movements.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center text-center text-xs text-brand-ink-muted">
                  <History size={28} className="mb-2 text-brand-line-strong" aria-hidden="true" />
                  <p className="font-semibold text-brand-ink-dark">Belum ada mutasi stok</p>
                  <p className="mt-0.5">Seluruh perubahan stok bahan ini akan otomatis tercatat di sini.</p>
                </div>
              ) : (
                <div className="divide-y divide-brand-line rounded-lg border border-brand-line">
                  {movements.map((m) => {
                    const isPositive = m.tipe === "IN" || (m.tipe === "OPNAME" && m.jumlah > 0);
                    return (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-3.5 text-xs hover:bg-brand-surface-alt/50"
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                              m.tipe === "SALE"
                                ? "bg-brand-primary-soft text-brand-primary"
                                : m.tipe === "OPNAME"
                                ? "bg-warning-soft text-warning"
                                : isPositive
                                ? "bg-success-soft text-success"
                                : "bg-danger-soft text-danger"
                            }`}
                          >
                            {m.tipe === "OPNAME" ? (
                              <RefreshCw size={15} aria-hidden="true" />
                            ) : isPositive ? (
                              <TrendingUp size={15} aria-hidden="true" />
                            ) : (
                              <TrendingDown size={15} aria-hidden="true" />
                            )}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-brand-ink-dark">
                                {m.tipe === "SALE"
                                  ? "Penjualan POS"
                                  : m.tipe === "IN"
                                  ? "Stok Masuk / PO"
                                  : m.tipe === "OPNAME"
                                  ? "Penyesuaian Opname"
                                  : "Stok Keluar Manual"}
                              </span>
                              <span className="text-[10px] text-brand-ink-muted">
                                {formatDate(m.tanggal)}
                              </span>
                            </div>
                            <p className="mt-0.5 text-brand-ink-muted">
                              {m.catatan || "Tanpa keterangan"}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`font-bold tabular-nums text-sm ${
                              isPositive ? "text-success" : "text-danger"
                            }`}
                          >
                            {isPositive ? `+${m.jumlah}` : `${m.jumlah}`}{" "}
                            <span className="text-xs font-normal text-brand-ink-muted">
                              {historyIngredient.satuan}
                            </span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
