import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { getSession } from "@/lib/session";
import { CaseOpenButton } from "@/components/cases/case-open-button";
import { Vitrine } from "@/components/cases/vitrine";
import Image from "next/image";

const WARM = new Set(["PREMIUM", "SUMMER"]);

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const c = await prisma.case.findUnique({ where: { slug: params.slug } });
  if (!c) return { title: "Кейс не найден" };
  return { title: `${c.name} — DRIPCASES` };
}

export default async function CaseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const caseData = await prisma.case.findUnique({
    where: { slug: params.slug, isActive: true },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              brand: true,
              images: true,
              price: true,
              size: true,
              color: true,
              stock: true,
            },
          },
        },
        orderBy: { dropChance: "desc" },
      },
    },
  });

  if (!caseData) notFound();

  const session = await getSession();
  let userBalance = 0;
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { balance: true },
    });
    userBalance = user?.balance || 0;
  }

  const canAfford = userBalance >= caseData.price;
  const allInStock = caseData.items.some((i) => i.product.stock > 0);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Case header */}
        <div className="grid lg:grid-cols-2 gap-10 mb-16">
          {/* Витрина */}
          <div className="relative aspect-[4/5]">
            {caseData.tag && (
              <span className="absolute top-4 left-4 z-20 rounded-md bg-white/[0.07] border border-white/15 backdrop-blur-sm px-2.5 py-1 text-[10px] text-white/85">
                {caseData.tag}
              </span>
            )}
            <Vitrine
              image={caseData.image}
              label={caseData.name}
              warm={WARM.has(caseData.name)}
              variant="hero"
              priority
            />
          </div>

          {/* Info + open */}
          <div className="flex flex-col justify-center">
            <h1 className="font-display font-bold text-3xl mb-2">Кейс {caseData.name}</h1>
            <p className="text-text-secondary mb-6">{caseData.description}</p>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-display font-bold">
                {formatPrice(caseData.price)}
              </span>
              <span className="text-text-tertiary text-sm">за открытие</span>
            </div>

            {session?.user ? (
              <div className="mb-6">
                <p className="text-sm text-text-secondary">
                  Твой баланс:{" "}
                  <span className={canAfford ? "text-green-400" : "text-red-400"}>
                    {formatPrice(userBalance)}
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-text-secondary mb-6">
                Войди, чтобы открыть кейс
              </p>
            )}

            <CaseOpenButton
              caseId={caseData.id}
              caseSlug={caseData.slug}
              price={caseData.price}
              canAfford={canAfford}
              isLoggedIn={!!session?.user}
              inStock={allInStock}
            />

            <p className="text-xs text-text-tertiary mt-4">
              {caseData.items.length} товаров в кейсе
            </p>
          </div>
        </div>

        {/* Items list */}
        <div>
          <h2 className="font-display font-semibold text-xl mb-6">
            Содержимое кейса
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {caseData.items.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-border bg-bg-card p-4 flex gap-4"
              >
                <div className="w-16 h-16 rounded-lg bg-bg-elevated shrink-0 overflow-hidden relative">
                  {item.product.images[0] ? (
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      sizes="64px"
                      className="object-contain p-1.5"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-text-tertiary text-[10px]">
                      нет фото
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{item.product.name}</p>
                  {item.product.brand && (
                    <p className="text-xs text-text-tertiary">{item.product.brand}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-text-secondary">
                      {formatPrice(item.product.price)}
                    </span>
                    <span className="text-xs text-accent font-medium">
                      {item.dropChance}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
