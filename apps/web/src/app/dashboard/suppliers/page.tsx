"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Truck, X } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Supplier {
  id: string;
  nama: string;
  kontak: string | null;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ nama: "", kontak: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await api.get("/suppliers");
      setSuppliers(response.data);
    } catch {
      toast.error("Gagal mengambil data supplier");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/suppliers", formData);
      toast.success("Supplier berhasil ditambahkan!");
      setIsModalOpen(false);
      setFormData({ nama: "", kontak: "" });
      fetchSuppliers();
    } catch {
      toast.error("Gagal menambahkan supplier");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus supplier ini?")) return;
    try {
      await api.delete(`/suppliers/${id}`);
      toast.success("Supplier berhasil dihapus");
      fetchSuppliers();
    } catch {
      toast.error("Gagal menghapus supplier");
    }
  };

  return (
    <div className="mx-auto max-w-6xl font-sans text-brand-ink">
      {/* Header Halaman */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-ink-dark sm:text-3xl">
            Data Supplier
          </h1>
          <p className="mt-1 text-sm text-brand-ink-muted">
            Kelola kontak pemasok bahan baku untuk memudahkan proses restock dan pembelian.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="gap-2 self-start sm:self-auto"
        >
          <Plus size={16} aria-hidden="true" />
          <span>Tambah Supplier</span>
        </Button>
      </div>

      {/* Tabel Data Supplier */}
      <div className="overflow-hidden rounded-xl border border-brand-line bg-brand-surface shadow-xs">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-xs text-brand-ink-muted">
            Memuat data supplier…
          </div>
        ) : suppliers.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center p-6 text-center text-xs text-brand-ink-muted">
            <Truck size={32} className="mb-2 text-brand-line-strong" aria-hidden="true" />
            <p className="font-semibold text-brand-ink-dark">Belum ada supplier</p>
            <p className="mt-1 text-brand-ink-muted">Tambahkan kontak pemasok untuk mempermudah restock bahan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-brand-line bg-brand-surface-alt text-brand-ink-dark font-semibold">
                  <th className="px-5 py-3">Nama Pemasok</th>
                  <th className="px-5 py-3">Kontak / Telepon</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-line">
                {suppliers.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors duration-150 hover:bg-brand-surface-alt/50"
                  >
                    <td className="px-5 py-3.5 font-semibold text-brand-ink-dark">
                      {item.nama}
                    </td>
                    <td className="px-5 py-3.5 text-brand-ink-muted">
                      {item.kontak || "-"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="inline-flex size-8 items-center justify-center rounded-lg text-danger hover:bg-danger-soft transition-colors"
                        aria-label={`Hapus supplier ${item.nama}`}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah Supplier */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-overlay/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl border border-brand-line bg-brand-surface p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-brand-ink-dark">Tambah Supplier Baru</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-md p-1 text-brand-ink-muted hover:bg-brand-surface-alt hover:text-brand-ink-dark"
                aria-label="Tutup modal"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="supplierNama"
                  className="mb-1.5 block text-xs font-semibold text-brand-ink-dark"
                >
                  Nama Pemasok
                </label>
                <Input
                  id="supplierNama"
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Agen Telur Pak Budi"
                  className="h-10 text-xs"
                />
              </div>

              <div>
                <label
                  htmlFor="supplierKontak"
                  className="mb-1.5 block text-xs font-semibold text-brand-ink-dark"
                >
                  Kontak / Telepon (Opsional)
                </label>
                <Input
                  id="supplierKontak"
                  type="text"
                  value={formData.kontak}
                  onChange={(e) => setFormData({ ...formData, kontak: e.target.value })}
                  placeholder="Contoh: 081234567890"
                  className="h-10 text-xs"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Menyimpan…" : "Simpan Supplier"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
