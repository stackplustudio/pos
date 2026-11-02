"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldAlert,
  Store,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Cookies from "js-cookie";
import Link from "next/link";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (searchParams.get("error") === "suspended") {
      setErrorMsg(
        "Akses ditolak. Akun bisnis Anda sedang dibekukan. Silakan hubungi layanan pelanggan.",
      );
    }
  }, [searchParams]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await api.post("/auth/login", formData);

      Cookies.set("token", response.data.access_token, { expires: 1 });
      localStorage.setItem("user", JSON.stringify(response.data.user));
      toast.success("Login berhasil!");

      if (response.data.user.role === "SUPER_ADMIN") {
        router.push("/dashboard/superadmin");
      } else {
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      const message =
        axios.isAxiosError<{ message?: unknown }>(error) &&
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : "";

      if (message === "SUSPENDED_TENANT") {
        setErrorMsg("Akses ditolak. Akun bisnis Anda sedang dibekukan.");
      } else {
        toast.error(message || "Email atau kata sandi salah. Silakan coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleMock = () => {
    toast("Login Google belum dihubungkan. Gunakan email untuk masuk.");
  };

  return (
    <div className="mx-auto grid min-h-screen w-full max-w-5xl items-center gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_420px] lg:gap-14 lg:px-8 font-sans">
      <section className="mx-auto w-full max-w-lg">
        <Link href="/" className="mb-8 inline-flex h-10 items-center gap-2.5 text-brand-ink-dark transition-colors hover:text-brand-primary">
          <span className="flex size-9 items-center justify-center rounded-lg bg-brand-primary text-white shadow-xs">
            <Store size={20} strokeWidth={2.2} aria-hidden="true" />
          </span>
          <span className="text-lg font-bold tracking-tight text-brand-ink-dark">
            NusaKasir<span className="text-brand-primary">.</span>
          </span>
        </Link>

        <h1 className="mb-4 text-3xl font-bold tracking-tight text-brand-ink-dark sm:text-4xl">
          Masuk ke sistem operasional kasir &amp; inventori
        </h1>
        <p className="text-sm leading-relaxed text-brand-ink-muted">
          Kelola transaksi penjualan, pemotongan stok bahan baku, dan laporan outlet F&amp;B secara real-time.
        </p>

        <div className="mt-8 hidden rounded-xl border border-brand-line bg-brand-surface p-5 shadow-xs sm:block">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary-soft text-brand-primary">
              <CheckCircle2 size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-brand-ink-dark">
                Terintegrasi dengan resep menu (BOM)
              </p>
              <p className="mt-1 text-xs text-brand-ink-muted leading-relaxed">
                Setiap transaksi kasir otomatis memotong stok bahan baku dan mencatat rekap shift harian.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="login-heading"
        className="w-full rounded-2xl border border-brand-line bg-brand-surface p-6 shadow-sm sm:p-8"
      >
        <div className="mb-6">
          <h2
            id="login-heading"
            className="text-xl font-bold tracking-tight text-brand-ink-dark"
          >
            Masuk ke akun
          </h2>
          <p className="mt-1 text-xs text-brand-ink-muted">
            Gunakan email dan kata sandi outlet yang telah terdaftar.
          </p>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-lg border border-danger/30 bg-danger-soft p-3.5 text-xs text-danger-dark leading-relaxed"
          >
            <ShieldAlert size={16} className="mt-0.5 shrink-0 text-danger" aria-hidden="true" />
            <p>{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-semibold text-brand-ink-dark"
            >
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="nama@outlet.com"
              value={formData.email}
              onChange={(event) =>
                setFormData({ ...formData, email: event.target.value })
              }
              className="h-10"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-semibold text-brand-ink-dark"
            >
              Kata sandi
            </label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="Masukkan kata sandi"
                value={formData.password}
                onChange={(event) =>
                  setFormData({ ...formData, password: event.target.value })
                }
                className="h-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((isVisible) => !isVisible)}
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center text-brand-ink-muted transition-colors hover:text-brand-ink-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              >
                {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="h-10 w-full rounded-lg bg-brand-primary text-sm font-semibold text-white shadow-xs hover:bg-brand-primary-dark"
          >
            {isLoading ? "Memverifikasi..." : "Masuk"}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-brand-line" />
          <span className="text-xs text-brand-ink-muted">atau</span>
          <span className="h-px flex-1 bg-brand-line" />
        </div>

        <button
          type="button"
          onClick={handleGoogleMock}
          className="inline-flex h-10 w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-lg border border-brand-line bg-brand-surface px-4 text-xs font-medium text-brand-ink-dark transition-colors duration-150 hover:bg-brand-surface-alt focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <svg aria-hidden="true" viewBox="0 0 48 48" className="size-4 shrink-0">
            <path
              fill="#4285F4"
              d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"
            />
            <path
              fill="#34A853"
              d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z"
            />
            <path
              fill="#FBBC05"
              d="M12.6 27.5a12 12 0 0 1 0-7v-5.3H5.8a20 20 0 0 0 0 17.6l6.8-5.3Z"
            />
            <path
              fill="#EA4335"
              d="M24 12.1c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6 29.5 4 24 4A20 20 0 0 0 5.8 15.2l6.8 5.3c1.6-4.8 6.1-8.4 11.4-8.4Z"
            />
          </svg>
          <span>Masuk dengan Google</span>
        </button>

        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-brand-ink-muted transition-colors hover:text-brand-primary"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Kembali ke beranda</span>
        </Link>
      </section>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center font-sans text-sm text-brand-ink-muted">
          Memuat halaman masuk...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
