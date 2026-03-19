// src/app/[locale]/(main)/products/[id]/page.tsx
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductDetail } from "@/components/products/ProductDetail";
import type { Locale } from "@/types";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: { locale: string; id: string };
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    select: {
      title: true,
      description: true,
      images: true,
      price: true,
      currency: true,
    },
  });

  if (!product) {
    return { title: "Product not found" };
  }

  const description = product.description.slice(0, 160).replace(/\n/g, " ");

  return {
    title: product.title,
    description,
    openGraph: {
      title: product.title,
      description,
      images: product.images[0]
        ? [{ url: product.images[0], width: 1200, height: 630, alt: product.title }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description,
      images: product.images[0] ? [product.images[0]] : [],
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ProductDetailPage({ params }: PageProps) {
  const { locale, id } = params;

  // Fetch session in parallel with product data
  const [session, product] = await Promise.all([
    auth(),
    prisma.product.findUnique({
      where: { id },
      select: {
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
      },
    }),
  ]);

  // 404 if not found
  if (!product) notFound();

  // Increment view count (fire-and-forget, non-blocking)
  prisma.product
    .update({ where: { id }, data: { views: { increment: 1 } } })
    .catch(() => {});

  // Fetch related products in the same category (excluding current)
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.category.id,
      status: "ACTIVE",
      id: { not: id },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      price: true,
      currency: true,
      images: true,
      location: true,
      views: true,
      createdAt: true,
      category: {
        select: { nameEn: true, nameUz: true, nameRu: true, slug: true },
      },
      seller: {
        select: { name: true, avatar: true },
      },
    },
  });

  const currentUserId   = session?.user ? (session.user as any).id as string : null;
  const isAuthenticated = Boolean(session?.user);

  return (
    <ProductDetail
      product={{
        ...product,
        price: Number(product.price),
      }}
      relatedProducts={relatedProducts.map((r) => ({
        ...r,
        price: Number(r.price),
      }))}
      locale={locale as Locale}
      currentUserId={currentUserId}
      isAuthenticated={isAuthenticated}
    />
  );
}
