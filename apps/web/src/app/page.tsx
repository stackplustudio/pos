import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowRight,
  BarChart3,
  Boxes,
  Check,
  CircleDollarSign,
  Clock3,
  Laptop,
  Monitor,
  Smartphone,
  Store,
  Truck,
} from "lucide-react";

const platforms = [
  { name: "Windows", detail: "Desktop", icon: Monitor },
  { name: "macOS", detail: "Desktop", icon: Laptop },
  { name: "Android", detail: "Mobile", icon: Smartphone },
  { name: "iOS", detail: "Mobile", icon: Smartphone },
];

const benefits = [
  {
    icon: Store,
    title: "Kasir lebih praktis",
    description:
      "Catat pesanan, proses pembayaran, dan pantau shift dari satu layar yang mudah digunakan.",
  },
  {
    icon: Boxes,
    title: "Stok selalu terkontrol",
    description:
      "Pantau bahan baku dan produk, dapatkan gambaran stok, lalu siapkan restock lebih terencana.",
  },
  {
    icon: BarChart3,
    title: "Bisnis lebih terukur",
    description:
      "Lihat ringkasan penjualan dan performa outlet untuk mengambil keputusan dengan lebih yakin.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-brand-background text-gray-900">
      <header className="px-4 pt-5 sm:px-6 lg:px-8">
        <nav
          aria-label="Navigasi utama"
          className="mx-auto flex max-w-7xl items-center justify-between"
        >
          <Link href="/" className="flex min-h-11 items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand-primary text-white">
              <Store size={21} strokeWidth={2.2} />
            </span>
            <span className="text-lg font-bold tracking-tight">
              NusaKasir<span className="text-brand-primary">.</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <a
              href="#fitur"
              className="hidden min-h-11 items-center px-3 text-sm font-medium text-gray-500 transition-colors hover:text-brand-primary sm:inline-flex"
            >
              Fitur
            </a>
            <a
              href="#unduh"
              className="hidden min-h-11 items-center px-3 text-sm font-medium text-gray-500 transition-colors hover:text-brand-primary sm:inline-flex"
            >
              Platform
            </a>
            <Link
              href="/auth/login"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-ink-dark px-5 text-xs font-bold uppercase text-white transition-colors hover:bg-black"
            >
              Coba aplikasi <ArrowRight size={15} />
            </Link>
          </div>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-16 sm:px-6 sm:pt-20 lg:grid-cols-2 lg:gap-10 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-line bg-white px-3 py-2 text-xs font-medium text-gray-500">
            <span className="size-2 rounded-full bg-brand-primary" />
            Satu sistem untuk operasional F&amp;B
          </div>
          <h1 className="mb-6 text-5xl font-bold leading-[1.08] tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
            Bisnis jalan,
            <br />
            <span className="text-brand-primary">semua tercatat.</span>
          </h1>
          <p className="mb-8 max-w-lg text-base leading-relaxed text-gray-500 sm:text-lg">
            Kelola kasir, stok, dan penjualan NusaKasir dengan lebih rapi.
            Dirancang untuk membantu bisnis kuliner tumbuh, dari satu outlet
            hingga banyak cabang.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth/login"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-primary px-6 text-xs font-bold uppercase text-white shadow-lg shadow-brand-primary/20 transition-all hover:bg-brand-primary-dark"
            >
              Masuk dan coba sekarang <ArrowRight size={16} />
            </Link>
            <a
              href="#fitur"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-brand-line bg-white px-6 text-xs font-bold uppercase text-gray-700 transition-colors hover:border-brand-primary/40 hover:text-brand-primary"
            >
              Lihat fitur
            </a>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-gray-500">
            <span className="inline-flex items-center gap-2">
              <Check size={15} className="text-brand-primary" />
              Kasir &amp; pembayaran
            </span>
            <span className="inline-flex items-center gap-2">
              <Check size={15} className="text-brand-primary" />
              Inventori terpantau
            </span>
          </div>
        </div>

        <div
          role="group"
          aria-label="Pratinjau dashboard NusaKasir"
          className="relative mx-auto w-full max-w-[560px]"
        >
          <div className="absolute -right-8 -top-8 size-48 rounded-full bg-brand-surface-alt blur-3xl" />
          <div className="absolute -bottom-8 -left-8 size-48 rounded-full bg-brand-primary/10 blur-3xl" />
          <div className="relative overflow-hidden rounded-3xl border border-brand-line bg-white p-3 shadow-xl shadow-gray-200/50 sm:p-5">
            <div className="flex items-center justify-between border-b border-brand-line pb-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                  <Store size={20} />
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-900">Ringkasan outlet</p>
                  <p className="text-xs text-gray-500">Kedai Senja · Hari ini</p>
                </div>
              </div>
              <span className="rounded-full bg-brand-surface-alt px-3 py-1.5 text-[11px] font-semibold text-gray-500">
                Live
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 py-5">
              <div className="rounded-2xl bg-brand-surface-alt p-4">
                <div className="mb-4 flex items-center justify-between text-gray-500">
                  <span className="text-xs">Penjualan</span>
                  <CircleDollarSign size={17} />
                </div>
                <p className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                  Rp 2.845.000
                </p>
                <p className="mt-1 text-[11px] font-medium text-brand-primary">
                  +12,8% dari kemarin
                </p>
              </div>
              <div className="rounded-2xl border border-brand-line p-4">
                <div className="mb-4 flex items-center justify-between text-gray-500">
                  <span className="text-xs">Pesanan</span>
                  <Clock3 size={17} />
                </div>
                <p className="text-2xl font-bold tracking-tight text-gray-900">84</p>
                <p className="mt-1 text-[11px] text-gray-500">Transaksi hari ini</p>
              </div>
            </div>

            <div className="rounded-2xl border border-brand-line p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Aktivitas penjualan</p>
                  <p className="mt-1 text-xs text-gray-500">Ringkasan per jam</p>
                </div>
                <span className="text-xs font-semibold text-brand-primary">Hari ini</span>
              </div>
              <div className="flex h-24 items-end gap-2 sm:h-28 sm:gap-3">
                {[38, 57, 44, 75, 58, 90, 68, 100, 79, 63, 86, 72].map(
                  (height, index) => (
                    <span
                      key={index}
                      className={`flex-1 rounded-t-md ${
                        index === 7 ? "bg-brand-primary" : "bg-brand-primary/15"
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  ),
                )}
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-gray-400">
                <span>08.00</span>
                <span>12.00</span>
                <span>16.00</span>
                <span>20.00</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-2xl bg-brand-primary p-4 text-white">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl bg-white/15">
                  <Truck size={18} />
                </span>
                <div>
                  <p className="text-xs font-semibold">Stok perlu diperhatikan</p>
                  <p className="mt-0.5 text-[11px] text-white/75">2 bahan baku menipis</p>
                </div>
              </div>
              <ArrowRight size={17} />
            </div>
          </div>
          <div className="absolute -bottom-5 right-5 hidden items-center gap-3 rounded-2xl border border-brand-line bg-white p-3 shadow-lg shadow-gray-200/50 sm:flex">
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand-surface-alt text-brand-primary">
              <Check size={18} />
            </span>
            <div>
              <p className="text-xs font-bold text-gray-900">Operasional lebih tertata</p>
              <p className="text-[11px] text-gray-500">Dalam satu dashboard</p>
            </div>
          </div>
        </div>
      </section>

      <section id="fitur" className="border-y border-brand-line bg-brand-surface py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Dibuat untuk bisnis kuliner
              </p>
              <h2 className="max-w-xl text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl">
                Fokus melayani,
                <br />
                <span className="text-brand-primary">biar sistem yang mencatat.</span>
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-gray-500">
              Semua alat penting untuk transaksi harian tersedia dalam alur
              kerja yang sederhana dan mudah dipelajari tim.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {benefits.map(({ icon: Icon, title, description }, index) => (
              <article
                key={title}
                className={`rounded-2xl border p-6 sm:p-7 ${
                  index === 0
                    ? "border-brand-primary bg-brand-primary text-white"
                    : "border-brand-line bg-white"
                }`}
              >
                <span
                  className={`mb-7 flex size-11 items-center justify-center rounded-xl ${
                    index === 0
                      ? "bg-white/15 text-white"
                      : "bg-brand-primary/10 text-brand-primary"
                  }`}
                >
                  <Icon size={22} />
                </span>
                <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                <p
                  className={`text-sm leading-relaxed ${
                    index === 0 ? "text-white/80" : "text-gray-500"
                  }`}
                >
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="unduh" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-9 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Akses dari perangkat pilihanmu
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Satu akun, <span className="text-brand-primary">di mana saja.</span>
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-gray-500">
              Gunakan NusaKasir melalui web hari ini. Aplikasi desktop dan
              mobile sedang disiapkan.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {platforms.map(({ name, detail, icon: Icon }) => (
              <div
                key={name}
                className="flex items-center justify-between rounded-2xl border border-brand-line bg-white p-5"
              >
                <div className="flex items-center gap-4">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-brand-surface-alt text-brand-primary">
                    <Icon size={21} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{name}</p>
                    <p className="mt-1 text-xs text-gray-500">{detail}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-surface-alt px-3 py-2 text-[10px] font-semibold text-gray-500">
                  <ArrowDownToLine size={13} />
                  Segera hadir
                </span>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-5 rounded-3xl bg-brand-primary px-6 py-8 text-white sm:flex-row sm:px-10">
            <div className="max-w-xl">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/70">
                Mulai sekarang
              </p>
              <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Coba NusaKasir lewat web.
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                Masuk ke aplikasi dan lihat bagaimana alur operasional bisnis
                Anda bisa lebih ringkas.
              </p>
            </div>
            <Link
              href="/auth/login"
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 text-xs font-bold uppercase text-brand-primary transition-colors hover:bg-brand-surface-alt"
            >
              Coba aplikasi <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-brand-line bg-brand-surface py-7">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <Link href="/" className="font-bold text-gray-900">
            NusaKasir<span className="text-brand-primary">.</span>
          </Link>
          <p>Solusi kasir dan inventori untuk bisnis kuliner Indonesia.</p>
          <p>© {new Date().getFullYear()} NusaKasir</p>
        </div>
      </footer>
    </main>
  );
}
