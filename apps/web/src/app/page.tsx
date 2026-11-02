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
    <main className="min-h-screen bg-brand-background text-brand-ink font-sans selection:bg-brand-primary-soft selection:text-brand-primary-dark">
      {/* Header & Nav */}
      <header className="border-b border-brand-line bg-brand-surface/90 sticky top-0 z-nav backdrop-blur-xs">
        <nav
          aria-label="Navigasi utama"
          className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8"
        >
          <Link href="/" className="flex items-center gap-2.5 text-brand-ink-dark transition-colors hover:text-brand-primary">
            <span className="flex size-9 items-center justify-center rounded-lg bg-brand-primary text-white shadow-xs">
              <Store size={20} strokeWidth={2.2} aria-hidden="true" />
            </span>
            <span className="text-lg font-bold tracking-tight text-brand-ink-dark">
              NusaKasir<span className="text-brand-primary">.</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <a
              href="#fitur"
              className="hidden text-sm font-medium text-brand-ink-muted transition-colors hover:text-brand-primary sm:inline-flex"
            >
              Fitur
            </a>
            <a
              href="#unduh"
              className="hidden text-sm font-medium text-brand-ink-muted transition-colors hover:text-brand-primary sm:inline-flex"
            >
              Platform
            </a>
            <Link
              href="/auth/login"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-primary px-4 text-xs font-semibold text-white shadow-xs transition-colors duration-150 hover:bg-brand-primary-dark focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <span>Buka aplikasi</span>
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-12 lg:px-8">
        <div className="max-w-xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-line bg-brand-surface px-3 py-1.5 text-xs font-medium text-brand-ink-muted">
            <span className="size-2 rounded-full bg-brand-primary" aria-hidden="true" />
            Satu sistem untuk operasional kasir &amp; stok UMKM F&amp;B
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-brand-ink-dark sm:text-5xl lg:text-6xl leading-[1.1]">
            Bisnis jalan,{" "}
            <span className="text-brand-primary">semua tercatat.</span>
          </h1>
          <p className="mb-6 text-base leading-relaxed text-brand-ink-muted sm:text-lg">
            Kelola kasir, stok resep, dan laporan omzet harian dengan lebih teratur.
            Dirancang khusus untuk membantu bisnis kuliner berkembang secara sehat.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth/login"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-primary px-6 text-sm font-semibold text-white shadow-xs transition-colors duration-150 hover:bg-brand-primary-dark focus-visible:ring-2 focus-visible:ring-brand-primary active:scale-95"
            >
              <span>Masuk ke dashboard</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <a
              href="#fitur"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-brand-line bg-brand-surface px-5 text-sm font-semibold text-brand-ink-dark transition-colors duration-150 hover:bg-brand-surface-alt focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              Pelajari fitur
            </a>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-brand-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <Check size={15} className="text-brand-primary" aria-hidden="true" />
              Kasir sentuh cepat &amp; cetak struk
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check size={15} className="text-brand-primary" aria-hidden="true" />
              Otomatisasi resep BOM &amp; inventori
            </span>
          </div>
        </div>

        {/* Hero Visual Card */}
        <div
          role="region"
          aria-label="Pratinjau antarmuka NusaKasir"
          className="relative mx-auto w-full max-w-[500px]"
        >
          <div className="overflow-hidden rounded-2xl border border-brand-line bg-brand-surface p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between border-b border-brand-line pb-4">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-brand-primary-soft text-brand-primary">
                  <Store size={18} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-bold text-brand-ink-dark">Ringkasan Outlet Hari Ini</p>
                  <p className="text-xs text-brand-ink-muted">Kedai Kopi &amp; Resto Senja</p>
                </div>
              </div>
              <span className="rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-semibold text-success">
                Aktif
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 py-4">
              <div className="rounded-xl border border-brand-line bg-brand-background p-4">
                <div className="mb-2 flex items-center justify-between text-brand-ink-muted">
                  <span className="text-xs font-medium">Penjualan</span>
                  <CircleDollarSign size={16} aria-hidden="true" />
                </div>
                <p className="text-xl font-bold tracking-tight text-brand-ink-dark sm:text-2xl tabular-nums">
                  Rp 2.845.000
                </p>
                <p className="mt-1 text-[11px] font-medium text-success">
                  +12,8% dari kemarin
                </p>
              </div>

              <div className="rounded-xl border border-brand-line bg-brand-background p-4">
                <div className="mb-2 flex items-center justify-between text-brand-ink-muted">
                  <span className="text-xs font-medium">Pesanan Selesai</span>
                  <Clock3 size={16} aria-hidden="true" />
                </div>
                <p className="text-xl font-bold tracking-tight text-brand-ink-dark sm:text-2xl tabular-nums">
                  84
                </p>
                <p className="mt-1 text-[11px] text-brand-ink-muted">Transaksi kasir</p>
              </div>
            </div>

            {/* Mini Chart Component */}
            <div className="rounded-xl border border-brand-line bg-brand-background p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-brand-ink-dark">Aktivitas Jam Sibuk</p>
                  <p className="text-[11px] text-brand-ink-muted">Distribusi transaksi per jam</p>
                </div>
                <span className="text-xs font-semibold text-brand-primary">Real-time</span>
              </div>
              <div className="flex h-20 items-end gap-1.5 sm:gap-2">
                {[38, 57, 44, 75, 58, 90, 68, 100, 79, 63, 86, 72].map(
                  (height, index) => (
                    <span
                      key={index}
                      className={`flex-1 rounded-t-sm transition-colors ${
                        index === 7 ? "bg-brand-primary" : "bg-brand-primary-soft"
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  )
                )}
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-brand-ink-muted tabular-nums">
                <span>08.00</span>
                <span>12.00</span>
                <span>16.00</span>
                <span>20.00</span>
              </div>
            </div>

            {/* Alert Bahan Menipis */}
            <div className="mt-3 flex items-center justify-between rounded-xl border border-brand-line bg-brand-surface-alt p-3.5 text-brand-ink-dark">
              <div className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-lg bg-warning-soft text-warning">
                  <Truck size={16} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-brand-ink-dark">Peringatan Bahan Baku</p>
                  <p className="text-[11px] text-brand-ink-muted">2 item mendekati batas minimum restock</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-brand-primary">Lihat</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="fitur" className="border-y border-brand-line bg-brand-surface py-14 sm:py-18">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-brand-ink-dark sm:text-3xl">
                Fokus melayani pelanggan,{" "}
                <span className="text-brand-primary">biar sistem yang mencatat.</span>
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-brand-ink-muted">
              Semua alur kerja kasir, pengelolaan resep, dan laporan omzet terhubung otomatis dalam satu aplikasi.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {benefits.map(({ icon: Icon, title, description }, index) => (
              <article
                key={title}
                className={`rounded-xl border p-5 sm:p-6 shadow-xs ${
                  index === 0
                    ? "border-brand-primary bg-brand-primary text-white"
                    : "border-brand-line bg-brand-surface text-brand-ink"
                }`}
              >
                <span
                  className={`mb-5 flex size-10 items-center justify-center rounded-lg ${
                    index === 0
                      ? "bg-white/20 text-white"
                      : "bg-brand-primary-soft text-brand-primary"
                  }`}
                >
                  <Icon size={20} aria-hidden="true" />
                </span>
                <h3 className={`mb-2 text-base font-semibold ${index === 0 ? "text-white" : "text-brand-ink-dark"}`}>
                  {title}
                </h3>
                <p className={`text-xs leading-relaxed ${index === 0 ? "text-white/85" : "text-brand-ink-muted"}`}>
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Platform & CTA Section */}
      <section id="unduh" className="py-14 sm:py-18">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-brand-ink-dark sm:text-3xl">
                Akses mudah di mana saja,{" "}
                <span className="text-brand-primary">kapan saja.</span>
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-brand-ink-muted">
              Gunakan NusaKasir melalui browser desktop, tablet kasir, atau laptop tanpa instalasi rumit.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {platforms.map(({ name, detail, icon: Icon }) => (
              <div
                key={name}
                className="flex items-center justify-between rounded-xl border border-brand-line bg-brand-surface p-4 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-brand-surface-alt text-brand-primary">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-brand-ink-dark">{name}</p>
                    <p className="text-[11px] text-brand-ink-muted">{detail}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-surface-alt px-2.5 py-1 text-[10px] font-semibold text-brand-ink-muted">
                  <ArrowDownToLine size={12} aria-hidden="true" />
                  Siap
                </span>
              </div>
            ))}
          </div>

          {/* Banner Card */}
          <div className="mt-8 flex flex-col items-center justify-between gap-6 rounded-2xl border border-brand-line bg-brand-surface-alt p-6 sm:flex-row sm:p-8">
            <div className="max-w-xl">
              <h3 className="text-xl font-bold tracking-tight text-brand-ink-dark sm:text-2xl">
                Mulai kelola outlet kuliner Anda hari ini.
              </h3>
              <p className="mt-1.5 text-xs text-brand-ink-muted leading-relaxed">
                Akses dashboard dan buka layar kasir dengan akun demo ataupun akun operasional bisnis Anda.
              </p>
            </div>
            <Link
              href="/auth/login"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-primary px-6 text-sm font-semibold text-white shadow-xs transition-colors duration-150 hover:bg-brand-primary-dark focus-visible:ring-2 focus-visible:ring-brand-primary active:scale-95"
            >
              <span>Masuk sekarang</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-line bg-brand-surface py-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 text-xs text-brand-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <Link href="/" className="font-bold text-brand-ink-dark">
            NusaKasir<span className="text-brand-primary">.</span>
          </Link>
          <p>Sistem POS dan manajemen stok bahan baku untuk UMKM F&amp;B Indonesia.</p>
          <p>© {new Date().getFullYear()} StackPlus Studio</p>
        </div>
      </footer>
    </main>
  );
}
