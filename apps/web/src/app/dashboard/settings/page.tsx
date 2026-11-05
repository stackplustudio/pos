"use client";

import { useState, useEffect } from "react";
import {
  Store,
  MapPin,
  Save,
  ShieldCheck,
  Phone,
  Percent,
  Printer,
  FileText,
  Sliders,
} from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    nama_bisnis: "",
    no_hp: "",
    alamat: "",
    pajak_persen: 11,
    lebar_printer: 58,
    footer_struk: "Terima kasih atas kunjungan Anda!",
  });
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
        no_hp: res.data.no_hp || "",
        alamat: res.data.alamat || "",
        pajak_persen: res.data.pajak_persen !== undefined ? res.data.pajak_persen : 11,
        lebar_printer: res.data.lebar_printer || 58,
        footer_struk: res.data.footer_struk || "Terima kasih atas kunjungan Anda!",
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
      await api.patch("/settings", {
        nama_bisnis: formData.nama_bisnis,
        no_hp: formData.no_hp,
        alamat: formData.alamat,
        pajak_persen: Number(formData.pajak_persen) || 0,
        lebar_printer: Number(formData.lebar_printer) || 58,
        footer_struk: formData.footer_struk,
      });
      toast.success("Profil outlet & konfigurasi printer berhasil disimpan!");
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
    <div className="mx-auto max-w-4xl font-sans text-brand-ink">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-brand-ink-dark sm:text-3xl">
          Pengaturan Outlet & Struk Kasir
        </h1>
        <p className="mt-1 text-sm text-brand-ink-muted">
          Perbarui identitas bisnis, kontak WhatsApp, tarif pajak, dan konfigurasi printer struk POS.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form Pengaturan Kiri (2 Kolom) */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-brand-line bg-brand-surface p-6 shadow-xs">
            <form onSubmit={handleSave} className="space-y-5">
              {/* Bagian 1: Identitas Bisnis */}
              <div>
                <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-ink-muted">
                  <Store size={14} className="text-brand-primary" aria-hidden="true" />
                  <span>Identitas Bisnis</span>
                </h2>
                <div>
                  <label
                    htmlFor="namaBisnis"
                    className="mb-1.5 block text-xs font-semibold text-brand-ink-dark"
                  >
                    Nama Outlet Bisnis
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
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="noHp"
                    className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink-dark"
                  >
                    <Phone size={14} className="text-brand-primary" aria-hidden="true" />
                    <span>Nomor WhatsApp Toko</span>
                  </label>
                  <Input
                    id="noHp"
                    type="text"
                    value={formData.no_hp}
                    onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                    className="h-10 text-sm font-medium"
                    placeholder="081234567890"
                  />
                </div>

                <div>
                  <label
                    htmlFor="pajakPersen"
                    className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink-dark"
                  >
                    <Percent size={14} className="text-brand-primary" aria-hidden="true" />
                    <span>Pajak Restoran / PB1 (%)</span>
                  </label>
                  <Input
                    id="pajakPersen"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.pajak_persen}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pajak_persen: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="h-10 text-sm font-medium"
                    placeholder="11"
                  />
                </div>
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
                  rows={2}
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full rounded-md border border-brand-line-strong bg-brand-surface p-3 text-xs text-brand-ink-dark placeholder:text-brand-ink-muted outline-none focus-visible:ring-2 focus-visible:ring-brand-primary resize-none"
                  placeholder="Contoh: Jl. Sudirman No. 45, Jakarta Selatan"
                />
              </div>

              {/* Bagian 2: Konfigurasi Printer & Struk (Sprint 4) */}
              <div className="border-t border-brand-line pt-5">
                <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-ink-muted">
                  <Printer size={14} className="text-brand-primary" aria-hidden="true" />
                  <span>Format Cetak Printer Thermal</span>
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-brand-ink-dark">
                      Pilihan Lebar Kertas Struk
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, lebar_printer: 58 })}
                        className={`flex flex-col items-center justify-center rounded-lg border p-3 text-center transition-colors whitespace-nowrap ${
                          formData.lebar_printer === 58
                            ? "border-brand-primary bg-brand-primary-soft text-brand-primary ring-1 ring-brand-primary"
                            : "border-brand-line bg-brand-surface text-brand-ink hover:bg-brand-surface-alt"
                        }`}
                      >
                        <span className="text-sm font-bold">58 mm</span>
                        <span className="mt-0.5 text-[11px] text-brand-ink-muted">
                          Standar (Mini Thermal)
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, lebar_printer: 80 })}
                        className={`flex flex-col items-center justify-center rounded-lg border p-3 text-center transition-colors whitespace-nowrap ${
                          formData.lebar_printer === 80
                            ? "border-brand-primary bg-brand-primary-soft text-brand-primary ring-1 ring-brand-primary"
                            : "border-brand-line bg-brand-surface text-brand-ink hover:bg-brand-surface-alt"
                        }`}
                      >
                        <span className="text-sm font-bold">80 mm</span>
                        <span className="mt-0.5 text-[11px] text-brand-ink-muted">
                          Lebar (Full Kasir)
                        </span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="footerStruk"
                      className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink-dark"
                    >
                      <FileText size={14} className="text-brand-primary" aria-hidden="true" />
                      <span>Catatan Kaki Struk (Footer)</span>
                    </label>
                    <Input
                      id="footerStruk"
                      type="text"
                      value={formData.footer_struk}
                      onChange={(e) => setFormData({ ...formData, footer_struk: e.target.value })}
                      className="h-10 text-sm font-medium"
                      placeholder="Contoh: WiFi: KedaiSenja | Pass: ngopidulu"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-success/20 bg-success-soft p-3.5 text-xs text-success leading-relaxed">
                <ShieldCheck size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-semibold">Otomatis Terhubung ke POS</p>
                  <p className="mt-0.5 text-brand-ink-muted">
                    Setiap perubahan nama outlet, lebar struk, dan catatan kaki akan langsung sinkron
                    ke layar kasir thermal printing.
                  </p>
                </div>
              </div>

              <div className="flex justify-end border-t border-brand-line pt-4">
                <Button type="submit" disabled={isSaving} className="gap-2">
                  <Save size={16} aria-hidden="true" />
                  <span>{isSaving ? "Menyimpan…" : "Simpan Pengaturan"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Live Preview Struk Kanan (1 Kolom) */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-xl border border-brand-line bg-brand-surface p-5 shadow-xs">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-ink-muted">
                Pratinjau Struk Kasir
              </span>
              <span className="rounded bg-brand-primary-soft px-2 py-0.5 text-[10px] font-bold text-brand-primary">
                {formData.lebar_printer}mm
              </span>
            </div>

            {/* Mockup Struk Thermal */}
            <div
              className={`mx-auto rounded-lg border border-dashed border-gray-300 bg-white p-4 font-mono text-brand-ink-dark shadow-inner text-center ${
                formData.lebar_printer === 58 ? "max-w-[240px] text-[11px]" : "max-w-[290px] text-xs"
              }`}
            >
              <h3 className="font-bold text-sm leading-tight">
                {formData.nama_bisnis || "NusaKasir"}
              </h3>
              {formData.alamat && (
                <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{formData.alamat}</p>
              )}
              {formData.no_hp && (
                <p className="text-[10px] text-gray-500 mt-0.5">Telp: {formData.no_hp}</p>
              )}
              <div className="my-2 border-t border-dashed border-gray-300" />

              <div className="flex justify-between text-[10px] text-gray-500">
                <span>05/11/2026 14:30</span>
                <span>#A8B2C1</span>
              </div>
              <div className="flex justify-between text-[10px] font-semibold text-gray-700">
                <span>Dine-In · Meja 03</span>
                <span>Kasir: Alex</span>
              </div>

              <div className="my-2 border-t border-dashed border-gray-300" />
              <div className="space-y-1 text-left text-[11px]">
                <div className="flex justify-between">
                  <span>2x Kopi Susu Aren</span>
                  <span>36.000</span>
                </div>
                <div className="flex justify-between">
                  <span>1x Roti Bakar Coklat</span>
                  <span>18.000</span>
                </div>
              </div>

              <div className="my-2 border-t border-dashed border-gray-300" />
              <div className="space-y-0.5 text-left text-[10px]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>54.000</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>PB1 ({formData.pajak_persen}%)</span>
                  <span>{Math.round(54000 * (formData.pajak_persen / 100))}</span>
                </div>
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-gray-300">
                  <span>TOTAL</span>
                  <span>{54000 + Math.round(54000 * (formData.pajak_persen / 100))}</span>
                </div>
              </div>

              <div className="my-2 border-t border-dashed border-gray-300" />
              <p className="text-[10px] font-medium text-gray-600 leading-tight">
                {formData.footer_struk || "Terima kasih atas kunjungan Anda!"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
