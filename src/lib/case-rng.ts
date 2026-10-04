import { randomBytes } from "crypto";

interface WeightedItem {
  id: string;
  productId: string;
  dropChance: number;
}

/**
 * Cryptographically secure weighted random selection.
 * Uses crypto.randomBytes instead of Math.random to prevent prediction.
 */
export function selectItem(items: WeightedItem[]): WeightedItem {
  if (items.length === 0) throw new Error("No items to select from");
  if (items.length === 1) return items[0];

  const totalWeight = items.reduce((sum, item) => sum + item.dropChance, 0);
  if (totalWeight <= 0) throw new Error("Total weight must be positive");

  // Generate a random float [0, 1) from 8 random bytes
  const buf = randomBytes(8);
  const maxUint64 = BigInt("18446744073709551615");
  const randomBigInt =
    (BigInt(buf[0]) << 56n) |
    (BigInt(buf[1]) << 48n) |
    (BigInt(buf[2]) << 40n) |
    (BigInt(buf[3]) << 32n) |
    (BigInt(buf[4]) << 24n) |
    (BigInt(buf[5]) << 16n) |
    (BigInt(buf[6]) << 8n) |
    BigInt(buf[7]);

  const randomFloat = Number(randomBigInt) / Number(maxUint64);
  const roll = randomFloat * totalWeight;

  let cumulative = 0;
  for (const item of items) {
    cumulative += item.dropChance;
    if (roll < cumulative) return item;
  }

  // Floating point edge case — return last item
  return items[items.length - 1];
}
