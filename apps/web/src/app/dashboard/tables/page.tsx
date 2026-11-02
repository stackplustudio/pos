"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, LayoutGrid } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Table {
  id: string;
  nomor_meja: string;
  area: string;
  status: string;
}

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [nomorMeja, setNomorMeja] = useState("");
  const [area, setArea] = useState("");

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await api.get("/tables");
      setTables(response.data);
    } catch {
      toast.error("Gagal mengambil data meja");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomorMeja) return;

    try {
      await api.post("/tables", { nomor_meja: nomorMeja, area });
      toast.success("Meja berhasil ditambahkan");
      setNomorMeja("");
      setArea("");
      fetchTables();
    } catch {
      toast.error("Gagal menambahkan meja");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/tables/${id}`);
      toast.success("Meja berhasil dihapus");
      fetchTables();
    } catch {
      toast.error("Gagal menghapus meja");
    }
  };

  return (
    <div className="mx-auto max-w-6xl font-sans text-brand-ink">
      {/* Header Halaman */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-brand-ink-dark sm:text-3xl">
          Manajemen Meja
        </h1>
        <p className="mt-1 text-sm text-brand-ink-muted">
          Atur nomor dan area tata letak meja untuk pesanan makan di tempat (Dine-in).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Kolom Kiri: Form Tambah Meja */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-brand-line bg-brand-surface p-5 shadow-xs sticky top-20">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-brand-ink-dark">
              <Plus size={16} className="text-brand-primary" aria-hidden="true" />
              <span>Tambah Meja Baru</span>
            </h2>

            <form onSubmit={handleAddTable} className="space-y-4">
              <div>
                <label
                  htmlFor="nomorMeja"
                  className="mb-1.5 block text-xs font-semibold text-brand-ink-dark"
                >
                  Nomor Meja
                </label>
                <Input
                  id="nomorMeja"
                  type="text"
                  required
                  value={nomorMeja}
                  onChange={(e) => setNomorMeja(e.target.value)}
                  placeholder="Contoh: A1, Teras-2"
                  className="h-10 text-xs"
                />
              </div>

              <div>
                <label
                  htmlFor="areaMeja"
                  className="mb-1.5 block text-xs font-semibold text-brand-ink-dark"
                >
                  Area (Opsional)
                </label>
                <Input
                  id="areaMeja"
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Contoh: Indoor, Outdoor"
                  className="h-10 text-xs"
                />
              </div>

              <Button
                type="submit"
                className="w-full text-xs font-semibold"
              >
                Simpan Meja
              </Button>
            </form>
          </div>
        </div>

        {/* Kolom Kanan: Grid Meja */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center text-xs text-brand-ink-muted">
              Memuat data meja…
            </div>
          ) : tables.length === 0 ? (
            <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-brand-line bg-brand-surface p-6 text-center text-xs text-brand-ink-muted">
              <LayoutGrid size={32} className="mb-2 text-brand-line-strong" aria-hidden="true" />
              <p className="font-semibold text-brand-ink-dark">Belum ada meja terdaftar</p>
              <p className="mt-1 text-brand-ink-muted">Gunakan form di samping untuk mendaftarkan meja operasional.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {tables.map((table) => {
                const isVacant = table.status === "KOSONG";
                return (
                  <div
                    key={table.id}
                    className="group relative flex flex-col items-center justify-center rounded-xl border border-brand-line bg-brand-surface p-5 shadow-xs transition-colors duration-150 hover:border-brand-primary"
                  >
                    <span
                      className={`absolute top-3 left-3 size-2 rounded-full ${
                        isVacant ? "bg-success" : "bg-danger"
                      }`}
                      title={isVacant ? "Meja Kosong" : "Meja Terisi"}
                      aria-hidden="true"
                    />

                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleDelete(table.id)}
                        className="inline-flex size-6 items-center justify-center rounded text-danger hover:bg-danger-soft transition-colors"
                        aria-label={`Hapus meja ${table.nomor_meja}`}
                      >
                        <Trash2 size={13} aria-hidden="true" />
                      </button>
                    </div>

                    <p className="mt-1 text-2xl font-bold tracking-tight text-brand-ink-dark">
                      {table.nomor_meja}
                    </p>
                    <p className="mt-1 rounded-md bg-brand-surface-alt px-2 py-0.5 text-[10px] font-medium text-brand-ink-muted">
                      {table.area || "Umum"}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
