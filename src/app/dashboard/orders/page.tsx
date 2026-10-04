"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import { Package, Truck, Check, Clock } from "lucide-react";
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
  ITEM_WON: "Выпал",
  AWAITING_CLAIM: "Ожидает оформления",
  PROCESSING: "В обработке",
  SHIPPED: "Отправлен",
  IN_DELIVERY: "В доставке",
  DELIVERED: "Получен",
  CANCELLED: "Отменён",
};

const STATUS_ICONS: Record<string, typeof Package> = {
  ITEM_WON: Package,
  AWAITING_CLAIM: Clock,
  PROCESSING: Clock,
  SHIPPED: Truck,
  IN_DELIVERY: Truck,
  DELIVERED: Check,
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/orders?mine=true")
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleClaim(e: React.FormEvent<HTMLFormElement>, orderId: string) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "AWAITING_CLAIM",
        fullName: formData.get("fullName"),
        phone: formData.get("phone"),
        city: formData.get("city"),
        address: formData.get("address"),
      }),
    });

    if (res.ok) {
      toast.success("Заказ оформлен");
      setClaimingId(null);
      router.refresh();
      // Refetch
      const data = await (await fetch("/api/admin/orders?mine=true")).json();
      setOrders(data.orders || []);
    } else {
      toast.error("Ошибка оформления");
    }
  }

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

        {orders.length === 0 ? (
          <div className="rounded-xl border border-border bg-bg-card p-8 text-center">
            <p className="text-text-secondary text-sm mb-4">Нет заказов</p>
            <Link href="/cases" className="btn-accent inline-flex">Открыть кейс</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const Icon = STATUS_ICONS[order.status] || Package;
              return (
                <div
                  key={order.id}
                  className="rounded-xl border border-border bg-bg-card p-5"
                >
                  <div className="flex items-start justify-between mb-3">
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

                  {/* Tracking */}
                  {order.trackingNumber && (
                    <p className="text-xs text-text-secondary mb-2">
                      Трек: <span className="text-white">{order.trackingNumber}</span>
                    </p>
                  )}

                  {/* Delivery info */}
                  {order.address && (
                    <p className="text-xs text-text-tertiary mb-2">
                      {order.city}, {order.address}
                    </p>
                  )}

                  {/* Claim form */}
                  {order.status === "ITEM_WON" && (
                    <>
                      {claimingId === order.id ? (
                        <form
                          onSubmit={(e) => handleClaim(e, order.id)}
                          className="mt-4 space-y-3 border-t border-border pt-4"
                        >
                          <p className="text-sm font-medium mb-2">
                            Данные для доставки
                          </p>
                          <input name="fullName" required className="input" placeholder="ФИО получателя" />
                          <input name="phone" required className="input" placeholder="Телефон" />
                          <input name="city" required className="input" placeholder="Город" />
                          <input name="address" required className="input" placeholder="Адрес / пункт выдачи" />
                          <div className="flex gap-2">
                            <button type="submit" className="btn-accent text-sm py-2">
                              Оформить
                            </button>
                            <button
                              type="button"
                              onClick={() => setClaimingId(null)}
                              className="btn-ghost text-sm py-2"
                            >
                              Отмена
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          onClick={() => setClaimingId(order.id)}
                          className="btn-accent text-sm py-2 mt-2"
                        >
                          Оформить получение
                        </button>
                      )}
                    </>
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
