import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Package } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "История открытий — DRIPCASES" };

export default async function HistoryPage() {
  const user = await requireAuth();

  const openings = await prisma.caseOpening.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true, brand: true, price: true, images: true } },
      case: { select: { name: true, slug: true } },
    },
  });

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="text-text-tertiary hover:text-white text-sm transition-colors">
            Кабинет
          </Link>
          <span className="text-text-tertiary">/</span>
          <h1 className="font-display font-bold text-xl">История открытий</h1>
        </div>

        {openings.length === 0 ? (
          <div className="rounded-xl border border-border bg-bg-card p-8 text-center">
            <p className="text-text-secondary text-sm mb-4">Пока пусто</p>
            <Link href="/cases" className="btn-accent inline-flex">Открыть кейс</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {openings.map((o) => (
              <div
                key={o.id}
                className="rounded-lg border border-border bg-bg-card p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-bg-elevated flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-accent/60" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{o.product.name}</p>
                    <p className="text-xs text-text-tertiary">
                      {o.product.brand && `${o.product.brand} · `}
                      Кейс{" "}
                      <Link href={`/cases/${o.case.slug}`} className="text-accent hover:underline">
                        {o.case.name}
                      </Link>
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-sm font-medium">{formatPrice(o.product.price)}</p>
                  <p className="text-xs text-text-tertiary">
                    -{formatPrice(o.cost)} · {new Date(o.createdAt).toLocaleDateString("ru-RU")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
