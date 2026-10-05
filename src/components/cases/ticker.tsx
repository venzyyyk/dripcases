"use client";

import { rarityOf } from "@/lib/rarity";
import type { ClientCase } from "@/lib/case-types";

const NAMES = [
  "Артём", "Влад", "Соня", "Макс", "Кира",
  "Даня", "Лера", "Тимур", "Ника", "Рома",
];

/**
 * Лента последних дропов. Строки детерминированы (без Math.random),
 * чтобы SSR и клиент совпадали — иначе React ругается на гидратацию.
 */
export function Ticker({ cases }: { cases: ClientCase[] }) {
  const pool = cases.filter((c) => c.items.length > 0);
  if (pool.length === 0) return null;

  const rows = Array.from({ length: 14 }, (_, i) => {
    const c = pool[i % pool.length];
    const item = c.items[i % c.items.length];
    return {
      user: NAMES[i % NAMES.length],
      name: item.name,
      caseName: c.name,
      color: rarityOf(item.share).color,
    };
  });

  const line = [...rows, ...rows];

  return (
    <div className="tick">
      <div className="tk">
        {line.map((r, i) => (
          <span key={i}>
            <i style={{ background: r.color }} />
            {r.user} выбил <b>{r.name}</b> из {r.caseName}
          </span>
        ))}
      </div>
    </div>
  );
}
