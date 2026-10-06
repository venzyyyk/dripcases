import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Package, History, Truck, Wallet } from "lucide-react";
import { Inventory } from "@/components/dashboard/inventory";

export const dynamic = "force-dynamic";

export const metadata = { title: "Личный кабинет — DRIPCASES" };

export default async function DashboardPage() {
  const user = await requireAuth();

  const [openingsCount, ordersCount, recentOpenings] = await Promise.all([
    prisma.caseOpening.count({ where: { userId: user.id } }),
    prisma.order.count({ where: { userId: user.id } }),
    prisma.caseOpening.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        product: { select: { name: true, brand: true, price: true } },
        case: { select: { name: true } },
      },
    }),
  ]);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display font-bold text-2xl mb-1">
          Привет, {user.name || "друг"}
        </h1>
        <p className="text-text-secondary text-sm mb-8">
          Твой личный кабинет
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            {
              icon: Wallet,
              label: "Баланс",
              value: formatPrice(user.balance),
              color: "text-green-400",
            },
            {
              icon: Package,
              label: "Кейсов открыто",
              value: openingsCount.toString(),
              color: "text-accent",
            },
            {
              icon: Truck,
              label: "Заказов",
              value: ordersCount.toString(),
              color: "text-blue-400",
            },
            {
              icon: History,
              label: "Последний",
              value: recentOpenings[0]
                ? recentOpenings[0].case.name
                : "—",
              color: "text-text-secondary",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-bg-card p-4"
            >
              <s.icon className={`w-5 h-5 mb-3 ${s.color}`} />
              <p className="text-xs text-text-tertiary mb-1">{s.label}</p>
              <p className="font-display font-semibold text-lg">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <Link
            href="/dashboard/history"
            className="rounded-xl border border-border bg-bg-card p-5 hover:border-border-hover transition-colors group"
          >
            <History className="w-5 h-5 text-accent mb-2" />
            <p className="font-medium text-sm">История открытий</p>
            <p className="text-xs text-text-tertiary mt-1">
              Все кейсы, которые ты открывал
            </p>
          </Link>
          <Link
            href="/dashboard/orders"
            className="rounded-xl border border-border bg-bg-card p-5 hover:border-border-hover transition-colors group"
          >
            <Truck className="w-5 h-5 text-blue-400 mb-2" />
            <p className="font-medium text-sm">Мои заказы</p>
            <p className="text-xs text-text-tertiary mt-1">
              Оформи получение выпавших товаров
            </p>
          </Link>
          <Link
            href="/cases"
            className="rounded-xl border border-border bg-bg-card p-5 hover:border-border-hover transition-colors group"
          >
            <Package className="w-5 h-5 text-green-400 mb-2" />
            <p className="font-medium text-sm">Открыть кейс</p>
            <p className="text-xs text-text-tertiary mt-1">
              Выбери кейс и испытай удачу
            </p>
          </Link>
        </div>

        {/* Инвентарь: выпавшие вещи, продать/забрать, оформление */}
        <Inventory />
      </div>
    </div>
  );
}
