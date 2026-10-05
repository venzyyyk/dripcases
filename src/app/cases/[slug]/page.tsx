import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { getSession } from "@/lib/session";
import { mapCase, caseItemsInclude } from "@/lib/case-mapper";
import { rarityOf } from "@/lib/rarity";
import { Vitrine } from "@/components/cases/vitrine";
import { OpenButton } from "@/components/cases/open-button";
import { OpenCaseProvider } from "@/components/cases/open-case-provider";

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
    include: caseItemsInclude,
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

  const client = mapCase(caseData);
  const canAfford = userBalance >= caseData.price;

  return (
    <OpenCaseProvider>
      <section className="hero" style={{ minHeight: "auto" }}>
        <div className="aur aur1" />
        <div className="dc-wrap hgrid" style={{ paddingTop: 120 }}>
          <div className="hr">
            <div className="stage">
              <Vitrine label={client.name} warm={client.warm} variant="hero" />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {caseData.tag && (
              <span className="pill" style={{ alignSelf: "flex-start" }}>
                <i />
                {caseData.tag}
              </span>
            )}
            <h1 className="dsp" style={{ marginTop: 20 }}>
              {caseData.name}
            </h1>
            {caseData.description && (
              <p className="lede">{caseData.description}</p>
            )}

            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 24 }}>
              <span className="dsp" style={{ fontSize: 30, fontWeight: 700 }}>
                {formatPrice(caseData.price)}
              </span>
              <span style={{ color: "var(--t3)", fontSize: 13 }}>за открытие</span>
            </div>

            <p style={{ fontSize: 13, color: "var(--t2)", margin: "10px 0 24px" }}>
              {session?.user ? (
                <>
                  Твой баланс:{" "}
                  <span style={{ color: canAfford ? "#4ade80" : "#f87171" }}>
                    {formatPrice(userBalance)}
                  </span>
                </>
              ) : (
                "Войди, чтобы открыть кейс"
              )}
            </p>

            <OpenButton data={client} />

            <p style={{ fontSize: 12, color: "var(--t3)", marginTop: 16 }}>
              {client.items.length} товаров в кейсе
            </p>
          </div>
        </div>
      </section>

      {/* Содержимое */}
      <section className="sec">
        <div className="dc-wrap sp">
          <p className="eb">СОДЕРЖИМОЕ КЕЙСА</p>
          <h2 className="dsp" style={{ marginBottom: 34 }}>
            Что можно выбить
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 14,
            }}
          >
            {client.items.map((item) => {
              const r = rarityOf(item.share);
              return (
                <div
                  key={item.productId}
                  style={{
                    display: "flex",
                    gap: 14,
                    padding: 14,
                    borderRadius: 12,
                    border: "1px solid var(--line)",
                    background: "var(--card)",
                    borderLeft: `3px solid ${r.color}`,
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 10,
                      background: "var(--elev)",
                      flexShrink: 0,
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <span style={{ fontSize: 10, color: "var(--t3)" }}>нет фото</span>
                    )}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</p>
                    {item.brand && (
                      <p style={{ fontSize: 11, color: "var(--t3)" }}>{item.brand}</p>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                      <span style={{ fontSize: 12, color: "var(--t2)" }}>
                        {formatPrice(item.price)}
                      </span>
                      <span style={{ fontSize: 11, color: r.color, fontWeight: 600 }}>
                        {r.key}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </OpenCaseProvider>
  );
}
