// src/components/categories/CategorySidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Laptop, Car, Home, Shirt, Sofa, Dumbbell,
  BookOpen, Leaf, Baby, Wrench, Tag, SlidersHorizontal, X,
} from "lucide-react";
import { getCategoryName } from "@/types";
import type { Category, Locale } from "@/types";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  Laptop, Car, Home, Shirt, Sofa, Dumbbell,
  BookOpen, Leaf, Baby, Wrench, Tag,
};

interface CategorySidebarProps {
  allCategories: Category[];
  currentSlug: string;
  locale: Locale;
  baseHref: string;
  currentMinPrice?: number;
  currentMaxPrice?: number;
  currentLocation?: string;
}

export function CategorySidebar({
  allCategories,
  currentSlug,
  locale,
  baseHref,
  currentMinPrice,
  currentMaxPrice,
  currentLocation,
}: CategorySidebarProps) {
  const router = useRouter();
  const [minPrice, setMinPrice] = useState(currentMinPrice ? String(currentMinPrice) : "");
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice ? String(currentMaxPrice) : "");
  const [location, setLocation] = useState(currentLocation ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (location) params.set("location", location);
    params.set("page", "1");
    router.push(`${baseHref}?${params.toString()}`);
  };

  const clearFilters = () => {
    setMinPrice(""); setMaxPrice(""); setLocation("");
    router.push(baseHref);
  };

  const hasActiveFilters = currentMinPrice || currentMaxPrice || currentLocation;

  const sidebarContent = (
    <div className="space-y-7">

      {/* Categories list */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Categories
        </h3>
        <nav className="space-y-0.5">
          {allCategories.map((cat) => {
            const IconCmp  = ICON_MAP[cat.icon ?? ""] ?? Tag;
            const name     = getCategoryName(cat, locale);
            const isActive = cat.slug === currentSlug;
            const count    = cat._count?.products ?? 0;

            return (
              <Link
                key={cat.id}
                href={`/${locale}/categories/${cat.slug}`}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all",
                  isActive
                    ? "bg-brand-600 text-white font-semibold shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <IconCmp className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-gray-400")} />
                <span className="flex-1 truncate">{name}</span>
                {count > 0 && (
                  <span className={cn(
                    "text-xs font-medium shrink-0",
                    isActive ? "text-brand-100" : "text-gray-400"
                  )}>
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Price range */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Price Range
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min"
                min={0}
                className="w-full h-9 pl-6 pr-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
              />
            </div>
            <span className="text-gray-300 text-sm">—</span>
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max"
                min={0}
                className="w-full h-9 pl-6 pr-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Location
        </h3>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City or district…"
          className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
        />
      </div>

      {/* Apply / Clear */}
      <div className="space-y-2">
        <button
          onClick={applyFilters}
          className="w-full h-9 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          Apply Filters
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="w-full h-9 text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1.5 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block w-56 shrink-0">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-24">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile button */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
          )}
        </button>

        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-72 bg-white z-50 overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-4">{sidebarContent}</div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
