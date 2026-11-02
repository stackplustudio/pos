"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, Building2, Ban, CheckCircle2, Plus, X, User } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TenantCount {
  users?: number;
  orders?: number;
}

interface Tenant {
  id: string;
  nama_bisnis: string;
  status_langganan: string;
  _count?: TenantCount;
}

export default function SuperAdminPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // State untuk Modal Tambah Klien
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nama_bisnis: "",
    alamat: "",
    owner_name: "",
    owner_email: "",
    owner_password: "",
  });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role !== "SUPER_ADMIN") {
          router.push("/dashboard");
          return;
        }
      } catch {
        router.push("/dashboard");
        return;
      }
    }
    fetchTenants();
  }, [router]);

  const fetchTenants = async () => {
    try {
      const res = await api.get("/tenants");
      setTenants(res.data);
    } catch {
      toast.error("Akses ditolak atau gagal memuat data klien.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, currentStatus: string, namaBisnis: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    const actionText = newStatus === "SUSPENDED" ? "membekukan" : "mengaktifkan kembali";
    if (!confirm(`Apakah Anda yakin ingin ${actionText} akses untuk klien: ${namaBisnis}?`)) return;

    try {
      await api.patch(`/tenants/${id}/status`, { status: newStatus });
      toast.success(`Status ${namaBisnis} berhasil diubah menjadi ${newStatus}`);
      fetchTenants();
    } catch {
      toast.error("Gagal mengubah status klien");
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/tenants", formData);
      toast.success("Klien dan akun Owner berhasil dibuat!");
      setIsModalOpen(false);
      setFormData({
        nama_bisnis: "",
        alamat: "",
        owner_name: "",
        owner_email: "",
        owner_password: "",
      });
      fetchTenants();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Gagal mendaftarkan klien baru");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-56 items-center justify-center font-sans text-xs text-brand-ink-muted">
        Memverifikasi otoritas Super Admin…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl font-sans text-brand-ink">
      {/* Header Portal Super Admin */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <ShieldAlert size={22} className="text-brand-primary" aria-hidden="true" />
            <h1 className="text-2xl font-bold tracking-tight text-brand-ink-dark sm:text-3xl">
              SaaS Control Center
            </h1>
          </div>
          <p className="max-w-2xl text-sm text-brand-ink-muted">
            Pusat kendali tenant platform. Kelola status langganan dan pantau aktivitas bisnis yang terdaftar.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="gap-2 self-start sm:self-auto"
        >
          <Plus size={16} aria-hidden="true" />
          <span>Daftarkan Klien Baru</span>
        </Button>
      </div>

      {/* Tabel Data Tenant */}
      <div className="overflow-hidden rounded-xl border border-brand-line bg-brand-surface shadow-xs">
        <div className="flex items-center justify-between border-b border-brand-line px-5 py-3.5 bg-brand-surface-alt">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-brand-primary" aria-hidden="true" />
            <h2 className="text-xs font-semibold text-brand-ink-dark">
              Daftar Klien Terdaftar
            </h2>
          </div>
          <span className="rounded-full bg-brand-primary-soft px-2.5 py-0.5 text-[11px] font-semibold text-brand-primary">
            Total: {tenants.length} Tenant
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-brand-line bg-brand-surface text-brand-ink-muted font-medium">
                <th className="px-5 py-3">Nama Bisnis &amp; ID</th>
                <th className="px-5 py-3">Statistik Sistem</th>
                <th className="px-5 py-3">Status Langganan</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-line">
              {tenants.map((tenant) => {
                const isActive = tenant.status_langganan === "ACTIVE";
                const isSuspended = tenant.status_langganan === "SUSPENDED";
                return (
                  <tr
                    key={tenant.id}
                    className="transition-colors duration-150 hover:bg-brand-surface-alt/50"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-brand-ink-dark">{tenant.nama_bisnis}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-brand-ink-muted">{tenant.id}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 tabular-nums">
                        <span className="rounded bg-brand-surface-alt px-2 py-0.5 text-[11px] font-medium text-brand-ink-dark">
                          {tenant._count?.users || 0} Pegawai
                        </span>
                        <span className="rounded bg-brand-surface-alt px-2 py-0.5 text-[11px] font-medium text-brand-ink-dark">
                          {tenant._count?.orders || 0} Transaksi
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          isActive
                            ? "bg-success-soft text-success"
                            : isSuspended
                            ? "bg-danger-soft text-danger"
                            : "bg-warning-soft text-warning"
                        }`}
                      >
                        {isActive && <CheckCircle2 size={13} aria-hidden="true" />}
                        {isSuspended && <Ban size={13} aria-hidden="true" />}
                        <span>{tenant.status_langganan}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateStatus(tenant.id, tenant.status_langganan, tenant.nama_bisnis)
                        }
                        className={`inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-semibold transition-colors duration-150 focus-visible:ring-2 ${
                          isActive
                            ? "border border-danger/30 bg-danger-soft text-danger-dark hover:bg-danger/15 focus-visible:ring-danger"
                            : "bg-success text-white hover:bg-success/90 focus-visible:ring-success"
                        }`}
                      >
                        {isActive ? "Suspend Klien" : "Aktifkan Akses"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-xs text-brand-ink-muted">
                    Belum ada klien yang terdaftar di platform.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Onboarding Klien Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-overlay/50 backdrop-blur-xs p-4">
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-brand-line bg-brand-surface shadow-md">
            <div className="flex items-center justify-between border-b border-brand-line px-5 py-4">
              <div>
                <h3 className="text-base font-bold text-brand-ink-dark">Onboarding Klien Baru</h3>
                <p className="text-xs text-brand-ink-muted">
                  Sistem akan otomatis mengaktifkan tenant dan kredensial Owner.
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

            <form onSubmit={handleCreateTenant} className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Profil Bisnis */}
              <div className="rounded-xl border border-brand-line bg-brand-surface-alt p-4 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-primary">
                  <Building2 size={15} aria-hidden="true" />
                  <span>Profil Bisnis (Tenant)</span>
                </div>
                <div>
                  <label htmlFor="tenantNama" className="sr-only">Nama Bisnis</label>
                  <Input
                    id="tenantNama"
                    required
                    type="text"
                    placeholder="Nama Bisnis / Restoran"
                    value={formData.nama_bisnis}
                    onChange={(e) => setFormData({ ...formData, nama_bisnis: e.target.value })}
                    className="h-10 text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="tenantAlamat" className="sr-only">Alamat Lengkap</label>
                  <Input
                    id="tenantAlamat"
                    type="text"
                    placeholder="Alamat Lengkap (Opsional)"
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              {/* Akun Owner */}
              <div className="rounded-xl border border-brand-line bg-brand-surface-alt p-4 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-primary">
                  <User size={15} aria-hidden="true" />
                  <span>Kredensial Akun Owner</span>
                </div>
                <div>
                  <label htmlFor="ownerNama" className="sr-only">Nama Owner</label>
                  <Input
                    id="ownerNama"
                    required
                    type="text"
                    placeholder="Nama Lengkap Owner"
                    value={formData.owner_name}
                    onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                    className="h-10 text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="ownerEmail" className="sr-only">Email Login</label>
                  <Input
                    id="ownerEmail"
                    required
                    type="email"
                    placeholder="Email untuk Login Owner"
                    value={formData.owner_email}
                    onChange={(e) => setFormData({ ...formData, owner_email: e.target.value })}
                    className="h-10 text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="ownerPassword" className="sr-only">Password</label>
                  <Input
                    id="ownerPassword"
                    required
                    type="password"
                    placeholder="Password Sementara"
                    value={formData.owner_password}
                    onChange={(e) => setFormData({ ...formData, owner_password: e.target.value })}
                    className="h-10 text-xs"
                  />
                </div>
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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Memproses…" : "Daftarkan Sekarang"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
