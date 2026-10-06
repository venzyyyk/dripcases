"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Package, Truck, Check, Clock, ShoppingBag } from "lucide-react";
import Link from "next/link";

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
    price: number;
    size: string | null;
    color: string | null;
  };
}

const STATUS_LABELS: Record<string, string> = {
  ITEM_WON: "Выпал — в инвентаре",
  KEPT: "Забран — к оформлению",
  SOLD: "Продан",
  AWAITING_CLAIM: "Ожидает оформления",
  PROCESSING: "В обработке",
  SHIPPED: "Отправлен",
  IN_DELIVERY: "В доставке",
  DELIVERED: "Получен",
  CANCELLED: "Отменён",
};

const STATUS_ICONS: Record<string, typeof Package> = {
  ITEM_WON: Package,
  KEPT: ShoppingBag,
  AWAITING_CLAIM: Clock,
  PROCESSING: Clock,
  SHIPPED: Truck,
  IN_DELIVERY: Truck,
  DELIVERED: Check,
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/orders?mine=true")
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
        <p className="text-text-secondary">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="text-text-tertiary hover:text-white text-sm transition-colors">
            Кабинет
          </Link>
          <span className="text-text-tertiary">/</span>
          <h1 className="font-display font-bold text-xl">Мои заказы</h1>
        </div>

        <p className="text-sm text-text-secondary mb-6">
          Выпавшие вещи — в{" "}
          <Link href="/dashboard" className="text-accent hover:text-accent-light">
            инвентаре
          </Link>
          : там можно продать, забрать и оформить доставку (ровно 3 вещи).
        </p>

        {orders.length === 0 ? (
          <div className="rounded-xl border border-border bg-bg-card p-8 text-center">
            <p className="text-text-secondary text-sm mb-4">Нет заказов</p>
            <Link href="/cases" className="btn-accent inline-flex">Открыть кейс</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders
              .filter((o) => o.status !== "SOLD")
              .map((order) => {
                const Icon = STATUS_ICONS[order.status] || Package;
                return (
                  <div key={order.id} className="rounded-xl border border-border bg-bg-card p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-bg-elevated flex items-center justify-center">
                          <Icon className="w-4 h-4 text-accent/60" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{order.product.name}</p>
                          <p className="text-xs text-text-tertiary">
                            {order.product.brand}
                            {order.product.size && ` · ${order.product.size}`}
                            {order.product.color && ` · ${order.product.color}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-accent/10 text-accent text-xs">
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                        <p className="text-xs text-text-tertiary mt-1">
                          {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                        </p>
                      </div>
                    </div>

                    {order.trackingNumber && (
                      <p className="text-xs text-text-secondary">
                        Трек: <span className="text-white">{order.trackingNumber}</span>
                      </p>
                    )}
                    {order.address && (
                      <p className="text-xs text-text-tertiary">
                        {order.city}, {order.address}
                      </p>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
