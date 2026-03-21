// src/components/products/ProductCard.tsx
import Link from "next/link";
import { MapPin, Eye, Clock, Tag } from "lucide-react";
import { formatPrice, formatRelativeTime } from "@/lib/utils";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { getCategoryName } from "@/types";
import type { ProductListItem, Locale } from "@/types";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: ProductListItem;
  locale: Locale;
  className?: string;
}

export function ProductCard({ product, locale, className }: ProductCardProps) {
  const categoryName = getCategoryName(
    { ...product.category, isActive: true },
    locale
  ); 

  return (
    <Link href={`/${locale}/products/${product.id}`}>
      <article
        className={cn(
          "group bg-white rounded-2xl overflow-hidden border border-gray-200",
          "hover:shadow-lg hover:-translate-y-1 hover:border-gray-300",
          "transition-all duration-200 cursor-pointer h-full flex flex-col",
          className
        )}
      >
        {/* ── Image ── */}
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <Tag className="w-10 h-10 text-gray-300" />
            </div>
          )}

          {/* Multiple images indicator */}
          {product.images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              +{product.images.length - 1}
            </div>
          )}

          {/* Category badge */}
          <div className="absolute top-2 left-2">
            <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full border border-white/50 shadow-sm">
              {categoryName}
            </span>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="p-4 flex flex-col gap-2 flex-1">
          {/* Title */}
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-brand-700 transition-colors leading-snug">
            {product.title}
          </h3>

          {/* Price */}
          <div className="mt-auto">
            <p className="text-lg font-bold text-brand-700">
              {Number(product.price) === 0
                ? "Free"
                : formatPrice(product.price, product.currency)}
            </p>
          </div>

          {/* Meta row */}
          <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-gray-100">
            <div className="flex items-center gap-1 min-w-0">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{product.location}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-2">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {product.views}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatRelativeTime(product.createdAt, locale)}
              </span>
            </div>
          </div>

          {/* Seller */}
          <div className="flex items-center gap-2 pt-1">
            <UserAvatar name={product.seller.name} image={product.seller.avatar} size="xs" />
            <span className="text-xs text-gray-500 truncate">{product.seller.name}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
