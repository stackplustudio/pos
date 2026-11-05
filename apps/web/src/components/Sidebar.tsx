"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  List,
  Coffee,
  Package,
  Users,
  LogOut,
  ReceiptText,
  LayoutGrid,
  Settings,
  Truck,
  Tag,
  ShoppingBag,
  TrendingUp,
  ShieldAlert,
  Store,
  X,
  ChefHat,
} from "lucide-react";
import Cookies from "js-cookie";

interface UserData {
  name: string;
  email: string;
  role: string;
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUserData(JSON.parse(userStr));
      } catch (err) {
        console.error("Gagal membaca sesi pengguna", err);
      }
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const menuGroups = [
    {
      title: "Utama",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["OWNER", "MANAGER", "KASIR"] },
        { name: "Transaksi", href: "/dashboard/orders", icon: ReceiptText, roles: ["OWNER", "MANAGER"] },
        { name: "Laporan Keuangan", href: "/dashboard/reports", icon: TrendingUp, roles: ["OWNER", "MANAGER"] },
      ],
    },
    {
      title: "Katalog",
      items: [
        { name: "Kategori", href: "/dashboard/categories", icon: List, roles: ["OWNER", "MANAGER", "KASIR"] },
        { name: "Daftar Menu", href: "/dashboard/menus", icon: Coffee, roles: ["OWNER", "MANAGER", "KASIR"] },
      ],
    },
    {
      title: "Operasional",
      items: [
        { name: "Kitchen Display (KDS)", href: "/dashboard/kds", icon: ChefHat, roles: ["OWNER", "MANAGER", "KASIR"] },
        { name: "Manajemen Meja", href: "/dashboard/tables", icon: LayoutGrid, roles: ["OWNER", "MANAGER", "KASIR"] },
        { name: "Inventory", href: "/dashboard/inventory", icon: Package, roles: ["OWNER", "MANAGER"] },
        { name: "Supplier", href: "/dashboard/suppliers", icon: Truck, roles: ["OWNER", "MANAGER"] },
        { name: "Purchase Order", href: "/dashboard/purchase-orders", icon: ShoppingBag, roles: ["OWNER", "MANAGER"] },
        { name: "Promo & Diskon", href: "/dashboard/discounts", icon: Tag, roles: ["OWNER", "MANAGER"] },
        { name: "Pegawai", href: "/dashboard/users", icon: Users, roles: ["OWNER", "MANAGER"] },
        { name: "Pengaturan", href: "/dashboard/settings", icon: Settings, roles: ["OWNER"] },
      ],
    },
    {
      title: "System Admin",
      items: [
        { name: "SaaS Control Center", href: "/dashboard/superadmin", icon: ShieldAlert, roles: ["SUPER_ADMIN"] },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-brand-overlay/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-[240px] flex-col border-r border-brand-line bg-brand-surface font-sans transition-transform duration-200 ease-standard lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Navigasi sidebar"
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-brand-line px-5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 text-brand-ink-dark transition-colors hover:text-brand-primary"
            onClick={onClose}
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-brand-primary text-white shadow-xs">
              <Store size={20} strokeWidth={2.2} aria-hidden="true" />
            </span>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-brand-ink-dark">
                NusaKasir<span className="text-brand-primary">.</span>
              </span>
              <span className="text-[11px] font-medium text-brand-ink-muted">POS &amp; Inventory</span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-brand-ink-muted hover:bg-brand-surface-alt hover:text-brand-ink-dark focus-visible:ring-2 focus-visible:ring-brand-primary lg:hidden"
            aria-label="Tutup navigasi"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {menuGroups.map((group, idx) => {
            const filteredItems = group.items.filter((item) =>
              item.roles.includes(userData?.role || "")
            );
            if (filteredItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1">
                <p className="px-3 text-[11px] font-semibold text-brand-ink-muted">
                  {group.title}
                </p>
                <div className="space-y-0.5">
                  {filteredItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={onClose}
                        className={`group flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-brand-primary ${
                          isActive
                            ? "bg-brand-primary-soft text-brand-primary font-semibold shadow-xs border-l-2 border-brand-primary"
                            : "text-brand-ink hover:bg-brand-surface-alt hover:text-brand-ink-dark"
                        }`}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <Icon
                          size={18}
                          className={`shrink-0 transition-colors ${
                            isActive ? "text-brand-primary" : "text-brand-ink-muted group-hover:text-brand-ink-dark"
                          }`}
                          aria-hidden="true"
                        />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="border-t border-brand-line p-3">
          <div className="mb-2 flex items-center gap-2.5 rounded-lg bg-brand-surface-alt p-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-xs font-bold text-brand-primary">
              {userData?.name ? userData.name.slice(0, 2).toUpperCase() : "NK"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-brand-ink-dark">
                {userData?.name || "Pengguna"}
              </p>
              <p className="truncate text-[11px] text-brand-ink-muted">
                {userData?.role || "Staff"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-brand-line bg-brand-surface px-3 text-xs font-medium text-danger hover:bg-danger-soft transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-danger"
          >
            <LogOut size={14} aria-hidden="true" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>
    </>
  );
}
