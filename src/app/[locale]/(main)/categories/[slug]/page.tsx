// src/app/[locale]/(main)/categories/[slug]/page.tsx
import { notFound }           from "next/navigation";
import { Metadata }           from "next";
import { getTranslations }    from "next-intl/server";
import Link                   from "next/link";
import { ArrowLeft, Tag }     from "lucide-react";
import {
  getCategoryBySlug,
  getCategories,
  getProductsByCategory,
} from "@/lib/data";
import { ProductCard }        from "@/components/products/ProductCard";
import { CategorySortBar }    from "@/components/categories/CategorySortBar";
import { CategorySidebar }    from "@/components/categories/CategorySidebar";
import { Pagination }         from "@/components/shared/Pagination";
import { getCategoryName }    from "@/types";
import type { Locale, ProductListItem } from "@/types";

interface PageProps {
  params: { locale: string; slug: string };
  searchParams: {
    page?: string;
    sortBy?: string;
    sortOrder?: string;
    minPrice?: string;
    maxPrice?: string;
    location?: string;
  };
}

// ── Static paths ──────────────────────────────────────────────────────────────
export async function generateStaticParams() {
  const categories = await getCategories();
  const locales    = ["en", "uz", "ru"];
  return locales.flatMap((locale) =>
    categories.map((cat) => ({ locale, slug: cat.slug }))
  );
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);
  if (!category) return { title: "Category not found" };

  const name  = getCategoryName(category, params.locale as Locale);
  const count = category._count?.products ?? 0;

  return {
    title: `${name} — ${count} listings`,
    description: `Browse ${count} ${name} listings on Marketplace. Find the best deals in ${name}.`,
    alternates: {
      canonical: `/${params.locale}/categories/${params.slug}`,
      languages: {
        en: `/en/categories/${params.slug}`,
        uz: `/uz/categories/${params.slug}`,
        ru: `/ru/categories/${params.slug}`,
      },
    },
    openGraph: {
      title: `${name} listings — Marketplace`,
      description: `Browse ${count} ${name} listings. Find the best deals near you.`,
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { locale, slug } = params;
  const typedLocale      = locale as Locale;

  const page      = Math.max(1, parseInt(searchParams.page ?? "1"));
  const sortBy    = (searchParams.sortBy ?? "createdAt") as "createdAt" | "price" | "views";
  const sortOrder = (searchParams.sortOrder ?? "desc") as "asc" | "desc";
  const minPrice  = searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined;
  const maxPrice  = searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined;
  const location  = searchParams.location ?? "";
  const perPage   = 24;

  // Parallel fetch: category info + products + all categories (for sidebar)
  const [category, { products, total, totalPages }, allCategories, t] =
    await Promise.all([
      getCategoryBySlug(slug),
      getProductsByCategory({ categorySlug: slug, page, perPage, sortBy, sortOrder, minPrice, maxPrice, location }),
      getCategories(),
      getTranslations("product"),
    ]);

  if (!category) notFound();

  const catName   = getCategoryName(category, typedLocale);
  const baseHref  = `/${locale}/categories/${slug}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href={`/${locale}`} className="hover:text-brand-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href={`/${locale}/products`} className="hover:text-brand-600 transition-colors">
          All listings
        </Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">{catName}</span>
      </nav>

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
            <Tag className="w-6 h-6 text-brand-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900">{catName}</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {total.toLocaleString()} {total === 1 ? "listing" : "listings"}
            </p>
          </div>
        </div>

        <Link
          href={`/${locale}/products`}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All categories
        </Link>
      </div>

      {/* ── Sort bar ── */}
      <CategorySortBar
        baseHref={baseHref}
        currentSortBy={sortBy}
        currentSortOrder={sortOrder}
        currentPage={page}
        total={total}
      />

      {/* ── Main grid with sidebar ── */}
      <div className="flex gap-8 items-start mt-6">

        {/* Sidebar — other categories + price filter */}
        <CategorySidebar
          allCategories={allCategories}
          currentSlug={slug}
          locale={typedLocale}
          baseHref={baseHref}
          currentMinPrice={minPrice}
          currentMaxPrice={maxPrice}
          currentLocation={location}
        />

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-dashed border-gray-300">
              <Tag className="w-12 h-12 text-gray-200 mb-4" />
              <p className="text-lg font-semibold text-gray-500">
                No listings in this category yet
              </p>
              <p className="text-sm text-gray-400 mt-1 mb-6">
                Be the first to post in {catName}
              </p>
              <Link href={`/${locale}/products/new`}>
                <button className="px-6 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors">
                  Post a listing
                </button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product as ProductListItem}
                    locale={typedLocale}
                  />
                ))}
              </div>

              {/* Server-side pagination via URL params */}
              {totalPages > 1 && (
                <ServerPagination
                  baseHref={baseHref}
                  page={page}
                  totalPages={totalPages}
                  searchParams={searchParams}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── URL-based pagination (no JS required) ─────────────────────────────────────
function ServerPagination({
  baseHref,
  page,
  totalPages,
  searchParams,
}: {
  baseHref: string;
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}) {
  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (searchParams.sortBy)    params.set("sortBy",    searchParams.sortBy);
    if (searchParams.sortOrder) params.set("sortOrder", searchParams.sortOrder);
    if (searchParams.minPrice)  params.set("minPrice",  searchParams.minPrice);
    if (searchParams.maxPrice)  params.set("maxPrice",  searchParams.maxPrice);
    if (searchParams.location)  params.set("location",  searchParams.location);
    params.set("page", String(p));
    return `${baseHref}?${params.toString()}`;
  };

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      {page > 1 && (
        <Link href={buildHref(page - 1)} className="px-3 h-9 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center">
          ← Prev
        </Link>
      )}
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-gray-400">…</span>
        ) : (
          <Link
            key={p}
            href={buildHref(p as number)}
            className={`w-9 h-9 rounded-lg text-sm font-medium flex items-center justify-center border transition-colors ${
              p === page
                ? "bg-brand-600 text-white border-brand-600"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {p}
          </Link>
        )
      )}
      {page < totalPages && (
        <Link href={buildHref(page + 1)} className="px-3 h-9 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center">
          Next →
        </Link>
      )}
    </div>
  );
}
