import { requireSupplier } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Package, ClipboardList, Truck } from "lucide-react";

export const metadata = { title: "Кабинет поставщика — DRIPCASES" };
export const dynamic = "force-dynamic";

export default async function SupplierHome() {
  const me = await requireSupplier();

  const [productsCount, awaiting, inProgress] = await Promise.all([
    prisma.product.count({ where: { supplierId: me.id } }),
    prisma.order.count({
      where: { product: { supplierId: me.id }, status: "AWAITING_CLAIM" },
    }),
    prisma.order.count({
      where: {
        product: { supplierId: me.id },
        status: { in: ["PROCESSING", "SHIPPED", "IN_DELIVERY"] },
      },
    }),
  ]);

  const cards = [
    { icon: Package, label: "Мои товары", value: productsCount, href: "/supplier/products", color: "text-accent" },
    { icon: ClipboardList, label: "Новые заказы", value: awaiting, href: "/supplier/orders", color: "text-blue-400" },
    { icon: Truck, label: "В отправке", value: inProgress, href: "/supplier/orders", color: "text-green-400" },
  ];

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-1">
        Привет, {me.name || "поставщик"}
      </h1>
      <p className="text-text-secondary text-sm mb-8">Твои товары и заказы</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c, i) => (
          <Link
            key={i}
            href={c.href}
            className="rounded-xl border border-border bg-bg-card p-5 hover:border-border-hover transition-colors"
          >
            <c.icon className={`w-5 h-5 mb-3 ${c.color}`} />
            <p className="text-xs text-text-tertiary mb-1">{c.label}</p>
            <p className="font-display font-semibold text-2xl">{c.value}</p>
          </Link>
        ))}
      </div>

      {awaiting > 0 && (
        <div className="mt-6 rounded-xl border border-accent/30 bg-accent/5 p-4 text-sm">
          У тебя {awaiting} новых заказ(ов) на отправку —{" "}
          <Link href="/supplier/orders" className="text-accent hover:text-accent-light">
            открыть
          </Link>
        </div>
      )}
    </div>
  );
}
