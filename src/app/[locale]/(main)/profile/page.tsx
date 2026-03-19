// src/app/[locale]/(main)/profile/page.tsx
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Settings, Plus, Phone, MessageCircle, Package } from "lucide-react";
import Link from "next/link";

export default async function ProfilePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("profile");
  const tNav = await getTranslations("nav");

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      telegram: true,
      avatar: true,
      role: true,
      createdAt: true,
      _count: { select: { products: true } },
    },
  });

  if (!user) redirect(`/${locale}/login`);

  const activeProducts = await prisma.product.count({
    where: { sellerId: user.id, status: "ACTIVE" },
  });

  const recentProducts = await prisma.product.findMany({
    where: { sellerId: user.id },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: {
      id: true,
      title: true,
      price: true,
      currency: true,
      images: true,
      status: true,
      createdAt: true,
      category: { select: { nameEn: true, nameUz: true, nameRu: true } },
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Sidebar: Profile card ── */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            {/* Avatar + name */}
            <div className="flex flex-col items-center text-center mb-6">
              <UserAvatar name={user.name} image={user.avatar} size="xl" />
              <h1 className="mt-4 text-xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
              {user.role === "ADMIN" && (
                <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                  Admin
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">{user._count.products}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t("totalListings")}</p>
              </div>
              <div className="bg-brand-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-brand-700">{activeProducts}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t("activeListings")}</p>
              </div>
            </div>

            {/* Contact info */}
            <div className="space-y-2.5 text-sm border-t border-gray-100 pt-4">
              {user.phone ? (
                <div className="flex items-center gap-2.5 text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{user.phone}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 text-gray-400 italic">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>{t("phone")} not set</span>
                </div>
              )}
              {user.telegram ? (
                <div className="flex items-center gap-2.5 text-gray-600">
                  <MessageCircle className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>@{user.telegram}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 text-gray-400 italic">
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span>{t("telegram")} not set</span>
                </div>
              )}
            </div>

            {/* Member since */}
            <p className="text-xs text-gray-400 mt-4 border-t border-gray-100 pt-4">
              {t("memberSince")} {formatDate(user.createdAt, locale)}
            </p>
          </div>

          {/* Edit button */}
          <Link href={`/${locale}/profile/edit`}>
            <Button variant="outline" className="w-full gap-2">
              <Settings className="w-4 h-4" />
              {t("editProfile")}
            </Button>
          </Link>
        </aside>

        {/* ── Main: Listings ── */}
        <main className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{t("myListings")}</h2>
            <Link href={`/${locale}/products/new`}>
              <Button size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" />
                {tNav("postAd")}
              </Button>
            </Link>
          </div>

          {recentProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="font-semibold text-gray-500">{t("noListings")}</p>
              <p className="text-sm text-gray-400 mt-1">{t("postFirstAd")}</p>
              <Link href={`/${locale}/products/new`} className="mt-4 inline-block">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1.5" />
                  {tNav("postAd")}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentProducts.map((product) => (
                <ProfileProductCard
                  key={product.id}
                  product={product}
                  locale={locale}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function ProfileProductCard({
  product,
  locale,
}: {
  product: {
    id: string;
    title: string;
    price: any;
    currency: string;
    images: string[];
    status: string;
    createdAt: Date;
    category: { nameEn: string; nameUz: string; nameRu: string };
  };
  locale: string;
}) {
  const catName =
    locale === "uz"
      ? product.category.nameUz
      : locale === "ru"
      ? product.category.nameRu
      : product.category.nameEn;

  const statusColor: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    INACTIVE: "bg-gray-100 text-gray-600",
    SOLD: "bg-blue-100 text-blue-700",
    PENDING: "bg-yellow-100 text-yellow-700",
  };

  return (
    <Link href={`/${locale}/products/${product.id}`}>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
        {/* Image */}
        <div className="aspect-video bg-gray-100 relative overflow-hidden">
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-300" />
            </div>
          )}
          {/* Status badge */}
          <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor[product.status] ?? ""}`}>
            {product.status}
          </span>
        </div>

        <div className="p-3.5">
          <p className="font-semibold text-gray-900 text-sm line-clamp-1">{product.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{catName}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="font-bold text-brand-700 text-sm">
              {Number(product.price).toLocaleString()} {product.currency}
            </span>
            <span className="text-xs text-gray-400">
              {formatDate(product.createdAt, locale)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
