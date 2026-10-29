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
    <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_460px] lg:gap-16 lg:px-8 lg:py-12">
      <section className="mx-auto w-full max-w-xl">
        <Link href="/" className="mb-9 inline-flex min-h-11 items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-brand-primary text-white">
            <Store size={21} strokeWidth={2.2} />
          </span>
          <span className="text-lg font-bold tracking-tight text-gray-900">
            NusaKasir<span className="text-brand-primary">.</span>
          </span>
        </Link>

        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Ruang kerja bisnis Anda
        </p>
        <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl">
          Selamat datang
          <br />
          <span className="text-brand-primary">kembali.</span>
        </h1>
        <p className="max-w-md text-base leading-relaxed text-gray-500">
          Kelola transaksi, persediaan, dan aktivitas outlet dalam satu sistem
          yang dirancang untuk bisnis kuliner.
        </p>

        <div className="mt-8 hidden max-w-md rounded-2xl border border-brand-line bg-white p-5 sm:block">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
              <ShieldAlert size={20} />
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Data operasional lebih tertata
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Satu tempat untuk kasir dan inventori
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-brand-line pt-4 text-xs text-gray-500">
            <span className="size-2 rounded-full bg-brand-primary" />
            Masuk untuk melanjutkan ke dashboard outlet Anda
          </div>
        </div>
      </section>

      <section
        aria-labelledby="login-heading"
        className="w-full rounded-3xl border border-brand-line bg-white p-6 shadow-lg shadow-gray-200/50 sm:p-9"
      >
        <div className="mb-7">
          <h2
            id="login-heading"
            className="text-2xl font-bold tracking-tight text-gray-900"
          >
            Masuk ke akun
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Gunakan email dan kata sandi yang terdaftar.
          </p>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <ShieldAlert size={18} className="mt-0.5 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-gray-900"
            >
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="nama@bisnis.com"
              value={formData.email}
              onChange={(event) =>
                setFormData({ ...formData, email: event.target.value })
              }
              className="h-12 rounded-xl border-brand-line bg-white px-4 text-sm text-gray-700 focus-visible:border-brand-primary focus-visible:ring-brand-primary/30"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-gray-900"
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
                className="h-12 rounded-xl border-brand-line bg-white px-4 pr-12 text-sm text-gray-700 focus-visible:border-brand-primary focus-visible:ring-brand-primary/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword((isVisible) => !isVisible)}
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                className="absolute inset-y-0 right-0 inline-flex min-h-11 w-11 items-center justify-center rounded-r-xl text-gray-400 transition-colors hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 w-full rounded-full bg-brand-primary px-6 text-xs font-bold uppercase text-white shadow-md shadow-brand-primary/20 hover:bg-brand-primary-dark"
          >
            {isLoading ? "Memverifikasi..." : "Masuk"}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-brand-line" />
          <span className="text-xs text-gray-400">atau</span>
          <span className="h-px flex-1 bg-brand-line" />
        </div>

        <button
          type="button"
          onClick={handleGoogleMock}
          className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-brand-line bg-white px-5 text-sm font-semibold text-gray-700 transition-colors hover:bg-brand-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
        >
          <svg aria-hidden="true" viewBox="0 0 48 48" className="size-5">
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
          Lanjutkan dengan Google <span className="text-xs text-gray-400">(demo)</span>
        </button>

        <p className="mt-4 text-center text-xs leading-relaxed text-gray-400">
          Simulasi Google belum terhubung ke OAuth dan tidak akan membuat sesi.
        </p>

        <Link
          href="/"
          className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-brand-primary"
        >
          <ArrowLeft size={16} />
          Kembali ke beranda
        </Link>
      </section>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-brand-background">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center px-4 text-sm font-medium text-gray-500">
            Memuat halaman masuk...
          </div>
        }
      >
        <LoginContent />
      </Suspense>
    </main>
  );
}
