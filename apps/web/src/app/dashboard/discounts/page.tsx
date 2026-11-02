"use client";

import { useState, useEffect } from "react";
import { Plus, Tag, X } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Discount {
  id: string;
  nama: string;
  tipe: string;
  nilai: number;
  status: boolean;
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    tipe: "PERSENTASE",
    nilai: "",
  });

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const res = await api.get("/discounts");
      setDiscounts(res.data);
    } catch {
      toast.error("Gagal memuat data diskon");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/discounts", {
        ...formData,
        nilai: parseInt(formData.nilai, 10),
      });
      toast.success("Promo berhasil dibuat!");
      setIsModalOpen(false);
      setFormData({ nama: "", tipe: "PERSENTASE", nilai: "" });
      fetchDiscounts();
    } catch {
      toast.error("Gagal membuat promo");
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/discounts/${id}/status`, { status: !currentStatus });
      toast.success("Status promo diperbarui");
      fetchDiscounts();
    } catch {
      toast.error("Gagal mengubah status");
    }
  };

  const formatRp = (angka: number) => {
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
            Promo &amp; Diskon
          </h1>
          <p className="mt-1 text-sm text-brand-ink-muted">
            Buat skema potongan harga (persentase atau nominal) untuk transaksi kasir.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="gap-2 self-start sm:self-auto"
        >
          <Plus size={16} aria-hidden="true" />
          <span>Buat Promo</span>
        </Button>
      </div>

      {/* Grid Promo Cards */}
      {isLoading ? (
        <div className="flex h-56 items-center justify-center text-xs text-brand-ink-muted">
          Memuat data promo…
        </div>
      ) : discounts.length === 0 ? (
        <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-brand-line bg-brand-surface p-6 text-center text-xs text-brand-ink-muted">
          <Tag size={32} className="mb-2 text-brand-line-strong" aria-hidden="true" />
          <p className="font-semibold text-brand-ink-dark">Belum ada promo aktif</p>
          <p className="mt-1 text-brand-ink-muted">Buat promo potongan harga pertama untuk menarik pelanggan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {discounts.map((discount) => (
            <div
              key={discount.id}
              className={`rounded-xl border p-5 shadow-xs transition-colors duration-150 ${
                discount.status
                  ? "border-brand-line bg-brand-surface"
                  : "border-brand-line/60 bg-brand-surface-alt/60 opacity-70"
              }`}
            >
              <div className="mb-3 flex items-start justify-between">
                <span className="flex size-9 items-center justify-center rounded-lg bg-brand-primary-soft text-brand-primary">
                  <Tag size={16} aria-hidden="true" />
                </span>
                <button
                  type="button"
                  onClick={() => toggleStatus(discount.id, discount.status)}
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-brand-primary ${
                    discount.status
                      ? "bg-success-soft text-success hover:bg-success/15"
                      : "bg-brand-surface-alt text-brand-ink-muted hover:bg-brand-line"
                  }`}
                  aria-label={`Ubah status ${discount.nama}`}
                >
                  {discount.status ? "Aktif" : "Nonaktif"}
                </button>
              </div>

              <h2 className="text-base font-semibold text-brand-ink-dark line-clamp-1">
                {discount.nama}
              </h2>
              <p className="mt-1 text-2xl font-bold text-brand-primary tabular-nums">
                {discount.tipe === "PERSENTASE" ? `${discount.nilai}%` : formatRp(discount.nilai)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal Buat Promo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-overlay/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl border border-brand-line bg-brand-surface p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-brand-ink-dark">Buat Promo Baru</h3>
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
                  htmlFor="promoNama"
                  className="mb-1.5 block text-xs font-semibold text-brand-ink-dark"
                >
                  Nama Promo
                </label>
                <Input
                  id="promoNama"
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Diskon Grand Opening"
                  className="h-10 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="promoTipe"
                    className="mb-1.5 block text-xs font-semibold text-brand-ink-dark"
                  >
                    Tipe Potongan
                  </label>
                  <select
                    id="promoTipe"
                    value={formData.tipe}
                    onChange={(e) => setFormData({ ...formData, tipe: e.target.value })}
                    className="h-10 w-full rounded-md border border-brand-line-strong bg-brand-surface px-3 text-xs text-brand-ink-dark outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                  >
                    <option value="PERSENTASE">Persentase (%)</option>
                    <option value="NOMINAL">Nominal (Rp)</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="promoNilai"
                    className="mb-1.5 block text-xs font-semibold text-brand-ink-dark"
                  >
                    Nilai
                  </label>
                  <Input
                    id="promoNilai"
                    type="number"
                    required
                    min="1"
                    value={formData.nilai}
                    onChange={(e) => setFormData({ ...formData, nilai: e.target.value })}
                    placeholder={formData.tipe === "PERSENTASE" ? "10" : "5000"}
                    className="h-10 text-xs tabular-nums"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit">Simpan Promo</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
