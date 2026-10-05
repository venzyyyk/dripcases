/**
 * Рарность выводится из нормированного шанса выпадения (share, %).
 * В БД отдельного поля rarity нет — есть dropChance (вес) у CaseItem.
 * Чем ниже доля выпадения, тем выше рарность.
 */

export interface Rarity {
  key: string;
  color: string;
}

export const RARITIES: Rarity[] = [
  { key: "Обычный", color: "#6b7280" },
  { key: "Редкий", color: "#3b82f6" },
  { key: "Эпический", color: "#a855f7" },
  { key: "Легендарный", color: "#f59e0b" },
  { key: "Мифический", color: "#ef4444" },
];

/** share — доля выпадения внутри кейса в процентах (0..100). */
export function rarityIndex(share: number): number {
  if (share >= 35) return 0;
  if (share >= 18) return 1;
  if (share >= 8) return 2;
  if (share >= 3) return 3;
  return 4;
}

export function rarityOf(share: number): Rarity {
  return RARITIES[rarityIndex(share)];
}

/** Нормирует сырые dropChance набора в доли (%), сумма = 100. */
export function toShares<T extends { dropChance: number }>(
  items: T[]
): (T & { share: number })[] {
  const total = items.reduce((s, i) => s + i.dropChance, 0) || 1;
  return items.map((i) => ({ ...i, share: (i.dropChance / total) * 100 }));
}

/** "Тёплый" (золотой) визуал витрины — для премиальных кейсов. */
export function isWarmCase(nameOrSlug: string): boolean {
  return /premium|summer|gold|lux|прем/i.test(nameOrSlug);
}
