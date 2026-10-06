"use client";

/**
 * Процедурная "витрина" кейса — стеклянная коробка с силуэтами одежды,
 * подиум и свечение. Фирменный визуал, не требует картинок.
 * Используется в hero (variant="hero") и в карточках каталога (variant="card").
 */

interface VitrineProps {
  label?: string;
  warm?: boolean;
  variant?: "hero" | "card";
}

function Garments({ warm }: { warm: boolean }) {
  const f = warm ? "rgba(236,226,200,.30)" : "rgba(235,235,238,.26)";
  const tf = warm ? "rgba(250,248,240,.38)" : "rgba(250,250,252,.34)";
  const s = warm ? "rgba(212,178,84,.32)" : "rgba(255,255,255,.22)";
  return (
    <div className="grm">
      {/* jacket */}
      <svg viewBox="0 0 60 90" style={{ width: "28%", height: "auto" }}>
        <path
          d="M20 8 L12 14 L6 26 L10 30 L13 24 L13 82 L47 82 L47 24 L50 30 L54 26 L48 14 L40 8 L30 16 Z"
          fill={f}
          stroke={s}
          strokeWidth=".8"
        />
        <path d="M30 16 L30 82" stroke={s} strokeWidth=".8" fill="none" />
      </svg>
      {/* tee */}
      <svg viewBox="0 0 60 90" style={{ width: "26%", height: "auto" }}>
        <path
          d="M21 10 L10 16 L5 28 L12 32 L14 27 L14 70 L46 70 L46 27 L48 32 L55 28 L50 16 L39 10 L30 17 Z"
          fill={tf}
          stroke={s}
          strokeWidth=".8"
        />
      </svg>
      {/* pants */}
      <svg viewBox="0 0 60 90" style={{ width: "26%", height: "auto" }}>
        <path
          d="M16 6 L44 6 L46 86 L34 86 L30 40 L26 86 L14 86 Z"
          fill={f}
          stroke={s}
          strokeWidth=".8"
        />
        <rect x="17" y="40" width="8" height="12" fill="none" stroke={s} strokeWidth=".7" />
        <rect x="35" y="40" width="8" height="12" fill="none" stroke={s} strokeWidth=".7" />
      </svg>
    </div>
  );
}

function Barcode() {
  const bars = Array.from({ length: 22 }, (_, i) => (
    <i
      key={i}
      style={{ width: i % 4 === 0 ? 2 : 1, height: `${50 + ((i * 37) % 50)}%` }}
    />
  ));
  return <div className="bc">{bars}</div>;
}

export function Vitrine({ label, warm = false, variant = "card" }: VitrineProps) {
  return (
    <div className={`vit ${variant === "card" ? "cardvit " : ""}${warm ? "warm" : ""}`}>
      <div className="vg" />
      <div className="vin">
        <div className="box">
          <div className="bb" />
          <div className="et" />
          <div className="el" />
          <div className="er" />
          <div className="shn" />
          <Garments warm={warm} />
          {label && (
            <div className="plate">
              <b>{label}</b>
              <Barcode />
            </div>
          )}
        </div>
        <div className="pod">
          <div className="pt" />
          <div className="ps" />
          <div className="pr" />
        </div>
      </div>
    </div>
  );
}
