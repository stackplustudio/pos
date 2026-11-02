"use client";

import { useState, useEffect } from "react";
import { Store, MapPin, Save, ShieldCheck } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const [formData, setFormData] = useState({ nama_bisnis: "", alamat: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/settings");
      setFormData({
        nama_bisnis: res.data.nama_bisnis || "",
        alamat: res.data.alamat || "",
      });
    } catch {
      toast.error("Gagal memuat pengaturan toko");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.patch("/settings", formData);
      toast.success("Profil outlet berhasil diperbarui!");
    } catch {
      toast.error("Gagal menyimpan pengaturan");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-56 items-center justify-center font-sans text-xs text-brand-ink-muted">
        Memuat data pengaturan outlet…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl font-sans text-brand-ink">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-brand-ink-dark sm:text-3xl">
          Pengaturan Outlet
        </h1>
        <p className="mt-1 text-sm text-brand-ink-muted">
          Perbarui identitas bisnis dan alamat resmi untuk tampilan cetak struk POS.
        </p>
      </div>

      <div className="rounded-xl border border-brand-line bg-brand-surface p-6 shadow-xs">
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label
              htmlFor="namaBisnis"
              className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink-dark"
            >
              <Store size={14} className="text-brand-primary" aria-hidden="true" />
              <span>Nama Outlet Bisnis</span>
            </label>
            <Input
              id="namaBisnis"
              type="text"
              required
              value={formData.nama_bisnis}
              onChange={(e) => setFormData({ ...formData, nama_bisnis: e.target.value })}
              className="h-10 text-sm font-medium"
              placeholder="Contoh: Kedai Kopi Senja"
            />
          </div>

          <div>
            <label
              htmlFor="alamatBisnis"
              className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink-dark"
            >
              <MapPin size={14} className="text-brand-primary" aria-hidden="true" />
              <span>Alamat Lengkap</span>
            </label>
            <textarea
              id="alamatBisnis"
              rows={3}
              value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              className="w-full rounded-md border border-brand-line-strong bg-brand-surface p-3 text-xs text-brand-ink-dark placeholder:text-brand-ink-muted outline-none focus-visible:ring-2 focus-visible:ring-brand-primary resize-none"
              placeholder="Contoh: Jl. Sudirman No. 45, Jakarta Selatan"
            />
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-success/20 bg-success-soft p-3.5 text-xs text-success leading-relaxed">
            <ShieldCheck size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold">Sinkronisasi Struk Real-time</p>
              <p className="mt-0.5 text-brand-ink-muted">
                Nama dan alamat outlet ini akan otomatis tercetak pada kop struk transaksi pelanggan di layar kasir.
              </p>
            </div>
          </div>

          <div className="flex justify-end border-t border-brand-line pt-4">
            <Button
              type="submit"
              disabled={isSaving}
              className="gap-2"
            >
              <Save size={16} aria-hidden="true" />
              <span>{isSaving ? "Menyimpan…" : "Simpan Perubahan"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
