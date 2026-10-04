import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.role === "ADMIN";
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      balance: true,
      isBlocked: true,
      createdAt: true,
      _count: { select: { caseOpenings: true, orders: true } },
    },
  });

  return NextResponse.json({ users });
}

export async function PATCH(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { action, userId } = body;

  if (action === "deposit") {
    const { amount } = body;
    if (!userId || !amount || amount <= 0) {
      return NextResponse.json({ error: "Неверные параметры" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { balance: { increment: amount } },
      }),
      prisma.transaction.create({
        data: {
          userId,
          amount,
          type: "DEPOSIT",
          description: "Пополнение администратором",
        },
      }),
    ]);

    return NextResponse.json({ ok: true });
  }

  if (action === "toggleBlock") {
    const { isBlocked } = body;
    await prisma.user.update({
      where: { id: userId },
      data: { isBlocked },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Неизвестное действие" }, { status: 400 });
}
