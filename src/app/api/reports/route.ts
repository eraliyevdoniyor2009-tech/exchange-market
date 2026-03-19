// src/app/api/reports/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createReportSchema } from "@/lib/validations";

// POST /api/reports — authenticated users only
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reporterId = (session.user as any).id as string;
    const body       = await req.json();
    const parsed     = createReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { productId, reason, description } = parsed.data;

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Prevent duplicate reports from same user
    const existing = await prisma.report.findFirst({
      where: { productId, reporterId },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already reported this listing" },
        { status: 409 }
      );
    }

    const report = await prisma.report.create({
      data: { productId, reporterId, reason, description },
      select: { id: true, reason: true, status: true, createdAt: true },
    });

    return NextResponse.json({ data: report }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/reports]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/reports — admin only
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const reports = await prisma.report.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        reason: true,
        description: true,
        status: true,
        createdAt: true,
        reporter: { select: { id: true, name: true, email: true } },
        product: {
          select: {
            id: true,
            title: true,
            seller: { select: { id: true, name: true } },
          },
        },
      },
    });

    return NextResponse.json({ data: reports });
  } catch (error) {
    console.error("[GET /api/reports]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
