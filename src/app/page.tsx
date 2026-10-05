import Link from "next/link";
import { ArrowRight, Star, Truck, ShieldCheck, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { mapCase, caseItemsInclude } from "@/lib/case-mapper";
import { Hero } from "@/components/layout/hero";
import { Ticker } from "@/components/cases/ticker";
import { CaseCard } from "@/components/cases/case-card";
import { OpenCaseProvider } from "@/components/cases/open-case-provider";
import { RevealObserver } from "@/components/layout/reveal-observer";

export const dynamic = "force-dynamic";

const FEATURES = [
  { icon: Star, title: "100% оригинал", desc: "Только проверенные бренды и поставщики" },
  { icon: Truck, title: "Быстрая доставка", desc: "По всей стране от 1 до 5 дней" },
  { icon: ShieldCheck, title: "Честный рандом", desc: "Результат считает сервер, подменить нельзя" },
  { icon: Sparkles, title: "Уникальные образы", desc: "Каждый кейс — готовый лук, а не просто вещи" },
];

const STEPS = [
  { n: "01", title: "Выбери кейс", desc: "От базового набора на каждый день до премиальных вещей — несколько категорий под разный стиль." },
  { n: "02", title: "Открой кейс", desc: "Пополни баланс и открой. Результат считает сервер — подменить его через браузер нельзя." },
  { n: "03", title: "Получи вещь", desc: "Укажи адрес в кабинете, отследи заказ по трек-номеру и забери свою вещь." },
];

export default async function HomePage() {
  const dbCases = await prisma.case.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: caseItemsInclude,
  });

  const cases = dbCases.map(mapCase);

  return (
    <OpenCaseProvider>
      <RevealObserver />

      <Hero cases={cases} />

      <Ticker cases={cases} />

      {/* Каталог */}
      <section className="sec" id="cat">
        <div className="dc-wrap sp">
          <div className="sh rv">
            <div>
              <p className="eb">НАШИ КЕЙСЫ</p>
              <h2 className="dsp">Выбери свой кейс</h2>
            </div>
            <Link href="/cases" className="all">
              Все кейсы <ArrowRight size={14} strokeWidth={1.5} />
            </Link>
          </div>

          <div className="cards rv">
            {cases.map((c) => (
              <CaseCard key={c.id} data={c} />
            ))}
          </div>
        </div>
      </section>

      {/* Преимущества */}
      <section className="feat">
        <div className="dc-wrap fin">
          <div className="fg rv">
            {FEATURES.map((f, i) => (
              <div key={i}>
                <f.icon size={22} strokeWidth={1.3} />
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Как это работает */}
      <section className="sec" id="how">
        <div className="dc-wrap sp">
          <div className="rv">
            <p className="eb">КАК ЭТО РАБОТАЕТ</p>
            <h2 className="dsp" style={{ marginBottom: 46 }}>
              Три шага до образа
            </h2>
          </div>
          <ol className="steps rv">
            {STEPS.map((s) => (
              <li key={s.n} className="step">
                <span className="n">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Футер */}
      <footer className="dc-footer">
        <div className="dc-wrap ft">
          <span className="logo">DRIPCASES</span>
          <nav>
            <Link href="/cases">Кейсы</Link>
            <Link href="/#how">Как это работает</Link>
            <Link href="/dashboard">Кабинет</Link>
          </nav>
          <p className="cr">2026 DRIPCASES</p>
        </div>
      </footer>
    </OpenCaseProvider>
  );
}
