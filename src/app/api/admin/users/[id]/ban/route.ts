// src/app/api/admin/users/[id]/ban/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { isActive } = await req.json();

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { isActive: Boolean(isActive) },
      select: { id: true, isActive: true },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[PATCH admin/users/ban]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
