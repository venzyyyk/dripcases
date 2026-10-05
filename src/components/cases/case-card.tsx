"use client";

import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Vitrine } from "@/components/cases/vitrine";
import { useOpenCase } from "@/components/cases/open-case-provider";
import { formatPrice } from "@/lib/utils";
import type { ClientCase } from "@/lib/case-types";

function isHot(tag: string | null): boolean {
  return !!tag && /хит|hot|top|топ|нов|new/i.test(tag);
}

export function CaseCard({ data }: { data: ClientCase }) {
  const { openCase } = useOpenCase();
  const ref = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const card = ref.current;
    if (!card) return;
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const rx = (y / r.height - 0.5) * -9;
    const ry = (x / r.width - 0.5) * 9;
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-5px)`;
    if (spotRef.current) {
      spotRef.current.style.background = `radial-gradient(360px circle at ${x}px ${y}px, rgba(212,178,84,.11), transparent 42%)`;
    }
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      className="card"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={() => openCase(data)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openCase(data);
        }
      }}
    >
      {data.tag && (
        <span className={`tag${isHot(data.tag) ? " hot" : ""}`}>{data.tag}</span>
      )}
      <div className="spot" ref={spotRef} />
      <div className="cv">
        <Vitrine warm={data.warm} variant="card" />
      </div>
      <div className="ct">
        <h3 className="dsp">{data.name}</h3>
        {data.description && <p>{data.description}</p>}
        <div className="cf">
          <span className="pr2">{formatPrice(data.price)}</span>
          <span className="go">
            <ArrowRight size={14} strokeWidth={1.6} />
          </span>
        </div>
      </div>
    </div>
  );
}
