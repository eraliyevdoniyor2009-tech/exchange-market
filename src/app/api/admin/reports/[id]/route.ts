// src/app/api/admin/reports/[id]/route.ts
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

    const { status } = await req.json();

    const validStatuses = ["PENDING", "REVIEWED", "RESOLVED", "DISMISSED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await prisma.report.update({
      where: { id: params.id },
      data: { status },
      select: { id: true, status: true },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[PATCH admin/reports/id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
