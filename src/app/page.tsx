import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Hero } from "@/components/layout/hero";
import { CaseCard } from "@/components/cases/case-card";
import { ArrowRight, Star, Truck, ShieldCheck, Flame } from "lucide-react";

const WARM_CASES = new Set(["PREMIUM", "SUMMER"]);

export default async function HomePage() {
  const cases = await prisma.case.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      price: true,
      image: true,
      tag: true,
    },
  });

  return (
    <>
      <Hero
        cases={cases.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          image: c.image,
          tag: c.tag,
        }))}
      />

      {/* Каталог */}
      <section className="relative border-t border-white/[0.06] bg-[#070708]">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 py-16 lg:py-20">
          <div className="flex items-end justify-between gap-6 mb-9">
            <div>
              <p className="text-[10px] tracking-[0.3em] text-white/35">
                НАШИ КЕЙСЫ
              </p>
              <h2 className="mt-3 font-display font-bold uppercase text-[clamp(1.6rem,4vw,2.3rem)] tracking-[-0.01em]">
                Выбери свой кейс
              </h2>
            </div>
            <Link
              href="/cases"
              className="hidden sm:inline-flex items-center gap-2 text-[13px] text-white/60 hover:text-white transition-colors border-b border-white/20 hover:border-white/50 pb-0.5"
            >
              Все кейсы
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5">
            {cases.map((c, i) => (
              <CaseCard
                key={c.id}
                priority={i < 3}
                name={c.name}
                slug={c.slug}
                description={c.description}
                price={c.price}
                image={c.image}
                tag={c.tag}
                warm={WARM_CASES.has(c.name)}
              />
            ))}
          </div>

          <Link
            href="/cases"
            className="sm:hidden mt-7 inline-flex items-center gap-2 text-[13px] text-white/60"
          >
            Все кейсы
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
          </Link>
        </div>
      </section>

      {/* Преимущества */}
      <section className="relative border-t border-white/[0.06] overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(100deg,#0b0c0e_0%,#0e1114_50%,#0a0b0d_100%)]" />
        <div className="relative max-w-[1240px] mx-auto px-5 sm:px-8 py-12 lg:py-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 lg:gap-y-0 lg:divide-x lg:divide-white/[0.07]">
            {FEATURES.map((f, i) => (
              <div key={i} className={i === 0 ? "lg:pr-10" : "lg:px-10"}>
                <f.icon className="w-[22px] h-[22px] text-white/85" strokeWidth={1.3} />
                <h3 className="mt-4 text-[14px] font-medium">{f.title}</h3>
                <p className="mt-2 text-[11.5px] leading-[1.55] text-white/40 max-w-[190px]">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Как это работает */}
      <section
        id="how-it-works"
        className="border-t border-white/[0.06] bg-[#070708]"
      >
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 py-16 lg:py-20">
          <p className="text-[10px] tracking-[0.3em] text-white/35">
            КАК ЭТО РАБОТАЕТ
          </p>
          <h2 className="mt-3 font-display font-bold uppercase text-[clamp(1.6rem,4vw,2.3rem)] mb-12">
            Три шага до образа
          </h2>

          <ol className="grid sm:grid-cols-3 gap-8 sm:gap-5">
            {STEPS.map((s, i) => (
              <li
                key={s.n}
                className="relative pt-6 border-t border-white/[0.09]"
              >
                <span className="absolute -top-3 left-0 bg-[#070708] pr-3 font-display text-[11px] tabular-nums text-white/35">
                  {s.n}
                </span>
                <h3 className="text-[15px] font-medium">{s.title}</h3>
                <p className="mt-2.5 text-[12.5px] leading-[1.6] text-white/45 max-w-[260px]">
                  {s.desc}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Футер */}
      <footer className="border-t border-white/[0.06]">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-5">
          <span className="font-display font-bold text-[15px] tracking-[0.14em]">
            DRIPCASES
          </span>
          <nav className="flex items-center gap-7 text-[12px] text-white/40">
            <Link href="/cases" className="hover:text-white transition-colors">
              Кейсы
            </Link>
            <Link href="/#how-it-works" className="hover:text-white transition-colors">
              Как это работает
            </Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Кабинет
            </Link>
          </nav>
          <p className="text-[11px] text-white/25">
            2026 DRIPCASES
          </p>
        </div>
      </footer>
    </>
  );
}

const FEATURES = [
  {
    icon: Star,
    title: "100% оригинал",
    desc: "Только проверенные бренды и поставщики",
  },
  {
    icon: Truck,
    title: "Быстрая доставка",
    desc: "По всей стране от 1 до 5 дней",
  },
  {
    icon: ShieldCheck,
    title: "Гарантия качества",
    desc: "Обмен и возврат в течение 14 дней",
  },
  {
    icon: Flame,
    title: "Уникальные образы",
    desc: "Каждый кейс — готовый лук, а не просто вещи",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Выбери кейс",
    desc: "От базового набора на каждый день до премиальных вещей — пять категорий под разный стиль.",
  },
  {
    n: "02",
    title: "Открой кейс",
    desc: "Пополни баланс и открой. Результат считает сервер — подменить его через браузер нельзя.",
  },
  {
    n: "03",
    title: "Получи вещь",
    desc: "Укажи адрес в кабинете, отследи заказ по трек-номеру и забери свою вещь.",
  },
];
