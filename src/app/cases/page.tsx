import { prisma } from "@/lib/prisma";
import { mapCase, caseItemsInclude } from "@/lib/case-mapper";
import { CaseCard } from "@/components/cases/case-card";
import { OpenCaseProvider } from "@/components/cases/open-case-provider";
import { RevealObserver } from "@/components/layout/reveal-observer";

export const metadata = { title: "Кейсы — DRIPCASES" };
export const dynamic = "force-dynamic";

export default async function CasesPage() {
  const dbCases = await prisma.case.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: caseItemsInclude,
  });

  const cases = dbCases.map(mapCase);

  return (
    <OpenCaseProvider>
      <RevealObserver />
      <section className="sec" style={{ minHeight: "100vh", borderTop: "none" }}>
        <div className="dc-wrap" style={{ paddingTop: 120, paddingBottom: 80 }}>
          <p className="eb">КАТАЛОГ</p>
          <h2 className="dsp" style={{ marginBottom: 12 }}>
            Все кейсы
          </h2>
          <p className="lede" style={{ marginTop: 0, marginBottom: 40 }}>
            Выбери кейс и открой — случайный товар уже твой.
          </p>

          {cases.length > 0 ? (
            <div className="cards rv">
              {cases.map((c) => (
                <CaseCard key={c.id} data={c} />
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--t3)", fontSize: 14 }}>
              Кейсов пока нет. Создай их в админке.
            </p>
          )}
        </div>
      </section>
    </OpenCaseProvider>
  );
}
