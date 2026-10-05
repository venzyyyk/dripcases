import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const mine = url.searchParams.get("mine");

  // If user requests their own orders
  if (mine) {
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            brand: true,
            price: true,
            size: true,
            color: true,
            images: true,
          },
        },
        case: { select: { name: true } },
      },
    });
    return NextResponse.json({ orders });
  }

  // Admin: all orders
  if ((session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      product: { select: { name: true, brand: true, price: true } },
    },
  });

  return NextResponse.json({ orders });
}
