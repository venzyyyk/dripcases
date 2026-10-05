import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { selectItem } from "@/lib/case-rng";

const MAX_OPENINGS = 10;

interface AvailItem {
  id: string;
  productId: string;
  dropChance: number;
  stock: number;
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const userId = session.user.id;
  const caseId = params.id;

  const body = await req.json().catch(() => ({}));
  let count = Number((body as any)?.count) || 1;
  if (!Number.isFinite(count)) count = 1;
  count = Math.max(1, Math.min(MAX_OPENINGS, Math.floor(count)));

  const caseData = await prisma.case.findUnique({
    where: { id: caseId, isActive: true },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              brand: true,
              price: true,
              images: true,
              size: true,
              color: true,
              stock: true,
              isActive: true,
            },
          },
        },
      },
    },
  });

  if (!caseData) {
    return NextResponse.json({ error: "Кейс не найден" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { balance: true, isBlocked: true },
  });
  if (!user || user.isBlocked) {
    return NextResponse.json({ error: "Аккаунт заблокирован" }, { status: 403 });
  }

  const totalCost = caseData.price * count;
  if (user.balance < totalCost) {
    return NextResponse.json(
      { error: `Недостаточно средств для ${count} открытий` },
      { status: 400 }
    );
  }

  // Локальный «склад» на время серии открытий — списываем последовательно,
  // чтобы не выдать товара больше, чем есть в наличии.
  const stockMap = new Map<string, number>();
  for (const it of caseData.items) {
    stockMap.set(it.productId, it.product.stock);
  }

  const availableAtStart = caseData.items.filter(
    (i) => i.product.stock > 0 && i.product.isActive
  );
  if (availableAtStart.length === 0) {
    return NextResponse.json({ error: "Нет товаров в наличии" }, { status: 400 });
  }

  // Предрассчитываем победителей честным серверным RNG
  const winners: { productId: string }[] = [];
  for (let n = 0; n < count; n++) {
    const pool: AvailItem[] = caseData.items
      .filter(
        (i) => i.product.isActive && (stockMap.get(i.productId) ?? 0) > 0
      )
      .map((i) => ({
        id: i.id,
        productId: i.productId,
        dropChance: i.dropChance,
        stock: stockMap.get(i.productId) ?? 0,
      }));
    if (pool.length === 0) break; // склад исчерпан в ходе серии

    const totalChance = pool.reduce((s, i) => s + i.dropChance, 0);
    const normalized = pool.map((i) => ({
      id: i.id,
      productId: i.productId,
      dropChance: (i.dropChance / totalChance) * 100,
    }));
    const w = selectItem(normalized);
    winners.push({ productId: w.productId });
    stockMap.set(w.productId, (stockMap.get(w.productId) ?? 1) - 1);
  }

  if (winners.length === 0) {
    return NextResponse.json({ error: "Нет товаров в наличии" }, { status: 400 });
  }

  const actualCost = caseData.price * winners.length;

  const result = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: { balance: { decrement: actualCost } },
      select: { balance: true },
    });

    for (const win of winners) {
      const opening = await tx.caseOpening.create({
        data: {
          userId,
          caseId,
          productId: win.productId,
          cost: caseData.price,
        },
      });
      await tx.product.update({
        where: { id: win.productId },
        data: { stock: { decrement: 1 } },
      });
      await tx.order.create({
        data: {
          userId,
          caseOpeningId: opening.id,
          productId: win.productId,
          status: "ITEM_WON",
        },
      });
    }

    await tx.transaction.create({
      data: {
        userId,
        amount: -actualCost,
        type: "CASE_OPEN",
        description: `Открытие кейса "${caseData.name}" ×${winners.length}`,
      },
    });

    return updatedUser;
  });

  interface WonProduct {
    id: string;
    name: string;
    brand: string | null;
    price: number;
    images: string[];
    size: string | null;
    color: string | null;
  }
  const byId = new Map<string, WonProduct>(
    caseData.items.map((i) => [i.productId, i.product as WonProduct])
  );
  const results = winners.map((w) => {
    const p = byId.get(w.productId)!;
    return {
      id: p.id,
      name: p.name,
      brand: p.brand,
      price: p.price,
      images: p.images,
      size: p.size,
      color: p.color,
    };
  });

  return NextResponse.json({
    results,
    count: results.length,
    newBalance: result.balance,
    // обратная совместимость с одиночным открытием
    product: results[0],
  });
}
