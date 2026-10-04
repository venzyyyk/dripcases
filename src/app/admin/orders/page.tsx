"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

interface Order {
  id: string;
  status: string;
  fullName: string | null;
  phone: string | null;
  city: string | null;
  address: string | null;
  trackingNumber: string | null;
  createdAt: string;
  user: { name: string | null; email: string };
  product: { name: string; brand: string | null; price: number };
}

const STATUSES = [
  "ITEM_WON",
  "AWAITING_CLAIM",
  "PROCESSING",
  "SHIPPED",
  "IN_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const STATUS_LABELS: Record<string, string> = {
  ITEM_WON: "Выпал",
  AWAITING_CLAIM: "Ожидает оформления",
  PROCESSING: "В обработке",
  SHIPPED: "Отправлен",
  IN_DELIVERY: "В доставке",
  DELIVERED: "Получен",
  CANCELLED: "Отменён",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    const res = await fetch("/api/admin/orders");
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  }

  async function updateStatus(orderId: string, status: string) {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success("Статус обновлён");
      fetchOrders();
    }
  }

  async function setTracking(orderId: string) {
    const tracking = prompt("Трек-номер:");
    if (!tracking) return;
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackingNumber: tracking }),
    });
    toast.success("Трек-номер добавлен");
    fetchOrders();
  }

  const filtered = filter ? orders.filter((o) => o.status === filter) : orders;

  if (loading) return <p className="text-text-secondary">Загрузка...</p>;

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-6">Заказы</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter("")}
          className={`px-3 py-1 rounded-lg text-xs transition-colors ${
            !filter ? "bg-accent text-black" : "bg-bg-elevated text-text-secondary hover:text-white"
          }`}
        >
          Все ({orders.length})
        </button>
        {STATUSES.map((s) => {
          const count = orders.filter((o) => o.status === s).length;
          if (count === 0) return null;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                filter === s ? "bg-accent text-black" : "bg-bg-elevated text-text-secondary hover:text-white"
              }`}
            >
              {STATUS_LABELS[s]} ({count})
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filtered.map((order) => (
          <div key={order.id} className="rounded-xl border border-border bg-bg-card p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-medium">{order.product.name}</p>
                <p className="text-xs text-text-tertiary">
                  {order.user.name || order.user.email} · {formatPrice(order.product.price)}
                </p>
              </div>
              <select
                value={order.status}
                onChange={(e) => updateStatus(order.id, e.target.value)}
                className="input w-auto py-1 px-2 text-xs"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>

            {order.fullName && (
              <div className="text-xs text-text-secondary mb-2">
                {order.fullName} · {order.phone} · {order.city}, {order.address}
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-text-tertiary">
                {new Date(order.createdAt).toLocaleDateString("ru-RU")}
              </span>
              {order.trackingNumber ? (
                <span className="text-xs text-accent">Трек: {order.trackingNumber}</span>
              ) : (
                order.status !== "ITEM_WON" &&
                order.status !== "CANCELLED" && (
                  <button
                    onClick={() => setTracking(order.id)}
                    className="text-xs text-text-tertiary hover:text-accent transition-colors"
                  >
                    Добавить трек-номер
                  </button>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
