import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Users, Package, ShoppingBag, Wallet } from "lucide-react";

export const metadata = { title: "Админка — DRIPCASES" };

export default async function AdminPage() {
  const [usersCount, casesCount, productsCount, totalRevenue, recentOpenings] =
    await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.case.count(),
      prisma.product.count(),
      prisma.transaction.aggregate({
        where: { type: "CASE_OPEN", status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.caseOpening.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: { select: { name: true, email: true } },
          product: { select: { name: true, price: true } },
          case: { select: { name: true } },
        },
      }),
    ]);

  const revenue = Math.abs(totalRevenue._sum.amount || 0);

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-6">Обзор</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { icon: Users, label: "Пользователей", value: usersCount },
          { icon: Package, label: "Кейсов", value: casesCount },
          { icon: ShoppingBag, label: "Товаров", value: productsCount },
          { icon: Wallet, label: "Оборот", value: formatPrice(revenue) },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-border bg-bg-card p-4">
            <s.icon className="w-5 h-5 text-accent mb-2" />
            <p className="text-xs text-text-tertiary mb-1">{s.label}</p>
            <p className="font-display font-semibold text-xl">{s.value}</p>
          </div>
        ))}
      </div>

      <h2 className="font-display font-semibold text-lg mb-4">
        Последние открытия
      </h2>
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-elevated">
              <th className="text-left px-4 py-3 text-text-tertiary font-medium text-xs">Пользователь</th>
              <th className="text-left px-4 py-3 text-text-tertiary font-medium text-xs">Кейс</th>
              <th className="text-left px-4 py-3 text-text-tertiary font-medium text-xs">Товар</th>
              <th className="text-right px-4 py-3 text-text-tertiary font-medium text-xs">Стоимость</th>
              <th className="text-right px-4 py-3 text-text-tertiary font-medium text-xs">Дата</th>
            </tr>
          </thead>
          <tbody>
            {recentOpenings.map((o) => (
              <tr key={o.id} className="border-b border-border last:border-0 hover:bg-bg-hover transition-colors">
                <td className="px-4 py-3">{o.user.name || o.user.email}</td>
                <td className="px-4 py-3 text-text-secondary">{o.case.name}</td>
                <td className="px-4 py-3">{o.product.name}</td>
                <td className="px-4 py-3 text-right text-accent">{formatPrice(o.product.price)}</td>
                <td className="px-4 py-3 text-right text-text-tertiary">
                  {new Date(o.createdAt).toLocaleDateString("ru-RU")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
