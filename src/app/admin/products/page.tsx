"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import Image from "next/image";
import { ImageUpload } from "@/components/admin/image-upload";
import Link from "next/link";

interface Product {
  id: string;
  images: string[];
  name: string;
  brand: string | null;
  size: string | null;
  color: string | null;
  price: number;
  sku: string | null;
  stock: number;
  isActive: boolean;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newImage, setNewImage] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get("name"),
      brand: fd.get("brand") || null,
      description: fd.get("description") || null,
      size: fd.get("size") || null,
      color: fd.get("color") || null,
      price: Math.round(parseFloat(fd.get("price") as string) * 100),
      sku: fd.get("sku") || null,
      stock: parseInt(fd.get("stock") as string) || 0,
      images: newImage ? [newImage] : [],
    };

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success("Товар создан");
      setShowCreate(false);
      setNewImage(null);
      fetchProducts();
    } else {
      const err = await res.json();
      toast.error(err.error || "Ошибка");
    }
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !current }),
    });
    fetchProducts();
  }

  if (loading) return <p className="text-text-secondary">Загрузка...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl">Товары</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-accent text-sm py-2">
          <Plus className="w-4 h-4" />
          Добавить товар
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="rounded-xl border border-border bg-bg-card p-5 mb-6 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Название</label>
              <input name="name" required className="input" />
            </div>
            <div>
              <label className="label">Бренд</label>
              <input name="brand" className="input" />
            </div>
          </div>
          <div>
            <label className="label">Описание</label>
            <input name="description" className="input" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="label">Цена (₽)</label>
              <input name="price" type="number" step="0.01" required className="input" />
            </div>
            <div>
              <label className="label">Размер</label>
              <input name="size" className="input" />
            </div>
            <div>
              <label className="label">Цвет</label>
              <input name="color" className="input" />
            </div>
            <div>
              <label className="label">Остаток</label>
              <input name="stock" type="number" className="input" defaultValue="0" />
            </div>
          </div>
          <div>
            <label className="label">Артикул (SKU)</label>
            <input name="sku" className="input" />
          </div>
          <div className="max-w-xs">
            <ImageUpload
              value={newImage}
              onChange={setNewImage}
              folder="products"
              label="Фото товара"
            />
          </div>
          <button type="submit" className="btn-primary text-sm py-2">Создать</button>
        </form>
      )}

      <div className="rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-border bg-bg-elevated">
              <th className="text-left px-4 py-3 text-text-tertiary font-medium text-xs">Товар</th>
              <th className="text-left px-4 py-3 text-text-tertiary font-medium text-xs">Бренд</th>
              <th className="text-right px-4 py-3 text-text-tertiary font-medium text-xs">Цена</th>
              <th className="text-center px-4 py-3 text-text-tertiary font-medium text-xs">Остаток</th>
              <th className="text-center px-4 py-3 text-text-tertiary font-medium text-xs">Статус</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-bg-hover transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-bg-elevated shrink-0 relative overflow-hidden">
                      {p.images?.[0] ? (
                        <Image
                          src={p.images[0]}
                          alt={p.name}
                          fill
                          sizes="40px"
                          className="object-contain p-1"
                        />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] text-text-tertiary">
                          —
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{p.name}</p>
                      <p className="text-xs text-text-tertiary truncate">
                        {[p.size, p.color, p.sku].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-secondary">{p.brand || "—"}</td>
                <td className="px-4 py-3 text-right">{formatPrice(p.price)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={p.stock === 0 ? "text-red-400" : ""}>{p.stock}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleActive(p.id, p.isActive)}
                    className={`px-2 py-0.5 rounded text-xs ${
                      p.isActive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {p.isActive ? "Активен" : "Скрыт"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
