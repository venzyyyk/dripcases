"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import Image from "next/image";
import { ImageUpload } from "@/components/admin/image-upload";

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

export default function SupplierProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newImage, setNewImage] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const res = await fetch("/api/supplier/products");
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

    const res = await fetch("/api/supplier/products", {
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

  async function patch(id: string, data: Record<string, unknown>) {
    await fetch("/api/supplier/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    fetchProducts();
  }

  if (loading) return <p className="text-text-secondary">Загрузка...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl">Мои товары</h1>
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
          <ImageUpload value={newImage} onChange={setNewImage} folder="products" label="Фото товара" />
          <button type="submit" className="btn-primary text-sm py-2">Создать</button>
        </form>
      )}

      {products.length === 0 ? (
        <p className="text-text-secondary text-sm">
          Пока нет товаров. Добавь первый — его можно будет включить в кейсы.
        </p>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p.id} className="rounded-xl border border-border bg-bg-card p-4 flex gap-4 items-center">
              <div className="w-14 h-14 rounded-lg bg-bg-elevated shrink-0 overflow-hidden relative">
                {p.images[0] ? (
                  <Image src={p.images[0]} alt={p.name} fill sizes="56px" className="object-cover" />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-text-tertiary text-[10px]">нет фото</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-text-tertiary">
                  {p.brand} · {formatPrice(p.price)} · остаток {p.stock}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  defaultValue={p.stock}
                  className="input w-20 py-1 text-xs"
                  onBlur={(e) => {
                    const v = parseInt(e.target.value);
                    if (!Number.isNaN(v) && v !== p.stock) patch(p.id, { stock: v });
                  }}
                  title="Остаток"
                />
                <button
                  onClick={() => patch(p.id, { isActive: !p.isActive })}
                  className={`text-xs px-2.5 py-1 rounded-md ${p.isActive ? "bg-green-500/15 text-green-400" : "bg-white/5 text-text-tertiary"}`}
                >
                  {p.isActive ? "Активен" : "Скрыт"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
