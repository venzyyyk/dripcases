import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") return false;
  return true;
}

export async function GET(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  // Single case with items (for edit page)
  if (id) {
    const caseData = await prisma.case.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, brand: true, price: true, stock: true },
            },
          },
          orderBy: { dropChance: "desc" },
        },
      },
    });

    if (!caseData) {
      return NextResponse.json({ error: "Кейс не найден" }, { status: 404 });
    }

    return NextResponse.json({ case: caseData });
  }

  // All cases (list)
  const cases = await prisma.case.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { items: true, openings: true } } },
  });

  return NextResponse.json({ cases });
}

export async function POST(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  // Add item to case
  if (body.action === "addItem") {
    const { caseId, productId, dropChance } = body;
    if (!caseId || !productId || dropChance == null) {
      return NextResponse.json({ error: "Все поля обязательны" }, { status: 400 });
    }

    // Check duplicate
    const existing = await prisma.caseItem.findUnique({
      where: { caseId_productId: { caseId, productId } },
    });
    if (existing) {
      return NextResponse.json({ error: "Товар уже в кейсе" }, { status: 409 });
    }

    const item = await prisma.caseItem.create({
      data: { caseId, productId, dropChance },
    });

    return NextResponse.json({ item }, { status: 201 });
  }

  // Create case
  const { name, slug, description, price, tag, sortOrder } = body;

  if (!name || !price) {
    return NextResponse.json({ error: "Укажите название и цену" }, { status: 400 });
  }

  const finalSlug = slug || name.toLowerCase().replace(/[^a-zа-яё0-9]+/gi, "-").replace(/-+$/, "");

  const existingSlug = await prisma.case.findUnique({ where: { slug: finalSlug } });
  if (existingSlug) {
    return NextResponse.json({ error: "Slug уже занят" }, { status: 409 });
  }

  const created = await prisma.case.create({
    data: {
      name,
      slug: finalSlug,
      description: description || null,
      price,
      tag: tag || null,
      sortOrder: sortOrder || 0,
    },
  });

  return NextResponse.json({ case: created }, { status: 201 });
}

export async function PATCH(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  // Remove item from case
  if (body.action === "removeItem") {
    const { itemId } = body;
    if (!itemId) {
      return NextResponse.json({ error: "itemId обязателен" }, { status: 400 });
    }

    await prisma.caseItem.delete({ where: { id: itemId } });
    return NextResponse.json({ ok: true });
  }

  // Update case fields
  const { id, action, ...data } = body;

  if (!id) {
    return NextResponse.json({ error: "ID обязателен" }, { status: 400 });
  }

  const updated = await prisma.case.update({ where: { id }, data });
  return NextResponse.json({ case: updated });
}

export async function DELETE(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID обязателен" }, { status: 400 });
  }

  // Check if case has openings
  const openingsCount = await prisma.caseOpening.count({ where: { caseId: id } });
  if (openingsCount > 0) {
    // Don't delete, just deactivate
    await prisma.case.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ deactivated: true });
  }

  // Safe to delete (cascade will remove CaseItems)
  await prisma.case.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
