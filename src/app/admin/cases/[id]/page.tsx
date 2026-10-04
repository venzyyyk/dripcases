"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/admin/image-upload";

interface CaseDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image: string | null;
  isActive: boolean;
  tag: string | null;
  sortOrder: number;
  items: {
    id: string;
    productId: string;
    dropChance: number;
    product: {
      id: string;
      name: string;
      brand: string | null;
      price: number;
      stock: number;
    };
  }[];
}

interface Product {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  stock: number;
}

export default function AdminCaseEditPage() {
  const params = useParams();
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [tag, setTag] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const [newProductId, setNewProductId] = useState("");
  const [newChance, setNewChance] = useState("");

  useEffect(() => {
    load();
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []));
  }, [params.id]);

  async function load() {
    const res = await fetch(`/api/admin/cases?id=${params.id}`);
    const data = await res.json();
    const c: CaseDetail | undefined = data.case;

    if (c) {
      setCaseData(c);
      setName(c.name);
      setDescription(c.description || "");
      setPrice((c.price / 100).toString());
      setTag(c.tag || "");
      setImage(c.image);
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/admin/cases", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: params.id,
        name,
        description: description || null,
        price: Math.round(parseFloat(price) * 100),
        tag: tag || null,
        image,
      }),
    });
    setSaving(false);
    if (res.ok) toast.success("Сохранено");
    else toast.error("Ошибка сохранения");
  }

  async function addItem() {
    if (!newProductId || !newChance) {
      toast.error("Выбери товар и укажи шанс");
      return;
    }

    const res = await fetch("/api/admin/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "addItem",
        caseId: params.id,
        productId: newProductId,
        dropChance: parseFloat(newChance),
      }),
    });

    if (res.ok) {
      toast.success("Товар добавлен");
      setNewProductId("");
      setNewChance("");
      load();
    } else {
      const err = await res.json();
      toast.error(err.error || "Ошибка");
    }
  }

  async function removeItem(itemId: string) {
    await fetch("/api/admin/cases", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "removeItem", itemId }),
    });
    toast.success("Удалено");
    load();
  }

  if (loading) return <p className="text-text-secondary">Загрузка...</p>;
  if (!caseData) return <p className="text-red-400">Кейс не найден</p>;

  const totalChance = caseData.items.reduce((s, i) => s + i.dropChance, 0);
  const used = new Set(caseData.items.map((i) => i.productId));
  const available = products.filter((p) => !used.has(p.id));
  const chanceOk = Math.abs(totalChance - 100) < 0.01;

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/cases"
        className="inline-flex items-center gap-2 text-sm text-text-tertiary hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад к кейсам
      </Link>

      <h1 className="font-display font-bold text-2xl mb-6">{caseData.name}</h1>

      <div className="grid lg:grid-cols-[1fr_280px] gap-6 mb-6">
        {/* Поля */}
        <div className="rounded-xl border border-border bg-bg-card p-5 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Название</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Цена (₽)</label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                step="0.01"
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="label">Описание</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">Тег</label>
            <input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="input"
              placeholder="Хит, Популярный..."
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary text-sm py-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Сохраняем..." : "Сохранить"}
          </button>
        </div>

        {/* Рендер */}
        <div className="rounded-xl border border-border bg-bg-card p-5">
          <ImageUpload
            value={image}
            onChange={setImage}
            folder="cases"
            label="Рендер витрины"
          />
          <p className="mt-3 text-[11px] leading-[1.5] text-text-tertiary">
            После загрузки нажми «Сохранить» — путь запишется в кейс.
          </p>
        </div>
      </div>

      {/* Товары */}
      <div className="rounded-xl border border-border bg-bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg">Товары в кейсе</h2>
          <span className={`text-xs ${chanceOk ? "text-green-400" : "text-red-400"}`}>
            Сумма шансов: {totalChance.toFixed(1)}%
          </span>
        </div>

        {!chanceOk && caseData.items.length > 0 && (
          <p className="mb-4 text-[11px] text-red-400/80">
            Сумма должна быть 100%. Сейчас шансы нормализуются на лету при
            открытии, но лучше привести к сотне явно.
          </p>
        )}

        <div className="space-y-2 mb-6">
          {caseData.items.length === 0 && (
            <p className="text-sm text-text-tertiary">Пусто — добавь товары ниже.</p>
          )}
          {caseData.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-border p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{item.product.name}</p>
                <p className="text-xs text-text-tertiary">
                  {item.product.brand && `${item.product.brand} · `}
                  {formatPrice(item.product.price)} ·{" "}
                  <span className={item.product.stock === 0 ? "text-red-400" : ""}>
                    остаток {item.product.stock}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <span className="text-accent text-sm font-medium tabular-nums">
                  {item.dropChance}%
                </span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1.5 text-text-tertiary hover:text-red-400 transition-colors"
                  aria-label="Удалить"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {available.length > 0 ? (
          <div className="flex items-end gap-3 border-t border-border pt-4">
            <div className="flex-1 min-w-0">
              <label className="label">Товар</label>
              <select
                value={newProductId}
                onChange={(e) => setNewProductId(e.target.value)}
                className="input"
              >
                <option value="">Выбрать...</option>
                {available.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({formatPrice(p.price)})
                  </option>
                ))}
              </select>
            </div>
            <div className="w-24">
              <label className="label">Шанс %</label>
              <input
                value={newChance}
                onChange={(e) => setNewChance(e.target.value)}
                type="number"
                step="0.1"
                className="input"
                placeholder="10"
              />
            </div>
            <button onClick={addItem} className="btn-accent text-sm py-3 px-4">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <p className="border-t border-border pt-4 text-xs text-text-tertiary">
            Все товары уже добавлены.
          </p>
        )}
      </div>
    </div>
  );
}
