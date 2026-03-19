// src/app/[locale]/(main)/products/page.tsx
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ProductListing } from "@/components/products/ProductListing";
import type { Locale } from "@/types";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Browse Products" };
}

export default async function ProductsPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { category?: string };
}) {
  const t = await getTranslations("home");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t("latestProducts")}</h1>
        <p className="text-gray-500 mt-1">{t("heroSubtitle")}</p>
      </div>
      <ProductListing
        locale={locale as Locale}
        initialCategorySlug={searchParams.category}
      />
    </div>
  );
}
