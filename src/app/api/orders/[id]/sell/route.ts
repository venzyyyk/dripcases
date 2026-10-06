import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Продать выпавший товар обратно: возврат оценочной стоимости на баланс. */
export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    select: {
      userId: true,
      status: true,
      productId: true,
      product: { select: { price: true, name: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
  }
  if (order.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (order.status !== "ITEM_WON") {
    return NextResponse.json(
      { error: "Этот товар уже нельзя продать" },
      { status: 400 }
    );
  }

  const refund = order.product.price;

  const result = await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: params.id },
      data: { status: "SOLD" },
    });
    const user = await tx.user.update({
      where: { id: session.user!.id },
      data: { balance: { increment: refund } },
      select: { balance: true },
    });
    // вернуть единицу на склад
    await tx.product.update({
      where: { id: order.productId },
      data: { stock: { increment: 1 } },
    });
    await tx.transaction.create({
      data: {
        userId: session.user!.id,
        amount: refund,
        type: "REFUND",
        description: `Продажа товара "${order.product.name}"`,
      },
    });
    return user;
  });

  return NextResponse.json({ ok: true, refund, newBalance: result.balance });
}
