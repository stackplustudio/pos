"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, FolderTree, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/axios";
import toast from "react-hot-toast";

interface Category {
  id: string;
  nama_kategori: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [namaKategori, setNamaKategori] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch {
      toast.error("Gagal memuat data kategori");
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setNamaKategori("");
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setIsEditing(true);
    setEditingId(cat.id);
    setNamaKategori(cat.nama_kategori);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKategori.trim()) return;

    setIsSubmitting(true);
    try {
      if (isEditing && editingId) {
        await api.patch(`/categories/${editingId}`, { nama_kategori: namaKategori.trim() });
        toast.success("Kategori berhasil diperbarui!");
      } else {
        await api.post("/categories", { nama_kategori: namaKategori.trim() });
        toast.success("Kategori baru berhasil ditambahkan!");
      }
      setIsModalOpen(false);
      setNamaKategori("");
      fetchCategories();
    } catch {
      toast.error(isEditing ? "Gagal memperbarui kategori" : "Gagal menambahkan kategori");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Yakin ingin menghapus kategori "${nama}"?`)) return;

    try {
      await api.delete(`/categories/${id}`);
      toast.success("Kategori berhasil dihapus");
      fetchCategories();
    } catch {
      toast.error("Gagal menghapus kategori");
    }
  };

  return (
    <div className="mx-auto max-w-6xl font-sans text-brand-ink">
      {/* Header Halaman */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-ink-dark sm:text-3xl">
            Kategori Menu
          </h1>
          <p className="mt-1 text-sm text-brand-ink-muted">
            Kelola pengelompokan produk untuk memudahkan navigasi pada layar kasir.
          </p>
        </div>

        <Button
          type="button"
          onClick={openAddModal}
          className="gap-2 self-start sm:self-auto"
        >
          <Plus size={16} aria-hidden="true" />
          <span>Tambah Kategori</span>
        </Button>
      </div>

      {/* Tabel Kategori */}
      <div className="overflow-hidden rounded-xl border border-brand-line bg-brand-surface shadow-xs">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-xs text-brand-ink-muted">
            Memuat data kategori…
          </div>
        ) : categories.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center p-6 text-center text-xs text-brand-ink-muted">
            <FolderTree size={32} className="mb-2 text-brand-line-strong" aria-hidden="true" />
            <p className="font-semibold text-brand-ink-dark">Belum ada kategori</p>
            <p className="mt-1 text-brand-ink-muted">Tambahkan kategori pertama untuk mengelompokkan menu.</p>
          </div>
        ) : (
          <div className="divide-y divide-brand-line">
            <div className="flex items-center justify-between bg-brand-surface-alt px-5 py-3 text-xs font-semibold text-brand-ink-dark">
              <span>Nama Kategori</span>
              <span>Aksi</span>
            </div>
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between px-5 py-3.5 transition-colors duration-150 hover:bg-brand-surface-alt/50"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-brand-primary-soft text-brand-primary">
                    <FolderTree size={16} aria-hidden="true" />
                  </span>
                  <span className="text-sm font-medium text-brand-ink-dark">
                    {cat.nama_kategori}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(cat)}
                    className="inline-flex size-8 items-center justify-center rounded-lg text-brand-ink-muted transition-colors duration-150 hover:bg-brand-surface-alt hover:text-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary"
                    aria-label={`Ubah kategori ${cat.nama_kategori}`}
                  >
                    <Edit2 size={15} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cat.id, cat.nama_kategori)}
                    className="inline-flex size-8 items-center justify-center rounded-lg text-brand-ink-muted transition-colors duration-150 hover:bg-danger-soft hover:text-danger focus-visible:ring-2 focus-visible:ring-danger"
                    aria-label={`Hapus kategori ${cat.nama_kategori}`}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Tambah / Edit Kategori */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-overlay/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl border border-brand-line bg-brand-surface shadow-md overflow-hidden">
            <div className="flex items-center justify-between border-b border-brand-line px-5 py-4">
              <div>
                <h3 className="text-base font-bold text-brand-ink-dark">
                  {isEditing ? "Ubah Kategori" : "Tambah Kategori Baru"}
                </h3>
                <p className="text-xs text-brand-ink-muted">
                  {isEditing ? "Perbarui nama pengelompokan menu." : "Tentukan nama kategori untuk katalog kasir."}
                </p>
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

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label
                  htmlFor="namaKategori"
                  className="mb-1.5 block text-xs font-semibold text-brand-ink-dark"
                >
                  Nama Kategori
                </label>
                <Input
                  id="namaKategori"
                  type="text"
                  required
                  value={namaKategori}
                  onChange={(e) => setNamaKategori(e.target.value)}
                  placeholder="Contoh: Kopi, Minuman Dingin, Snack"
                  className="h-10 text-sm font-medium"
                  autoFocus
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
                  {isSubmitting ? "Menyimpan…" : isEditing ? "Simpan Perubahan" : "Tambah Kategori"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
