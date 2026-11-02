"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, BookOpen, X, Coffee, Layers } from "lucide-react";
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
  category: Category;
}

interface Ingredient {
  id: string;
  nama: string;
  satuan: string;
}

interface Recipe {
  id: string;
  jumlah_takaran: number;
  ingredient: Ingredient;
}

export default function MenusPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [menuRecipes, setMenuRecipes] = useState<Recipe[]>([]);

  // Form Resep State
  const [selectedIngredientId, setSelectedIngredientId] = useState("");
  const [takaran, setTakaran] = useState("");
  const [isSavingRecipe, setIsSavingRecipe] = useState(false);

  useEffect(() => {
    fetchMenus();
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

  return (
    <div className="mx-auto max-w-6xl font-sans text-brand-ink">
      {/* Header Halaman */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-ink-dark sm:text-3xl">
            Daftar Menu &amp; Resep
          </h1>
          <p className="mt-1 text-sm text-brand-ink-muted">
            Kelola katalog produk outlet dan takaran komposisi bahan baku (BOM).
          </p>
        </div>

        <Button
          type="button"
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
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      menu.status
                        ? "bg-success-soft text-success"
                        : "bg-danger-soft text-danger"
                    }`}
                  >
                    {menu.status ? "Tersedia" : "Habis"}
                  </span>
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
                  className="inline-flex items-center gap-1.5 rounded-lg border border-brand-line bg-brand-surface px-2.5 py-1.5 text-xs font-medium text-brand-ink-dark transition-colors duration-150 hover:bg-brand-surface-alt focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <BookOpen size={14} aria-hidden="true" />
                  <span>Resep (BOM)</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="inline-flex size-8 items-center justify-center rounded-lg text-brand-ink-muted transition-colors duration-150 hover:bg-brand-surface-alt hover:text-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary"
                    aria-label={`Ubah menu ${menu.nama}`}
                  >
                    <Edit2 size={15} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="inline-flex size-8 items-center justify-center rounded-lg text-brand-ink-muted transition-colors duration-150 hover:bg-danger-soft hover:text-danger focus-visible:ring-2 focus-visible:ring-danger"
                    aria-label={`Hapus menu ${menu.nama}`}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          ))}
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
                  Resep: {selectedMenu.nama}
                </h3>
                <p className="text-xs text-brand-ink-muted">
                  Tentukan pemotongan stok bahan baku otomatis saat menu ini terjual.
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
              {/* Form Tambah Bahan */}
              <form onSubmit={handleAddRecipe} className="mb-6 rounded-xl border border-brand-line bg-brand-surface-alt p-4">
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
