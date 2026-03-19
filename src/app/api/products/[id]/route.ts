// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProductSchema } from "@/lib/validations";

const PRODUCT_DETAIL_SELECT = {
  id: true,
  title: true,
  description: true,
  price: true,
  currency: true,
  location: true,
  images: true,
  status: true,
  views: true,
  createdAt: true,
  updatedAt: true,
  sellerId: true,
  seller: {
    select: {
      id: true,
      name: true,
      avatar: true,
      phone: true,
      telegram: true,
      createdAt: true,
      _count: { select: { products: true } },
    },
  },
  category: {
    select: {
      id: true,
      nameEn: true,
      nameUz: true,
      nameRu: true,
      slug: true,
      icon: true,
    },
  },
};

// GET /api/products/[id] — product detail + increment views
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      select: PRODUCT_DETAIL_SELECT,
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Increment views in background (non-blocking)
    prisma.product
      .update({ where: { id: params.id }, data: { views: { increment: 1 } } })
      .catch(() => {});

    return NextResponse.json({ data: product });
  } catch (error) {
    console.error("[GET /api/products/id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/products/[id] — update (owner or admin)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.product.findUnique({
      where: { id: params.id },
      select: { sellerId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const sessionUserId = (session.user as any).id as string;
    const sessionRole   = (session.user as any).role as string;

    if (existing.sellerId !== sessionUserId && sessionRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: parsed.data,
      select: PRODUCT_DETAIL_SELECT,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[PATCH /api/products/id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/products/[id] — owner or admin
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.product.findUnique({
      where: { id: params.id },
      select: { sellerId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const sessionUserId = (session.user as any).id as string;
    const sessionRole   = (session.user as any).role as string;

    if (existing.sellerId !== sessionUserId && sessionRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.product.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("[DELETE /api/products/id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
