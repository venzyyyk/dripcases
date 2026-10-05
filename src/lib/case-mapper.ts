import { toShares, isWarmCase } from "./rarity";
import type { ClientCase } from "./case-types";

/** Prisma include для кейса с товарами — общий для главной и каталога. */
export const caseItemsInclude = {
  items: {
    orderBy: { dropChance: "desc" as const },
    include: {
      product: {
        select: { name: true, brand: true, price: true, images: true },
      },
    },
  },
} as const;

interface DbCaseItem {
  productId: string;
  dropChance: number;
  product: {
    name: string;
    brand: string | null;
    price: number;
    images: string[];
  };
}

interface DbCase {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  tag: string | null;
  items: DbCaseItem[];
}

export function mapCase(c: DbCase): ClientCase {
  const raw = c.items.map((it) => ({
    productId: it.productId,
    name: it.product.name,
    brand: it.product.brand,
    price: it.product.price,
    images: it.product.images,
    dropChance: it.dropChance,
  }));
  const items = toShares(raw).map((r) => ({
    productId: r.productId,
    name: r.name,
    brand: r.brand,
    price: r.price,
    images: r.images,
    share: r.share,
  }));
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    price: c.price,
    tag: c.tag,
    warm: isWarmCase(c.name || c.slug),
    items,
  };
}
