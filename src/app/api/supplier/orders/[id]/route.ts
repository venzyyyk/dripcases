import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Статусы, которые поставщик вправе выставлять по своему заказу
const SUPPLIER_STATUSES = [
  "PROCESSING",
  "SHIPPED",
  "IN_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "SUPPLIER" && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const me = session!.user!.id as string;

  // заказ должен быть на товар этого поставщика
  const order = await prisma.order.findFirst({
    where: { id: params.id, product: { supplierId: me } },
    select: { id: true },
  });
  if (!order) {
    return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};

  if (body.status !== undefined) {
    if (!SUPPLIER_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Недопустимый статус" }, { status: 400 });
    }
    data.status = body.status;
  }
  if (body.trackingNumber !== undefined) {
    data.trackingNumber = String(body.trackingNumber);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Нечего обновлять" }, { status: 400 });
  }

  const updated = await prisma.order.update({ where: { id: params.id }, data });
  return NextResponse.json({ order: updated });
}
