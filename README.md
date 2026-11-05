# 🏪 NusaKasir — SaaS POS & Inventory UMKM F&B

> **Stack Plus Studio Core Engine V1.0**  
> Solusi SaaS Point of Sales (POS) dan Manajemen Stok Bahan Baku berbasis Resep (*Bill of Materials* / BOM) terintegrasi untuk UMKM Kuliner (Restoran, Cafe, Warung, Kedai Kopi, Cloud Kitchen).

---

## 🌟 Fitur Utama

- 🛒 **Layar Kasir (POS) Cepat & Responsif:** Transaksi pesanan menu dalam hitungan detik, mendukung mode Dine-In & Takeaway, penerapan promo diskon otomatis, serta cetak struk thermal 58mm/80mm.
- 📦 **Pemotongan Stok Otomatis (Bill of Materials / BOM):** Setiap menu yang terjual langsung memotong bahan baku pendukungnya secara real-time sesuai resep takaran baku.
- ⏱️ **Manajemen Shift & Rekonsiliasi Kasir:** Catat modal awal laci kas, tracking kas sistem vs kas fisik saat tutup shift, dan deteksi selisih kas otomatis.
- 📋 **Purchase Order & Manajemen Supplier:** Restock bahan baku mudah via PO; saat status pesanan diselesaikan, stok gudang otomatis bertambah dan harga beli diperbarui.
- 📊 **Laporan Finansial & Laba Rugi (P&L):** Monitoring omzet, total transaksi harian, dan estimasi laba bersih secara berkala.
- 👥 **Multi-Tenant SaaS dengan RBAC:** Isolasi data aman antar tenant dengan 5 level peran (`SUPER_ADMIN`, `OWNER`, `MANAGER`, `KASIR`, `DAPUR`).
- 🎨 **StackPlus Design System V3 (Hallmark Standard):** Antarmuka modern, tanpa glassmorphism, fully-accessible, berbasis design tokens CSS-first.

---

## 🛠️ Arsitektur & Tech Stack

Monorepo diorkestrasi menggunakan **Turborepo** dan **pnpm workspaces**:

```text
web-pos/
├── apps/
│   ├── api/             # Backend API (NestJS 11, JWT Auth, Passport, REST)
│   └── web/             # Frontend Client (Next.js 16 App Router, Tailwind v4, shadcn)
├── packages/
│   └── database/        # Data Layer (Prisma ORM v5, PostgreSQL / Neon)
├── docs/                # SOP & Dokumentasi Standar StackPlus Studio
└── PRD-SaaS-POS-Inventory-UMKM-FnB.md # Product Requirements Document
```

### Rincian Teknologi:
- **Frontend (`apps/web`):** Next.js 16 (App Router), React 19, Tailwind CSS v4, Base UI / shadcn, Axios, React Hot Toast, Lucide Icons.
- **Backend (`apps/api`):** NestJS 11, Passport JWT, bcryptjs, Class Validator.
- **Database (`packages/database`):** PostgreSQL (Neon Serverless), Prisma Client v5.
- **Manajemen Paket:** pnpm (Node Linker: hoisted).

---

## ⚙️ Prasyarat Sistem

- **Node.js:** Versi >= 20.x
- **pnpm:** Versi >= 9.x (`npm install -g pnpm`)
- **Database:** Akun PostgreSQL (disarankan Neon.tech untuk serverless pooler)

---

## 🚦 Panduan Instalasi & Menjalankan Proyek

### 1. Kloning Repository & Instalasi Dependency
```bash
git clone <url-repo>
cd web-pos
pnpm install --node-linker=hoisted
```

### 2. Konfigurasi Environment Variables
Salin file template `.env.example` ke file `.env` di masing-masing direktori:
```bash
# Salin konfigurasi database & API
cp packages/database/.env.example packages/database/.env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```
> Pastikan mengisi `DATABASE_URL` dan `DIRECT_URL` dengan kredensial PostgreSQL Anda.

### 3. Generate Prisma Client & Migrasi Database
```bash
# Sinkronkan skema database
pnpm --filter @cahyodev/database db:push

# Generate client Prisma untuk backend
pnpm --filter @cahyodev/database db:generate
```

### 4. Database Seeding (Data Awal)
Jalankan seeder untuk membuat akun Superadmin, Tenant demo (StackPlus Cafe), Owner, Kasir, Kategori, Menu, dan Bahan Baku:
```bash
pnpm --filter @cahyodev/database db:seed
```

#### 🔑 Akun Default Hasil Seeding:
| Peran | Email | Kata Sandi | Kegunaan |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `stackplustudio@gmail.com` | `stackplustudio06` | Mengelola tenant & platform |
| **Owner Tenant** | `budicahyono@gmail.com` | `stackplustudio3` | Akses penuh outlet & dashboard |
| **Kasir** | `kasir@stackplustudio.com` | `kasir123` (PIN: `1234`) | Akses POS & transaksi kasir |

### 5. Menjalankan Aplikasi (Development Mode)
Jalankan seluruh workspace secara bersamaan menggunakan Turborepo:
```bash
pnpm dev
```
Aplikasi akan aktif pada:
- **Frontend Web:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:3001](http://localhost:3001)

---

## 🧪 Panduan Verifikasi & Quality Gate

Untuk memastikan kode memenuhi standar kualitas StackPlus Studio sebelum commit:

```bash
# 1. Typecheck & Build Backend
pnpm --filter api build

# 2. Typecheck & Build Frontend Next.js
pnpm --filter web build

# 3. Linter Desain UI (Hallmark Sloplint)
node "C:\Users\acer\.agents\skills\hallmark\scripts\sloplint.mjs" apps/web/src --scope app
```

---

## 🔒 Aturan Pengkodean (Coding Rules)

1. **API Requests:** DILARANG menggunakan `fetch()` browser native di frontend. Selalu gunakan `import { api } from "@/lib/axios"`.
2. **Notifikasi UI:** DILARANG menggunakan `alert()`. Selalu gunakan `import toast from 'react-hot-toast'`.
3. **Modul Backend Baru:** Selalu jalankan `nest g resource <nama_modul>` di dalam `apps/api` sebelum mengisi kode DTO, Service, dan Controller.
4. **Proteksi Endpoint:** Selalu tambahkan `@UseGuards(JwtAuthGuard)` untuk endpoint backend yang membutuhkan autentikasi.
5. **Design System:** Wajib mengacu pada token `--brand-*` yang didefinisikan di `docs/ui.md`. Dilarang menggunakan warna hex hardcoded di JSX.

---

## 📄 Lisensi & Tim Pengembang
Dikembangkan oleh **Stack Plus Studio Core Team** untuk platform SaaS POS F&B Indonesia.
