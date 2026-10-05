"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Play, ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { Vitrine } from "@/components/cases/vitrine";
import { useOpenCase } from "@/components/cases/open-case-provider";
import type { ClientCase } from "@/lib/case-types";

export function Hero({ cases }: { cases: ClientCase[] }) {
  const { openCase } = useOpenCase();
  const [idx, setIdx] = useState(cases.length > 1 ? 1 : 0);
  const vitRef = useRef<HTMLDivElement>(null);

  const has = cases.length > 0;
  const current = has ? cases[idx] : null;

  const prev = () => setIdx((i) => (i - 1 + cases.length) % cases.length);
  const next = () => setIdx((i) => (i + 1) % cases.length);

  const onMove = (e: React.MouseEvent) => {
    const el = vitRef.current;
    if (!el) return;
    const r = e.currentTarget.getBoundingClientRect();
    const rx = (((e.clientY - r.top) / r.height) - 0.5) * -8;
    const ry = (((e.clientX - r.left) / r.width) - 0.5) * 11;
    el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  };
  const onLeave = () => {
    if (vitRef.current) vitRef.current.style.transform = "";
  };

  return (
    <section className="hero">
      <div className="aur aur1" />
      <div className="aur aur2" />
      <div className="dc-wrap hgrid">
        <div>
          <span className="pill">
            <i />
            СТИЛЬ В КАЖДОМ КЕЙСЕ
          </span>
          <h1 className="dsp">
            <span className="l">
              <span>Открой свой</span>
            </span>
            <span className="l">
              <span className="grad">стиль</span>
            </span>
          </h1>
          <p className="lede">
            Кейсы с готовыми образами — это не просто одежда, это твой новый
            стиль. Открой кейс, получи уникальный образ и будь в центре внимания.
          </p>
          <div className="cta">
            <button
              className="b1"
              onClick={() => current && openCase(current)}
              disabled={!current}
            >
              Открыть кейс
              <span>
                <ArrowRight size={15} strokeWidth={2} />
              </span>
            </button>
            <Link href="#how" className="b2">
              <span>
                <Play size={12} fill="currentColor" />
              </span>
              Как это работает?
            </Link>
          </div>
          <div className="proof">
            <div className="avs">
              <i style={{ background: "linear-gradient(135deg,#3a3a3f,#1d1d20)" }}>A</i>
              <i style={{ background: "linear-gradient(135deg,#4a443a,#24211c)" }}>M</i>
              <i style={{ background: "linear-gradient(135deg,#35393f,#1b1d20)" }}>K</i>
              <i style={{ background: "linear-gradient(135deg,#423a3a,#201c1c)" }}>D</i>
            </div>
            <p>
              Уже выбрали
              <br />
              <b>более 50 000 человек</b>
            </p>
          </div>
        </div>

        <div className="hr">
          <div className="stage" onMouseMove={onMove} onMouseLeave={onLeave}>
            <div ref={vitRef} style={{ width: "100%", height: "100%" }}>
              {current ? (
                <Vitrine
                  label={current.name}
                  warm={current.warm}
                  variant="hero"
                />
              ) : (
                <Vitrine label="DRIPCASES" variant="hero" />
              )}
            </div>
          </div>

          <div className="hint">
            <p>
              Наведи
              <br />
              и рассмотри
              <br />
              детали
            </p>
            <span>
              <RotateCw size={16} strokeWidth={1.3} />
            </span>
          </div>

          {has && cases.length > 1 && (
            <div className="car">
              <button onClick={prev} aria-label="Назад">
                <ChevronLeft size={16} strokeWidth={1.4} />
              </button>
              <p className="cnt">
                <span>{String(idx + 1).padStart(2, "0")}</span>
                <span className="d"> / {String(cases.length).padStart(2, "0")}</span>
              </p>
              <button onClick={next} aria-label="Вперёд">
                <ChevronRight size={16} strokeWidth={1.4} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
