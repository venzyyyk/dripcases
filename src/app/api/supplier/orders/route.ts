import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function supplierId() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "SUPPLIER" && role !== "ADMIN") return null;
  return session!.user!.id as string;
}

/** Заказы на товары этого поставщика (с данными для отправки). */
export async function GET() {
  const me = await supplierId();
  if (!me) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const orders = await prisma.order.findMany({
    where: { product: { supplierId: me } },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        select: { id: true, name: true, brand: true, size: true, color: true, images: true, sku: true },
      },
    },
  });
  return NextResponse.json({ orders });
}
