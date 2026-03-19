// src/app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createProductSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

const PRODUCT_SELECT = {
  id: true,
  title: true,
  price: true,
  currency: true,
  location: true,
  images: true,
  status: true,
  views: true,
  createdAt: true,
  seller: {
    select: {
      id: true,
      name: true,
      avatar: true,
      phone: true,
      telegram: true,
    },
  },
  category: {
    select: {
      id: true,
      nameEn: true,
      nameUz: true,
      nameRu: true,
      slug: true,
    },
  },
} satisfies Prisma.ProductSelect;

// GET /api/products — paginated list with filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page      = Math.max(1, parseInt(searchParams.get("page")    ?? "1"));
    const perPage   = Math.min(48, Math.max(1, parseInt(searchParams.get("perPage") ?? "20")));
    const search    = searchParams.get("search")?.trim()     ?? "";
    const catSlug   = searchParams.get("categorySlug")?.trim() ?? "";
    const catId     = searchParams.get("categoryId")?.trim()   ?? "";
    const location  = searchParams.get("location")?.trim()     ?? "";
    const minPrice  = parseFloat(searchParams.get("minPrice")  ?? "0") || 0;
    const maxPrice  = parseFloat(searchParams.get("maxPrice")  ?? "0") || 0;
    const sortBy    = (searchParams.get("sortBy") ?? "createdAt") as "createdAt" | "price" | "views";
    const sortOrder = (searchParams.get("sortOrder") ?? "desc") as "asc" | "desc";
    const sellerId  = searchParams.get("sellerId")?.trim() ?? "";

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      status: "ACTIVE",
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    if (catSlug) {
      where.category = { slug: catSlug };
    } else if (catId) {
      where.categoryId = catId;
    }

    if (location) {
      where.location = { contains: location, mode: "insensitive" };
    }

    if (minPrice > 0 || maxPrice > 0) {
      where.price = {};
      if (minPrice > 0) where.price.gte = minPrice;
      if (maxPrice > 0) where.price.lte = maxPrice;
    }

    if (sellerId) {
      where.sellerId = sellerId;
      // When fetching by seller, include non-active products too if querying own
      delete where.status;
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sortBy === "price"
        ? { price: sortOrder }
        : sortBy === "views"
        ? { views: sortOrder }
        : { createdAt: sortOrder };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        select: PRODUCT_SELECT,
        orderBy,
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ]);

    return NextResponse.json({
      data: products,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    });
  } catch (error) {
    console.error("[GET /api/products]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/products — create listing (auth required)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sellerId = (session.user as any).id as string;

    const body = await req.json();
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { title, description, price, currency, categoryId, location, images } = parsed.data;

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId, isActive: true },
      select: { id: true },
    });
    if (!category) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price,
        currency,
        location,
        images,
        sellerId,
        categoryId,
      },
      select: PRODUCT_SELECT,
    });

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/products]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
