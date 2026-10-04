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

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, description, brand, size, color, price, sku, stock, images } = body;

  if (!name || !price) {
    return NextResponse.json({ error: "Укажите название и цену" }, { status: 400 });
  }

  if (sku) {
    const existing = await prisma.product.findUnique({ where: { sku } });
    if (existing) {
      return NextResponse.json({ error: "SKU уже занят" }, { status: 409 });
    }
  }

  const product = await prisma.product.create({
    data: {
      name,
      description: description || null,
      brand: brand || null,
      size: size || null,
      color: color || null,
      price,
      sku: sku || null,
      stock: stock || 0,
      images: images || [],
    },
  });

  return NextResponse.json({ product }, { status: 201 });
}

export async function PATCH(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { id, ...data } = body;

  if (!id) {
    return NextResponse.json({ error: "ID обязателен" }, { status: 400 });
  }

  const product = await prisma.product.update({ where: { id }, data });
  return NextResponse.json({ product });
}
