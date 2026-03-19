// src/app/[locale]/(main)/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Plus, ArrowRight, Zap } from "lucide-react";
import { getCachedHomepageData, getCategories } from "@/lib/data";
import { HeroSearch }                 from "@/components/home/HeroSearch";
import { CategoryGrid }               from "@/components/home/CategoryGrid";
import { StatsBar }                   from "@/components/home/StatsBar";
import { FeaturedProductsCarousel }   from "@/components/home/FeaturedProductsCarousel";
import { ProductCard }                from "@/components/products/ProductCard";
import { Button }                     from "@/components/ui/button";
import type { Locale, ProductListItem } from "@/types";
import { auth } from "@/lib/auth";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "home" });
  return {
    title: t("hero"),
    description: t("heroSubtitle"),
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", uz: "/uz", ru: "/ru" },
    },
  };
}

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const [t, tNav, { featuredProducts, latestProducts, stats }, categories, session] =
    await Promise.all([
      getTranslations("home"),
      getTranslations("nav"),
      getCachedHomepageData(),
      getCategories(),
      auth(),
    ]);

  const typedLocale = locale as Locale;

  return (
    <div className="min-h-screen">

      {/* ═══════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 pt-16 pb-20">

        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-brand-900/40 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Zap className="w-3.5 h-3.5 text-yellow-300" />
            {stats.activeListings.toLocaleString()} active listings right now
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-4">
            {t("hero")}
          </h1>
          <p className="text-brand-100 text-lg sm:text-xl mb-10 max-w-xl mx-auto">
            {t("heroSubtitle")}
          </p>

          {/* Search bar */}
          <HeroSearch placeholder={t("searchPlaceholder")} />

          {/* CTA row */}
          <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
            {!session?.user && (
              <Link href={`/${locale}/register`}>
                <Button
                  size="lg"
                  className="bg-white text-brand-700 hover:bg-brand-50 active:bg-brand-100 font-bold shadow-lg"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Post your first ad
                </Button>
              </Link>
            )}
            <Link href={`/${locale}/products`}>
              <button className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors">
                Browse all listings
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <StatsBar stats={stats} />
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ═══════════════════════════════════════════════════════
            CATEGORIES
        ═══════════════════════════════════════════════════════ */}
        <section className="py-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t("browseCategories")}</h2>
              <p className="text-gray-500 text-sm mt-0.5">
                Find exactly what you're looking for
              </p>
            </div>
          </div>
          <CategoryGrid categories={categories} showCounts />
        </section>

        {/* ═══════════════════════════════════════════════════════
            FEATURED (most viewed)
        ═══════════════════════════════════════════════════════ */}
        {featuredProducts.length > 0 && (
          <section className="py-4 pb-14">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-amber-500" />
                  Featured Listings
                </h2>
                <p className="text-gray-500 text-sm mt-0.5">
                  Most popular products right now
                </p>
              </div>
              <Link
                href={`/${locale}/products?sortBy=views&sortOrder=desc`}
                className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1"
              >
                See all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <FeaturedProductsCarousel
              products={featuredProducts as ProductListItem[]}
              locale={typedLocale}
            />
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════
            LATEST PRODUCTS
        ═══════════════════════════════════════════════════════ */}
        <section className="py-4 pb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t("latestProducts")}</h2>
              <p className="text-gray-500 text-sm mt-0.5">
                Fresh listings added today
              </p>
            </div>
            <Link
              href={`/${locale}/products`}
              className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1"
            >
              {t("featuredCategories")} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {latestProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product as ProductListItem}
                locale={typedLocale}
              />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href={`/${locale}/products`}>
              <Button variant="outline" size="lg" className="gap-2 px-8">
                View all listings
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SELL CTA BANNER
        ═══════════════════════════════════════════════════════ */}
        {!session?.user && (
          <section className="mb-16">
            <div className="relative overflow-hidden bg-gradient-to-r from-brand-600 to-brand-800 rounded-3xl px-8 py-12 text-center">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1)_0%,transparent_50%)] pointer-events-none" />
              <div className="relative">
                <h2 className="text-3xl font-black text-white mb-2">
                  Have something to sell?
                </h2>
                <p className="text-brand-100 mb-8 text-lg">
                  Post your ad for free and reach thousands of buyers
                </p>
                <Link href={`/${locale}/register`}>
                  <Button
                    size="xl"
                    className="bg-white text-brand-700 hover:bg-brand-50 font-bold shadow-xl"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Post a Free Ad
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
