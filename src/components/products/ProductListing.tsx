// src/components/products/ProductListing.tsx
"use client";

import { useFilterStore } from "@/store/filterStore";
import { useProducts } from "@/hooks/use-products";
import { ProductGrid } from "./ProductGrid";
import { ProductFilters } from "./ProductFilters";
import { Pagination } from "@/components/shared/Pagination";
import type { Locale } from "@/types";
import { Package2 } from "lucide-react";

interface ProductListingProps {
  locale: Locale;
  initialCategorySlug?: string;
}

export function ProductListing({ locale, initialCategorySlug }: ProductListingProps) {
  const filters = useFilterStore();

  // Apply initial category slug on mount via store default
  const activeFilters = {
    ...filters,
    categorySlug: filters.categorySlug || initialCategorySlug || "",
  };

  const { products, total, totalPages, page, isLoading, error } = useProducts(activeFilters);

  return (
    <div className="flex gap-8 items-start">
      {/* Filters sidebar */}
      <ProductFilters locale={locale} />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Result count + mobile filter row */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <p className="text-sm text-gray-500">
            {isLoading ? (
              <span className="inline-block w-24 h-4 bg-gray-200 rounded animate-pulse" />
            ) : (
              <>
                <span className="font-semibold text-gray-900">{total.toLocaleString()}</span>{" "}
                {total === 1 ? "product" : "products"} found
              </>
            )}
          </p>

          {/* Mobile filters trigger is inside ProductFilters component */}
          <div className="lg:hidden">
            <ProductFilters locale={locale} />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 mb-5">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Grid */}
        <ProductGrid
          products={products}
          locale={locale}
          isLoading={isLoading}
        />

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => filters.setFilter("page", p)}
          />
        )}
      </div>
    </div>
  );
}
