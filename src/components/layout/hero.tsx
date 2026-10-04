"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ArrowLeft, Play, RotateCw, Sparkles } from "lucide-react";
import { Vitrine } from "@/components/cases/vitrine";

interface HeroCase {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  tag: string | null;
}

export function Hero({ cases }: { cases: HeroCase[] }) {
  const [index, setIndex] = useState(0);
  const slides = cases.length > 0 ? cases : FALLBACK;
  const current = slides[index];
  const warm = current.name === "PREMIUM" || current.name === "SUMMER";

  function prev() {
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  }
  function next() {
    setIndex((i) => (i + 1) % slides.length);
  }

  return (
    <section className="relative overflow-hidden">
      {/* Фоновая атмосфера */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1100px] h-[700px] rounded-full blur-[120px] bg-[radial-gradient(ellipse,rgba(255,255,255,0.055),transparent_65%)]" />
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-bg to-transparent" />
      </div>

      <div className="relative max-w-[1240px] mx-auto px-5 sm:px-8 pt-[120px] lg:pt-[132px] pb-16 lg:pb-20">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-10 lg:gap-8 items-center">
          {/* Левая колонка */}
          <div className="relative z-10 max-w-[520px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[11px] tracking-[0.14em] text-white/70">
              <Sparkles className="w-3 h-3" strokeWidth={1.5} />
              СТИЛЬ В КАЖДОМ КЕЙСЕ
            </span>

            <h1 className="mt-7 font-display font-bold uppercase leading-[0.86] tracking-[-0.02em] text-[clamp(2.8rem,8.5vw,5.1rem)]">
              <span className="block">Открой свой</span>
              <span className="block text-white/35">стиль</span>
            </h1>

            <p className="mt-6 text-[15px] leading-[1.65] text-white/55 max-w-[400px]">
              Кейсы с готовыми образами — это не просто одежда, это твой новый
              стиль. Открой кейс, получи уникальный образ и будь в центре
              внимания.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href={`/cases/${current.slug}`}
                className="group inline-flex items-center gap-3 rounded-full bg-white text-black pl-7 pr-2 py-2 text-[14px] font-medium transition-colors hover:bg-white/90"
              >
                Открыть кейс
                <span className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>

              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-3 text-[14px] text-white/75 hover:text-white transition-colors"
              >
                <span className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center transition-colors hover:border-white/45">
                  <Play className="w-3.5 h-3.5 fill-current" strokeWidth={0} />
                </span>
                Как это работает?
              </Link>
            </div>

            {/* Социальное доказательство */}
            <div className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-2.5">
                {AVATARS.map((a, i) => (
                  <span
                    key={i}
                    className="w-8 h-8 rounded-full ring-2 ring-bg flex items-center justify-center text-[10px] font-medium text-white/70"
                    style={{ background: a }}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                ))}
              </div>
              <p className="text-[12px] leading-[1.5] text-white/45">
                Уже выбрали
                <br />
                <span className="text-white/80">более 50 000 человек</span>
              </p>
            </div>
          </div>

          {/* Правая колонка — витрина */}
          <div className="relative">
            <div className="relative aspect-[4/5] sm:aspect-[5/5] lg:aspect-[4/4.4] w-full max-w-[560px] mx-auto">
              <Vitrine
                image={current.image}
                label={current.name}
                warm={warm}
                variant="hero"
                priority
              />
            </div>

            {/* Подсказка «прокрути» */}
            <div className="hidden xl:flex absolute top-[22%] -right-6 flex-col items-start gap-5 w-[108px]">
              <p className="text-[12px] leading-[1.5] text-white/50">
                Прокрути
                <br />и рассмотри
                <br />
                детали
              </p>
              <span className="w-12 h-12 rounded-full border border-white/18 flex items-center justify-center text-white/60">
                <RotateCw className="w-4 h-4" strokeWidth={1.3} />
              </span>
            </div>

            {/* Карусель */}
            <div className="mt-2 flex items-center justify-center lg:justify-end gap-5">
              <button
                onClick={prev}
                className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/55 hover:text-white hover:border-white/35 transition-colors"
                aria-label="Предыдущий кейс"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={1.4} />
              </button>
              <p className="text-[13px] tabular-nums">
                <span className="text-white">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-white/30"> / {String(slides.length).padStart(2, "0")}</span>
              </p>
              <button
                onClick={next}
                className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/55 hover:text-white hover:border-white/35 transition-colors"
                aria-label="Следующий кейс"
              >
                <ArrowRight className="w-4 h-4" strokeWidth={1.4} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const AVATARS = [
  "linear-gradient(135deg,#3a3a3f,#1d1d20)",
  "linear-gradient(135deg,#4a443a,#24211c)",
  "linear-gradient(135deg,#35393f,#1b1d20)",
  "linear-gradient(135deg,#423a3a,#201c1c)",
];

const FALLBACK: HeroCase[] = [
  { id: "1", name: "URBAN", slug: "urban", description: null, image: null, tag: null },
];
