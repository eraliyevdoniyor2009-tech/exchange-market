// src/app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// GET /api/categories — public list
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { nameEn: "asc" },
      select: {
        id: true,
        nameEn: true,
        nameUz: true,
        nameRu: true,
        slug: true,
        icon: true,
        _count: { select: { products: { where: { status: "ACTIVE" } } } },
      },
    });

    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error("[GET /api/categories]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const createCategorySchema = z.object({
  nameEn: z.string().min(2).max(60).trim(),
  nameUz: z.string().min(2).max(60).trim(),
  nameRu: z.string().min(2).max(60).trim(),
  slug: z.string().min(2).max(60).regex(/^[a-z0-9-]+$/),
  icon: z.string().max(50).optional(),
});

// POST /api/categories — admin only
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionRole = (session.user as any).role;
    if (sessionRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const existing = await prisma.category.findUnique({
      where: { slug: parsed.data.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({ data: parsed.data });

    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/categories]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
