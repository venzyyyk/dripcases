"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";

interface Order {
  id: string;
  status: string;
  fullName: string | null;
  phone: string | null;
  city: string | null;
  address: string | null;
  trackingNumber: string | null;
  createdAt: string;
  product: {
    name: string;
    brand: string | null;
    size: string | null;
    color: string | null;
    sku: string | null;
    images: string[];
  };
}

const STATUS_LABELS: Record<string, string> = {
  ITEM_WON: "Выпал (не оформлен)",
  KEPT: "Забран покупателем",
  AWAITING_CLAIM: "Ожидает отправки",
  PROCESSING: "В обработке",
  SHIPPED: "Отправлен",
  IN_DELIVERY: "В доставке",
  DELIVERED: "Получен",
  CANCELLED: "Отменён",
};

// что поставщик может выставить
const SETTABLE = ["PROCESSING", "SHIPPED", "IN_DELIVERY", "DELIVERED", "CANCELLED"];

export default function SupplierOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await (await fetch("/api/supplier/orders")).json();
      setOrders(data.orders || []);
    } finally {
      setLoading(false);
    }
  }

  async function patch(id: string, body: Record<string, unknown>) {
    const r = await fetch(`/api/supplier/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (r.ok) {
      toast.success("Обновлено");
      load();
    } else {
      const d = await r.json().catch(() => ({}));
      toast.error(d.error || "Ошибка");
    }
  }

  if (loading) return <p className="text-text-secondary">Загрузка...</p>;

  // показываем только оформленные покупателем (есть что отправлять) и дальше по статусам
  const actionable = orders.filter((o) =>
    ["AWAITING_CLAIM", "PROCESSING", "SHIPPED", "IN_DELIVERY", "DELIVERED", "CANCELLED"].includes(o.status)
  );
  const pending = orders.filter((o) => ["ITEM_WON", "KEPT"].includes(o.status));

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-6">Заказы на мои товары</h1>

      {actionable.length === 0 && pending.length === 0 && (
        <p className="text-text-secondary text-sm">Пока нет заказов на твои товары.</p>
      )}

      {actionable.length > 0 && (
        <div className="space-y-4 mb-10">
          {actionable.map((o) => (
            <div key={o.id} className="rounded-xl border border-border bg-bg-card p-5">
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-lg bg-bg-elevated shrink-0 overflow-hidden relative">
                  {o.product.images[0] ? (
                    <Image src={o.product.images[0]} alt={o.product.name} fill sizes="56px" className="object-cover" />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{o.product.name}</p>
                  <p className="text-xs text-text-tertiary">
                    {o.product.brand}
                    {o.product.size && ` · ${o.product.size}`}
                    {o.product.color && ` · ${o.product.color}`}
                    {o.product.sku && ` · ${o.product.sku}`}
                  </p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-accent/10 text-accent text-xs">
                    {STATUS_LABELS[o.status] || o.status}
                  </span>
                </div>
              </div>

              {/* Данные для отправки */}
              <div className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-1 text-xs border-t border-border pt-3">
                <p><span className="text-text-tertiary">Получатель:</span> {o.fullName || "—"}</p>
                <p><span className="text-text-tertiary">Телефон:</span> {o.phone || "—"}</p>
                <p><span className="text-text-tertiary">Город:</span> {o.city || "—"}</p>
                <p><span className="text-text-tertiary">Адрес:</span> {o.address || "—"}</p>
              </div>

              {/* Управление */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <select
                  defaultValue={o.status}
                  className="input w-auto py-1.5 text-xs"
                  onChange={(e) => patch(o.id, { status: e.target.value })}
                >
                  {SETTABLE.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
                <input
                  defaultValue={o.trackingNumber || ""}
                  placeholder="Трек-номер"
                  className="input w-40 py-1.5 text-xs"
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v && v !== o.trackingNumber) patch(o.id, { trackingNumber: v });
                  }}
                />
                {o.trackingNumber && (
                  <span className="text-xs text-text-secondary">трек: {o.trackingNumber}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {pending.length > 0 && (
        <div>
          <h2 className="font-display font-semibold text-sm text-text-secondary mb-3">
            Ещё не оформлены покупателем ({pending.length})
          </h2>
          <div className="space-y-2">
            {pending.map((o) => (
              <div key={o.id} className="rounded-lg border border-border bg-bg-card p-3 flex items-center gap-3 text-xs">
                <span className="font-medium">{o.product.name}</span>
                <span className="text-text-tertiary">{STATUS_LABELS[o.status]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
