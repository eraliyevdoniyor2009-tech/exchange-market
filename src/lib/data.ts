// src/lib/data.ts
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

// ─── Cache tags ────────────────────────────────────────────────────────────────
export const CACHE_TAGS = {
  products:   "products",
  categories: "categories",
  product:    (id: string) => `product-${id}`,
  category:   (slug: string) => `category-${slug}`,
} as const;

// ─── Categories ───────────────────────────────────────────────────────────────

/** Cached for 1 hour — categories rarely change */
export const getCachedCategories = unstable_cache(
  async () => {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: { nameEn: "asc" },
      select: {
        id: true,
        nameEn: true,
        nameUz: true,
        nameRu: true,
        slug: true,
        icon: true,
        isActive: true,
        _count: {
          select: { products: { where: { status: "ACTIVE" } } },
        },
      },
    });
  },
  ["all-categories"],
  { revalidate: 3600, tags: [CACHE_TAGS.categories] }
);

/** Per-request dedup within a single render pass */
export const getCategories = cache(getCachedCategories);

// ─── Homepage data ─────────────────────────────────────────────────────────────

export const getCachedHomepageData = unstable_cache(
  async () => {
    const [featuredProducts, latestProducts, stats] = await Promise.all([
      // Featured: most viewed active products
      prisma.product.findMany({
        where: { status: "ACTIVE" },
        orderBy: { views: "desc" },
        take: 8,
        select: {
          id: true,
          title: true,
          price: true,
          currency: true,
          location: true,
          images: true,
          status: true,
          views: true,
          createdAt: true,
          seller: { select: { id: true, name: true, avatar: true, phone: true, telegram: true } },
          category: { select: { id: true, nameEn: true, nameUz: true, nameRu: true, slug: true } },
        },
      }),
      // Latest 16 active products
      prisma.product.findMany({
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 16,
        select: {
          id: true,
          title: true,
          price: true,
          currency: true,
          location: true,
          images: true,
          status: true,
          views: true,
          createdAt: true,
          seller: { select: { id: true, name: true, avatar: true, phone: true, telegram: true } },
          category: { select: { id: true, nameEn: true, nameUz: true, nameRu: true, slug: true } },
        },
      }),
      // Platform stats
      Promise.all([
        prisma.product.count({ where: { status: "ACTIVE" } }),
        prisma.user.count(),
        prisma.category.count({ where: { isActive: true } }),
      ]),
    ]);

    return {
      featuredProducts,
      latestProducts,
      stats: {
        activeListings: stats[0],
        totalUsers: stats[1],
        totalCategories: stats[2],
      },
    };
  },
  ["homepage-data"],
  { revalidate: 300, tags: [CACHE_TAGS.products] } // 5-min revalidation
);

// ─── Category page data ────────────────────────────────────────────────────────

export const getCategoryBySlug = unstable_cache(
  async (slug: string) => {
    return prisma.category.findUnique({
      where: { slug, isActive: true },
      select: {
        id: true,
        nameEn: true,
        nameUz: true,
        nameRu: true,
        slug: true,
        icon: true,
        isActive: true,
        _count: { select: { products: { where: { status: "ACTIVE" } } } },
      },
    });
  },
  ["category-by-slug"],
  { revalidate: 3600, tags: [CACHE_TAGS.categories] }
);

// ─── Products for category page (server-side, paginated) ──────────────────────

export async function getProductsByCategory(params: {
  categorySlug: string;
  page: number;
  perPage: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  minPrice?: number;
  maxPrice?: number;
  location?: string;
}) {
  const { categorySlug, page, perPage, sortBy, sortOrder, minPrice, maxPrice, location } = params;

  const where: any = {
    status: "ACTIVE",
    category: { slug: categorySlug },
  };

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = minPrice;
    if (maxPrice) where.price.lte = maxPrice;
  }

  if (location) {
    where.location = { contains: location, mode: "insensitive" };
  }

  const orderBy =
    sortBy === "price" ? { price: sortOrder } :
    sortBy === "views" ? { views: sortOrder } :
    { createdAt: sortOrder };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        title: true,
        price: true,
        currency: true,
        location: true,
        images: true,
        status: true,
        views: true,
        createdAt: true,
        seller: { select: { id: true, name: true, avatar: true, phone: true, telegram: true } },
        category: { select: { id: true, nameEn: true, nameUz: true, nameRu: true, slug: true } },
      },
    }),
  ]);

  return { products, total, totalPages: Math.ceil(total / perPage), page };
}

// ─── Search suggestions ────────────────────────────────────────────────────────

export async function getSearchSuggestions(query: string): Promise<string[]> {
  if (query.length < 2) return [];

  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      title: { contains: query, mode: "insensitive" },
    },
    select: { title: true },
    take: 6,
    orderBy: { views: "desc" },
  });

  return Array.from(new Set(products.map((p) => p.title))); 
}
