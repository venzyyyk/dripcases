"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

interface CaseData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  isActive: boolean;
  tag: string | null;
  sortOrder: number;
  _count: { items: number; openings: number };
}

export default function AdminCasesPage() {
  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchCases();
  }, []);

  async function fetchCases() {
    const res = await fetch("/api/admin/cases");
    const data = await res.json();
    setCases(data.cases || []);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get("name"),
      slug: (fd.get("name") as string).toLowerCase().replace(/[^a-zа-я0-9]/g, "-"),
      description: fd.get("description"),
      price: Math.round(parseFloat(fd.get("price") as string) * 100),
      tag: fd.get("tag") || null,
      sortOrder: parseInt(fd.get("sortOrder") as string) || 0,
    };

    const res = await fetch("/api/admin/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success("Кейс создан");
      setShowCreate(false);
      fetchCases();
    } else {
      const err = await res.json();
      toast.error(err.error || "Ошибка");
    }
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/admin/cases`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !current }),
    });
    fetchCases();
  }

  if (loading) return <p className="text-text-secondary">Загрузка...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl">Кейсы</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-accent text-sm py-2">
          <Plus className="w-4 h-4" />
          Создать кейс
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="rounded-xl border border-border bg-bg-card p-5 mb-6 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Название</label>
              <input name="name" required className="input" placeholder="PREMIUM" />
            </div>
            <div>
              <label className="label">Цена (₽)</label>
              <input name="price" type="number" step="0.01" required className="input" placeholder="4990" />
            </div>
          </div>
          <div>
            <label className="label">Описание</label>
            <input name="description" className="input" placeholder="Описание кейса" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Тег</label>
              <input name="tag" className="input" placeholder="Хит, Популярный..." />
            </div>
            <div>
              <label className="label">Порядок сортировки</label>
              <input name="sortOrder" type="number" className="input" defaultValue="0" />
            </div>
          </div>
          <button type="submit" className="btn-primary text-sm py-2">Создать</button>
        </form>
      )}

      {/* List */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-elevated">
              <th className="text-left px-4 py-3 text-text-tertiary font-medium text-xs">Название</th>
              <th className="text-left px-4 py-3 text-text-tertiary font-medium text-xs">Цена</th>
              <th className="text-center px-4 py-3 text-text-tertiary font-medium text-xs">Товаров</th>
              <th className="text-center px-4 py-3 text-text-tertiary font-medium text-xs">Открытий</th>
              <th className="text-center px-4 py-3 text-text-tertiary font-medium text-xs">Статус</th>
              <th className="text-right px-4 py-3 text-text-tertiary font-medium text-xs">Действия</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-bg-hover transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    {c.tag && <span className="text-xs text-accent">{c.tag}</span>}
                  </div>
                </td>
                <td className="px-4 py-3">{formatPrice(c.price)}</td>
                <td className="px-4 py-3 text-center">{c._count.items}</td>
                <td className="px-4 py-3 text-center">{c._count.openings}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleActive(c.id, c.isActive)}
                    className={`px-2 py-0.5 rounded text-xs ${
                      c.isActive
                        ? "bg-green-500/10 text-green-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {c.isActive ? "Активен" : "Неактивен"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/cases/${c.id}`}
                    className="inline-flex p-1.5 text-text-tertiary hover:text-white transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
