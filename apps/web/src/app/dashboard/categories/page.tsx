"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, FolderTree } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  nama_kategori: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulasi data kategori produk
    setCategories([
      { id: "1", nama_kategori: "Kopi & Espresso" },
      { id: "2", nama_kategori: "Non-Kopi & Teh" },
      { id: "3", nama_kategori: "Makanan Utama" },
      { id: "4", nama_kategori: "Snack & Camilan" },
    ]);
    setIsLoading(false);
  }, []);

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
                    className="inline-flex size-8 items-center justify-center rounded-lg text-brand-ink-muted transition-colors duration-150 hover:bg-brand-surface-alt hover:text-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary"
                    aria-label={`Ubah kategori ${cat.nama_kategori}`}
                  >
                    <Edit2 size={15} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
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
    </div>
  );
}
