// src/components/home/FeaturedProductsCarousel.tsx
"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin, Eye } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { ProductListItem, Locale } from "@/types";
import { cn } from "@/lib/utils";

interface FeaturedProductsCarouselProps {
  products: ProductListItem[];
  locale: Locale;
}

export function FeaturedProductsCarousel({ products, locale }: FeaturedProductsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  if (products.length === 0) return null;

  return (
    <div className="relative group/carousel">
      {/* Scroll buttons */}
      <button
        onClick={() => scroll("left")}
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10",
          "w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200",
          "flex items-center justify-center",
          "opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200",
          "hover:bg-brand-50 hover:border-brand-200"
        )}
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      </button>
      <button
        onClick={() => scroll("right")}
        className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10",
          "w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200",
          "flex items-center justify-center",
          "opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200",
          "hover:bg-brand-50 hover:border-brand-200"
        )}
        aria-label="Scroll right"
      >
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>

      {/* Scrollable track */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-3 scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/${locale}/products/${product.id}`}
            className="group/card flex-shrink-0 w-56 bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
          >
            {/* Image */}
            <div className="relative h-40 bg-gray-100 overflow-hidden">
              {product.images[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
              )}
              {/* Views badge */}
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                <Eye className="w-2.5 h-2.5" />
                {product.views}
              </div>
            </div>

            {/* Content */}
            <div className="p-3 space-y-1.5">
              <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug group-hover/card:text-brand-700 transition-colors">
                {product.title}
              </p>
              <p className="text-base font-black text-brand-700">
                {Number(product.price) === 0
                  ? "Free"
                  : formatPrice(product.price, product.currency)}
              </p>
              <p className="flex items-center gap-1 text-[11px] text-gray-400">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{product.location}</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
