import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Забрать выпавший товар: переводит его в статус «забран» (ждёт оформления). */
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
    select: { userId: true, status: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
  }
  if (order.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (order.status !== "ITEM_WON") {
    return NextResponse.json({ error: "Товар уже обработан" }, { status: 400 });
  }

  await prisma.order.update({
    where: { id: params.id },
    data: { status: "KEPT" },
  });

  return NextResponse.json({ ok: true });
}
