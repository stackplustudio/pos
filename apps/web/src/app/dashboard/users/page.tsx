"use client";

import { useState, useEffect } from "react";
import { Plus, UserX, Users as UsersIcon, X } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "KASIR" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data);
    } catch {
      toast.error("Gagal mengambil data pegawai");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/users", formData);
      toast.success("Pegawai berhasil ditambahkan!");
      setIsModalOpen(false);
      setFormData({ name: "", email: "", password: "", role: "KASIR" });
      fetchUsers();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Gagal menambahkan pegawai");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm("Yakin ingin menonaktifkan pegawai ini?")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("Pegawai dinonaktifkan");
      fetchUsers();
    } catch {
      toast.error("Gagal menonaktifkan pegawai");
    }
  };

  return (
    <div className="mx-auto max-w-6xl font-sans text-brand-ink">
      {/* Header Halaman */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-ink-dark sm:text-3xl">
            Manajemen Pegawai
          </h1>
          <p className="mt-1 text-sm text-brand-ink-muted">
            Kelola hak akses kasir, manager, dan staf operasional outlet.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="gap-2 self-start sm:self-auto"
        >
          <Plus size={16} aria-hidden="true" />
          <span>Tambah Pegawai</span>
        </Button>
      </div>

      {/* Tabel Data Pegawai */}
      <div className="overflow-hidden rounded-xl border border-brand-line bg-brand-surface shadow-xs">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-xs text-brand-ink-muted">
            Memuat data pegawai…
          </div>
        ) : users.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center p-6 text-center text-xs text-brand-ink-muted">
            <UsersIcon size={32} className="mb-2 text-brand-line-strong" aria-hidden="true" />
            <p className="font-semibold text-brand-ink-dark">Belum ada pegawai</p>
            <p className="mt-1 text-brand-ink-muted">Daftarkan akun staf kasir untuk memulai transaksi.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-brand-line bg-brand-surface-alt text-brand-ink-dark font-semibold">
                  <th className="px-5 py-3">Nama &amp; Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-line">
                {users.map((user) => {
                  const isOwner = user.role === "OWNER";
                  const isActive = user.status === "ACTIVE";
                  return (
                    <tr
                      key={user.id}
                      className="transition-colors duration-150 hover:bg-brand-surface-alt/50"
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-brand-ink-dark">{user.name}</p>
                        <p className="text-[11px] text-brand-ink-muted mt-0.5">{user.email}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            isOwner
                              ? "bg-warning-soft text-warning"
                              : "bg-brand-primary-soft text-brand-primary"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            isActive
                              ? "bg-success-soft text-success"
                              : "bg-danger-soft text-danger"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {!isOwner && (
                          <button
                            type="button"
                            onClick={() => handleDeactivate(user.id)}
                            className="inline-flex size-8 items-center justify-center rounded-lg text-danger hover:bg-danger-soft transition-colors"
                            aria-label={`Nonaktifkan pegawai ${user.name}`}
                          >
                            <UserX size={15} aria-hidden="true" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah Pegawai */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-overlay/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl border border-brand-line bg-brand-surface p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-brand-ink-dark">Tambah Pegawai Baru</h3>
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
                  htmlFor="pegawaiName"
                  className="mb-1.5 block text-xs font-semibold text-brand-ink-dark"
                >
                  Nama Lengkap
                </label>
                <Input
                  id="pegawaiName"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Rian Pratama"
                  className="h-10 text-xs"
                />
              </div>

              <div>
                <label
                  htmlFor="pegawaiEmail"
                  className="mb-1.5 block text-xs font-semibold text-brand-ink-dark"
                >
                  Email Login
                </label>
                <Input
                  id="pegawaiEmail"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rian@outlet.com"
                  className="h-10 text-xs"
                />
              </div>

              <div>
                <label
                  htmlFor="pegawaiPassword"
                  className="mb-1.5 block text-xs font-semibold text-brand-ink-dark"
                >
                  Password Sementara
                </label>
                <Input
                  id="pegawaiPassword"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  className="h-10 text-xs"
                />
              </div>

              <div>
                <label
                  htmlFor="pegawaiRole"
                  className="mb-1.5 block text-xs font-semibold text-brand-ink-dark"
                >
                  Hak Akses (Role)
                </label>
                <select
                  id="pegawaiRole"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="h-10 w-full rounded-md border border-brand-line-strong bg-brand-surface px-3 text-xs text-brand-ink-dark outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <option value="KASIR">KASIR</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="DAPUR">STAF DAPUR</option>
                </select>
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
                  {isSubmitting ? "Menyimpan…" : "Simpan Pegawai"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
