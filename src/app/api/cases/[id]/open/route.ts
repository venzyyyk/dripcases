import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { selectItem } from "@/lib/case-rng";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const userId = session.user.id;
  const caseId = params.id;

  // Load case with items
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

  // Filter to items with stock > 0 and active
  const availableItems = caseData.items.filter(
    (i) => i.product.stock > 0 && i.product.isActive
  );

  if (availableItems.length === 0) {
    return NextResponse.json(
      { error: "Нет товаров в наличии" },
      { status: 400 }
    );
  }

  // Check user balance
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { balance: true, isBlocked: true },
  });

  if (!user || user.isBlocked) {
    return NextResponse.json({ error: "Аккаунт заблокирован" }, { status: 403 });
  }

  if (user.balance < caseData.price) {
    return NextResponse.json(
      { error: "Недостаточно средств" },
      { status: 400 }
    );
  }

  // Normalize chances for available items only
  const totalChance = availableItems.reduce((s, i) => s + i.dropChance, 0);
  const normalizedItems = availableItems.map((i) => ({
    id: i.id,
    productId: i.productId,
    dropChance: (i.dropChance / totalChance) * 100,
  }));

  // Select winner
  const winner = selectItem(normalizedItems);
  const wonProduct = availableItems.find((i) => i.productId === winner.productId)!
    .product;

  // All mutations in one transaction — atomic
  const result = await prisma.$transaction(async (tx) => {
    const opening = await tx.caseOpening.create({
      data: {
        userId,
        caseId,
        productId: winner.productId,
        cost: caseData.price,
      },
    });

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: { balance: { decrement: caseData.price } },
      select: { balance: true },
    });

    await tx.product.update({
      where: { id: winner.productId },
      data: { stock: { decrement: 1 } },
    });

    await tx.transaction.create({
      data: {
        userId,
        amount: -caseData.price,
        type: "CASE_OPEN",
        description: `Открытие кейса "${caseData.name}"`,
      },
    });

    await tx.order.create({
      data: {
        userId,
        caseOpeningId: opening.id,
        productId: winner.productId,
        status: "ITEM_WON",
      },
    });

    return { opening, updatedUser };
  });

  return NextResponse.json({
    product: {
      id: wonProduct.id,
      name: wonProduct.name,
      brand: wonProduct.brand,
      price: wonProduct.price,
      images: wonProduct.images,
      size: wonProduct.size,
      color: wonProduct.color,
    },
    openingId: result.opening.id,
    newBalance: result.updatedUser.balance,
  });
}
