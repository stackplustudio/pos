"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, BookOpen, X, Coffee, Layers, Calculator, Check, Power } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Category {
  id: string;
  nama_kategori: string;
}

interface MenuItem {
  id: string;
  nama: string;
  harga_jual: number;
  status: boolean;
  categoryId?: string;
  category: Category;
}

interface Ingredient {
  id: string;
  nama: string;
  satuan: string;
  harga_beli_terakhir: number;
}

interface Recipe {
  id: string;
  jumlah_takaran: number;
  ingredient: Ingredient;
}

export default function MenusPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal Resep State
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [menuRecipes, setMenuRecipes] = useState<Recipe[]>([]);

  // Form Resep State
  const [selectedIngredientId, setSelectedIngredientId] = useState("");
  const [takaran, setTakaran] = useState("");
  const [isSavingRecipe, setIsSavingRecipe] = useState(false);

  // Modal Menu (Create / Edit) State
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isEditingMenu, setIsEditingMenu] = useState(false);
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const [menuForm, setMenuForm] = useState({
    nama: "",
    harga_jual: "",
    categoryId: "",
    status: true,
  });
  const [isSubmittingMenu, setIsSubmittingMenu] = useState(false);

  useEffect(() => {
    fetchMenus();
    fetchCategories();
    fetchIngredients();
  }, []);

  const fetchMenus = async () => {
    try {
      const response = await api.get("/menu-items");
      setMenus(response.data);
    } catch {
      toast.error("Gagal mengambil data menu");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data);
    } catch {
      console.error("Gagal memuat kategori");
    }
  };

  const fetchIngredients = async () => {
    try {
      const response = await api.get("/ingredients");
      setIngredients(response.data);
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status !== 403) {
        console.error("Gagal memuat bahan baku", error);
      }
    }
  };

  // Menu Modal Handlers
  const openAddMenuModal = () => {
    setIsEditingMenu(false);
    setEditingMenuId(null);
    setMenuForm({
      nama: "",
      harga_jual: "",
      categoryId: categories[0]?.id || "",
      status: true,
    });
    setIsMenuModalOpen(true);
  };

  const openEditMenuModal = (menu: MenuItem) => {
    setIsEditingMenu(true);
    setEditingMenuId(menu.id);
    setMenuForm({
      nama: menu.nama,
      harga_jual: String(menu.harga_jual),
      categoryId: menu.category?.id || menu.categoryId || categories[0]?.id || "",
      status: menu.status,
    });
    setIsMenuModalOpen(true);
  };

  const handleSubmitMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuForm.nama || !menuForm.harga_jual || !menuForm.categoryId) {
      toast.error("Nama menu, harga, dan kategori wajib diisi");
      return;
    }

    setIsSubmittingMenu(true);
    try {
      if (isEditingMenu && editingMenuId) {
        await api.patch(`/menu-items/${editingMenuId}`, {
          nama: menuForm.nama,
          harga_jual: parseInt(menuForm.harga_jual, 10),
          categoryId: menuForm.categoryId,
          status: menuForm.status,
        });
        toast.success("Menu berhasil diperbarui!");
      } else {
        await api.post("/menu-items", {
          nama: menuForm.nama,
          harga_jual: parseInt(menuForm.harga_jual, 10),
          categoryId: menuForm.categoryId,
        });
        toast.success("Menu baru berhasil ditambahkan!");
      }
      setIsMenuModalOpen(false);
      fetchMenus();
    } catch {
      toast.error(isEditingMenu ? "Gagal memperbarui menu" : "Gagal menambahkan menu");
    } finally {
      setIsSubmittingMenu(false);
    }
  };

  const handleDeleteMenu = async (id: string, nama: string) => {
    if (!confirm(`Yakin ingin menghapus menu "${nama}"?`)) return;

    try {
      await api.delete(`/menu-items/${id}`);
      toast.success("Menu berhasil dihapus");
      fetchMenus();
    } catch {
      toast.error("Gagal menghapus menu");
    }
  };

  const handleToggleStatus = async (menu: MenuItem) => {
    const nextStatus = !menu.status;
    try {
      await api.patch(`/menu-items/${menu.id}`, { status: nextStatus });
      setMenus((prev) =>
        prev.map((m) => (m.id === menu.id ? { ...m, status: nextStatus } : m))
      );
      toast.success(
        nextStatus ? `Menu "${menu.nama}" diaktifkan (Tersedia)` : `Menu "${menu.nama}" ditandai Habis (86'd)`
      );
    } catch {
      toast.error("Gagal mengubah status menu");
    }
  };

  // Resep Modal Handlers
  const openRecipeModal = async (menu: MenuItem) => {
    setSelectedMenu(menu);
    setIsRecipeModalOpen(true);
    setMenuRecipes([]);

    try {
      const res = await api.get(`/recipes/menu/${menu.id}`);
      setMenuRecipes(res.data);
    } catch {
      toast.error("Gagal mengambil komposisi resep");
    }
  };

  const handleAddRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMenu || !selectedIngredientId || !takaran) return;

    setIsSavingRecipe(true);
    try {
      await api.post("/recipes", {
        menuItemId: selectedMenu.id,
        ingredientId: selectedIngredientId,
        jumlah_takaran: parseFloat(takaran),
      });

      const res = await api.get(`/recipes/menu/${selectedMenu.id}`);
      setMenuRecipes(res.data);
      toast.success("Bahan berhasil ditambahkan ke resep");
      setSelectedIngredientId("");
      setTakaran("");
    } catch {
      toast.error("Gagal menyimpan resep");
    } finally {
      setIsSavingRecipe(false);
    }
  };

  const handleRemoveRecipe = async (recipeId: string) => {
    try {
      await api.delete(`/recipes/${recipeId}`);
      setMenuRecipes((prev) => prev.filter((r) => r.id !== recipeId));
      toast.success("Bahan dihapus dari resep");
    } catch {
      toast.error("Gagal menghapus bahan");
    }
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  // Estimasi HPP per menu dari resep BOM
  const estimasiHPP = menuRecipes.reduce((sum, r) => {
    const hargaBeli = r.ingredient?.harga_beli_terakhir || 0;
    return sum + r.jumlah_takaran * hargaBeli;
  }, 0);

  return (
    <div className="mx-auto max-w-6xl font-sans text-brand-ink">
      {/* Header Halaman */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-ink-dark sm:text-3xl">
            Daftar Menu &amp; Resep
          </h1>
          <p className="mt-1 text-sm text-brand-ink-muted">
            Kelola katalog produk outlet, status ketersediaan, dan takaran komposisi bahan baku (BOM).
          </p>
        </div>

        <Button
          type="button"
          onClick={openAddMenuModal}
          className="gap-2 self-start sm:self-auto"
        >
          <Plus size={16} aria-hidden="true" />
          <span>Tambah Menu</span>
        </Button>
      </div>

      {/* Grid Katalog Menu */}
      {isLoading ? (
        <div className="flex h-56 items-center justify-center text-xs text-brand-ink-muted">
          Memuat data menu…
        </div>
      ) : menus.length === 0 ? (
        <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-brand-line bg-brand-surface p-6 text-center text-xs text-brand-ink-muted">
          <Coffee size={32} className="mb-2 text-brand-line-strong" aria-hidden="true" />
          <p className="font-semibold text-brand-ink-dark">Belum ada menu</p>
          <p className="mt-1 text-brand-ink-muted">Tambahkan menu pertama untuk mulai melayani transaksi kasir.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {menus.map((menu) => (
            <div
              key={menu.id}
              className="flex flex-col justify-between rounded-xl border border-brand-line bg-brand-surface p-4 shadow-xs transition-colors duration-150 hover:border-brand-primary"
            >
              <div>
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="rounded-md bg-brand-surface-alt px-2 py-0.5 text-[11px] font-medium text-brand-ink-muted">
                    {menu.category?.nama_kategori || "Tanpa Kategori"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(menu)}
                    title="Klik untuk mengubah status ketersediaan"
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                      menu.status
                        ? "bg-success-soft text-success hover:bg-success/20"
                        : "bg-danger-soft text-danger hover:bg-danger/20"
                    }`}
                  >
                    <Power size={11} aria-hidden="true" />
                    <span>{menu.status ? "Tersedia" : "Habis (86'd)"}</span>
                  </button>
                </div>

                <h2 className="text-base font-semibold text-brand-ink-dark line-clamp-1">
                  {menu.nama}
                </h2>
                <p className="mt-1 text-base font-bold text-brand-primary tabular-nums">
                  {formatRupiah(menu.harga_jual)}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-brand-line pt-3">
                <button
                  type="button"
                  onClick={() => openRecipeModal(menu)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary transition-colors hover:text-brand-primary-dark"
                >
                  <BookOpen size={14} aria-hidden="true" />
                  <span>Resep (BOM)</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditMenuModal(menu)}
                    className="inline-flex size-7 items-center justify-center rounded-md text-brand-ink-muted hover:bg-brand-surface-alt hover:text-brand-primary transition-colors"
                    aria-label={`Ubah menu ${menu.nama}`}
                  >
                    <Edit2 size={14} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteMenu(menu.id, menu.nama)}
                    className="inline-flex size-7 items-center justify-center rounded-md text-brand-ink-muted hover:bg-danger-soft hover:text-danger transition-colors"
                    aria-label={`Hapus menu ${menu.nama}`}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah / Edit Menu */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-overlay/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-brand-line bg-brand-surface shadow-md overflow-hidden">
            <div className="flex items-center justify-between border-b border-brand-line px-5 py-4">
              <div>
                <h3 className="text-base font-bold text-brand-ink-dark">
                  {isEditingMenu ? "Ubah Menu" : "Tambah Menu Baru"}
                </h3>
                <p className="text-xs text-brand-ink-muted">
                  {isEditingMenu ? "Perbarui informasi dan harga produk." : "Daftarkan produk baru untuk katalog kasir."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuModalOpen(false)}
                className="rounded-md p-1.5 text-brand-ink-muted hover:bg-brand-surface-alt hover:text-brand-ink-dark"
                aria-label="Tutup modal"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmitMenu} className="p-5 space-y-4">
              <div>
                <label htmlFor="menuNama" className="mb-1.5 block text-xs font-semibold text-brand-ink-dark">
                  Nama Menu
                </label>
                <Input
                  id="menuNama"
                  type="text"
                  required
                  value={menuForm.nama}
                  onChange={(e) => setMenuForm({ ...menuForm, nama: e.target.value })}
                  placeholder="Contoh: Es Kopi Susu Gula Aren"
                  className="h-10 text-sm font-medium"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="menuHarga" className="mb-1.5 block text-xs font-semibold text-brand-ink-dark">
                    Harga Jual (Rp)
                  </label>
                  <Input
                    id="menuHarga"
                    type="number"
                    required
                    min="0"
                    step="500"
                    value={menuForm.harga_jual}
                    onChange={(e) => setMenuForm({ ...menuForm, harga_jual: e.target.value })}
                    placeholder="Contoh: 25000"
                    className="h-10 text-sm tabular-nums"
                  />
                </div>

                <div>
                  <label htmlFor="menuKategori" className="mb-1.5 block text-xs font-semibold text-brand-ink-dark">
                    Kategori
                  </label>
                  <select
                    id="menuKategori"
                    required
                    value={menuForm.categoryId}
                    onChange={(e) => setMenuForm({ ...menuForm, categoryId: e.target.value })}
                    className="h-10 w-full rounded-md border border-brand-line-strong bg-brand-surface px-3 text-xs text-brand-ink-dark outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                  >
                    <option value="" disabled>Pilih kategori…</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nama_kategori}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isEditingMenu && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="menuStatus"
                    checked={menuForm.status}
                    onChange={(e) => setMenuForm({ ...menuForm, status: e.target.checked })}
                    className="size-4 rounded border-brand-line-strong text-brand-primary focus:ring-brand-primary"
                  />
                  <label htmlFor="menuStatus" className="text-xs font-medium text-brand-ink-dark cursor-pointer">
                    Menu tersedia untuk transaksi kasir (Aktif)
                  </label>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsMenuModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingMenu}
                >
                  {isSubmittingMenu ? "Menyimpan…" : isEditingMenu ? "Simpan Perubahan" : "Tambah Menu"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Resep (BOM) */}
      {isRecipeModalOpen && selectedMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-overlay/50 backdrop-blur-xs p-4">
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-brand-line bg-brand-surface shadow-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-brand-line px-5 py-4">
              <div>
                <h3 className="text-base font-bold text-brand-ink-dark">
                  Resep (BOM): {selectedMenu.nama}
                </h3>
                <p className="text-xs text-brand-ink-muted">
                  Tentukan pemotongan stok bahan baku otomatis saat menu ini terjual di kasir.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRecipeModalOpen(false)}
                className="rounded-md p-1.5 text-brand-ink-muted hover:bg-brand-surface-alt hover:text-brand-ink-dark focus-visible:ring-2 focus-visible:ring-brand-primary"
                aria-label="Tutup modal resep"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* Card Estimasi HPP */}
              <div className="mb-5 flex items-center justify-between rounded-xl border border-brand-line bg-brand-surface-alt p-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-brand-primary-soft text-brand-primary">
                    <Calculator size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-brand-ink-dark">Estimasi HPP Bahan</p>
                    <p className="text-[11px] text-brand-ink-muted">Dihitung dari harga beli terakhir bahan</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-brand-primary tabular-nums">
                    {formatRupiah(estimasiHPP)}
                  </p>
                  <p className="text-[11px] text-brand-ink-muted">
                    Margin:{" "}
                    <span className="font-semibold text-success">
                      {selectedMenu.harga_jual > 0
                        ? `${Math.round(((selectedMenu.harga_jual - estimasiHPP) / selectedMenu.harga_jual) * 100)}%`
                        : "0%"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Form Tambah Bahan */}
              <form onSubmit={handleAddRecipe} className="mb-6 rounded-xl border border-brand-line bg-brand-surface p-4 shadow-xs">
                <p className="mb-3 text-xs font-semibold text-brand-ink-dark">Tambah Komposisi Bahan</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_120px_auto]">
                  <div>
                    <label htmlFor="ingredientSelect" className="sr-only">
                      Bahan Baku
                    </label>
                    <select
                      id="ingredientSelect"
                      required
                      value={selectedIngredientId}
                      onChange={(e) => setSelectedIngredientId(e.target.value)}
                      className="h-10 w-full rounded-md border border-brand-line-strong bg-brand-surface px-3 text-xs text-brand-ink-dark outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                    >
                      <option value="" disabled>Pilih bahan baku…</option>
                      {ingredients.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.nama} ({ing.satuan})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="takaranInput" className="sr-only">
                      Takaran
                    </label>
                    <Input
                      id="takaranInput"
                      type="number"
                      step="0.01"
                      required
                      min="0.01"
                      value={takaran}
                      onChange={(e) => setTakaran(e.target.value)}
                      placeholder="Takaran"
                      className="h-10 text-xs tabular-nums"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSavingRecipe}
                    className="h-10 text-xs font-semibold"
                  >
                    {isSavingRecipe ? "Menyimpan…" : "Tambah"}
                  </Button>
                </div>
              </form>

              {/* Komposisi Resep Saat Ini */}
              <div className="flex items-center gap-1.5 mb-3">
                <Layers size={15} className="text-brand-primary" aria-hidden="true" />
                <h4 className="text-xs font-semibold text-brand-ink-dark">
                  Daftar Bahan Pemotong Stok
                </h4>
              </div>

              {menuRecipes.length === 0 ? (
                <div className="rounded-lg border border-dashed border-brand-line p-4 text-center text-xs text-brand-ink-muted">
                  Menu ini belum memiliki resep. Penjualan kasir tidak akan memotong stok otomatis.
                </div>
              ) : (
                <div className="space-y-2">
                  {menuRecipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      className="flex items-center justify-between rounded-lg border border-brand-line bg-brand-surface p-3 shadow-xs"
                    >
                      <div>
                        <p className="text-xs font-semibold text-brand-ink-dark">
                          {recipe.ingredient.nama}
                        </p>
                        <p className="text-[11px] text-brand-primary font-medium tabular-nums">
                          Memotong {recipe.jumlah_takaran} {recipe.ingredient.satuan} per porsi
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveRecipe(recipe.id)}
                        className="inline-flex size-8 items-center justify-center rounded-lg text-danger hover:bg-danger-soft transition-colors"
                        aria-label={`Hapus ${recipe.ingredient.nama}`}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
