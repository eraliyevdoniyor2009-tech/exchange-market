// src/app/[locale]/(main)/profile/[userId]/page.tsx
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { ProductCard } from "@/components/products/ProductCard";
import { formatDate } from "@/lib/utils";
import { Phone, MessageCircle, Calendar, Package } from "lucide-react";
import type { Locale, ProductListItem } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: { userId: string };
}): Promise<Metadata> {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { name: true },
  });
  return { title: user ? `${user.name}'s Listings` : "Seller Profile" };
}

export default async function PublicProfilePage({
  params: { locale, userId },
}: {
  params: { locale: string; userId: string };
}) {
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { id: userId, isActive: true },
    select: {
      id: true,
      name: true,
      phone: true,
      telegram: true,
      avatar: true,
      createdAt: true,
      _count: { select: { products: { where: { status: "ACTIVE" } } } },
    },
  });

  if (!user) notFound();

  const products = await prisma.product.findMany({
    where: { sellerId: userId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: 24,
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
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* ── Seller card ── */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center sticky top-24">
            <UserAvatar name={user.name} image={user.avatar} size="xl" className="mx-auto" />
            <h1 className="mt-4 text-xl font-bold text-gray-900">{user.name}</h1>

            <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="text-center">
                <p className="text-2xl font-black text-gray-900">{user._count.products}</p>
                <p className="text-xs">Active listings</p>
              </div>
            </div>

            {/* Contact */}
            {(user.phone || user.telegram) && (
              <div className="mt-5 space-y-2 text-left border-t border-gray-100 pt-4">
                {user.phone && (
                  <a
                    href={`tel:${user.phone}`}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-green-50 hover:bg-green-100 transition-colors group"
                  >
                    <Phone className="w-4 h-4 text-green-700 shrink-0" />
                    <span className="text-sm text-green-800 font-medium truncate">{user.phone}</span>
                  </a>
                )}
                {user.telegram && (
                  <a
                    href={`https://t.me/${user.telegram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group"
                  >
                    <MessageCircle className="w-4 h-4 text-blue-700 shrink-0" />
                    <span className="text-sm text-blue-800 font-medium truncate">@{user.telegram}</span>
                  </a>
                )}
              </div>
            )}

            <p className="mt-4 text-xs text-gray-400 flex items-center justify-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Member since {formatDate(user.createdAt, locale)}
            </p>
          </div>
        </aside>

        {/* ── Listings ── */}
        <main className="lg:col-span-3">
          <h2 className="text-xl font-bold text-gray-900 mb-5">
            {user.name}'s Listings
            <span className="ml-2 text-base font-normal text-gray-400">
              ({products.length})
            </span>
          </h2>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-dashed border-gray-300">
              <Package className="w-10 h-10 text-gray-300 mb-3" />
              <p className="font-semibold text-gray-500">No active listings</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    price: Number(product.price)
                  }}
                  locale={locale as Locale}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
