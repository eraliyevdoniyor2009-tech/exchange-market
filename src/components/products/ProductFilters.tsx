// src/components/products/ProductFilters.tsx
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFilterStore } from "@/store/filterStore";
import type { Category, Locale } from "@/types";
import { getCategoryName } from "@/types";
import { cn } from "@/lib/utils";

interface ProductFiltersProps {
  locale: Locale;
}

export function ProductFilters({ locale }: ProductFiltersProps) {
  const t = useTranslations("product");
  const tCommon = useTranslations("common");

  const {
    search, categorySlug, minPrice, maxPrice, sortBy, sortOrder, location,
    setFilter, setFilters, resetFilters,
  } = useFilterStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [localSearch, setLocalSearch] = useState(search ?? "");
  const [localMin, setLocalMin] = useState(minPrice ? String(minPrice) : "");
  const [localMax, setLocalMax] = useState(maxPrice ? String(maxPrice) : "");
  const [localLocation, setLocalLocation] = useState(location ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((json) => setCategories(json.data ?? []))
      .catch(() => {});
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => setFilter("search", localSearch), 400);
    return () => clearTimeout(timer);
  }, [localSearch]);

  // Debounced location
  useEffect(() => {
    const timer = setTimeout(() => setFilter("location", localLocation), 400);
    return () => clearTimeout(timer);
  }, [localLocation]);

  const applyPriceFilter = () => {
    setFilters({
      minPrice: localMin ? parseFloat(localMin) : undefined,
      maxPrice: localMax ? parseFloat(localMax) : undefined,
    });
  };

  const hasActiveFilters = search || categorySlug || minPrice || maxPrice || location;

  const SortOptions = [
    { label: "Newest first", value: "createdAt", order: "desc" as const },
    { label: "Oldest first", value: "createdAt", order: "asc" as const },
    { label: "Price: low–high", value: "price", order: "asc" as const },
    { label: "Price: high–low", value: "price", order: "desc" as const },
    { label: "Most viewed", value: "views", order: "desc" as const },
  ];

  const filterContent = (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {tCommon("search")}
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full h-9 pl-9 pr-8 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
          />
          {localSearch && (
            <button
              onClick={() => { setLocalSearch(""); setFilter("search", ""); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t("category")}
        </label>
        <div className="space-y-1">
          <button
            onClick={() => setFilter("categorySlug", "")}
            className={cn(
              "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
              !categorySlug
                ? "bg-brand-600 text-white font-semibold"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            {t("allCategories")}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                setFilter("categorySlug", categorySlug === cat.slug ? "" : cat.slug)
              }
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group",
                categorySlug === cat.slug
                  ? "bg-brand-600 text-white font-semibold"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <span>{getCategoryName(cat, locale)}</span>
              {cat._count && (
                <span className={cn(
                  "text-xs",
                  categorySlug === cat.slug ? "text-brand-100" : "text-gray-400"
                )}>
                  {cat._count.products}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
        <input
          value={localLocation}
          onChange={(e) => setLocalLocation(e.target.value)}
          placeholder="City or district…"
          className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
        />
      </div>

      {/* Price range */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t("price")} Range
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            onBlur={applyPriceFilter}
            placeholder="Min"
            min={0}
            className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
          />
          <span className="text-gray-300 text-sm shrink-0">—</span>
          <input
            type="number"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            onBlur={applyPriceFilter}
            placeholder="Max"
            min={0}
            className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Sort by</label>
        <div className="space-y-1">
          {SortOptions.map((opt) => {
            const active = sortBy === opt.value && sortOrder === opt.order;
            return (
              <button
                key={`${opt.value}-${opt.order}`}
                onClick={() => setFilters({ sortBy: opt.value as any, sortOrder: opt.order })}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                  active ? "bg-brand-50 text-brand-700 font-semibold" : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset */}
      {hasActiveFilters && (
        <Button variant="outline" size="sm" className="w-full gap-2" onClick={resetFilters}>
          <X className="w-4 h-4" />
          {tCommon("clear")} Filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 shrink-0">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-20">
          {filterContent}
        </div>
      </aside>

      {/* Mobile filter button + drawer */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setMobileOpen(true)}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-brand-600" />
          )}
        </Button>

        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="fixed inset-y-0 right-0 w-80 bg-white z-50 overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-4">{filterContent}</div>
              <div className="p-4 border-t border-gray-200">
                <Button className="w-full" onClick={() => setMobileOpen(false)}>
                  Show Results
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
