import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Оформление доставки: ровно 3 забранных товара, суммарной оценкой ≥ 3500 ₽. */
export const CHECKOUT_ITEMS = 3;
export const CHECKOUT_MIN_KOPECKS = 350000; // 3500 ₽

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { orderIds, fullName, phone, city, address } = body as {
    orderIds?: string[];
    fullName?: string;
    phone?: string;
    city?: string;
    address?: string;
  };

  if (!Array.isArray(orderIds) || orderIds.length !== CHECKOUT_ITEMS) {
    return NextResponse.json(
      { error: `Нужно выбрать ровно ${CHECKOUT_ITEMS} товара` },
      { status: 400 }
    );
  }
  if (!fullName || !phone || !city || !address) {
    return NextResponse.json(
      { error: "Заполни все поля доставки" },
      { status: 400 }
    );
  }

  const orders = await prisma.order.findMany({
    where: {
      id: { in: orderIds },
      userId: session.user.id,
      status: "KEPT",
    },
    select: { id: true, product: { select: { price: true } } },
  });

  if (orders.length !== CHECKOUT_ITEMS) {
    return NextResponse.json(
      { error: "Некоторые товары недоступны для оформления" },
      { status: 400 }
    );
  }

  const total = orders.reduce((s, o) => s + o.product.price, 0);
  if (total < CHECKOUT_MIN_KOPECKS) {
    return NextResponse.json(
      {
        error: `Сумма товаров ${(total / 100).toLocaleString(
          "ru-RU"
        )} ₽ — минимум для оформления ${(CHECKOUT_MIN_KOPECKS / 100).toLocaleString(
          "ru-RU"
        )} ₽`,
      },
      { status: 400 }
    );
  }

  await prisma.order.updateMany({
    where: { id: { in: orders.map((o) => o.id) }, userId: session.user.id },
    data: {
      status: "AWAITING_CLAIM",
      fullName,
      phone,
      city,
      address,
    },
  });

  return NextResponse.json({ ok: true, count: orders.length });
}
