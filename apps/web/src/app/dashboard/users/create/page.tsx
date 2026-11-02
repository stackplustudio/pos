"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

export default function CreateUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/users", formData);
      toast.success("Berhasil menambahkan pengguna baru!");
      router.push("/dashboard/users");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error("Gagal: " + (err.response?.data?.message || "Terjadi kesalahan"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl font-sans text-brand-ink">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-ink-dark sm:text-3xl">
            Tambah Pengguna Baru
          </h1>
          <p className="mt-1 text-sm text-brand-ink-muted">
            Form pendaftaran akun sistem StackPlus Studio.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => router.back()}
          variant="outline"
          className="gap-1.5"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Batal</span>
        </Button>
      </div>

      <div className="rounded-xl border border-brand-line bg-brand-surface p-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-xs font-semibold text-brand-ink-dark"
            >
              Nama Lengkap
            </label>
            <Input
              id="name"
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="h-10 text-xs"
              placeholder="Masukkan nama lengkap"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-semibold text-brand-ink-dark"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="h-10 text-xs"
              placeholder="nama@outlet.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-semibold text-brand-ink-dark"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="h-10 text-xs"
              placeholder="Minimal 6 karakter"
            />
          </div>

          <div>
            <label
              htmlFor="role"
              className="mb-1.5 block text-xs font-semibold text-brand-ink-dark"
            >
              Role Akses
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="h-10 w-full rounded-md border border-brand-line-strong bg-brand-surface px-3 text-xs text-brand-ink-dark outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <option value="USER">User Reguler</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          <div className="flex justify-end gap-2.5 border-t border-brand-line pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? "Menyimpan…" : "Simpan Pengguna"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
