import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { CaseCard } from "@/components/cases/case-card";

export const metadata = { title: "Кейсы — DRIPCASES" };

const WARM = new Set(["PREMIUM", "SUMMER"]);

export default async function CasesPage() {
  const cases = await prisma.case.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, brand: true, price: true } },
        },
        orderBy: { dropChance: "desc" },
      },
    },
  });

  return (
    <div className="min-h-screen pt-[120px] pb-20 px-5 sm:px-8">
      <div className="max-w-[1240px] mx-auto">
        <p className="text-[10px] tracking-[0.3em] text-white/35">КАТАЛОГ</p>
        <h1 className="mt-3 font-display font-bold uppercase text-[clamp(1.8rem,5vw,2.8rem)]">
          Все кейсы
        </h1>
        <p className="mt-3 text-[14px] text-white/45 max-w-[420px]">
          Выбери кейс и открой — случайный товар уже твой.
        </p>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {cases.map((c) => (
            <CaseCard
              key={c.id}
              name={c.name}
              slug={c.slug}
              description={c.description}
              price={c.price}
              image={c.image}
              tag={c.tag}
              warm={WARM.has(c.name)}
            />
          ))}
        </div>

        {cases.length === 0 && (
          <p className="mt-10 text-sm text-white/40">
            Кейсов пока нет. Создай их в админке.
          </p>
        )}
      </div>
    </div>
  );
}
