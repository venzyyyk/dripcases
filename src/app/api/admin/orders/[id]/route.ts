import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orderId = params.id;
  const body = await req.json();

  // Check order ownership or admin
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { userId: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
  }

  const isAdmin = (session.user as any).role === "ADMIN";
  const isOwner = order.userId === session.user.id;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Users can only update delivery info and status to AWAITING_CLAIM
  const updateData: any = {};

  if (isOwner && !isAdmin) {
    if (body.fullName) updateData.fullName = body.fullName;
    if (body.phone) updateData.phone = body.phone;
    if (body.city) updateData.city = body.city;
    if (body.address) updateData.address = body.address;
    if (body.status === "AWAITING_CLAIM") updateData.status = "AWAITING_CLAIM";
  } else {
    // Admin can update anything
    if (body.status) updateData.status = body.status;
    if (body.trackingNumber !== undefined) updateData.trackingNumber = body.trackingNumber;
    if (body.fullName) updateData.fullName = body.fullName;
    if (body.phone) updateData.phone = body.phone;
    if (body.city) updateData.city = body.city;
    if (body.address) updateData.address = body.address;
    if (body.adminNote !== undefined) updateData.adminNote = body.adminNote;
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: updateData,
  });

  return NextResponse.json({ order: updated });
}
