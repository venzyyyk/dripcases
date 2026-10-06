"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { formatPrice } from "@/lib/utils";

const CHECKOUT_ITEMS = 3;
const CHECKOUT_MIN = 350000; // 3500 ₽ в копейках

interface InvProduct {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  size: string | null;
  color: string | null;
  images: string[];
}
interface InvOrder {
  id: string;
  status: string;
  createdAt: string;
  trackingNumber: string | null;
  city: string | null;
  address: string | null;
  product: InvProduct;
  case?: { name: string } | null;
}

const STATUS_LABELS: Record<string, string> = {
  AWAITING_CLAIM: "Ожидает оформления",
  PROCESSING: "В обработке",
  SHIPPED: "Отправлен",
  IN_DELIVERY: "В доставке",
  DELIVERED: "Получен",
  CANCELLED: "Отменён",
};

function Thumb({ p, size = 56 }: { p: InvProduct; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        background: "var(--elev)",
        flexShrink: 0,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {p.images?.[0] ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={p.images[0]}
          alt={p.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <span style={{ fontSize: 9, color: "var(--t3)" }}>нет фото</span>
      )}
    </div>
  );
}

export function Inventory() {
  const [orders, setOrders] = useState<InvOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [checkingOut, setCheckingOut] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await (await fetch("/api/admin/orders?mine=true")).json();
      setOrders(data.orders || []);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const won = orders.filter((o) => o.status === "ITEM_WON");
  const kept = orders.filter((o) => o.status === "KEPT");
  const processed = orders.filter(
    (o) => !["ITEM_WON", "KEPT", "SOLD"].includes(o.status)
  );

  const selectedOrders = kept.filter((o) => selected.has(o.id));
  const selectedSum = selectedOrders.reduce((s, o) => s + o.product.price, 0);
  const canCheckout =
    selectedOrders.length === CHECKOUT_ITEMS && selectedSum >= CHECKOUT_MIN;

  async function sell(id: string) {
    setBusy(id);
    try {
      const r = await fetch(`/api/orders/${id}/sell`, { method: "POST" });
      const d = await r.json().catch(() => ({}));
      if (r.ok) {
        toast.success(`Продано, +${formatPrice(d.refund)} на баланс`);
        window.dispatchEvent(new Event("balance:refresh"));
        await load();
      } else {
        toast.error(d.error || "Не удалось продать");
      }
    } finally {
      setBusy(null);
    }
  }

  async function keep(id: string) {
    setBusy(id);
    try {
      const r = await fetch(`/api/orders/${id}/keep`, { method: "POST" });
      const d = await r.json().catch(() => ({}));
      if (r.ok) {
        toast.success("Товар в инвентаре — выбери 3 для оформления");
        await load();
      } else {
        toast.error(d.error || "Ошибка");
      }
    } finally {
      setBusy(null);
    }
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        if (next.size >= CHECKOUT_ITEMS) {
          toast.error(`Можно выбрать только ${CHECKOUT_ITEMS}`);
          return next;
        }
        next.add(id);
      }
      return next;
    });
  }

  async function submitCheckout(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      const r = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds: Array.from(selected),
          fullName: fd.get("fullName"),
          phone: fd.get("phone"),
          city: fd.get("city"),
          address: fd.get("address"),
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok) {
        toast.success("Заказ оформлен, передан в обработку");
        setSelected(new Set());
        setCheckingOut(false);
        await load();
      } else {
        toast.error(d.error || "Ошибка оформления");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p style={{ color: "var(--t2)", fontSize: 14 }}>Загрузка инвентаря…</p>;
  }

  const card: React.CSSProperties = {
    borderRadius: 12,
    border: "1px solid var(--line)",
    background: "var(--card)",
    padding: 14,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Новые выпавшие */}
      <section>
        <h2 className="font-display font-semibold text-lg mb-4">
          Выпало — забрать или продать
        </h2>
        {won.length === 0 ? (
          <p style={{ color: "var(--t3)", fontSize: 13 }}>
            Нет новых вещей. Открой кейс!
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 12,
            }}
          >
            {won.map((o) => (
              <div key={o.id} style={{ ...card, display: "flex", gap: 12 }}>
                <Thumb p={o.product} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500 }}>{o.product.name}</p>
                  <p style={{ fontSize: 11, color: "var(--t3)" }}>
                    {o.product.brand}
                    {o.product.size && ` · ${o.product.size}`}
                  </p>
                  <p style={{ fontSize: 13, color: "var(--gold)", marginTop: 4 }}>
                    {formatPrice(o.product.price)}
                  </p>
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button
                      className="bgo"
                      style={{ padding: "7px 14px", fontSize: 12 }}
                      disabled={busy === o.id}
                      onClick={() => keep(o.id)}
                    >
                      Забрать
                    </button>
                    <button
                      className="bg-"
                      style={{ padding: "7px 14px", fontSize: 12 }}
                      disabled={busy === o.id}
                      onClick={() => sell(o.id)}
                    >
                      Продать
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Забранные — оформление */}
      <section>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <h2 className="font-display font-semibold text-lg">
            К оформлению{" "}
            <span style={{ color: "var(--t3)", fontSize: 13, fontWeight: 400 }}>
              выбрано {selectedOrders.length}/{CHECKOUT_ITEMS} ·{" "}
              {formatPrice(selectedSum)}
            </span>
          </h2>
          <button
            className="bgo"
            style={{ padding: "9px 18px", fontSize: 13 }}
            disabled={!canCheckout}
            onClick={() => setCheckingOut(true)}
          >
            Оформить {CHECKOUT_ITEMS} вещи
          </button>
        </div>

        <p style={{ fontSize: 12, color: "var(--t3)", marginBottom: 14 }}>
          Выбери ровно {CHECKOUT_ITEMS} вещи на сумму от{" "}
          {formatPrice(CHECKOUT_MIN)}, чтобы оформить доставку.
        </p>

        {kept.length === 0 ? (
          <p style={{ color: "var(--t3)", fontSize: 13 }}>
            Пока нечего оформлять — нажми «Забрать» на выпавших вещах.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 12,
            }}
          >
            {kept.map((o) => {
              const on = selected.has(o.id);
              return (
                <button
                  key={o.id}
                  onClick={() => toggle(o.id)}
                  style={{
                    ...card,
                    display: "flex",
                    gap: 12,
                    textAlign: "left",
                    cursor: "pointer",
                    borderColor: on ? "#3b82f6" : "var(--line)",
                    boxShadow: on ? "0 0 0 1px #3b82f6, 0 0 20px rgba(59,130,246,.25)" : "none",
                    background: on ? "rgba(59,130,246,.08)" : "var(--card)",
                    transition: "0.2s",
                  }}
                >
                  <Thumb p={o.product} size={48} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{o.product.name}</p>
                    <p style={{ fontSize: 11, color: "var(--t3)" }}>
                      {o.product.brand}
                    </p>
                    <p style={{ fontSize: 13, color: on ? "#60a5fa" : "var(--gold)", marginTop: 4 }}>
                      {formatPrice(o.product.price)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Форма доставки */}
        {checkingOut && (
          <form
            onSubmit={submitCheckout}
            style={{ ...card, marginTop: 16, display: "flex", flexDirection: "column", gap: 10, maxWidth: 440 }}
          >
            <p style={{ fontSize: 14, fontWeight: 600 }}>Данные для доставки</p>
            <input name="fullName" required className="input" placeholder="ФИО получателя" />
            <input name="phone" required className="input" placeholder="Телефон" />
            <input name="city" required className="input" placeholder="Город" />
            <input name="address" required className="input" placeholder="Адрес / пункт выдачи" />
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" className="bgo" style={{ padding: "10px 18px", fontSize: 13 }} disabled={submitting}>
                {submitting ? "Оформляем…" : "Подтвердить"}
              </button>
              <button
                type="button"
                className="bg-"
                style={{ padding: "10px 18px", fontSize: 13 }}
                onClick={() => setCheckingOut(false)}
              >
                Отмена
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Оформленные заказы */}
      {processed.length > 0 && (
        <section>
          <h2 className="font-display font-semibold text-lg mb-4">Заказы</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {processed.map((o) => (
              <div key={o.id} style={{ ...card, display: "flex", gap: 12, alignItems: "center" }}>
                <Thumb p={o.product} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500 }}>{o.product.name}</p>
                  {o.address && (
                    <p style={{ fontSize: 11, color: "var(--t3)" }}>
                      {o.city}, {o.address}
                    </p>
                  )}
                  {o.trackingNumber && (
                    <p style={{ fontSize: 11, color: "var(--t2)" }}>
                      Трек: {o.trackingNumber}
                    </p>
                  )}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: "rgba(212,178,84,.12)",
                    color: "var(--gold2)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {STATUS_LABELS[o.status] || o.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
